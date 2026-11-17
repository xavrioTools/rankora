import express, { Request, Response, NextFunction } from 'express';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  validateSafeUrl,
  safeFetchHtml,
  runFullSeoAudit,
  clientRateLimiter,
  robotsManager,
  fetchWithSafeRedirects,
} from './src/services/crawlerService';
import { moderateReview, sanitizeHtml } from './src/utils/moderation';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);
const REVIEWS_FILE = path.resolve(__dirname, 'data', 'reviews.json');
const UNAVAILABLE_MSG = 'Real data is currently unavailable. Please try again later or configure the required data source.';

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Client Rate Limiting Middleware for API routes
app.use('/api/', (req: Request, res: Response, next: NextFunction): any => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const { limited, resetMs } = clientRateLimiter.isRateLimited(clientIp);
  if (limited) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Too many requests. Please wait before submitting another audit.',
      retryAfterSeconds: Math.ceil(resetMs / 1000),
    });
  }
  next();
});

function hasConfiguredGeminiKey(): boolean {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  return Boolean(key && key !== 'MY_GEMINI_API_KEY' && key !== 'undefined');
}

function getGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: (process.env.GEMINI_API_KEY || '').trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ------------------------------------------------------------------------------------------------
// API ROUTES
// ------------------------------------------------------------------------------------------------

// Contact Form Endpoint
app.post('/api/contact', async (req: Request, res: Response): Promise<any> => {
  const { name, email, subject, message, website } = req.body || {};

  // Honeypot spam trap
  if (typeof website === 'string' && website.trim().length > 0) {
    return res.status(400).json({ error: 'Spam detection triggered.' });
  }

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof subject !== 'string' ||
    typeof message !== 'string'
  ) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Strip CR/LF from single-line header fields to prevent email header injection
  const cleanName = name.replace(/[\r\n]+/g, ' ').trim();
  const cleanEmail = email.replace(/[\r\n]+/g, '').trim();
  const cleanSubject = subject.replace(/[\r\n]+/g, ' ').trim();
  const cleanMessage = message.trim();

  if (!cleanName || !cleanEmail || !cleanSubject || !cleanMessage) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (cleanName.length > 100 || cleanEmail.length > 150 || cleanSubject.length > 200 || cleanMessage.length > 5000) {
    return res.status(400).json({ error: 'One or more fields exceed maximum allowed length.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const smtpHost = (process.env.SMTP_HOST || '').trim() || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10) || 587;
  const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || '').trim();
  const adminEmail = (process.env.ADMIN_EMAIL || smtpUser).trim();

  const isPlaceholder =
    !smtpUser ||
    !smtpPass ||
    smtpUser === 'your-gmail-address@gmail.com' ||
    smtpPass === 'your-google-app-password';

  if (isPlaceholder || !adminEmail) {
    return res.status(503).json({
      error:
        'Email delivery is not configured on this server yet. Please set SMTP_USER, SMTP_PASS, and ADMIN_EMAIL environment variables.',
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });

    const safeName = sanitizeHtml(cleanName);
    const safeEmail = sanitizeHtml(cleanEmail);
    const safeSubject = sanitizeHtml(cleanSubject);
    const safeMessage = sanitizeHtml(cleanMessage).replace(/\n/g, '<br>');
    const sentTimestamp = new Date().toISOString();

    await transporter.sendMail({
      from: `"Rankora Contact" <${smtpUser}>`,
      to: adminEmail,
      replyTo: cleanEmail,
      subject: `[Rankora Contact] ${cleanSubject}`,
      text: `Name: ${cleanName}\nEmail: ${cleanEmail}\nSubject: ${cleanSubject}\n\nMessage:\n${cleanMessage}\n\nSent at: ${sentTimestamp}`,
      html: `
        <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 600px;">
          <h2 style="color: #4f46e5; margin-bottom: 16px;">New Contact Form Submission</h2>
          <p style="margin: 4px 0;"><strong>Name:</strong> ${safeName}</p>
          <p style="margin: 4px 0;"><strong>Email:</strong> ${safeEmail}</p>
          <p style="margin: 4px 0;"><strong>Subject:</strong> ${safeSubject}</p>
          <p style="margin: 16px 0 6px;"><strong>Message:</strong></p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 10px;">${safeMessage}</div>
          <p style="font-size: 12px; color: #64748b; margin-top: 16px;">Sent at: ${sentTimestamp}</p>
        </div>
      `,
    });

    return res.json({ success: true });
  } catch (error: any) {
    console.error('SMTP delivery failed:', error?.message || error);
    return res.status(502).json({
      error: 'Unable to send your message via Gmail SMTP right now. Please verify SMTP credentials or try again later.',
    });
  }
});

// Real SEO Performance & Live Indexability Tracker Endpoint
app.post('/api/performance-tracker', async (req: Request, res: Response): Promise<any> => {
  try {
    const rawUrl = typeof req.body?.url === 'string' ? req.body.url.trim() : '';
    if (!rawUrl) {
      return res.status(400).json({ error: 'Website URL is required.' });
    }

    const withProtocol = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    const validation = await validateSafeUrl(withProtocol);
    if (!validation.safe || !validation.urlObj) {
      return res.status(400).json({ error: validation.error || 'Please enter a valid public website URL.' });
    }

    const parsed = validation.urlObj;
    const domain = parsed.hostname.replace(/^www\./i, '').toLowerCase();
    const retrievedAt = new Date().toISOString();

    // 1. Live crawl of the target URL
    const fetchResult = await safeFetchHtml(parsed.toString(), 2 * 1024 * 1024);
    const finalParsed = new URL(fetchResult.finalUrl);
    const origin = finalParsed.origin;
    const $ = cheerio.load(fetchResult.html);

    const isHttps = finalParsed.protocol === 'https:';
    const canonical = $('link[rel="canonical" i]').attr('href')?.trim() || '';
    const robotsMeta = $('meta[name="robots" i]').attr('content')?.trim() || '';
    const xRobotsTag = fetchResult.headers['x-robots-tag'] || '';

    let internalLinks = 0;
    let externalDofollow = 0;
    let externalNofollow = 0;
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href')?.trim();
      if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }
      try {
        const resolved = new URL(href, fetchResult.finalUrl);
        if (resolved.origin === origin) {
          internalLinks++;
        } else {
          const rel = ($(el).attr('rel') || '').toLowerCase();
          if (rel.includes('nofollow') || rel.includes('ugc') || rel.includes('sponsored')) {
            externalNofollow++;
          } else {
            externalDofollow++;
          }
        }
      } catch {
        // ignore invalid href
      }
    });

    // 2. Live /robots.txt inspection
    let robotsTxtFound = false;
    let robotsTxtStatus: number | null = null;
    let robotsBlocksRoot = false;
    const declaredSitemaps: string[] = [];
    try {
      const robotsRes = await fetchWithSafeRedirects(`${origin}/robots.txt`, {
        headers: { 'User-Agent': 'RankoraBot/1.0 (+https://rankora.app/bot)' },
        timeoutMs: 4500,
        maxHops: 3,
      });
      robotsTxtStatus = robotsRes.response.status;
      if (robotsRes.response.ok) {
        robotsTxtFound = true;
        const robotsText = await robotsRes.response.text();
        let activeWildcard = false;
        for (const line of robotsText.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const idx = trimmed.indexOf(':');
          if (idx === -1) continue;
          const k = trimmed.slice(0, idx).trim().toLowerCase();
          const v = trimmed.slice(idx + 1).trim();
          if (k === 'user-agent') {
            activeWildcard = v === '*';
          } else if (activeWildcard && k === 'disallow' && v === '/') {
            robotsBlocksRoot = true;
          } else if (k === 'sitemap' && v) {
            declaredSitemaps.push(v);
          }
        }
      }
    } catch {
      robotsTxtStatus = null;
    }

    // 3. Live XML Sitemap inspection
    const primarySitemapUrl = declaredSitemaps[0] || `${origin}/sitemap.xml`;
    let sitemapFound = false;
    let sitemapStatus: number | null = null;
    let sitemapUrlCount: number | null = null;
    let isSitemapIndex = false;
    try {
      const smRes = await fetchWithSafeRedirects(primarySitemapUrl, {
        headers: { 'User-Agent': 'RankoraBot/1.0 (+https://rankora.app/bot)' },
        timeoutMs: 5000,
        maxHops: 3,
      });
      sitemapStatus = smRes.response.status;
      if (smRes.response.ok) {
        const smXml = await smRes.response.text();
        const $xml = cheerio.load(smXml, { xmlMode: true });
        const urlLocs = $xml('urlset > url > loc').length;
        const idxLocs = $xml('sitemapindex > sitemap > loc').length;
        if (urlLocs > 0 || idxLocs > 0 || $xml('loc').length > 0) {
          sitemapFound = true;
          isSitemapIndex = idxLocs > 0 && urlLocs === 0;
          sitemapUrlCount = urlLocs || idxLocs || $xml('loc').length;
        }
      }
    } catch {
      sitemapStatus = null;
    }

    // 4. Third-party authority / backlink APIs are not configured (never fabricate PageRank, DA, or backlinks)
    const authorityUnavailableReason =
      'Real Domain Authority, PageRank, and backlink metrics are unavailable because no third-party authority API is configured. Rankora never fabricates authority or backlink data.';

    const hasNoindex = /noindex|none/i.test(robotsMeta) || /noindex|none/i.test(xRobotsTag);
    let indexingStatus: 'Indexable' | 'Blocked from Indexing' | 'HTTP Error' = 'Indexable';
    if (fetchResult.status >= 400) {
      indexingStatus = 'HTTP Error';
    } else if (hasNoindex || robotsBlocksRoot) {
      indexingStatus = 'Blocked from Indexing';
    }

    const liveChecks = [
      {
        label: 'HTTP Status Code',
        value: `HTTP ${fetchResult.status}`,
        status: fetchResult.status >= 200 && fetchResult.status < 300 ? 'good' : fetchResult.status < 400 ? 'warn' : 'bad',
      },
      {
        label: 'HTTPS Transport',
        value: isHttps ? 'Enabled' : 'Not Encrypted (HTTP)',
        status: isHttps ? 'good' : 'bad',
      },
      {
        label: 'Meta Robots & X-Robots-Tag',
        value: hasNoindex ? `Blocked (${robotsMeta || xRobotsTag})` : robotsMeta || xRobotsTag || 'Indexable (no noindex directive)',
        status: hasNoindex ? 'bad' : 'good',
      },
      {
        label: 'Canonical Tag',
        value: canonical || 'Missing',
        status: canonical ? 'good' : 'warn',
      },
      {
        label: 'robots.txt Status',
        value: robotsTxtFound
          ? robotsBlocksRoot
            ? `Found (HTTP ${robotsTxtStatus}) — Disallow: / active`
            : `Accessible (HTTP ${robotsTxtStatus})`
          : `Not found (HTTP ${robotsTxtStatus ?? 'unreachable'})`,
        status: robotsTxtFound && !robotsBlocksRoot ? 'good' : robotsBlocksRoot ? 'bad' : 'warn',
      },
      {
        label: 'XML Sitemap',
        value: sitemapFound
          ? `${sitemapUrlCount?.toLocaleString() || 0} ${isSitemapIndex ? 'child sitemaps' : 'URLs'} found`
          : `Unavailable (HTTP ${sitemapStatus ?? 'unreachable'})`,
        status: sitemapFound ? 'good' : 'warn',
      },
    ];

    return res.json({
      domain,
      fullUrl: fetchResult.finalUrl,
      retrievedAt,
      source: 'Live HTTP Crawl & Technical Inspection',
      httpStatus: fetchResult.status,
      responseTimeMs: fetchResult.responseTimeMs,
      pageSizeKb: Number((fetchResult.sizeBytes / 1024).toFixed(1)),
      redirectCount: fetchResult.redirectChain.length,
      isHttps,
      canonical,
      robotsMeta,
      xRobotsTag,
      robotsTxtFound,
      robotsTxtStatus,
      sitemapUrl: primarySitemapUrl,
      sitemapFound,
      sitemapStatus,
      sitemapUrlCount,
      indexingStatus,
      outboundLinks: {
        internal: internalLinks,
        externalDofollow,
        externalNofollow,
        totalExternal: externalDofollow + externalNofollow,
      },
      authorityApiConfigured: false,
      domainAuthority: null,
      domainAuthoritySource: null,
      totalBacklinks: null,
      referringDomains: null,
      monthlyHistory: null,
      authorityTiers: null,
      unavailableReason: authorityUnavailableReason,
      liveChecks,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to inspect website URL.' });
  }
});

