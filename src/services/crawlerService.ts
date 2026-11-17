import * as cheerio from 'cheerio';
import dns from 'dns/promises';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface SafeUrlValidationResult {
  safe: boolean;
  urlObj?: URL;
  error?: string;
}

export interface FetchResult {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  finalUrl: string;
  redirectChain: Array<{ url: string; status: number }>;
  responseTimeMs: number;
  isHtml: boolean;
  html: string;
  sizeBytes: number;
  robotsAllowed: boolean;
}

export interface IssueItem {
  id: string;
  category: 'on-page' | 'technical' | 'content' | 'links' | 'off-page';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'warning' | 'passed';
  title: string;
  affected: string;
  whyItMatters: string;
  solution: string;
  suggestedFix?: string;
}

export interface CrawledPageSummary {
  url: string;
  status: number;
  title: string;
  metaDesc: string;
  wordCount: number;
  issuesCount: number;
  isDuplicateTitle?: boolean;
  isDuplicateMetaDesc?: boolean;
  responseTimeMs: number;
}

export interface SeoAuditReport {
  url: string;
  timestamp: string;
  httpStatus: number;
  responseTimeMs: number;
  pageSizeKb: number;
  crawlDepth: number;
  crawledPagesCount: number;
  crawledPages: CrawledPageSummary[];
  redirectChain: Array<{ url: string; status: number }>;
  robotsTxtFound: boolean;
  robotsTxtStatus: number | null;
  sitemapUrl: string;
  sitemapStatus: number | null;
  sitemapUrlCount: number | null;
  scores: {
    overall: number;
    onPage: number;
    technical: number;
    content: number;
    offPage: number;
  };
  counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    warnings: number;
    passed: number;
  };
  pageInfo: {
    title: string;
    titleLength: number;
    metaDescription: string;
    metaDescriptionLength: number;
    canonical: string;
    robotsMeta: string;
    xRobotsTag: string;
    viewport: string;
    charset: string;
    language: string;
    favicon: string;
    isHttps: boolean;
    hasHsts: boolean;
    hasXFrameOptions: boolean;
    hasContentSecurityPolicy: boolean;
    compression: string;
  };
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
    h4: string[];
    h5: string[];
    h6: string[];
  };
  images: {
    total: number;
    withAlt: number;
    missingAlt: number;
    withoutLazyLoading: number;
    sample: Array<{ src: string; alt: string; hasAlt: boolean; loading?: string }>;
  };
  links: {
    internalCount: number;
    externalCount: number;
    nofollowCount: number;
    sample: Array<{ href: string; text: string; isInternal: boolean; isNofollow: boolean }>;
  };
  content: {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    avgSentenceLength: number;
    readingEase: number;
    readingLevel: string;
    topKeywords: Array<{ keyword: string; count: number; density: number }>;
  };
  openGraph: {
    title: string;
    description: string;
    image: string;
    url: string;
    type: string;
    siteName: string;
  };
  twitterCard: {
    card: string;
    title: string;
    description: string;
    image: string;
  };
  schemas: any[];
  offPage: {
    socialLinks: Array<{ platform: string; url: string }>;
    referringDomainsEst: number | null;
    backlinkCountEst: number | null;
    dofollowCount: number;
    nofollowCount: number;
    suspiciousSignals: string[];
    apiStatusNote: string;
    has3pCoverage: boolean;
  };
  issues: IssueItem[];
}

// ============================================================================
// 1. SSRF & Network Security Sandbox
// ============================================================================

export function isPrivateOrReservedIp(rawIp: string): boolean {
  const ip = rawIp.trim().toLowerCase().replace(/^\[|\]$/g, '');
  if (!ip) return true;

  // Handle IPv6-mapped IPv4 (e.g. ::ffff:127.0.0.1)
  const v4Mapped = ip.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  const normalizedIpv4 = v4Mapped ? v4Mapped[1] : ip;

  const ipv4Match = normalizedIpv4.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const o1 = parseInt(ipv4Match[1], 10);
    const o2 = parseInt(ipv4Match[2], 10);
    const o3 = parseInt(ipv4Match[3], 10);
    const o4 = parseInt(ipv4Match[4], 10);

    if (o1 > 255 || o2 > 255 || o3 > 255 || o4 > 255) return true;

    if (
      o1 === 0 || // 0.0.0.0/8
      o1 === 10 || // 10.0.0.0/8
      o1 === 127 || // 127.0.0.0/8 loopback
      (o1 === 100 && o2 >= 64 && o2 <= 127) || // 100.64.0.0/10 CGNAT
      (o1 === 169 && o2 === 254) || // 169.254.0.0/16 link-local / cloud metadata
      (o1 === 172 && o2 >= 16 && o2 <= 31) || // 172.16.0.0/12
      (o1 === 192 && o2 === 168) || // 192.168.0.0/16
      (o1 === 192 && o2 === 0 && (o3 === 0 || o3 === 2)) ||
      (o1 === 198 && (o2 === 18 || o2 === 19)) || // benchmarking
      (o1 === 198 && o2 === 51 && o3 === 100) ||
      (o1 === 203 && o2 === 0 && o3 === 113) ||
      o1 >= 224 // multicast & reserved
    ) {
      return true;
    }
    return false;
  }

  // IPv6 private / loopback / link-local / ULA
  if (
    ip === '::' ||
    ip === '::1' ||
    ip.startsWith('fc') ||
    ip.startsWith('fd') ||
    ip.startsWith('fe8') ||
    ip.startsWith('fe9') ||
    ip.startsWith('fea') ||
    ip.startsWith('feb') ||
    ip.startsWith('ff') ||
    ip.startsWith('::ffff:')
  ) {
    return true;
  }

  return false;
}

