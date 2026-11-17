import React, { useState } from 'react';
import {
  Globe,
  Link2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Loader2,
  ArrowUpRight,
  BarChart3,
  Clock,
  RefreshCw,
  Info,
  ShieldCheck,
} from 'lucide-react';

interface LiveCheckItem {
  label: string;
  value: string;
  status: 'good' | 'warn' | 'bad';
}

interface DomainPerformanceData {
  domain: string;
  fullUrl: string;
  retrievedAt: string;
  source: string;
  httpStatus: number;
  responseTimeMs: number;
  pageSizeKb: number;
  redirectCount: number;
  isHttps: boolean;
  canonical: string;
  robotsMeta: string;
  xRobotsTag: string;
  robotsTxtFound: boolean;
  robotsTxtStatus: number | null;
  sitemapUrl: string;
  sitemapFound: boolean;
  sitemapStatus: number | null;
  sitemapUrlCount: number | null;
  indexingStatus: 'Indexable' | 'Blocked from Indexing' | 'HTTP Error';
  outboundLinks: {
    internal: number;
    externalDofollow: number;
    externalNofollow: number;
    totalExternal: number;
  };
  authorityApiConfigured?: boolean;
  domainAuthority: number | null;
  domainAuthoritySource: string | null;
  totalBacklinks: number | null;
  referringDomains: number | null;
  unavailableReason: string;
  liveChecks: LiveCheckItem[];
}

const SAMPLE_DOMAINS = ['wikipedia.org', 'github.com', 'example.com'];