// Helper: clean Markdown links in Lighthouse descriptions to plain text
function cleanLighthouseDescription(text: unknown): string {
  if (typeof text !== 'string') return '';
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
}

// Helper: parse CrUX field metric from Google PageSpeed Insights v5 loadingExperience
function extractCruxMetric(
  metricsMap: Record<string, any> | undefined,
  key: string,
  unit: 'ms' | 's-from-ms' | 'cls'
) {
  const m = metricsMap?.[key];
  if (!m || typeof m.percentile !== 'number') return null;

  let displayValue = String(m.percentile);
  if (unit === 'ms') {
    displayValue = `${m.percentile} ms`;
  } else if (unit === 's-from-ms') {
    displayValue = `${(m.percentile / 1000).toFixed(2)} s`;
  } else if (unit === 'cls') {
    displayValue = (m.percentile / 100).toFixed(2);
  }

  return {
    percentile: m.percentile,
    displayValue,
    category: (m.category as 'FAST' | 'AVERAGE' | 'SLOW' | 'NONE') || null,
    distributions: Array.isArray(m.distributions) ? m.distributions : [],
  };
}

// Real Google PageSpeed Insights v5 & Server TTFB Endpoint
app.post('/api/pagespeed', async (req: Request, res: Response): Promise<any> => {
  try {
    const rawUrl = typeof req.body?.url === 'string' ? req.body.url.trim() : '';
    const strategy: 'mobile' | 'desktop' = req.body?.strategy === 'desktop' ? 'desktop' : 'mobile';

    if (!rawUrl) {
      return res.status(400).json({ error: 'Website URL is required.' });
    }

    const withProtocol = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    const validation = await validateSafeUrl(withProtocol);
    if (!validation.safe || !validation.urlObj) {
      return res.status(400).json({ error: validation.error || 'Please provide a valid public HTTP/HTTPS URL.' });
    }

    const targetUrl = validation.urlObj.toString();

    // Always collect direct real server measurements
    let directMetrics: {
      finalUrl: string;
      httpStatus: number;
      ttfbMs: number;
      htmlSizeKb: number;
      compression: string;
    } | null = null;

    try {
      const directFetch = await safeFetchHtml(targetUrl, 2 * 1024 * 1024);
      directMetrics = {
        finalUrl: directFetch.finalUrl,
        httpStatus: directFetch.status,
        ttfbMs: directFetch.responseTimeMs,
        htmlSizeKb: Number((directFetch.sizeBytes / 1024).toFixed(1)),
        compression: directFetch.headers['content-encoding'] || 'none',
      };
    } catch {
      directMetrics = null;
    }

    // Call official Google PageSpeed Insights API v5 endpoint
    const psiKey = (process.env.GOOGLE_PAGESPEED_API_KEY || process.env.PAGESPEED_API_KEY || '').trim();
    const apiKeyConfigured = Boolean(psiKey && !/your-|placeholder/i.test(psiKey));

    const psiParams = new URLSearchParams();
    psiParams.set('url', directMetrics?.finalUrl || targetUrl);
    psiParams.set('strategy', strategy);
    psiParams.append('category', 'performance');
    psiParams.append('category', 'accessibility');
    psiParams.append('category', 'best-practices');
    psiParams.append('category', 'seo');
    if (apiKeyConfigured) {
      psiParams.set('key', psiKey);
    }

    const psiEndpoint = `https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?${psiParams.toString()}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45000);

    try {
      const psiRes = await fetch(psiEndpoint, { signal: controller.signal });
      clearTimeout(timer);

      const psiData: any = await psiRes.json().catch(() => ({}));
      if (!psiRes.ok || !psiData?.lighthouseResult) {
        const rawErrMsg = String(psiData?.error?.message || `HTTP ${psiRes.status}`);
        // Sanitize just in case any upstream string includes query params
        const safeUpstreamMsg = rawErrMsg.replace(/([?&]key=)[^&\s]+/gi, '$1[REDACTED]');
        const isRateLimit =
          psiRes.status === 429 ||
          /quota|rate\s*limit|RESOURCE_EXHAUSTED/i.test(safeUpstreamMsg);

        return res.json({
          url: directMetrics?.finalUrl || targetUrl,
          strategy,
          source: 'Google PageSpeed Insights API v5 (pagespeedonline.googleapis.com)',
          apiKeyConfigured,
          retrievedAt: new Date().toISOString(),
          analysisTimestamp: null,
          directMetrics,
          psiAvailable: false,
          psiErrorCode: isRateLimit ? 'RATE_LIMITED' : 'UPSTREAM_ERROR',
          psiError: isRateLimit
            ? apiKeyConfigured
              ? 'Google PageSpeed Insights API rate limit or daily quota exceeded. Please try again later.'
              : 'Google PageSpeed Insights unkeyed quota exceeded. Configure GOOGLE_PAGESPEED_API_KEY on the server or try again later.'
            : UNAVAILABLE_MSG,
          psiErrorDetail: `Google PageSpeed Insights API returned (${psiRes.status}): ${safeUpstreamMsg}`,
          scores: null,
          labMetrics: null,
          fieldData: null,
          opportunities: [],
          diagnostics: [],
        });
      }

      const lhr = psiData.lighthouseResult;
      const categories = lhr.categories || {};
      const audits = lhr.audits || {};

      const scoreToInt = (cat: any): number | null =>
        typeof cat?.score === 'number' ? Math.round(cat.score * 100) : null;

      const scores = {
        performance: scoreToInt(categories.performance),
        accessibility: scoreToInt(categories.accessibility),
        bestPractices: scoreToInt(categories['best-practices']),
        seo: scoreToInt(categories.seo),
      };

      // Strictly label as Lighthouse Simulated Lab Data
      const extractLabMetric = (id: string) => {
        const a = audits[id];
        if (!a) return null;
        return {
          id,
          title: a.title || id,
          displayValue: a.displayValue || null,
          numericValue: typeof a.numericValue === 'number' ? a.numericValue : null,
          score: typeof a.score === 'number' ? a.score : null,
        };
      };

      const labMetrics = {
        lcp: extractLabMetric('largest-contentful-paint'),
        fcp: extractLabMetric('first-contentful-paint'),
        cls: extractLabMetric('cumulative-layout-shift'),
        tbt: extractLabMetric('total-blocking-time'),
        speedIndex: extractLabMetric('speed-index'),
        tti: extractLabMetric('interactive'),
        serverResponseTime: extractLabMetric('server-response-time'),
      };

      // Strictly label as Chrome UX Report (CrUX) Real-User Field Data
      const pageCrux = psiData.loadingExperience?.metrics ? psiData.loadingExperience : null;
      const originCrux =
        !pageCrux && psiData.originLoadingExperience?.metrics ? psiData.originLoadingExperience : null;
      const activeCrux = pageCrux || originCrux;
      const cruxMetrics = activeCrux?.metrics;

      const fieldData = activeCrux
        ? {
            available: Boolean(
              cruxMetrics &&
                (cruxMetrics.LARGEST_CONTENTFUL_PAINT_MS ||
                  cruxMetrics.INTERACTION_TO_NEXT_PAINT_MS ||
                  cruxMetrics.CUMULATIVE_LAYOUT_SHIFT_SCORE ||
                  cruxMetrics.FIRST_CONTENTFUL_PAINT_MS ||
                  cruxMetrics.EXPERIMENTAL_TIME_TO_FIRST_BYTE)
            ),
            scope: pageCrux ? ('page' as const) : ('origin' as const),
            overallCategory: (activeCrux.overall_category as 'FAST' | 'AVERAGE' | 'SLOW' | 'NONE') || null,
            lcp: extractCruxMetric(cruxMetrics, 'LARGEST_CONTENTFUL_PAINT_MS', 's-from-ms'),
            inp: extractCruxMetric(cruxMetrics, 'INTERACTION_TO_NEXT_PAINT_MS', 'ms'),
            cls: extractCruxMetric(cruxMetrics, 'CUMULATIVE_LAYOUT_SHIFT_SCORE', 'cls'),
            fcp: extractCruxMetric(cruxMetrics, 'FIRST_CONTENTFUL_PAINT_MS', 's-from-ms'),
            ttfb: extractCruxMetric(cruxMetrics, 'EXPERIMENTAL_TIME_TO_FIRST_BYTE', 'ms'),
          }
        : {
            available: false,
            scope: 'page' as const,
            overallCategory: null,
            lcp: null,
            inp: null,
            cls: null,
            fcp: null,
            ttfb: null,
          };

      // Build category lookup so diagnostics know which Lighthouse category flagged them
      const auditCategoryMap = new Map<string, string>();
      (['performance', 'accessibility', 'best-practices', 'seo'] as const).forEach((catKey) => {
        const refs = categories[catKey]?.auditRefs;
        if (Array.isArray(refs)) {
          refs.forEach((ref: any) => {
            if (ref?.id && !auditCategoryMap.has(ref.id)) {
              auditCategoryMap.set(
                ref.id,
                catKey === 'best-practices'
                  ? 'Best Practices'
                  : catKey === 'seo'
                  ? 'SEO'
                  : catKey.charAt(0).toUpperCase() + catKey.slice(1)
              );
            }
          });
        }
      });

      const opportunities = Object.values(audits)
        .filter((a: any) => a?.details?.type === 'opportunity' && typeof a.score === 'number' && a.score < 0.9)
        .sort((a: any, b: any) => (b.details?.overallSavingsMs || 0) - (a.details?.overallSavingsMs || 0))
        .slice(0, 8)
        .map((a: any) => ({
          id: String(a.id),
          title: String(a.title || a.id),
          description: cleanLighthouseDescription(a.description),
          displayValue: a.displayValue || null,
          savingsMs: Math.round(a.details?.overallSavingsMs || 0),
          savingsBytes: Math.round(a.details?.overallSavingsBytes || 0),
          score: typeof a.score === 'number' ? a.score : null,
        }));

      const diagnostics = Object.values(audits)
        .filter(
          (a: any) =>
            a?.details?.type !== 'opportunity' &&
            typeof a?.score === 'number' &&
            a.score < 0.9 &&
            a.scoreDisplayMode !== 'notApplicable' &&
            a.scoreDisplayMode !== 'manual'
        )
        .sort((a: any, b: any) => (a.score ?? 1) - (b.score ?? 1))
        .slice(0, 12)
        .map((a: any) => ({
          id: String(a.id),
          category: auditCategoryMap.get(String(a.id)) || 'Performance',
          title: String(a.title || a.id),
          description: cleanLighthouseDescription(a.description),
          displayValue: a.displayValue || null,
          score: typeof a.score === 'number' ? a.score : null,
        }));

      const passedAuditsCount = Object.values(audits).filter((a: any) => a?.score === 1).length;

      return res.json({
        url: lhr.finalUrl || targetUrl,
        requestedUrl: lhr.requestedUrl || targetUrl,
        strategy,
        source: 'Google PageSpeed Insights API v5 (pagespeedonline.googleapis.com)',
        lighthouseVersion: lhr.lighthouseVersion || null,
        apiKeyConfigured,
        analysisTimestamp: lhr.fetchTime || psiData.analysisUTCTimestamp || new Date().toISOString(),
        retrievedAt: new Date().toISOString(),
        directMetrics,
        psiAvailable: true,
        scores,
        labMetrics,
        fieldData,
        opportunities,
        diagnostics,
        passedAuditsCount,
      });
    } catch (psiErr: any) {
      clearTimeout(timer);
      const isTimeout = psiErr?.name === 'AbortError';
      return res.json({
        url: directMetrics?.finalUrl || targetUrl,
        strategy,
        source: 'Google PageSpeed Insights API v5 (pagespeedonline.googleapis.com)',
        apiKeyConfigured,
        retrievedAt: new Date().toISOString(),
        analysisTimestamp: null,
        directMetrics,
        psiAvailable: false,
        psiErrorCode: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
        psiError: isTimeout
          ? 'Google PageSpeed Insights API request timed out. Please try again later.'
          : UNAVAILABLE_MSG,
        psiErrorDetail: isTimeout
          ? 'PageSpeed Insights API v5 did not respond within 45 seconds.'
          : String(psiErr?.message || 'Network error while contacting pagespeedonline.googleapis.com').replace(/([?&]key=)[^&\s]+/gi, '$1[REDACTED]'),
        scores: null,
        labMetrics: null,
        fieldData: null,
        opportunities: [],
        diagnostics: [],
      });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'PageSpeed measurement failed.' });
  }
});

// Real JSON-LD Schema.org & Rich Results Validator Endpoint
app.post('/api/validate-schema', async (req: Request, res: Response): Promise<any> => {
  try {
    const { jsonLd, url } = req.body || {};
    const rawBlocks: string[] = [];
    let inspectedUrl: string | null = null;

    if (typeof url === 'string' && url.trim()) {
      const fetchResult = await safeFetchHtml(url.trim(), 2 * 1024 * 1024);
      inspectedUrl = fetchResult.finalUrl;
      const $ = cheerio.load(fetchResult.html);
      $('script[type="application/ld+json"]').each((_, el) => {
        const text = $(el).html()?.trim();
        if (text) rawBlocks.push(text);
      });
      if (rawBlocks.length === 0) {
        return res.json({
          inspectedUrl,
          totalBlocks: 0,
          validCount: 0,
          errorCount: 0,
          warningCount: 0,
          results: [],
          message: 'No <script type="application/ld+json"> structured data blocks were found on this page.',
        });
      }
    } else if (typeof jsonLd === 'string' && jsonLd.trim()) {
      rawBlocks.push(jsonLd.trim());
    } else {
      return res.status(400).json({ error: 'Provide either a JSON-LD snippet or a live URL to validate.' });
    }

    const REQUIRED_FIELDS: Record<string, string[]> = {
      Article: ['headline', 'author', 'datePublished'],
      NewsArticle: ['headline', 'author', 'datePublished'],
      BlogPosting: ['headline', 'author', 'datePublished'],
      Product: ['name'],
      Recipe: ['name'],
      Person: ['name'],
      FAQPage: ['mainEntity'],
      LocalBusiness: ['name', 'address'],
      Organization: ['name', 'url'],
      BreadcrumbList: ['itemListElement'],
      ItemList: ['itemListElement'],
      WebSite: ['name', 'url'],
      Event: ['name', 'startDate', 'location'],
      HowTo: ['name', 'step'],
      Review: ['itemReviewed', 'reviewRating', 'author'],
    };

    const RECOMMENDED_FIELDS: Record<string, string[]> = {
      Article: ['image', 'publisher', 'dateModified'],
      BlogPosting: ['image', 'publisher'],
      Product: ['offers', 'image', 'description'],
      Recipe: ['image', 'author', 'recipeIngredient', 'recipeInstructions'],
      Person: ['url', 'jobTitle', 'sameAs'],
      LocalBusiness: ['telephone', 'openingHoursSpecification'],
      Organization: ['logo', 'sameAs'],
      ItemList: ['name'],
    };

    const validateEntity = (
      node: any,
      errors: string[],
      warnings: string[],
      types: string[],
      labelPrefix?: string
    ) => {
      const typeVal = node['@type'];
      if (!typeVal) {
        errors.push(`${labelPrefix || 'Node'} is missing required "@type" declaration.`);
        return;
      }
      const nodeTypes = Array.isArray(typeVal) ? typeVal : [typeVal];
      nodeTypes.forEach((t) => {
        const typeStr = String(t);
        types.push(typeStr);
        const prefix = labelPrefix ? `${labelPrefix} (${typeStr})` : typeStr;
        const reqProps = REQUIRED_FIELDS[typeStr];
        if (reqProps) {
          reqProps.forEach((prop) => {
            const v = node[prop];
            if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) {
              errors.push(`${prefix}: Missing Google Rich Results required property "${prop}".`);
            }
          });
        }
        const recProps = RECOMMENDED_FIELDS[typeStr];
        if (recProps) {
          recProps.forEach((prop) => {
            const v = node[prop];
            if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) {
              warnings.push(`${prefix}: Missing recommended property "${prop}".`);
            }
          });
        }

        if (typeStr === 'ItemList' && Array.isArray(node.itemListElement)) {
          node.itemListElement.forEach((listEl: any, elIdx: number) => {
            const nestedItem = listEl && typeof listEl === 'object' && listEl.item && typeof listEl.item === 'object'
              ? listEl.item
              : null;
            if (nestedItem && nestedItem['@type']) {
              validateEntity(nestedItem, errors, warnings, types, `Item #${elIdx + 1}`);
            }
          });
        }
      });
    };

    const results = rawBlocks.map((block, index) => {
      const errors: string[] = [];
      const warnings: string[] = [];
      const types: string[] = [];

      let parsed: any;
      try {
        parsed = JSON.parse(block);
      } catch (parseErr: any) {
        return {
          index: index + 1,
          valid: false,
          types: [],
          errors: [`Invalid JSON syntax: ${parseErr.message}`],
          warnings: [],
          snippet: block.slice(0, 180),
        };
      }

      const nodes: any[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed['@graph'])
        ? parsed['@graph']
        : [parsed];

      const rootContext = parsed['@context'];
      if (!Array.isArray(parsed)) {
        if (!rootContext) {
          errors.push('Missing "@context" property (expected "https://schema.org").');
        } else if (typeof rootContext === 'string' && !/schema\.org/i.test(rootContext)) {
          warnings.push(`Unexpected "@context": "${rootContext}". Standard structured data uses "https://schema.org".`);
        }
      }

      nodes.forEach((node, nIdx) => {
        if (!node || typeof node !== 'object') {
          errors.push(`Node #${nIdx + 1} is not a valid JSON object.`);
          return;
        }
        validateEntity(node, errors, warnings, types, nodes.length > 1 ? `Entity #${nIdx + 1}` : undefined);
      });

      return {
        index: index + 1,
        valid: errors.length === 0,
        types,
        errors,
        warnings,
        snippet: block.slice(0, 180),
      };
    });

    return res.json({
      inspectedUrl,
      totalBlocks: results.length,
      validCount: results.filter((r) => r.valid).length,
      errorCount: results.reduce((acc, r) => acc + r.errors.length, 0),
      warningCount: results.reduce((acc, r) => acc + r.warnings.length, 0),
      results,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Schema validation failed.' });
  }
});

