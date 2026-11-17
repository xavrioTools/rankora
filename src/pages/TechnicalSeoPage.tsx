import React, { useState, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { ScoreGauge } from '../components/ScoreGauge';
import { exportAuditReportToPdf } from '../services/pdfExportService';
import { TechnicalAuditResponse } from '../types/seo';
import {
  Code2,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Shield,
  Zap,
  Server,
  Lock,
  FileCheck,
  Smartphone,
  Layers,
  FileDown,
  Globe,
  ArrowRight,
  Info,
} from 'lucide-react';

export function TechnicalSeoPage() {
  const { sharedUrl, setSharedUrl, cachedReport, setCachedReport } = useNavigation();
  const [urlInput, setUrlInput] = useState(sharedUrl && sharedUrl !== 'https://' ? sharedUrl : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [techAudit, setTechAudit] = useState<TechnicalAuditResponse | null>(null);

  useEffect(() => {
    if (sharedUrl && sharedUrl !== 'https://' && !techAudit && !loading) {
      handleAnalyze(sharedUrl);
    }
  }, []);

  const handleAnalyze = async (overrideUrl?: string) => {
    const raw = (overrideUrl || urlInput).trim();
    if (!raw) return;

    let fullUrl = raw;
    if (!/^https?:\/\//i.test(fullUrl)) fullUrl = 'https://' + fullUrl;

    setSharedUrl(fullUrl);
    setUrlInput(fullUrl);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/technical-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fullUrl }),
      });
      const data: TechnicalAuditResponse & { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to run technical SEO audit');
      setTechAudit(data);
      if (data.auditReport) {
        setCachedReport(data.auditReport);
      }
    } catch (err: any) {
      setError(err.message || 'Error inspecting technical signals');
    } finally {
      setLoading(false);
    }
  };

  // Support either direct /api/technical-audit response or fallback to cachedReport from WebsiteAuditPage
  const report = techAudit?.auditReport || cachedReport;
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const handleExportPdf = async () => {
    if (!report) return;
    setIsExportingPdf(true);
    setPdfError(null);
    try {
      await exportAuditReportToPdf(report);
    } catch (err: any) {
      setPdfError(err?.message || 'Failed to generate PDF report');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const activeUrl = techAudit?.url || report?.url || '';
  const activeScore = techAudit?.technicalScore ?? report?.scores.technical ?? 0;
  const httpStatus = techAudit?.status.httpStatus ?? report?.httpStatus ?? null;
  const ttfbMs = techAudit?.status.ttfbMs ?? report?.responseTimeMs ?? null;
  const htmlSizeKb = techAudit?.status.htmlSizeKb ?? report?.pageSizeKb ?? null;
  const compression = techAudit?.status.compression ?? report?.pageInfo.compression ?? 'none';
  const isHttps = techAudit?.status.isHttps ?? report?.pageInfo.isHttps ?? false;
  const redirectChain = techAudit?.status.redirectChain ?? report?.redirectChain ?? [];

  const robotsMeta = techAudit?.crawlability.robotsMeta ?? report?.pageInfo.robotsMeta ?? '';
  const xRobotsTag = techAudit?.crawlability.xRobotsTag ?? report?.pageInfo.xRobotsTag ?? '';
  const isNoindex = Boolean(
    /noindex|none/i.test(robotsMeta) || /noindex|none/i.test(xRobotsTag)
  );
  const robotsTxtFound = techAudit?.crawlability.robotsTxtFound ?? report?.robotsTxtFound ?? false;
  const robotsTxtStatus = techAudit?.crawlability.robotsTxtStatus ?? report?.robotsTxtStatus ?? null;
  const robotsTxtAllowed = techAudit?.crawlability.robotsTxtAllowed ?? true;
  const sitemapUrl = techAudit?.crawlability.sitemapUrl ?? report?.sitemapUrl ?? '';
  const sitemapStatus = techAudit?.crawlability.sitemapStatus ?? report?.sitemapStatus ?? null;
  const sitemapUrlCount = techAudit?.crawlability.sitemapUrlCount ?? report?.sitemapUrlCount ?? null;
  const canonicalUrl = techAudit?.crawlability.canonicalUrl ?? report?.pageInfo.canonical ?? '';
  const canonicalStatus = techAudit?.crawlability.canonicalStatus ?? null;
  const isCrawlable = techAudit?.crawlability.isCrawlable ?? Boolean(httpStatus && httpStatus < 400);
  const isIndexable = techAudit?.crawlability.isIndexable ?? Boolean(isCrawlable && !isNoindex);

  const hasAuditData = Boolean(techAudit || report);

  const technicalChecks = hasAuditData
    ? [
        {
          name: 'HTTPS / SSL Encryption',
          desc: 'Ensures data in transit is encrypted with a modern TLS certificate.',
          status: isHttps ? 'pass' : 'fail',
          details: isHttps ? 'Valid HTTPS protocol' : 'Unencrypted HTTP detected',
          icon: Lock,
        },
        {
          name: 'Server Response Time (TTFB)',
          desc: 'Time from crawler request to receiving first byte of HTML.',
          status:
            ttfbMs === null
              ? 'warn'
              : ttfbMs < 800
              ? 'pass'
              : ttfbMs < 2000
              ? 'warn'
              : 'fail',
          details: ttfbMs !== null ? `${ttfbMs} ms latency` : 'Unavailable',
          icon: Zap,
        },
        {
          name: 'Crawlability & Indexability Status',
          desc: 'Evaluates robots.txt path permissions, HTTP status code, and index directives.',
          status: isIndexable ? 'pass' : isCrawlable ? 'warn' : 'fail',
          details: `Crawlable: ${isCrawlable ? 'Yes' : 'Blocked'} | Indexable: ${
            isIndexable ? 'Yes' : 'No (noindex/blocked)'
          }`,
          icon: Globe,
        },
        {
          name: 'Canonical Tag & HTTP Reachability',
          desc: 'Checks declared rel="canonical" target and verifies its live HTTP status code.',
          status: canonicalUrl
            ? canonicalStatus && canonicalStatus >= 200 && canonicalStatus < 300
              ? 'pass'
              : 'warn'
            : 'warn',
          details: canonicalUrl
            ? `${canonicalUrl}${canonicalStatus ? ` (HTTP ${canonicalStatus})` : ''}`
            : 'No rel="canonical" link tag declared',
          icon: Layers,
        },
        {
          name: 'Mobile Viewport Optimization',
          desc: 'Meta viewport tag instructing browsers how to scale on mobile screens.',
          status: report?.pageInfo.viewport ? 'pass' : report ? 'fail' : 'warn',
          details: report?.pageInfo.viewport || 'Missing or not inspected (robots blocked)',
          icon: Smartphone,
        },
        {
          name: 'Strict-Transport-Security (HSTS)',
          desc: 'Forces browsers to only connect via secure HTTPS.',
          status:
            techAudit?.securityHeaders.hsts || report?.pageInfo.hasHsts ? 'pass' : 'warn',
          details:
            techAudit?.securityHeaders.hsts || report?.pageInfo.hasHsts
              ? 'HSTS header active'
              : 'HSTS header missing',
          icon: Shield,
        },
        {
          name: 'HTTP Compression',
          desc: 'Reduces bandwidth by compressing HTML with gzip or Brotli.',
          status: compression !== 'none' ? 'pass' : 'warn',
          details: `Encoding: ${compression}`,
          icon: Server,
        },
        {
          name: 'Structured Data (JSON-LD)',
          desc: 'Helps Google understand entities and enables rich search cards.',
          status: (report?.schemas.length ?? 0) > 0 ? 'pass' : 'warn',
          details: `${report?.schemas.length ?? 0} schema block(s) detected`,
          icon: Layers,
        },
        {
          name: 'Robots Meta & X-Robots-Tag',
          desc: 'Controls indexing (index/noindex) and link following (follow/nofollow).',
          status: isNoindex ? 'fail' : 'pass',
          details:
            [
              robotsMeta ? `Meta: ${robotsMeta}` : null,
              xRobotsTag ? `Header: ${xRobotsTag}` : null,
            ]
              .filter(Boolean)
              .join(' | ') || 'Default index, follow assumed',
          icon: Code2,
        },
        {
          name: 'robots.txt Accessibility',
          desc: 'Live HTTP check for crawl directives at the root /robots.txt endpoint.',
          status: !robotsTxtAllowed ? 'fail' : robotsTxtFound ? 'pass' : 'warn',
          details: !robotsTxtAllowed
            ? `Target path blocked by robots.txt (HTTP ${robotsTxtStatus ?? 200})`
            : robotsTxtFound
            ? `Accessible (HTTP ${robotsTxtStatus ?? 200}) — path allowed`
            : `Not found or inaccessible (HTTP ${robotsTxtStatus ?? 'N/A'})`,
          icon: FileCheck,
        },
        {
          name: 'XML Sitemap Discovery',
          desc: 'Checks declared sitemaps or /sitemap.xml and parses indexed URL entries.',
          status: sitemapStatus === 200 ? 'pass' : 'warn',
          details: sitemapUrl
            ? sitemapStatus === 200
              ? `${sitemapUrlCount ?? 0} URL(s) in ${sitemapUrl}`
              : `HTTP ${sitemapStatus ?? 'Error'} at ${sitemapUrl}`
            : 'No XML sitemap found at /sitemap.xml or declared in robots.txt',
          icon: Layers,
        },
        {
          name: 'Charset Declaration',
          desc: 'Specifies character encoding to prevent garbled text.',
          status: report?.pageInfo.charset ? 'pass' : 'warn',
          details: `Charset: ${report?.pageInfo.charset || 'Not inspected'}`,
          icon: FileCheck,
        },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-xs font-bold">
            <Code2 className="w-3.5 h-3.5" />
            <span>Infrastructure, Status Codes &amp; Crawlability</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Technical SEO Analyzer
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Run a real-data technical SEO audit powered by live HTTP/HTML inspection, <code className="font-mono text-xs text-cyan-600 dark:text-cyan-400">robots.txt</code> &amp; sitemap verification, and Google PageSpeed Insights v5 Lighthouse SEO audits.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAnalyze();
          }}
          className="mt-6 flex flex-col sm:flex-row items-center gap-2"
        >
          <div className="relative flex-1 w-full flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="https://example.com"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={loading}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !urlInput.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm shadow-md shadow-cyan-500/20 active:scale-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{loading ? 'Auditing...' : 'Run Technical Scan'}</span>
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
            <div>
              <div className="font-bold">Scan Error</div>
              <div className="text-xs">{error}</div>
            </div>
          </div>
        )}
      </div>

      {/* Results View */}
      {hasAuditData && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
              <ScoreGauge score={activeScore} size="lg" label="Technical Score" />
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Technical Architecture Health
                </h2>
                <p className="text-sm text-slate-500 mt-1 max-w-xl break-all">
                  Audited URL: <span className="font-mono text-xs text-cyan-600 dark:text-cyan-400">{activeUrl}</span>
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mt-3 text-xs">
                  <span
                    className={`px-2.5 py-1 rounded-md font-bold ${
                      httpStatus === null || httpStatus >= 400
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        : httpStatus >= 300
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {httpStatus !== null
                      ? `HTTP ${httpStatus} ${httpStatus >= 400 ? 'Error' : httpStatus >= 300 ? 'Redirect' : 'OK'}`
                      : 'HTTP Unreachable'}
                  </span>
                  {htmlSizeKb !== null && (
                    <span className="px-2.5 py-1 rounded-md bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 font-bold">
                      {htmlSizeKb} KB HTML Size
                    </span>
                  )}
                  {ttfbMs !== null && (
                    <span className="px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-bold">
                      {ttfbMs} ms TTFB
                    </span>
                  )}
                  <span
                    className={`px-2.5 py-1 rounded-md font-bold ${
                      isIndexable
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    }`}
                  >
                    {isIndexable ? 'Indexable' : isCrawlable ? 'Noindex' : 'Crawl Blocked'}
                  </span>
                  {redirectChain.length > 0 && (
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold">
                      {redirectChain.length} redirect hop(s)
                    </span>
                  )}
                </div>

                {techAudit?.dataSources && techAudit.dataSources.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold">Live Providers:</span>
                    {techAudit.dataSources.map((src) => (
                      <span
                        key={src}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                )}

                {pdfError && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">{pdfError}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {report && (
                <button
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 text-white text-sm font-bold flex items-center gap-2 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
                >
                  {isExportingPdf ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4" />
                      <span>Export PDF Report</span>
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => handleAnalyze()}
                disabled={loading}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Re-Scan
              </button>
            </div>
          </div>

          {/* Redirect Hop Chain (if redirects occurred) */}
          {redirectChain.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                HTTP Redirect Chain ({redirectChain.length} hop{redirectChain.length === 1 ? '' : 's'})
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                {redirectChain.map((hop, idx) => (
                  <React.Fragment key={`${hop.url}-${idx}`}>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 break-all">
                      [{hop.status}] {hop.url}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </React.Fragment>
                ))}
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 break-all">
                  [{httpStatus ?? 200}] {activeUrl}
                </span>
              </div>
            </div>
          )}

          {/* Grid of Live Technical Checks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {technicalChecks.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-4"
                >
                  <div
                    className={`p-3 rounded-xl shrink-0 ${
                      item.status === 'pass'
                        ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400'
                        : item.status === 'warn'
                        ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400'
                        : 'bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.name}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                          item.status === 'pass'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : item.status === 'warn'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                    <div className="mt-2 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg truncate">
                      {item.details}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Google Lighthouse SEO API v5 Crawlability Audits */}
          {techAudit?.lighthouseSeo && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Google Lighthouse SEO &amp; Crawlability Audits
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Source: {techAudit.lighthouseSeo.source}
                  </p>
                </div>

                {techAudit.lighthouseSeo.available && (
                  <div className="flex items-center gap-2 text-xs font-bold">
                    {techAudit.lighthouseSeo.seoScore !== null && (
                      <span className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Google SEO Score: {techAudit.lighthouseSeo.seoScore}/100
                      </span>
                    )}
                    {techAudit.lighthouseSeo.bestPracticesScore !== null && (
                      <span className="px-3 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                        Best Practices: {techAudit.lighthouseSeo.bestPracticesScore}/100
                      </span>
                    )}
                  </div>
                )}
              </div>

              {techAudit.lighthouseSeo.available ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {techAudit.lighthouseSeo.audits.map((audit) => (
                    <div
                      key={audit.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex items-start gap-3"
                    >
                      {audit.passed === true ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : audit.passed === false ? (
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      ) : (
                        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {audit.title}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                              audit.passed === true
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : audit.passed === false
                                ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {audit.passed === true ? 'Pass' : audit.passed === false ? 'Fail' : 'N/A'}
                          </span>
                        </div>
                        {audit.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            {audit.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    {techAudit.lighthouseSeo.error ||
                      'Google PageSpeed Insights API v5 is temporarily unavailable; live HTTP crawlability diagnostics above remain accurate.'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