export function SeoPerformanceTracker() {
  const [urlInput, setUrlInput] = useState('');
  const [data, setData] = useState<DomainPerformanceData | null>(null);
  const [recentDomains, setRecentDomains] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('rankora_tracked_domains');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrackerData = async (targetUrl: string, persistHistory = true) => {
    const cleanTarget = targetUrl.trim();
    if (!cleanTarget) {
      setError('Please enter a website URL (for example, example.com).');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/performance-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanTarget }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error || 'Failed to inspect target website.');
      }

      setData(payload as DomainPerformanceData);
      setUrlInput(payload.domain);

      if (persistHistory) {
        setRecentDomains((prev) => {
          const next = [payload.domain, ...prev.filter((d) => d !== payload.domain)].slice(0, 4);
          try {
            localStorage.setItem('rankora_tracked_domains', JSON.stringify(next));
          } catch {
            // Ignore storage quota errors
          }
          return next;
        });
      }
    } catch (err: any) {
      setError(err.message || 'Unable to inspect target website.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackUrl = (e?: React.FormEvent, overrideRaw?: string) => {
    if (e) e.preventDefault();
    const target = (overrideRaw ?? urlInput).trim();
    if (overrideRaw) {
      setUrlInput(overrideRaw);
    }
    fetchTrackerData(target, true);
  };

  const dofollowPct =
    data && data.outboundLinks.totalExternal > 0
      ? Math.round((data.outboundLinks.externalDofollow / data.outboundLinks.totalExternal) * 100)
      : 0;
  const nofollowPct = data && data.outboundLinks.totalExternal > 0 ? 100 - dofollowPct : 0;

  return (
    <section
      aria-labelledby="seo-performance-tracker-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="rounded-3xl bg-white dark:bg-[#111625] border border-slate-200/90 dark:border-slate-800/90 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Header & URL Input Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>SEO Performance Tracker</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Live Crawl &amp; Indexability Diagnostics
              </span>
            </div>
            <h2
              id="seo-performance-tracker-heading"
              className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight text-balance"
            >
              Domain Authority, Link Profile &amp; Indexing Summary
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Enter any live public URL to inspect real HTTP status, robots.txt, XML sitemap entries, indexability directives, and outbound link ratios. Authority metrics are only displayed when a third-party authority API is connected.
            </p>
          </div>

          <form
            onSubmit={(e) => handleTrackUrl(e)}
            className="w-full lg:w-auto lg:min-w-[420px] space-y-2"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1 flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <label htmlFor="tracker-url-input" className="sr-only">
                  Website URL to inspect
                </label>
                <input
                  id="tracker-url-input"
                  type="text"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter domain or URL (e.g. wikipedia.org)"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 font-medium outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Inspecting...</span>
                  </>
                ) : (
                  <>
                    <span>Track URL</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Inspect live:</span>
              {Array.from(new Set([...recentDomains, ...SAMPLE_DOMAINS])).slice(0, 4).map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => handleTrackUrl(undefined, sample)}
                  className={`font-mono text-[11px] transition-colors cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 ${
                    data?.domain === sample
                      ? 'text-indigo-600 dark:text-indigo-400 font-semibold underline underline-offset-4'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {sample}
                </button>
              ))}
            </div>

            {error && (
              <div role="alert" className="flex items-center justify-between gap-2 text-xs font-medium text-red-600 dark:text-red-400">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => fetchTrackerData(urlInput, false)}
                  className="inline-flex items-center gap-1 underline hover:no-underline shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Loading State */}
        {loading && !data ? (
          <div className="space-y-6 animate-pulse" aria-busy="true">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800"
                />
              ))}
            </div>
          </div>
        ) : !data ? (
          <div className="p-8 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
            <Globe className="w-8 h-8 text-indigo-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Ready for Live URL Inspection
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Enter any domain above or click a live example to inspect real HTTP status, robots.txt, XML sitemap entries, canonical tags, and outbound links.
            </p>
          </div>
        ) : (
          <div className={`space-y-6 transition-opacity duration-200 ${loading ? 'opacity-60' : 'opacity-100'}`}>
            {/* Active Target Metadata Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex flex-wrap items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="font-mono font-semibold text-slate-900 dark:text-white break-all">
                  {data.fullUrl}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">HTTP {data.httpStatus}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{data.responseTimeMs} ms</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{data.pageSizeKb} KB HTML</span>
                {data.redirectCount > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{data.redirectCount} redirect hop(s)</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1.5 font-mono tabular-nums">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Retrieved {new Date(data.retrievedAt).toLocaleTimeString()}</span>
              </div>
            </div>

            {/* 3 Primary Real KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Domain Authority (Third-Party API Status) */}
              <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4">
                <div className="space-y-2 min-w-0">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Domain Authority &amp; PageRank
                  </div>
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Third-Party Authority Data Unavailable
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {data.unavailableReason}
                  </p>
                </div>
              </div>

              {/* Card 2: Crawled Link Profile & Backlink Index Status */}
              <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Outbound Link Profile (Live HTML)
                  </span>
                  <Link2 className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                    {data.outboundLinks.totalExternal.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                    external · {data.outboundLinks.internal.toLocaleString()} internal
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                    <div
                      className="h-full bg-indigo-600"
                      style={{ width: `${dofollowPct}%` }}
                      aria-label={`Dofollow ${dofollowPct}%`}
                    />
                    <div
                      className="h-full bg-slate-400 dark:bg-slate-600"
                      style={{ width: `${nofollowPct}%` }}
                      aria-label={`Nofollow ${nofollowPct}%`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                    <span>{data.outboundLinks.externalDofollow} Dofollow ({dofollowPct}%)</span>
                    <span>{data.outboundLinks.externalNofollow} Nofollow ({nofollowPct}%)</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Real Indexing & Sitemap Status */}
              <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Live Indexing Status
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold whitespace-nowrap ${
                      data.indexingStatus === 'Indexable'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {data.indexingStatus === 'Indexable' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    <span>{data.indexingStatus}</span>
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                    {data.sitemapUrlCount !== null ? data.sitemapUrlCount.toLocaleString() : '—'}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {data.sitemapFound ? 'XML sitemap entries discovered' : 'No XML sitemap entries found'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 truncate">
                  <div>robots.txt: {data.robotsTxtFound ? `HTTP ${data.robotsTxtStatus}` : `Not found (${data.robotsTxtStatus ?? 'N/A'})`}</div>
                  <div className="truncate">Sitemap: {data.sitemapUrl}</div>
                </div>
              </div>
            </div>

            {/* Real Live Inspection Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Live Indexability &amp; Technical Signals</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Direct checks executed against {data.domain} ({data.source})
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-200/70 dark:divide-slate-800/80 text-xs">
                  {data.liveChecks.map((item) => (
                    <div key={item.label} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                      <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold shrink-0">
                        {item.status === 'good' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : item.status === 'warn' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        )}
                        <span>{item.label}</span>
                      </span>
                      <span className="font-mono text-slate-600 dark:text-slate-400 break-all sm:text-right">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <Info className="w-4 h-4 text-indigo-500" />
                    <span>Backlink Index &amp; Historical Trends</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {data.unavailableReason}
                  </p>
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#111625] border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                    <div>
                      <strong>Inbound Backlinks &amp; Referring Domains:</strong> Unavailable — no third-party backlink index provider is configured.
                    </div>
                    <div>
                      <strong>Domain Authority &amp; PageRank:</strong> Unavailable — no third-party authority API is configured. Rankora never simulates or estimates authority scores.
                    </div>
                    <div>
                      <strong>Historical Trends:</strong> Unavailable without an active longitudinal search/backlink index provider.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