// 1. Full SEO Crawl & Deep Audit Endpoint
app.post('/api/crawl', async (req: Request, res: Response): Promise<any> => {
  try {
    const { url, maxPages = 1 } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required.' });
    }

    const report = await runFullSeoAudit(url, maxPages);
    return res.json(report);
  } catch (err: any) {
    const errorMessage = err.message || 'Internal audit processing error';
    const status = errorMessage.includes('blocked by website\'s robots.txt')
      ? 403
      : errorMessage.includes('rate limit') || errorMessage.includes('Rate limit')
      ? 429
      : errorMessage.includes('Invalid URL') || errorMessage.includes('prohibited') || errorMessage.includes('restricted')
      ? 400
      : 500;
    return res.status(status).json({ error: errorMessage });
  }
});

// 1b. Dedicated Technical SEO Audit Route (Live HTTP/Crawlability + Google PageSpeed Insights Lighthouse SEO API v5)
app.post('/api/technical-audit', async (req: Request, res: Response): Promise<any> => {
  try {
    const rawUrl = typeof req.body?.url === 'string' ? req.body.url.trim() : '';
    if (!rawUrl) {
      return res.status(400).json({ error: 'Website URL is required.' });
    }

    const withProtocol = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    const validation = await validateSafeUrl(withProtocol);
    if (!validation.safe || !validation.urlObj) {
      return res.status(400).json({ error: validation.error || 'Please provide a valid public HTTP/HTTPS URL.' });
    }

    const targetUrlObj = validation.urlObj;
    const targetUrl = targetUrlObj.toString();
    const origin = targetUrlObj.origin;

    // 1. Live HTTP/HTML + Robots + Sitemap inspection
    const liveInspectionPromise = (async () => {
      const robotsRules = await robotsManager.getRules(origin);
      const robotsTxtAllowed = robotsManager.isAllowed(targetUrlObj, robotsRules);

      let auditReport: any = null;
      let httpStatus: number | null = null;
      let ttfbMs: number | null = null;
      let htmlSizeKb: number | null = null;
      let compression = 'none';
      let redirectChain: Array<{ url: string; status: number }> = [];
      let finalUrl = targetUrl;
      let xRobotsTag = '';

      if (robotsTxtAllowed) {
        auditReport = await runFullSeoAudit(targetUrl, 1);
        httpStatus = auditReport.httpStatus;
        ttfbMs = auditReport.responseTimeMs;
        htmlSizeKb = auditReport.pageSizeKb;
        compression = auditReport.pageInfo?.compression || 'none';
        redirectChain = Array.isArray(auditReport.redirectChain) ? auditReport.redirectChain : [];
        finalUrl = auditReport.url || targetUrl;
        xRobotsTag = auditReport.pageInfo?.xRobotsTag || '';
      } else {
        // Still perform a safe HEAD check to inspect real HTTP status code and X-Robots-Tag even when robots.txt disallows crawling
        try {
          const startedAt = Date.now();
          const headRes = await fetchWithSafeRedirects(targetUrl, {
            method: 'HEAD',
            headers: { 'User-Agent': 'RankoraBot/1.0 (+https://rankora.app/bot)' },
            timeoutMs: 6000,
            maxHops: 5,
          });
          ttfbMs = Date.now() - startedAt;
          httpStatus = headRes.response.status;
          finalUrl = headRes.finalUrl;
          redirectChain = headRes.redirectChain;
          xRobotsTag = headRes.response.headers.get('x-robots-tag') || '';
          compression = headRes.response.headers.get('content-encoding') || 'none';
        } catch {
          httpStatus = null;
        }
      }

      // Check canonical URL HTTP status if canonical differs from finalUrl
      const canonicalUrl = auditReport?.pageInfo?.canonical || '';
      let canonicalStatus: number | null = canonicalUrl ? httpStatus : null;
      let canonicalMatchesFinal = false;
      if (canonicalUrl) {
        try {
          const resolvedCanonical = new URL(canonicalUrl, finalUrl).toString();
          canonicalMatchesFinal =
            resolvedCanonical.replace(/\/+$/, '') === finalUrl.replace(/\/+$/, '');
          if (!canonicalMatchesFinal) {
            const canCheck = await fetchWithSafeRedirects(resolvedCanonical, {
              method: 'HEAD',
              headers: { 'User-Agent': 'RankoraBot/1.0 (+https://rankora.app/bot)' },
              timeoutMs: 5000,
              maxHops: 3,
            });
            canonicalStatus = canCheck.response.status;
          }
        } catch {
          canonicalStatus = null;
        }
      }

      // Check sitemap if auditReport wasn't populated (e.g. robots blocked)
      let sitemapUrl = auditReport?.sitemapUrl || robotsRules.sitemapUrl || `${origin}/sitemap.xml`;
      let sitemapStatus: number | null = auditReport?.sitemapStatus ?? null;
      let sitemapUrlCount: number | null = auditReport?.sitemapUrlCount ?? null;
      if (!auditReport) {
        try {
          const smRes = await fetchWithSafeRedirects(sitemapUrl, {
            method: 'GET',
            headers: { 'User-Agent': 'RankoraBot/1.0 (+https://rankora.app/bot)' },
            timeoutMs: 5000,
            maxHops: 3,
          });
          sitemapStatus = smRes.response.status;
          if (sitemapStatus === 200) {
            const smXml = await smRes.response.text();
            const $sm = cheerio.load(smXml, { xmlMode: true });
            sitemapUrlCount =
              $sm('urlset > url > loc').length ||
              $sm('sitemapindex > sitemap > loc').length ||
              $sm('loc').length;
          }
        } catch {
          sitemapStatus = null;
        }
      }

      return {
        robotsRules,
        robotsTxtAllowed,
        auditReport,
        httpStatus,
        ttfbMs,
        htmlSizeKb,
        compression,
        redirectChain,
        finalUrl,
        xRobotsTag,
        canonicalUrl,
        canonicalStatus,
        canonicalMatchesFinal,
        sitemapUrl,
        sitemapStatus,
        sitemapUrlCount,
      };
    })();

    // 2. Google PageSpeed Insights API v5 (Lighthouse SEO & Best Practices Crawlability Audits)
    const lighthouseSeoPromise = (async () => {
      const psiKey = (process.env.GOOGLE_PAGESPEED_API_KEY || process.env.PAGESPEED_API_KEY || '').trim();
      const apiKeyConfigured = Boolean(psiKey && !/your-|placeholder/i.test(psiKey));
      const psiParams = new URLSearchParams();
      psiParams.set('url', targetUrl);
      psiParams.set('strategy', 'mobile');
      psiParams.append('category', 'seo');
      psiParams.append('category', 'best-practices');
      if (apiKeyConfigured) {
        psiParams.set('key', psiKey);
      }

      const psiEndpoint = `https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?${psiParams.toString()}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30000);

      try {
        const psiRes = await fetch(psiEndpoint, { signal: controller.signal });
        clearTimeout(timer);
        const psiData: any = await psiRes.json().catch(() => ({}));
        if (!psiRes.ok || !psiData?.lighthouseResult) {
          const msg = String(psiData?.error?.message || `HTTP ${psiRes.status}`).replace(
            /([?&]key=)[^&\s]+/gi,
            '$1[REDACTED]'
          );
          return {
            available: false,
            source: 'Google PageSpeed Insights API v5 (pagespeedonline.googleapis.com)',
            seoScore: null,
            bestPracticesScore: null,
            audits: [],
            error: `Google PageSpeed Insights API returned (${psiRes.status}): ${msg}`,
          };
        }

        const lhr = psiData.lighthouseResult;
        const categories = lhr.categories || {};
        const audits = lhr.audits || {};
        const targetAuditIds = [
          'http-status-code',
          'is-crawlable',
          'robots-txt',
          'canonical',
          'hreflang',
          'crawlable-anchors',
          'viewport',
          'document-title',
          'meta-description',
          'link-text',
          'structured-data',
        ];

        const extractedAudits = targetAuditIds
          .map((id) => {
            const a = audits[id];
            if (!a) return null;
            const score = typeof a.score === 'number' ? a.score : null;
            return {
              id,
              title: String(a.title || id),
              description: cleanLighthouseDescription(a.description),
              score,
              displayValue: a.displayValue || null,
              passed: score === null ? null : score >= 0.9,
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null);

        return {
          available: true,
          source: 'Google PageSpeed Insights API v5 (pagespeedonline.googleapis.com)',
          seoScore:
            typeof categories.seo?.score === 'number'
              ? Math.round(categories.seo.score * 100)
              : null,
          bestPracticesScore:
            typeof categories['best-practices']?.score === 'number'
              ? Math.round(categories['best-practices'].score * 100)
              : null,
          audits: extractedAudits,
        };
      } catch (err: any) {
        clearTimeout(timer);
        return {
          available: false,
          source: 'Google PageSpeed Insights API v5 (pagespeedonline.googleapis.com)',
          seoScore: null,
          bestPracticesScore: null,
          audits: [],
          error:
            err?.name === 'AbortError'
              ? 'Google PageSpeed Insights API timed out after 30s.'
              : String(err?.message || 'Unable to reach pagespeedonline.googleapis.com').replace(
                  /([?&]key=)[^&\s]+/gi,
                  '$1[REDACTED]'
                ),
        };
      }
    })();

    const [live, lighthouseSeo] = await Promise.all([
      liveInspectionPromise,
      lighthouseSeoPromise,
    ]);

    const robotsMeta = live.auditReport?.pageInfo?.robotsMeta || '';
    const isNoindex =
      /noindex|none/i.test(robotsMeta) || /noindex|none/i.test(live.xRobotsTag || '');
    const httpSuccess = typeof live.httpStatus === 'number' && live.httpStatus >= 200 && live.httpStatus < 400;
    const isCrawlable = Boolean(live.robotsTxtAllowed && httpSuccess);
    const isIndexable = Boolean(isCrawlable && !isNoindex);

    const statusCode = live.httpStatus;
    const statusLabel =
      statusCode === null
        ? 'Unreachable'
        : statusCode >= 500
        ? `HTTP ${statusCode} Server Error`
        : statusCode >= 400
        ? `HTTP ${statusCode} Client Error`
        : statusCode >= 300
        ? `HTTP ${statusCode} Redirect`
        : `HTTP ${statusCode} OK`;

    // Derive deterministic technical score from real measured signals
    let technicalScore = live.auditReport?.scores?.technical ?? 75;
    if (!live.robotsTxtAllowed) technicalScore = Math.min(technicalScore, 45);
    if (!httpSuccess) technicalScore = Math.min(technicalScore, 35);
    if (isNoindex) technicalScore = Math.min(technicalScore, 55);
    if (lighthouseSeo.available && typeof lighthouseSeo.seoScore === 'number') {
      technicalScore = Math.round(technicalScore * 0.6 + lighthouseSeo.seoScore * 0.4);
    }

    const dataSources = ['Live HTTP/HTML Crawler & Robots/Sitemap Inspector'];
    if (lighthouseSeo.available) {
      dataSources.push('Google PageSpeed Insights API v5 (Lighthouse SEO)');
    }

    return res.json({
      url: live.finalUrl,
      requestedUrl: targetUrl,
      auditedAt: new Date().toISOString(),
      dataSources,
      technicalScore,
      status: {
        httpStatus: live.httpStatus,
        statusLabel,
        isHttps: live.finalUrl.startsWith('https://'),
        ttfbMs: live.ttfbMs,
        htmlSizeKb: live.htmlSizeKb,
        compression: live.compression,
        redirectChain: live.redirectChain,
        redirectHops: live.redirectChain.length,
      },
      securityHeaders: {
        hsts: Boolean(live.auditReport?.pageInfo?.hasHsts),
        xFrameOptions: Boolean(live.auditReport?.pageInfo?.hasXFrameOptions),
        contentSecurityPolicy: Boolean(live.auditReport?.pageInfo?.hasContentSecurityPolicy),
      },
      crawlability: {
        robotsTxtFound: live.robotsRules.found,
        robotsTxtStatus: live.robotsRules.httpStatus,
        robotsTxtAllowed: live.robotsTxtAllowed,
        disallowedPathsCount: live.robotsRules.disallowedPaths.length,
        sitemapUrl: live.sitemapUrl,
        sitemapStatus: live.sitemapStatus,
        sitemapUrlCount: live.sitemapUrlCount,
        robotsMeta,
        xRobotsTag: live.xRobotsTag,
        isCrawlable,
        isIndexable,
        canonicalUrl: live.canonicalUrl,
        canonicalStatus: live.canonicalStatus,
        canonicalMatchesFinal: live.canonicalMatchesFinal,
        internalLinksCount: live.auditReport?.links?.internalCount ?? 0,
        externalLinksCount: live.auditReport?.links?.externalCount ?? 0,
        nofollowLinksCount: live.auditReport?.links?.nofollowCount ?? 0,
      },
      lighthouseSeo,
      auditReport: live.auditReport,
    });
  } catch (err: any) {
    const errorMessage = err.message || 'Technical SEO audit failed.';
    const status =
      errorMessage.includes('Invalid URL') ||
      errorMessage.includes('prohibited') ||
      errorMessage.includes('restricted')
        ? 400
        : 500;
    return res.status(status).json({ error: errorMessage });
  }
});

// 2. Broken Link Checker
app.post('/api/check-links', async (req: Request, res: Response): Promise<any> => {
  try {
    const { url, maxLinks = 25 } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const fetchResult = await safeFetchHtml(url);
    const $ = cheerio.load(fetchResult.html);
    const currentOrigin = new URL(fetchResult.finalUrl).origin;

    const discoveredUrls: Array<{ href: string; anchorText: string; isInternal: boolean }> = [];
    const seen = new Set<string>();

    $('a[href]').each((_, el) => {
      const rawHref = $(el).attr('href')?.trim();
      const anchorText = $(el).text().trim().slice(0, 70) || '[No text]';

      if (rawHref && !rawHref.startsWith('#') && !rawHref.startsWith('javascript:') && !rawHref.startsWith('mailto:') && !rawHref.startsWith('tel:')) {
        try {
          const resolved = new URL(rawHref, fetchResult.finalUrl);
          if (resolved.protocol === 'http:' || resolved.protocol === 'https:') {
            const cleanUrl = resolved.toString();
            if (!seen.has(cleanUrl) && discoveredUrls.length < maxLinks) {
              seen.add(cleanUrl);
              discoveredUrls.push({
                href: cleanUrl,
                anchorText,
                isInternal: resolved.origin === currentOrigin,
              });
            }
          }
        } catch {
          // ignore invalid
        }
      }
    });

    // Check each link with timeout
    const results = await Promise.all(
      discoveredUrls.map(async (item) => {
        const start = Date.now();
        try {
          // SSRF check for target
          const validation = await validateSafeUrl(item.href);
          if (!validation.safe) {
            return {
              ...item,
              status: 403,
              statusText: 'Blocked by SSRF policy',
              timeMs: 0,
              isBroken: true,
            };
          }

          let resp: globalThis.Response;
          try {
            const headOut = await fetchWithSafeRedirects(item.href, {
              method: 'HEAD',
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 RankoraBot/1.0',
                'Accept': '*/*',
              },
              timeoutMs: 6000,
              maxHops: 5,
            });
            resp = headOut.response;

            // If server disallows HEAD (e.g. 405 Method Not Allowed, 403 Forbidden, 400), retry with lightweight GET
            if (resp.status === 405 || resp.status === 403 || resp.status === 400) {
              const getOut = await fetchWithSafeRedirects(item.href, {
                method: 'GET',
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 RankoraBot/1.0',
                  'Accept': 'text/html,*/*',
                  'Range': 'bytes=0-1024',
                },
                timeoutMs: 6000,
                maxHops: 5,
              });
              resp = getOut.response;
            }
          } catch {
            const getOut = await fetchWithSafeRedirects(item.href, {
              method: 'GET',
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 RankoraBot/1.0',
                'Accept': 'text/html,*/*',
                'Range': 'bytes=0-1024',
              },
              timeoutMs: 6000,
              maxHops: 5,
            });
            resp = getOut.response;
          }

          const timeMs = Date.now() - start;
          const isBroken = resp.status >= 400;
          return {
            ...item,
            status: resp.status,
            statusText: resp.statusText,
            timeMs,
            isBroken,
          };
        } catch (err: any) {
          return {
            ...item,
            status: 0,
            statusText: err.name === 'AbortError' ? 'Timeout (6s)' : (err.message || 'Connection failed'),
            timeMs: Date.now() - start,
            isBroken: true,
          };
        }
      })
    );

    const brokenCount = results.filter((r) => r.isBroken).length;
    const workingCount = results.length - brokenCount;

    return res.json({
      targetUrl: fetchResult.finalUrl,
      totalChecked: results.length,
      workingCount,
      brokenCount,
      links: results,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Link checking failed' });
  }
});

// 3. Real Keyword Suggestions & Google Autocomplete Extractor (Zero synthetic volume/CPC/difficulty)
app.post('/api/keyword-suggestions', async (req: Request, res: Response): Promise<any> => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Keyword query is required.' });
    }

    const cleanQuery = query.trim().slice(0, 100);
    const prefixes = ['', 'how to ', 'best ', 'what is ', 'why '];
    const letters = ['a', 'b', 'c', 'd', 'e'];

    let anySuccess = false;

    async function fetchSuggest(q: string): Promise<string[]> {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      try {
        const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(q)}`;
        const r = await fetch(url, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        });
        clearTimeout(timer);
        if (r.ok) {
          const data = await r.json();
          if (Array.isArray(data) && Array.isArray(data[1])) {
            anySuccess = true;
            return data[1].filter((item: unknown) => typeof item === 'string');
          }
        }
      } catch {
        clearTimeout(timer);
      }
      return [];
    }

    const tasks = [
      fetchSuggest(cleanQuery),
      ...prefixes.slice(1).map((p) => fetchSuggest(p + cleanQuery)),
      ...letters.map((l) => fetchSuggest(cleanQuery + ' ' + l)),
    ];

    const batchResults = await Promise.all(tasks);
    if (!anySuccess) {
      return res.status(502).json({ error: UNAVAILABLE_MSG });
    }

    const set = new Set<string>();
    const directSuggestions: string[] = [];
    const questionSuggestions: string[] = [];
    const modifierSuggestions: string[] = [];

    (batchResults[0] || []).forEach((item) => {
      const lower = item.toLowerCase();
      if (!set.has(lower)) {
        set.add(lower);
        directSuggestions.push(item);
      }
    });

    batchResults.slice(1, 5).forEach((list) => {
      list.forEach((item) => {
        const lower = item.toLowerCase();
        if (!set.has(lower) && lower !== cleanQuery.toLowerCase()) {
          set.add(lower);
          questionSuggestions.push(item);
        }
      });
    });

    batchResults.slice(5).forEach((list) => {
      list.forEach((item) => {
        const lower = item.toLowerCase();
        if (!set.has(lower) && lower !== cleanQuery.toLowerCase()) {
          set.add(lower);
          modifierSuggestions.push(item);
        }
      });
    });

    const analyzeIntent = (kw: string): 'Transactional' | 'Commercial' | 'Informational' | 'Navigational' => {
      const lower = kw.toLowerCase();
      if (lower.startsWith('buy') || lower.includes('price') || lower.includes('discount') || lower.includes('cheap') || lower.includes('cost')) {
        return 'Transactional';
      }
      if (lower.includes('best') || lower.includes('review') || lower.includes('vs') || lower.includes('top') || lower.includes('compare')) {
        return 'Commercial';
      }
      if (lower.startsWith('how') || lower.startsWith('what') || lower.startsWith('why') || lower.includes('guide') || lower.includes('tutorial')) {
        return 'Informational';
      }
      return 'Navigational';
    };

    const combinedList = [...directSuggestions, ...questionSuggestions, ...modifierSuggestions].slice(0, 50);

    const detailedKeywords = combinedList.map((kw) => {
      const intent = analyzeIntent(kw);
      return {
        keyword: kw,
        intent,
        difficulty: null,
        difficultyLabel: 'Unavailable' as const,
        volumeTier: null,
        cpcEstimate: null,
        isSearchVolumeBacked: false,
        category: intent,
      };
    });

    return res.json({
      query: cleanQuery,
      source: 'Google Autocomplete API (suggestqueries.google.com)',
      retrievedAt: new Date().toISOString(),
      metricsAvailable: false,
      unavailableReason: UNAVAILABLE_MSG,
      total: detailedKeywords.length,
      keywords: detailedKeywords,
      questions: questionSuggestions.slice(0, 15),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch keyword suggestions' });
  }
});

// 4. AI Content Optimizer (Powered by Gemini - No fake fallbacks)
app.post('/api/ai-optimize', async (req: Request, res: Response): Promise<any> => {
  try {
    const { content, targetKeyword, pageTitle } = req.body;
    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'Content text is required.' });
    }

    if (!hasConfiguredGeminiKey()) {
      return res.status(503).json({
        error: UNAVAILABLE_MSG,
        details: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const prompt = `You are a world-class SEO content optimization engineer. Analyze this content for SEO excellence:

Target Keyword: ${targetKeyword || 'General SEO'}
Current Title: ${pageTitle || 'None provided'}

Content Draft:
"""
${content.slice(0, 5000)}
"""

Provide an actionable, structured optimization response in strict JSON format with:
1. "overallContentScore": number from 1 to 100
2. "readabilityGrade": string (e.g. "8th Grade - Easy to read")
3. "keywordAssessment": object with "densityStatus": string, "occurrences": number, "recommendation": string
4. "titleSuggestions": array of 3 high-CTR, SEO-optimized title ideas (between 50-60 characters)
5. "metaDescriptionSuggestions": array of 2 compelling meta descriptions (between 140-155 characters)
6. "missingLsiKeywords": array of 6-8 semantic entities and related keywords that should be naturally included
7. "contentGaps": array of 3 specific subtopics or questions currently missing from the text
8. "quickWins": array of 3 immediate improvements to boost organic rankings.

Return ONLY valid JSON matching this schema.`;

    const ai = getGeminiClient();
    const aiResponse = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const jsonText = (aiResponse.text || '').trim();
    if (!jsonText) {
      return res.status(502).json({ error: UNAVAILABLE_MSG });
    }
    const parsed = JSON.parse(jsonText);
    return res.json({
      ...parsed,
      isAiPowered: true,
      model: 'gemini-4-hydrogen',
      retrievedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Gemini /api/ai-optimize error:', err?.message || err);
    return res.status(502).json({
      error: UNAVAILABLE_MSG,
      details: err?.message || 'Gemini API request failed.',
    });
  }
});

// 4b. Comprehensive Content SEO Analyzer (Deterministic NLP + Optional Gemini 4 Hydrogen)
app.post('/api/ai-content-analysis', async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      content,
      primaryKeyword = '',
      secondaryKeywords = '',
      targetAudience = 'General Web Readers',
      searchIntent = 'Informational',
    } = req.body;

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'Content text is required for analysis.' });
    }

    const rawText = content.trim();
    const words = rawText.toLowerCase().match(/\b[a-z0-9'-]{2,}\b/g) || [];
    const wordCount = words.length;
    const sentences = (rawText.match(/[.!?]+(?:\s+|$)/g) || []).length || 1;
    const paragraphs = rawText.split(/\n+/).filter((p) => p.trim().length > 0);
    const paragraphCount = paragraphs.length || 1;

    const countWordSyllables = (word: string) => {
      const clean = word.toLowerCase().replace(/(?:[^laeiouy]|ed|es|e)$/, '').replace(/^y/, '');
      const matches = clean.match(/[aeiouy]{1,2}/g);
      return matches ? matches.length : 1;
    };

    const totalSyllables = words.reduce((acc, w) => acc + countWordSyllables(w), 0);
    const difficultWordsCount = words.filter((w) => countWordSyllables(w) >= 3).length;

    const avgSentenceLength = Number((wordCount / Math.max(1, sentences)).toFixed(1));
    const avgParagraphLength = Math.round(wordCount / Math.max(1, paragraphCount));
    const avgSyllablesPerWord = totalSyllables / Math.max(1, wordCount);
    const fleschScore = Math.round(
      Math.max(0, Math.min(100, 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord))
    );

    let gradeLevel = 'Standard (8th–9th Grade)';
    if (fleschScore >= 90) gradeLevel = 'Very Easy (5th Grade)';
    else if (fleschScore >= 80) gradeLevel = 'Easy (6th Grade)';
    else if (fleschScore >= 70) gradeLevel = 'Fairly Easy (7th Grade)';
    else if (fleschScore >= 60) gradeLevel = 'Standard (8th–9th Grade)';
    else if (fleschScore >= 50) gradeLevel = 'Fairly Difficult (High School)';
    else if (fleschScore >= 30) gradeLevel = 'Difficult (College Level)';
    else gradeLevel = 'Very Difficult (Academic)';

    const passiveMatches = rawText.match(/\b(am|is|are|was|were|be|been|being)\s+([a-z]+ed)\b/gi) || [];
    const passiveVoiceCount = passiveMatches.length;

    const transitionRegex =
      /\b(however|therefore|moreover|furthermore|consequently|additionally|nonetheless|nevertheless|meanwhile|for example|for instance|as a result|finally|firstly|secondly|thirdly|specifically|in addition|similarly|likewise|otherwise|instead|overall|ultimately)\b/gi;
    const transitionWordsCount = (rawText.match(transitionRegex) || []).length;

    const pk = String(primaryKeyword || '').trim().toLowerCase();
    let primaryOccurrences = 0;
    let primaryKeywordDensity = 0;
    if (pk) {
      const pkRegex = new RegExp(`\\b${pk.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
      primaryOccurrences = (rawText.match(pkRegex) || []).length;
      primaryKeywordDensity = Number(((primaryOccurrences / Math.max(1, wordCount)) * 100).toFixed(2));
    }

    const secList = typeof secondaryKeywords === 'string'
      ? secondaryKeywords.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
      : Array.isArray(secondaryKeywords)
      ? secondaryKeywords.map((s) => String(s).trim().toLowerCase()).filter(Boolean)
      : [];

    const secondaryKeywordStats = secList.map((sk) => {
      const regex = new RegExp(`\\b${sk.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
      const count = (rawText.match(regex) || []).length;
      const density = Number(((count / Math.max(1, wordCount)) * 100).toFixed(2));
      return { keyword: sk, count, density };
    });

    const stopWords = new Set([
      'the', 'and', 'for', 'that', 'this', 'with', 'you', 'have', 'are', 'from',
      'not', 'your', 'all', 'can', 'was', 'our', 'will', 'about', 'more', 'when',
      'they', 'what', 'their', 'which', 'there', 'who', 'been', 'out', 'into',
      'just', 'then', 'any', 'these', 'them', 'than', 'some', 'other', 'its',
    ]);
    const wordFreq: Record<string, number> = {};
    for (const w of words) {
      if (w.length > 3 && !stopWords.has(w) && !/^\d+$/.test(w)) {
        wordFreq[w] = (wordFreq[w] || 0) + 1;
      }
    }

    const stuffedPhrases: Array<{ phrase: string; count: number; density: number; reason: string }> = [];
    const overusedKeywordsToHighlight: string[] = [];

    if (pk && primaryKeywordDensity > 3.0) {
      overusedKeywordsToHighlight.push(pk);
      stuffedPhrases.push({
        phrase: pk,
        count: primaryOccurrences,
        density: primaryKeywordDensity,
        reason: `Primary keyword density (${primaryKeywordDensity}%) exceeds 3.0% threshold.`,
      });
    }

    Object.entries(wordFreq).forEach(([word, count]) => {
      const density = Number(((count / Math.max(1, wordCount)) * 100).toFixed(2));
      if (density > 3.5 && count >= 4) {
        if (!overusedKeywordsToHighlight.includes(word)) overusedKeywordsToHighlight.push(word);
        if (word !== pk) {
          stuffedPhrases.push({
            phrase: word,
            count,
            density,
            reason: `Word density (${density}%) repeated ${count} times.`,
          });
        }
      }
    });

    const hasHeadings = /^#{1,6}\s/m.test(rawText) || /<h[1-6][^>]*>/i.test(rawText);
    const hasPrimaryInFirstParagraph = pk
      ? (paragraphs[0] || '').toLowerCase().includes(pk)
      : false;

    const spellingGrammarNotes: string[] = [];
    if (passiveVoiceCount > 3) {
      spellingGrammarNotes.push(`Detected ${passiveVoiceCount} passive voice phrasing pattern(s); rewrite using active verbs where clear.`);
    } else {
      spellingGrammarNotes.push(`Passive voice usage is low (${passiveVoiceCount} detected).`);
    }
    if (avgSentenceLength > 22) {
      spellingGrammarNotes.push(`Average sentence length (${avgSentenceLength} words) is long; aim for 14–20 words per sentence.`);
    } else {
      spellingGrammarNotes.push(`Average sentence length (${avgSentenceLength} words) is well paced for web reading.`);
    }
    if (!hasHeadings) {
      spellingGrammarNotes.push('No Markdown (#) or HTML (<h2>/<h3>) subheadings detected in the draft.');
    }

    const deterministicReadabilityMetrics = {
      fleschScore,
      gradeLevel,
      avgSentenceLength,
      avgParagraphLength,
      passiveVoiceCount,
      difficultWordsCount,
      repeatedWords: Array.from(new Set(overusedKeywordsToHighlight)),
      transitionWordsCount,
      spellingGrammarNotes,
    };

    const deterministicStuffingReport = {
      primaryKeywordDensity,
      primaryOccurrences,
      secondaryKeywordStats,
      stuffedPhrases,
      unnaturalPlacementNotes: [
        pk
          ? primaryKeywordDensity > 3.0
            ? `Primary keyword "${pk}" appears ${primaryOccurrences} times (${primaryKeywordDensity}% density — high).`
            : primaryKeywordDensity === 0
            ? `Primary keyword "${pk}" was not found in the text.`
            : `Primary keyword "${pk}" appears ${primaryOccurrences} times (${primaryKeywordDensity}% density).`
          : 'No primary keyword specified.',
        pk && !hasPrimaryInFirstParagraph
          ? `Primary keyword "${pk}" does not appear in the opening paragraph.`
          : pk
          ? `Primary keyword "${pk}" is present in the opening paragraph.`
          : '',
      ].filter(Boolean),
      overusedKeywordsToHighlight: Array.from(new Set(overusedKeywordsToHighlight)),
    };

    // Deterministic technical text scores (always real & measured from the submitted draft)
    const kwScore = !pk ? 50 : primaryKeywordDensity >= 0.8 && primaryKeywordDensity <= 2.5 ? 92 : primaryKeywordDensity > 3.5 ? 48 : primaryOccurrences > 0 ? 74 : 35;
    const lenScore = wordCount >= 800 ? 92 : wordCount >= 400 ? 78 : wordCount >= 200 ? 60 : 35;
    const headingScore = hasHeadings ? 88 : 45;
    const paraScore = avgParagraphLength <= 80 ? 88 : avgParagraphLength <= 130 ? 70 : 50;
    const deterministicScoreBreakdown: Record<string, { score: number; explanation: string }> = {
      keywordOptimization: {
        score: kwScore,
        explanation: pk
          ? `Measured "${pk}" ${primaryOccurrences} time(s) (${primaryKeywordDensity}% of ${wordCount} words).`
          : 'Provide a primary target keyword to score exact density and placement.',
      },
      contentDepth: {
        score: lenScore,
        explanation: `Submitted draft contains ${wordCount.toLocaleString()} words across ${paragraphCount} paragraph(s).`,
      },
      headingStructure: {
        score: headingScore,
        explanation: hasHeadings
          ? 'Markdown or HTML heading markers detected in draft.'
          : 'No headings detected; use H2/H3 structure to organize sections.',
      },
      readability: {
        score: fleschScore,
        explanation: `Exact Flesch Reading Ease: ${fleschScore}/100 (${gradeLevel}), avg ${avgSentenceLength} words/sentence.`,
      },
      paragraphStructure: {
        score: paraScore,
        explanation: `Average paragraph contains ${avgParagraphLength} words across ${paragraphCount} block(s).`,
      },
      vocabularyVariety: {
        score: Math.min(95, Math.max(40, Math.round((Object.keys(wordFreq).length / Math.max(1, wordCount)) * 180))),
        explanation: `${Object.keys(wordFreq).length} unique non-stopword terms detected.`,
      },
    };

    const deterministicOverallScore = Math.round(
      Object.values(deterministicScoreBreakdown).reduce((acc, s) => acc + s.score, 0) /
        Object.keys(deterministicScoreBreakdown).length
    );

    // Optional AI Semantic & Rewrite Analysis via Google Gemini (ONLY if key configured; never fake rewrites or volumes)
    let isAiPowered = false;
    let aiUnavailable = false;
    let aiErrorDetail: string | null = null;
    let aiStatusNote = 'Deterministic local text metrics computed cleanly.';
    let aiOptimizations: any = null;
    let keywordSuggestions: any[] = [];
    let finalScoreBreakdown = deterministicScoreBreakdown;
    let finalOverallScore = deterministicOverallScore;

    if (!hasConfiguredGeminiKey()) {
      aiUnavailable = true;
      aiErrorDetail = 'GEMINI_API_KEY is not configured.';
      aiStatusNote = UNAVAILABLE_MSG;
    } else {
      try {
        const prompt = `You are a senior SEO Content Strategist. Analyze this draft accurately. Do NOT fabricate search volume numbers.

Primary Target Keyword: ${primaryKeyword || 'Not specified'}
Secondary Keywords: ${secList.length > 0 ? secList.join(', ') : 'None'}
Target Audience: ${targetAudience}
Search Intent: ${searchIntent}

CONTENT DRAFT (${wordCount} words):
"""
${rawText.slice(0, 7000)}
"""

Return strict JSON matching:
{
  "overallScore": number (0-100),
  "semanticScores": {
    "contentRelevance": { "score": number, "explanation": string },
    "semanticCoverage": { "score": number, "explanation": string },
    "searchIntentAlignment": { "score": number, "explanation": string },
    "contentCompleteness": { "score": number, "explanation": string }
  },
  "keywordSuggestions": [
    { "keyword": string, "type": "related" | "semantic" | "synonym" | "long-tail" | "question" | "commercial" | "informational" }
  ],
  "aiOptimizations": {
    "suggestedSeoTitle": string,
    "suggestedMetaDescription": string,
    "suggestedH1": string,
    "suggestedH2s": [string],
    "suggestedH3s": [string],
    "suggestedIntro": string,
    "suggestedConclusion": string,
    "faqSection": [{ "question": string, "answer": string }],
    "keywordPlacementAdvice": [string],
    "semanticImprovements": [string],
    "contentGaps": [string],
    "fullOptimizedText": string
  }
}
Return ONLY valid JSON.`;

        const ai = getGeminiClient();
        const aiResponse = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const parsed = JSON.parse((aiResponse.text || '{}').trim());
        isAiPowered = true;
        aiStatusNote = 'Evaluated via Google Gemini (gemini-4-hydrogen) + Exact NLP Text Metrics';
        if (typeof parsed.overallScore === 'number') {
          finalOverallScore = Math.max(0, Math.min(100, Math.round(parsed.overallScore)));
        }
        if (parsed.semanticScores && typeof parsed.semanticScores === 'object') {
          finalScoreBreakdown = {
            ...deterministicScoreBreakdown,
            ...parsed.semanticScores,
          };
        }
        if (Array.isArray(parsed.keywordSuggestions)) {
          keywordSuggestions = parsed.keywordSuggestions.map((item: any) => ({
            keyword: String(item.keyword || ''),
            type: String(item.type || 'semantic'),
            isSearchDataBacked: false,
            searchVolumeTier: null,
          }));
        }
        aiOptimizations = parsed.aiOptimizations || null;
      } catch (apiErr: any) {
        aiUnavailable = true;
        aiErrorDetail = apiErr?.message || 'Gemini API call failed.';
        aiStatusNote = UNAVAILABLE_MSG;
      }
    }

    return res.json({
      isAiPowered,
      aiUnavailable,
      aiErrorDetail,
      aiStatusNote,
      retrievedAt: new Date().toISOString(),
      deterministicStats: {
        wordCount,
        sentenceCount: sentences,
        paragraphCount,
        uniqueTermsCount: Object.keys(wordFreq).length,
      },
      overallScore: finalOverallScore,
      scoreBreakdown: finalScoreBreakdown,
      keywordStuffingReport: deterministicStuffingReport,
      keywordSuggestions,
      readabilityMetrics: deterministicReadabilityMetrics,
      aiOptimizations,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Content analysis failed.' });
  }
});

// 5. Bulk URL SEO Checker
app.post('/api/bulk-check', async (req: Request, res: Response): Promise<any> => {
  try {
    const { urls } = req.body;
    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'Array of URLs is required.' });
    }

    const sanitizedUrls = urls.slice(0, 15); // Max 15 per batch for fast response
    const results = await Promise.all(
      sanitizedUrls.map(async (rawUrl) => {
        const start = Date.now();
        const trimmed = (rawUrl || '').trim();
        if (!trimmed) {
          return {
            url: rawUrl,
            finalUrl: rawUrl,
            status: 0,
            title: '[Empty URL]',
            titleLength: 0,
            metaDesc: 'Empty URL line provided',
            metaDescLength: 0,
            h1Count: 0,
            isHttps: false,
            responseTimeMs: 0,
            score: 0,
            success: false,
          };
        }
        const target = /^https?:\/\//i.test(trimmed) ? trimmed : 'https://' + trimmed;
        try {
          const fetchResult = await safeFetchHtml(target, 1024 * 512); // smaller limit for speed
          const $ = cheerio.load(fetchResult.html);

          const title = $('title').first().text().trim();
          const metaDesc = $('meta[name="description" i]').attr('content')?.trim() || '';
          const h1Count = $('h1').length;
          const isHttps = fetchResult.finalUrl.startsWith('https://');

          let score = 100;
          if (!title) score -= 25;
          else if (title.length < 30 || title.length > 65) score -= 8;
          if (!metaDesc) score -= 20;
          if (h1Count === 0) score -= 20;
          if (!isHttps) score -= 15;
          if (fetchResult.responseTimeMs > 2000) score -= 15;

          return {
            url: rawUrl,
            finalUrl: fetchResult.finalUrl,
            status: fetchResult.status,
            title: title || '[Missing Title]',
            titleLength: title.length,
            metaDesc: metaDesc || '[Missing Description]',
            metaDescLength: metaDesc.length,
            h1Count,
            isHttps,
            responseTimeMs: fetchResult.responseTimeMs,
            score: Math.max(10, Math.min(100, score)),
            success: true,
          };
        } catch (err: any) {
          return {
            url: rawUrl,
            finalUrl: rawUrl,
            status: 0,
            title: '[Crawl Failed]',
            titleLength: 0,
            metaDesc: err.message || 'Network error',
            metaDescLength: 0,
            h1Count: 0,
            isHttps: false,
            responseTimeMs: Date.now() - start,
            score: 0,
            success: false,
          };
        }
      })
    );

    return res.json({ total: results.length, results });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Bulk check failed' });
  }
});