export async function validateSafeUrl(inputUrl: string): Promise<SafeUrlValidationResult> {
  try {
    let normalized = inputUrl.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = 'https://' + normalized;
    }
    const parsed = new URL(normalized);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { safe: false, error: 'Only HTTP and HTTPS protocols are permitted.' };
    }

    const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');

    if (
      !hostname ||
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.test') ||
      hostname.endsWith('.invalid') ||
      hostname === 'metadata.google.internal'
    ) {
      return { safe: false, error: 'Access to localhost and internal network hosts is prohibited.' };
    }

    // Check literal IPv4 or IPv6 in hostname directly
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) || hostname.includes(':')) {
      if (isPrivateOrReservedIp(hostname)) {
        return { safe: false, error: 'Access to private, link-local, or metadata IP addresses is strictly blocked.' };
      }
      return { safe: true, urlObj: parsed };
    }

    // DNS lookup verification across all returned records to prevent DNS rebinding SSRF
    try {
      const records = await dns.lookup(hostname, { all: true });
      if (!records || records.length === 0) {
        return { safe: false, error: `Hostname "${hostname}" could not be resolved via DNS.` };
      }
      for (const rec of records) {
        if (isPrivateOrReservedIp(rec.address)) {
          return { safe: false, error: 'Domain resolves to a private or restricted network address.' };
        }
      }
    } catch {
      return { safe: false, error: `Unable to resolve hostname "${hostname}" via DNS.` };
    }

    return { safe: true, urlObj: parsed };
  } catch (err: any) {
    return { safe: false, error: 'Malformed URL provided: ' + (err.message || 'Invalid format') };
  }
}

// ============================================================================
// 2. Rate Limiter & Concurrency Manager
// ============================================================================

class DomainRateLimiter {
  private lastRequestMap = new Map<string, number>();
  private defaultMinIntervalMs = 200;

  public async throttle(origin: string, minDelayMs?: number): Promise<void> {
    const delay = minDelayMs && minDelayMs > 0 ? minDelayMs : this.defaultMinIntervalMs;
    const lastTime = this.lastRequestMap.get(origin) || 0;
    const now = Date.now();
    const elapsed = now - lastTime;

    if (elapsed < delay) {
      const waitTime = delay - elapsed;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    this.lastRequestMap.set(origin, Date.now());
  }
}

export const domainRateLimiter = new DomainRateLimiter();

// Sliding window IP rate limiter for crawl API requests
class ClientRateLimiter {
  private windowMs = 60 * 1000; // 1 minute
  private maxRequestsPerWindow = 30;
  private requestsMap = new Map<string, number[]>();