// 6. Fetch & Parse live robots.txt (honest status reporting without template impersonation)
app.post('/api/fetch-robots', async (req: Request, res: Response): Promise<any> => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }

    const withProtocol = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    const validation = await validateSafeUrl(withProtocol);
    if (!validation.safe || !validation.urlObj) {
      return res.status(400).json({ error: validation.error || 'Invalid URL provided.' });
    }

    const robotsUrl = `${validation.urlObj.origin}/robots.txt`;

    try {
      const { response: fetchRes, finalUrl } = await fetchWithSafeRedirects(robotsUrl, {
        headers: { 'User-Agent': 'RankoraBot/1.0 (+https://rankora.app/bot)' },
        timeoutMs: 6000,
        maxHops: 4,
      });

      if (!fetchRes.ok) {
        return res.json({
          success: false,
          found: false,
          status: fetchRes.status,
          robotsUrl: finalUrl,
          message: `No accessible robots.txt found at ${robotsUrl} (HTTP ${fetchRes.status}).`,
          rawText: '',
          rules: [],
          sitemapUrl: '',
        });
      }

      const rawText = await fetchRes.text();
      const lines = rawText.split(/\r?\n/);
      const rules: Array<{ userAgent: string; disallows: string[]; allows: string[]; crawlDelay?: string }> = [];
      let sitemapUrl = '';
      let currentRule: { userAgent: string; disallows: string[]; allows: string[]; crawlDelay?: string } | null = null;

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const colonIdx = trimmed.indexOf(':');
        if (colonIdx === -1) continue;

        const key = trimmed.slice(0, colonIdx).trim().toLowerCase();
        const val = trimmed.slice(colonIdx + 1).trim();

        if (key === 'user-agent') {
          currentRule = {
            userAgent: val,
            disallows: [],
            allows: [],
            crawlDelay: '',
          };
          rules.push(currentRule);
        } else if (key === 'disallow' && currentRule) {
          if (val) currentRule.disallows.push(val);
        } else if (key === 'allow' && currentRule) {
          if (val) currentRule.allows.push(val);
        } else if (key === 'crawl-delay' && currentRule) {
          currentRule.crawlDelay = val;
        } else if (key === 'sitemap') {
          if (!sitemapUrl) sitemapUrl = val;
        }
      }

      return res.json({
        success: true,
        found: true,
        status: fetchRes.status,
        robotsUrl: finalUrl,
        rawText,
        rules,
        sitemapUrl,
      });
    } catch (fetchErr: any) {
      return res.status(502).json({
        success: false,
        found: false,
        robotsUrl,
        error: `Could not reach ${robotsUrl}: ${fetchErr?.message || 'Network error'}`,
      });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error fetching robots.txt' });
  }
});

// Persistent Community Reviews Storage & Strict Moderation
async function readStoredReviews(): Promise<any[]> {
  try {
    const raw = await fs.readFile(REVIEWS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeStoredReviews(reviews: any[]): Promise<void> {
  await fs.mkdir(path.dirname(REVIEWS_FILE), { recursive: true });
  await fs.writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2), 'utf8');
}

app.get('/api/reviews', async (_req: Request, res: Response): Promise<any> => {
  try {
    const reviews = await readStoredReviews();
    return res.json({ reviews });
  } catch (err: any) {
    return res.status(500).json({ error: 'Unable to load stored reviews.' });
  }
});

app.post('/api/submit-review', async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, role, rating, comment } = req.body || {};
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanRole = typeof role === 'string' ? role.trim() : '';
    const cleanComment = typeof comment === 'string' ? comment.trim() : '';
    const numRating = Number(rating);

    if (cleanName.length < 2 || cleanName.length > 50) {
      return res.status(400).json({ error: 'Name must be between 2 and 50 characters.' });
    }
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    }
    if (cleanComment.length < 10) {
      return res.status(400).json({ error: 'Please write at least 10 characters in your review.' });
    }

    const nameMod = moderateReview(cleanName);
    if (!nameMod.valid) {
      return res.status(400).json({ error: nameMod.error });
    }
    if (cleanRole) {
      const roleMod = moderateReview(cleanRole);
      if (!roleMod.valid) {
        return res.status(400).json({ error: roleMod.error });
      }
    }
    const commentMod = moderateReview(cleanComment);
    if (!commentMod.valid) {
      return res.status(400).json({ error: commentMod.error });
    }

    const sanitizedReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: sanitizeHtml(cleanName),
      role: sanitizeHtml(cleanRole || 'SEO Practitioner').slice(0, 50),
      rating: numRating,
      comment: sanitizeHtml(cleanComment).slice(0, 2000),
      date: new Date().toISOString(),
    };

    const existing = await readStoredReviews();
    const updated = [sanitizedReview, ...existing].slice(0, 50);
    await writeStoredReviews(updated);

    return res.status(201).json({ success: true, review: sanitizedReview });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Unable to store verified review.' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Rankora SEO Suite server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