  public isRateLimited(clientKey: string): { limited: boolean; resetMs: number } {
    const now = Date.now();
    const timestamps = (this.requestsMap.get(clientKey) || []).filter((t) => now - t < this.windowMs);

    if (timestamps.length >= this.maxRequestsPerWindow) {
      const oldest = timestamps[0];
      const resetMs = this.windowMs - (now - oldest);
      return { limited: true, resetMs };
    }

    timestamps.push(now);
    this.requestsMap.set(clientKey, timestamps);
    return { limited: false, resetMs: 0 };
  }
}

export const clientRateLimiter = new ClientRateLimiter();

// ============================================================================
// 3. Robots.txt Parser & Compliance Cache
// ============================================================================

interface RobotsRules {
  disallowedPaths: string[];
  allowedPaths: string[];
  crawlDelayMs?: number;
  sitemapUrls: string[];
  sitemapUrl?: string;
  found: boolean;
  httpStatus: number | null;
  fetchedAt: number;
}

export async function fetchWithSafeRedirects(
  initialUrl: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    timeoutMs?: number;
    maxHops?: number;
  } = {}
): Promise<{
  response: globalThis.Response;
  finalUrl: string;
  redirectChain: Array<{ url: string; status: number }>;
}> {
  const maxHops = options.maxHops ?? 5;
  const timeoutMs = options.timeoutMs ?? 9000;
  let currentUrl = initialUrl;
  let method = (options.method || 'GET').toUpperCase();
  const redirectChain: Array<{ url: string; status: number }> = [];

  for (let hop = 0; hop <= maxHops; hop++) {
    const validation = await validateSafeUrl(currentUrl);
    if (!validation.safe || !validation.urlObj) {
      throw new Error(validation.error || 'Redirect target blocked by SSRF security policy.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    let res: globalThis.Response;
    try {
      res = await fetch(validation.urlObj.toString(), {
        method,
        signal: controller.signal,
        headers: options.headers,
        redirect: 'manual',
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (!location) {
        return { response: res, finalUrl: validation.urlObj.toString(), redirectChain };
      }
      if (hop === maxHops) {
        throw new Error(`Too many HTTP redirects (exceeded ${maxHops} hops).`);
      }
      redirectChain.push({ url: validation.urlObj.toString(), status: res.status });
      currentUrl = new URL(location, validation.urlObj).toString();
      if (res.status === 303 || ((res.status === 301 || res.status === 302) && method === 'POST')) {
        method = 'GET';
      }
      continue;
    }

    return {
      response: res,
      finalUrl: validation.urlObj.toString(),
      redirectChain,
    };
  }

  throw new Error('Redirect resolution failed.');
}

class RobotsManager {
  private cache = new Map<string, RobotsRules>();
  private cacheTtlMs = 15 * 60 * 1000; // 15 minutes cache

  public async getRules(origin: string): Promise<RobotsRules> {
    const cached = this.cache.get(origin);
    if (cached && Date.now() - cached.fetchedAt < this.cacheTtlMs) {
      return cached;
    }

    const rules: RobotsRules = {
      disallowedPaths: [],
      allowedPaths: [],
      sitemapUrls: [],
      found: false,
      httpStatus: null,
      fetchedAt: Date.now(),
    };

    try {
      const robotsUrl = `${origin}/robots.txt`;
      const { response: res } = await fetchWithSafeRedirects(robotsUrl, {
        headers: {
          'User-Agent': 'RankoraBot/1.0 (+https://rankora.app/bot)',
        },
        timeoutMs: 4500,
        maxHops: 3,
      });

      rules.httpStatus = res.status;

      if (res.status === 200) {
        rules.found = true;
        const text = await res.text();
        const lines = text.split(/\r?\n/);
        let currentUserAgentMatches = false;

        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (line.startsWith('#') || !line) continue;

          const colonIndex = line.indexOf(':');
          if (colonIndex === -1) continue;

          const key = line.slice(0, colonIndex).trim().toLowerCase();
          const val = line.slice(colonIndex + 1).trim();

          if (key === 'user-agent') {
            currentUserAgentMatches = val === '*' || val.toLowerCase().includes('rankorabot');
          } else if (currentUserAgentMatches) {
            if (key === 'disallow' && val) {
              rules.disallowedPaths.push(val);
            } else if (key === 'allow' && val) {
              rules.allowedPaths.push(val);
            } else if (key === 'crawl-delay') {
              const delaySec = parseFloat(val);
              if (!isNaN(delaySec)) {
                rules.crawlDelayMs = Math.min(5000, Math.max(100, delaySec * 1000));
              }
            }
          }

          if (key === 'sitemap' && val) {
            rules.sitemapUrls.push(val);
            if (!rules.sitemapUrl) rules.sitemapUrl = val;
          }
        }
      }
    } catch {
      // If fetching robots.txt fails or times out, allow crawling by default
    }

    this.cache.set(origin, rules);
    return rules;
  }

  public isAllowed(urlObj: URL, rules: RobotsRules): boolean {
    const pathname = urlObj.pathname + urlObj.search;

    // First check explicit allow rules
    for (const allow of rules.allowedPaths) {
      if (allow && pathname.startsWith(allow)) {
        return true;
      }
    }

    // Check disallow rules
    for (const disallow of rules.disallowedPaths) {
      if (disallow === '/') return false;
      if (disallow && pathname.startsWith(disallow)) {
        return false;
      }
    }

    return true;
  }
}

export const robotsManager = new RobotsManager();

// ============================================================================
// 4. Safe Fetcher Implementation
// ============================================================================

export async function safeFetchHtml(
  targetUrl: string,
  maxBytes = 5 * 1024 * 1024
): Promise<FetchResult> {
  const validation = await validateSafeUrl(targetUrl);
  if (!validation.safe || !validation.urlObj) {
    throw new Error(validation.error || 'Invalid URL provided.');
  }

  const urlObj = validation.urlObj;
  const origin = urlObj.origin;

  // Robots.txt check
  const robotsRules = await robotsManager.getRules(origin);
  const isAllowedByRobots = robotsManager.isAllowed(urlObj, robotsRules);

  if (!isAllowedByRobots) {
    throw new Error(`Crawling blocked by website's robots.txt directives for path: ${urlObj.pathname}`);
  }

  // Throttle request according to domain rate limits / crawl-delay
  await domainRateLimiter.throttle(origin, robotsRules.crawlDelayMs);

  let initialUrl = urlObj.toString();
  const startTime = Date.now();

  const browserHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 RankoraBot/1.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
  };

  let fetchOutput: {
    response: globalThis.Response;
    finalUrl: string;
    redirectChain: Array<{ url: string; status: number }>;
  };

  try {
    fetchOutput = await fetchWithSafeRedirects(initialUrl, {
      method: 'GET',
      headers: browserHeaders,
      timeoutMs: 9000,
      maxHops: 5,
    });
  } catch (err: any) {
    if (initialUrl.startsWith('https://') && !/^https?:\/\//i.test(targetUrl.trim())) {
      try {
        const httpUrl = initialUrl.replace(/^https:\/\//i, 'http://');
        fetchOutput = await fetchWithSafeRedirects(httpUrl, {
          method: 'GET',
          headers: browserHeaders,
          timeoutMs: 9000,
          maxHops: 5,
        });
      } catch (httpErr: any) {
        if (err.name === 'AbortError' || httpErr.name === 'AbortError') {
          throw new Error('Request timed out after 9 seconds. The website server was too slow to respond.');
        }
        throw new Error(`Unable to fetch URL: ${err.message || 'Connection failed'}`);
      }
    } else {
      if (err.name === 'AbortError') {
        throw new Error('Request timed out after 9 seconds. The website server was too slow to respond.');
      }
      throw new Error(`Unable to fetch URL: ${err.message || 'Connection failed'}`);
    }
  }

  const { response: res, finalUrl, redirectChain } = fetchOutput;
  const responseTimeMs = Date.now() - startTime;
  const headers: Record<string, string> = {};
  res.headers.forEach((val, key) => {
    headers[key.toLowerCase()] = val;
  });

  const contentType = headers['content-type'] || '';
  const isHtml = contentType.includes('html') || contentType.includes('xml') || contentType === '';

  const text = await res.text();
  const truncatedText = text.length > maxBytes ? text.slice(0, maxBytes) : text;

  return {
    status: res.status,
    statusText: res.statusText,
    headers,
    finalUrl,
    redirectChain,
    responseTimeMs,
    isHtml,
    html: truncatedText,
    sizeBytes: Buffer.byteLength(truncatedText, 'utf8'),
    robotsAllowed: true,
  };
}

// ============================================================================
// 5. Full SEO Audit Engine
// ============================================================================

export async function runFullSeoAudit(targetUrl: string, maxPages = 1): Promise<SeoAuditReport> {
  const crawlLimit = Math.max(1, Math.min(10, parseInt(String(maxPages), 10) || 1));

  const fetchResult = await safeFetchHtml(targetUrl);
  const { html, status, responseTimeMs, headers, finalUrl, sizeBytes, redirectChain } = fetchResult;

  const $ = cheerio.load(html);

  // Basic Page Info
  const rawTitle = $('title').first().text().trim();
  const metaDescription =
    $('meta[name="description" i]').attr('content')?.trim() ||
    $('meta[property="og:description" i]').attr('content')?.trim() ||
    '';
  const canonical = $('link[rel="canonical" i]').attr('href')?.trim() || '';
  const robotsMeta = $('meta[name="robots" i]').attr('content')?.trim() || '';
  const viewport = $('meta[name="viewport" i]').attr('content')?.trim() || '';
  const charset =
    $('meta[charset]').attr('charset') ||
    $('meta[http-equiv="Content-Type" i]').attr('content')?.match(/charset=([^;]+)/i)?.[1] ||
    'UTF-8';
  const language = $('html').attr('lang')?.trim() || '';
  const favicon = $('link[rel="icon" i], link[rel="shortcut icon" i]').attr('href') || '/favicon.ico';

  // Headings
  const headings = {
    h1: $('h1').map((_: number, el: any) => $(el).text().trim()).get().filter(Boolean),
    h2: $('h2').map((_: number, el: any) => $(el).text().trim()).get().filter(Boolean),
    h3: $('h3').map((_: number, el: any) => $(el).text().trim()).get().filter(Boolean),
    h4: $('h4').map((_: number, el: any) => $(el).text().trim()).get().filter(Boolean),
    h5: $('h5').map((_: number, el: any) => $(el).text().trim()).get().filter(Boolean),
    h6: $('h6').map((_: number, el: any) => $(el).text().trim()).get().filter(Boolean),
  };

  // Social Sharing Cards
  const openGraph = {
    title: $('meta[property="og:title" i]').attr('content') || '',
    description: $('meta[property="og:description" i]').attr('content') || '',
    image: $('meta[property="og:image" i]').attr('content') || '',
    url: $('meta[property="og:url" i]').attr('content') || '',
    type: $('meta[property="og:type" i]').attr('content') || '',
    siteName: $('meta[property="og:site_name" i]').attr('content') || '',
  };

  const twitterCard = {
    card: $('meta[name="twitter:card" i]').attr('content') || '',
    title: $('meta[name="twitter:title" i]').attr('content') || '',
    description: $('meta[name="twitter:description" i]').attr('content') || '',
    image: $('meta[name="twitter:image" i]').attr('content') || '',
  };

  // Image Auditing
  const sampleImages: Array<{ src: string; alt: string; hasAlt: boolean; loading?: string }> = [];
  let imagesWithoutLazyLoading = 0;

  $('img').each((_: number, el: any) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || '';
    const alt = $(el).attr('alt');
    const loadingAttr = $(el).attr('loading') || '';
    const hasAlt = typeof alt === 'string' && alt.trim().length > 0;

    if (src) {
      if (loadingAttr.toLowerCase() !== 'lazy') {
        imagesWithoutLazyLoading++;
      }
      if (sampleImages.length < 50) {
        sampleImages.push({ src, alt: alt || '', hasAlt, loading: loadingAttr });
      }
    }
  });

  const totalImages = $('img').length;
  const imagesWithAlt = $('img[alt]').filter((_: number, el: any) => ($(el).attr('alt') || '').trim().length > 0).length;
  const imagesMissingAlt = totalImages - imagesWithAlt;

  // Links & Outbound Profiles
  const currentOrigin = new URL(finalUrl).origin;
  let internalLinksCount = 0;
  let externalLinksCount = 0;
  let nofollowLinksCount = 0;
  const sampleLinks: Array<{ href: string; text: string; isInternal: boolean; isNofollow: boolean }> = [];
  const internalUrlsSet = new Set<string>();
  const socialLinksMap = new Map<string, string>();

  $('a[href]').each((_: number, el: any) => {
    const href = $(el).attr('href')?.trim();
    const text = $(el).text().trim().slice(0, 80);
    const rel = $(el).attr('rel') || '';
    const isNofollow = rel.toLowerCase().includes('nofollow');

    if (
      href &&
      !href.startsWith('#') &&
      !href.startsWith('javascript:') &&
      !href.startsWith('mailto:') &&
      !href.startsWith('tel:')
    ) {
      let isInternal = false;
      let resolvedHref = href;
      try {
        const resolved = new URL(href, finalUrl);
        isInternal = resolved.origin === currentOrigin;
        resolvedHref = resolved.href;
      } catch {
        isInternal = href.startsWith('/');
      }

      if (isInternal) {
        internalLinksCount++;
        if (resolvedHref !== finalUrl) {
          internalUrlsSet.add(resolvedHref);
        }
      } else {
        externalLinksCount++;
        if (/twitter\.com|x\.com/i.test(resolvedHref)) socialLinksMap.set('Twitter / X', resolvedHref);
        else if (/facebook\.com/i.test(resolvedHref)) socialLinksMap.set('Facebook', resolvedHref);
        else if (/linkedin\.com/i.test(resolvedHref)) socialLinksMap.set('LinkedIn', resolvedHref);
        else if (/youtube\.com/i.test(resolvedHref)) socialLinksMap.set('YouTube', resolvedHref);
        else if (/instagram\.com/i.test(resolvedHref)) socialLinksMap.set('Instagram', resolvedHref);
        else if (/github\.com/i.test(resolvedHref)) socialLinksMap.set('GitHub', resolvedHref);
        else if (/pinterest\.com/i.test(resolvedHref)) socialLinksMap.set('Pinterest', resolvedHref);
      }

      if (isNofollow) {
        nofollowLinksCount++;
      }

      if (sampleLinks.length < 50) {
        sampleLinks.push({ href: resolvedHref, text: text || '[Empty Anchor]', isInternal, isNofollow });
      }
    }
  });

  // Multi-Page Deep Crawl Summary
  const crawledPagesSummary: CrawledPageSummary[] = [
    {
      url: finalUrl,
      status,
      title: rawTitle,
      metaDesc: metaDescription,
      wordCount: 0,
      issuesCount: 0,
      responseTimeMs,
    },
  ];

  if (crawlLimit > 1 && internalUrlsSet.size > 0) {
    const urlsToCrawl = Array.from(internalUrlsSet).slice(0, crawlLimit - 1);
    for (const subUrl of urlsToCrawl) {
      try {
        const subRes = await safeFetchHtml(subUrl);
        const $sub = cheerio.load(subRes.html);
        const subTitle = $sub('title').first().text().trim();
        const subMetaDesc = $sub('meta[name="description" i]').attr('content')?.trim() || '';
        $sub('script, style, noscript, svg, nav, footer, header').remove();
        const subText = $sub('body').text().replace(/\s+/g, ' ').trim();
        const subWords = (subText.match(/\b[a-z0-9'-]{2,}\b/gi) || []).length;

        crawledPagesSummary.push({
          url: subRes.finalUrl,
          status: subRes.status,
          title: subTitle,
          metaDesc: subMetaDesc,
          wordCount: subWords,
          issuesCount: 0,
          responseTimeMs: subRes.responseTimeMs,
        });
      } catch {
        crawledPagesSummary.push({
          url: subUrl,
          status: 0,
          title: '[Crawl Failed / Blocked]',
          metaDesc: '',
          wordCount: 0,
          issuesCount: 1,
          responseTimeMs: 0,
        });
      }
    }
  }

  // Duplicate Titles & Descriptions Check
  const titleCountsMap = new Map<string, string[]>();
  const metaDescCountsMap = new Map<string, string[]>();

  for (const p of crawledPagesSummary) {
    if (p.title) {
      const key = p.title.toLowerCase();
      titleCountsMap.set(key, [...(titleCountsMap.get(key) || []), p.url]);
    }
    if (p.metaDesc) {
      const key = p.metaDesc.toLowerCase();
      metaDescCountsMap.set(key, [...(metaDescCountsMap.get(key) || []), p.url]);
    }
  }

  for (const p of crawledPagesSummary) {
    if (p.title && (titleCountsMap.get(p.title.toLowerCase())?.length || 0) > 1) {
      p.isDuplicateTitle = true;
    }
    if (p.metaDesc && (metaDescCountsMap.get(p.metaDesc.toLowerCase())?.length || 0) > 1) {
      p.isDuplicateMetaDesc = true;
    }
  }

  // Content Analysis
  $('script, style, noscript, svg, nav, footer, header').remove();
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const words = bodyText.toLowerCase().match(/\b[a-z0-9'-]{2,}\b/g) || [];
  const wordCount = words.length;
  crawledPagesSummary[0].wordCount = wordCount;

  // Flesch Reading Ease
  const sentenceCount = (bodyText.match(/[.!?]+(?:\s+|$)/g) || []).length || 1;
  const syllableCount = words.reduce((acc: number, word: string) => {
    const clean = word.toLowerCase().replace(/(?:[^laeiouy]|ed|es|e)$/, '').replace(/^y/, '');
    const matches = clean.match(/[aeiouy]{1,2}/g);
    return acc + (matches ? matches.length : 1);
  }, 0);
  const avgSentenceLength = wordCount / Math.max(sentenceCount, 1);
  const avgSyllablesPerWord = syllableCount / Math.max(wordCount, 1);
  const readingEase = Math.round(
    Math.max(0, Math.min(100, 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord))
  );

  let readingLevel = 'Standard Web';
  if (readingEase >= 90) readingLevel = 'Very Easy (5th Grade)';
  else if (readingEase >= 80) readingLevel = 'Easy (6th Grade)';
  else if (readingEase >= 70) readingLevel = 'Fairly Easy (7th Grade)';
  else if (readingEase >= 60) readingLevel = 'Standard (8th–9th Grade)';
  else if (readingEase >= 50) readingLevel = 'Fairly Difficult (High School)';
  else if (readingEase >= 30) readingLevel = 'Difficult (College Level)';
  else readingLevel = 'Very Difficult (Academic)';

  const paragraphCount = bodyText.split(/\n+/).filter((p: string) => p.trim().length > 0).length || 1;

  // Keyword Density
  const stopWords = new Set([
    'the', 'and', 'for', 'that', 'this', 'with', 'you', 'have', 'are', 'from',
    'not', 'your', 'all', 'can', 'was', 'our', 'will', 'about', 'more', 'when',
    'they', 'what', 'their', 'which', 'there', 'who', 'been', 'out', 'into',
    'just', 'then', 'any', 'these', 'them', 'than', 'some', 'other', 'its',
  ]);
  const wordFreq: Record<string, number> = {};
  for (const w of words) {
    if (w.length > 2 && !stopWords.has(w) && !/^\d+$/.test(w)) {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    }
  }
  const topKeywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([keyword, count]) => ({
      keyword,
      count,
      density: Number(((count / Math.max(wordCount, 1)) * 100).toFixed(2)),
    }));

  // JSON-LD Schemas
  const schemas: any[] = [];
  $('script[type="application/ld+json"]').each((_: number, el: any) => {
    try {
      const raw = $(el).html()?.trim();
      if (raw) {
        schemas.push(JSON.parse(raw));
      }
    } catch {
      schemas.push({ parsingError: 'Invalid JSON-LD syntax detected.' });
    }
  });

  // Technical Directives & Live robots.txt / sitemap.xml Verification
  const isHttps = finalUrl.startsWith('https://');
  const hasHsts = Boolean(headers['strict-transport-security']);
  const hasXFrameOptions = Boolean(headers['x-frame-options']);
  const hasContentSecurityPolicy = Boolean(headers['content-security-policy']);
  const compression = headers['content-encoding'] || 'none';
  const xRobotsTag = headers['x-robots-tag'] || '';

  const robotsRules = await robotsManager.getRules(currentOrigin);
  const candidateSitemapUrl = robotsRules.sitemapUrl || `${currentOrigin}/sitemap.xml`;
  let sitemapStatus: number | null = null;
  let sitemapUrlCount: number | null = null;
  try {
    const smRes = await fetchWithSafeRedirects(candidateSitemapUrl, {
      headers: { 'User-Agent': 'RankoraBot/1.0 (+https://rankora.app/bot)' },
      timeoutMs: 4500,
      maxHops: 3,
    });
    sitemapStatus = smRes.response.status;
    if (smRes.response.ok) {
      const smText = await smRes.response.text();
      const $xml = cheerio.load(smText, { xmlMode: true });
      const urlLocs = $xml('urlset > url > loc').length || $xml('sitemapindex > sitemap > loc').length || $xml('loc').length;
      sitemapUrlCount = urlLocs;
    }
  } catch {
    sitemapStatus = null;
  }

  // Issue Construction & Auditing
  const issues: IssueItem[] = [];

  if (status >= 400) {
    issues.push({
      id: 'http-error-status',
      category: 'technical',
      severity: status >= 500 ? 'critical' : 'high',
      title: `Target Returned HTTP ${status} Error`,
      affected: finalUrl,
      whyItMatters: 'Search engines cannot properly index pages returning 4xx or 5xx HTTP error codes.',
      solution: 'Resolve server or routing configuration so the page responds with HTTP 200 OK.',
    });
  }

  if (/noindex|none/i.test(robotsMeta) || /noindex|none/i.test(xRobotsTag)) {
    issues.push({
      id: 'noindex-detected',
      category: 'technical',
      severity: 'critical',
      title: 'Page Blocked From Search Indexing (noindex)',
      affected: [robotsMeta ? `meta: ${robotsMeta}` : '', xRobotsTag ? `X-Robots-Tag: ${xRobotsTag}` : ''].filter(Boolean).join(' | '),
      whyItMatters: 'The noindex directive instructs Google and other search engines to omit this URL from search results.',
      solution: 'Remove "noindex" from meta robots or X-Robots-Tag headers if this page should rank organically.',
    });
  }

  if (!robotsRules.found) {
    issues.push({
      id: 'robots-missing',
      category: 'technical',
      severity: 'warning',
      title: `No robots.txt File Found (${robotsRules.httpStatus || 'unreachable'})`,
      affected: `${currentOrigin}/robots.txt`,
      whyItMatters: 'A valid robots.txt guides crawler budget and declares XML sitemap locations.',
      solution: 'Publish a /robots.txt file at the domain root specifying crawler directives and Sitemap URL.',
    });
  } else {
    issues.push({
      id: 'robots-passed',
      category: 'technical',
      severity: 'passed',
      title: 'robots.txt File Accessible',
      affected: `${currentOrigin}/robots.txt (HTTP ${robotsRules.httpStatus})`,
      whyItMatters: 'Crawlers can read crawl permissions and sitemap pointers.',
      solution: 'No action required.',
    });
  }

  if (sitemapStatus !== 200) {
    issues.push({
      id: 'sitemap-missing',
      category: 'technical',
      severity: 'warning',
      title: `XML Sitemap Missing or Inaccessible (${sitemapStatus ?? 'unreachable'})`,
      affected: candidateSitemapUrl,
      whyItMatters: 'XML sitemaps help search engines discover canonical pages and crawl priority.',
      solution: 'Generate a valid XML sitemap and declare its URL inside robots.txt.',
    });
  } else {
    issues.push({
      id: 'sitemap-passed',
      category: 'technical',
      severity: 'passed',
      title: `XML Sitemap Valid (${sitemapUrlCount ?? 0} entries detected)`,
      affected: candidateSitemapUrl,
      whyItMatters: 'Search bots can efficiently discover listed URLs.',
      solution: 'No action required.',
    });
  }

  // Title issues
  if (!rawTitle) {
    issues.push({
      id: 'title-missing',
      category: 'on-page',
      severity: 'critical',
      title: 'Missing Page Title Tag',
      affected: finalUrl,
      whyItMatters: 'The <title> tag is the single most crucial on-page element search engines use for indexing and SERP clickability.',
      solution: 'Add a concise, descriptive <title> tag between 50 and 60 characters with target keywords.',
      suggestedFix: `<title>Primary Keyword – Brand Name</title>`,
    });
  } else if (rawTitle.length < 30) {
    issues.push({
      id: 'title-too-short',
      category: 'on-page',
      severity: 'warning',
      title: `Title Tag is Very Short (${rawTitle.length} chars)`,
      affected: rawTitle,
      whyItMatters: 'Titles under 30 characters waste SERP space and fail to communicate value.',
      solution: 'Expand title to 50–60 characters to include key value propositions.',
    });
  } else if (rawTitle.length > 60) {
    issues.push({
      id: 'title-too-long',
      category: 'on-page',
      severity: 'warning',
      title: `Title Tag Exceeds 60 Characters (${rawTitle.length} chars)`,
      affected: rawTitle,
      whyItMatters: 'Titles over 60 characters risk truncation with an ellipsis ("...") in Google search results.',
      solution: 'Condense title to stay between 50 and 60 characters.',
    });
  } else {
    issues.push({
      id: 'title-passed',
      category: 'on-page',
      severity: 'passed',
      title: `Optimal Title Tag Length (${rawTitle.length} characters)`,
      affected: rawTitle,
      whyItMatters: 'Fits cleanly within desktop and mobile SERP preview bounds.',
      solution: 'No action required.',
    });
  }

  // Meta Description
  if (!metaDescription) {
    issues.push({
      id: 'meta-desc-missing',
      category: 'on-page',
      severity: 'high',
      title: 'Missing Meta Description Tag',
      affected: finalUrl,
      whyItMatters: 'Without a meta description, Google auto-generates text snippets that lower click-through rates (CTR).',
      solution: 'Write a compelling 140–160 character description summarizing page value.',
      suggestedFix: `<meta name="description" content="Discover actionable tips and free tools to boost your SEO today." />`,
    });
  } else if (metaDescription.length < 110) {
    issues.push({
      id: 'meta-desc-short',
      category: 'on-page',
      severity: 'warning',
      title: `Meta Description is Short (${metaDescription.length} chars)`,
      affected: metaDescription,
      whyItMatters: 'Short descriptions may under-inform search users.',
      solution: 'Expand snippet to 140–160 characters.',
    });
  } else if (metaDescription.length > 165) {
    issues.push({
      id: 'meta-desc-long',
      category: 'on-page',
      severity: 'warning',
      title: `Meta Description Exceeds 165 Characters (${metaDescription.length} chars)`,
      affected: metaDescription,
      whyItMatters: 'Descriptions over 160 characters are truncated on SERP pages.',
      solution: 'Trim non-essential text so main hook fits within 155 characters.',
    });
  } else {
    issues.push({
      id: 'meta-desc-passed',
      category: 'on-page',
      severity: 'passed',
      title: `Optimal Meta Description Length (${metaDescription.length} characters)`,
      affected: metaDescription,
      whyItMatters: 'Fits within search snippet limits without truncation.',
      solution: 'No action required.',
    });
  }

  // Headings
  if (headings.h1.length === 0) {
    issues.push({
      id: 'h1-missing',
      category: 'on-page',
      severity: 'critical',
      title: 'Missing H1 Heading',
      affected: finalUrl,
      whyItMatters: 'H1 signals core page topic to web crawlers and screen readers.',
      solution: 'Add exactly one clear <h1> heading to the page body.',
      suggestedFix: `<h1>Main Page Heading Here</h1>`,
    });
  } else if (headings.h1.length > 1) {
    issues.push({
      id: 'h1-multiple',
      category: 'on-page',
      severity: 'warning',
      title: `Multiple H1 Headings Found (${headings.h1.length} H1 tags)`,
      affected: headings.h1.join(' | '),
      whyItMatters: 'Multiple H1 tags dilute heading hierarchy.',
      solution: 'Use a single H1 heading and change secondary titles to H2 elements.',
    });
  } else {
    issues.push({
      id: 'h1-passed',
      category: 'on-page',
      severity: 'passed',
      title: 'Single H1 Heading Present',
      affected: headings.h1[0],
      whyItMatters: 'Proper semantic hierarchy established.',
      solution: 'No action required.',
    });
  }

  // Image alt check
  if (totalImages > 0 && imagesMissingAlt > 0) {
    issues.push({
      id: 'img-alt-missing',
      category: 'content',
      severity: imagesMissingAlt > 3 ? 'high' : 'warning',
      title: `${imagesMissingAlt} of ${totalImages} Images Missing Alt Text`,
      affected: `${imagesMissingAlt} image elements without alt text`,
      whyItMatters: 'Alt attributes are vital for accessibility and Google Image Search indexation.',
      solution: 'Add descriptive alt text to all img elements.',
      suggestedFix: `<img src="image.jpg" alt="Descriptive label of image content" />`,
    });
  } else if (totalImages > 0) {
    issues.push({
      id: 'img-alt-passed',
      category: 'content',
      severity: 'passed',
      title: `All ${totalImages} Images Have Descriptive Alt Tags`,
      affected: `${totalImages} images checked`,
      whyItMatters: 'Accessibility and image indexing standards met.',
      solution: 'No action required.',
    });
  }

  // Viewport
  if (!viewport) {
    issues.push({
      id: 'viewport-missing',
      category: 'technical',
      severity: 'critical',
      title: 'Missing Mobile Viewport Tag',
      affected: finalUrl,
      whyItMatters: 'Mobile-first indexing requires a responsive viewport configuration.',
      solution: 'Add the mobile viewport meta tag inside <head>.',
      suggestedFix: `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`,
    });
  } else {
    issues.push({
      id: 'viewport-passed',
      category: 'technical',
      severity: 'passed',
      title: 'Mobile Viewport Configured',
      affected: viewport,
      whyItMatters: 'Page scales properly on mobile viewports.',
      solution: 'No action required.',
    });
  }

  // HTTPS / SSL
  if (!isHttps) {
    issues.push({
      id: 'ssl-missing',
      category: 'technical',
      severity: 'critical',
      title: 'Website Not Using Secure HTTPS Protocol',
      affected: finalUrl,
      whyItMatters: 'HTTPS is an official Google ranking factor and protects user traffic.',
      solution: 'Install an SSL certificate and enforce HTTPS redirects.',
    });
  } else {
    issues.push({
      id: 'ssl-passed',
      category: 'technical',
      severity: 'passed',
      title: 'Secure HTTPS Enabled',
      affected: 'HTTPS Active',
      whyItMatters: 'Encrypted communication meets web safety benchmarks.',
      solution: 'No action required.',
    });
  }

  // Canonical
  if (!canonical) {
    issues.push({
      id: 'canonical-missing',
      category: 'on-page',
      severity: 'warning',
      title: 'Missing Canonical Link Tag',
      affected: finalUrl,
      whyItMatters: 'Prevents duplicate content conflicts when URLs have query params or variations.',
      solution: 'Add a self-referencing canonical tag.',
      suggestedFix: `<link rel="canonical" href="${finalUrl}" />`,
    });
  } else {
    issues.push({
      id: 'canonical-passed',
      category: 'on-page',
      severity: 'passed',
      title: 'Canonical Tag Implemented',
      affected: canonical,
      whyItMatters: 'Directs search indexing to authoritative URL.',
      solution: 'No action required.',
    });
  }

  // Open Graph
  if (!openGraph.title || !openGraph.image) {
    issues.push({
      id: 'og-missing',
      category: 'on-page',
      severity: 'warning',
      title: 'Incomplete Open Graph Tags',
      affected: `og:title: ${openGraph.title ? 'Yes' : 'No'}, og:image: ${openGraph.image ? 'Yes' : 'No'}`,
      whyItMatters: 'Social platforms display low-quality text links without OpenGraph metadata.',
      solution: 'Define og:title, og:description, og:image, and og:url.',
      suggestedFix: `<meta property="og:title" content="${rawTitle || 'Page Title'}" />\n<meta property="og:image" content="https://example.com/share.png" />`,
    });
  } else {
    issues.push({
      id: 'og-passed',
      category: 'on-page',
      severity: 'passed',
      title: 'Open Graph Social Metadata Present',
      affected: openGraph.title,
      whyItMatters: 'Rich preview cards render when page is shared.',
      solution: 'No action required.',
    });
  }

  // Structured Data
  if (schemas.length === 0) {
    issues.push({
      id: 'schema-missing',
      category: 'technical',
      severity: 'warning',
      title: 'No Structured Data (JSON-LD) Detected',
      affected: finalUrl,
      whyItMatters: 'Structured data enables rich snippet visual enhancements in search results.',
      solution: 'Add Schema.org JSON-LD definitions (Organization, Article, FAQ, Breadcrumbs).',
    });
  } else {
    issues.push({
      id: 'schema-passed',
      category: 'technical',
      severity: 'passed',
      title: `${schemas.length} Structured Data Block(s) Detected`,
      affected: schemas.map((s) => s['@type'] || 'JSON-LD').join(', '),
      whyItMatters: 'Boosts entity classification and rich snippet eligibility.',
      solution: 'No action required.',
    });
  }

  // TTFB Response Time
  if (responseTimeMs > 2500) {
    issues.push({
      id: 'ttfb-slow',
      category: 'technical',
      severity: 'high',
      title: `Slow Server Latency (${responseTimeMs}ms)`,
      affected: `${responseTimeMs} ms TTFB`,
      whyItMatters: 'Slow responses degrade Core Web Vitals and crawl efficiency.',
      solution: 'Implement server caching, CDN delivery, or database query optimization.',
    });
  } else if (responseTimeMs > 1000) {
    issues.push({
      id: 'ttfb-moderate',
      category: 'technical',
      severity: 'warning',
      title: `Moderate Server Latency (${responseTimeMs}ms)`,
      affected: `${responseTimeMs} ms TTFB`,
      whyItMatters: 'TTFB over 800ms can slow page loading.',
      solution: 'Enable page edge caching.',
    });
  } else {
    issues.push({
      id: 'ttfb-passed',
      category: 'technical',
      severity: 'passed',
      title: `Fast Response Time (${responseTimeMs}ms)`,
      affected: `${responseTimeMs} ms`,
      whyItMatters: 'Responds quickly to search crawlers and visitors.',
      solution: 'No action required.',
    });
  }

  // Word count
  if (wordCount < 250) {
    issues.push({
      id: 'thin-content',
      category: 'content',
      severity: 'high',
      title: `Thin Content Detected (${wordCount} words)`,
      affected: `${wordCount} words`,
      whyItMatters: 'Pages under 300 words often lack search intent coverage.',
      solution: 'Add thorough content, explanations, and key answers.',
    });
  } else {
    issues.push({
      id: 'content-passed',
      category: 'content',
      severity: 'passed',
      title: `Comprehensive Content Length (${wordCount.toLocaleString()} words)`,
      affected: `${wordCount} words`,
      whyItMatters: 'Sufficient context for keyword topical authority.',
      solution: 'No action required.',
    });
  }

  // Scoring Calculation
  let onPagePenalty = 0;
  let technicalPenalty = 0;
  let contentPenalty = 0;
  let offPagePenalty = 0;

  issues.forEach((issue) => {
    let p = 0;
    if (issue.severity === 'critical') p = 20;
    else if (issue.severity === 'high') p = 12;
    else if (issue.severity === 'medium' || issue.severity === 'warning') p = 6;
    else if (issue.severity === 'low') p = 2;

    if (issue.category === 'on-page') onPagePenalty += p;
    if (issue.category === 'technical') technicalPenalty += p;
    if (issue.category === 'content') contentPenalty += p;
    if (issue.category === 'off-page' || issue.category === 'links') offPagePenalty += p;
  });

  const clamp = (val: number) => Math.max(15, Math.min(100, Math.round(val)));
  const onPageScore = clamp(100 - onPagePenalty);
  const technicalScore = clamp(100 - technicalPenalty);
  const contentScore = clamp(100 - contentPenalty);
  const offPageScore = clamp(100 - offPagePenalty);
  const overallScore = clamp(
    0.35 * onPageScore + 0.35 * technicalScore + 0.15 * contentScore + 0.15 * offPageScore
  );

  const socialLinksList = Array.from(socialLinksMap.entries()).map(([platform, u]) => ({ platform, url: u }));

  return {
    url: finalUrl,
    timestamp: new Date().toISOString(),
    httpStatus: status,
    responseTimeMs,
    pageSizeKb: Number((sizeBytes / 1024).toFixed(1)),
    crawlDepth: crawlLimit,
    crawledPagesCount: crawledPagesSummary.length,
    crawledPages: crawledPagesSummary,
    redirectChain,
    robotsTxtFound: robotsRules.found,
    robotsTxtStatus: robotsRules.httpStatus,
    sitemapUrl: candidateSitemapUrl,
    sitemapStatus,
    sitemapUrlCount,
    scores: {
      overall: overallScore,
      onPage: onPageScore,
      technical: technicalScore,
      content: contentScore,
      offPage: offPageScore,
    },
    counts: {
      critical: issues.filter((i) => i.severity === 'critical').length,
      high: issues.filter((i) => i.severity === 'high').length,
      medium: issues.filter((i) => i.severity === 'medium' || i.severity === 'warning').length,
      low: issues.filter((i) => i.severity === 'low').length,
      warnings: issues.filter((i) => i.severity === 'medium' || i.severity === 'warning').length,
      passed: issues.filter((i) => i.severity === 'passed').length,
    },
    pageInfo: {
      title: rawTitle,
      titleLength: rawTitle.length,
      metaDescription,
      metaDescriptionLength: metaDescription.length,
      canonical,
      robotsMeta,
      xRobotsTag,
      viewport,
      charset,
      language,
      favicon,
      isHttps,
      hasHsts,
      hasXFrameOptions,
      hasContentSecurityPolicy,
      compression,
    },
    headings,
    images: {
      total: totalImages,
      withAlt: imagesWithAlt,
      missingAlt: imagesMissingAlt,
      withoutLazyLoading: imagesWithoutLazyLoading,
      sample: sampleImages,
    },
    links: {
      internalCount: internalLinksCount,
      externalCount: externalLinksCount,
      nofollowCount: nofollowLinksCount,
      sample: sampleLinks,
    },
    content: {
      wordCount,
      sentenceCount,
      paragraphCount,
      avgSentenceLength: Number(avgSentenceLength.toFixed(1)),
      readingEase,
      readingLevel,
      topKeywords,
    },
    openGraph,
    twitterCard,
    schemas,
    offPage: {
      socialLinks: socialLinksList,
      referringDomainsEst: null,
      backlinkCountEst: null,
      dofollowCount: Math.max(0, externalLinksCount - nofollowLinksCount),
      nofollowCount: nofollowLinksCount,
      suspiciousSignals: socialLinksList.length === 0 ? ['No brand social profiles linked on target page'] : [],
      apiStatusNote:
        'Live crawl metrics reflect on-page outbound links and linked social profiles. Backlink index and referring-domain totals require a connected third-party backlink data provider.',
      has3pCoverage: false,
    },
    issues,
  };
}
