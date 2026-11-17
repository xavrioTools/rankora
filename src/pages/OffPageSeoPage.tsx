import React, { useState, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import {
  Globe,
  Search,
  Loader2,
  AlertCircle,
  Link2,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Share2,
  TrendingUp,
  ShieldCheck,
  Info,
} from 'lucide-react';

export function OffPageSeoPage() {
  const { sharedUrl, setSharedUrl, cachedReport, setCachedReport } = useNavigation();
  const [urlInput, setUrlInput] = useState(sharedUrl && sharedUrl !== 'https://' ? sharedUrl : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sharedUrl && sharedUrl !== 'https://' && !cachedReport && !loading) {
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
      const res = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fullUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze off-page signals');
      setCachedReport(data);
    } catch (err: any) {
      setError(err.message || 'Error inspecting off-page signals');
    } finally {
      setLoading(false);
    }
  };

  const report = cachedReport;
  const externalSample = report?.links.sample.filter((l) => !l.isInternal) || [];
  const nofollowCount = report?.links.nofollowCount || 0;
  const externalCount = report?.links.externalCount || 0;
  const dofollowCount = Math.max(0, externalCount - nofollowCount);
  const socialProfiles = report?.offPage?.socialLinks || [];

  // Backlink readiness checklist
  const readinessChecklist = report
    ? [
        {
          title: 'Connected Official Brand Social Profiles',
          status: socialProfiles.length > 0,
          note: socialProfiles.length > 0
            ? `Discovered ${socialProfiles.length} brand channels (${socialProfiles.map((s) => s.platform).join(', ')}).`
            : 'No official social profile links discovered on site. Linking company social pages improves Google E-E-A-T score.',
        },
        {
          title: 'Open Graph Social Cards (og:image & og:title)',
          status: Boolean(report.openGraph.title && report.openGraph.image),
          note: 'Essential so that shared links render high-CTR cards across Twitter, Facebook, Slack, and LinkedIn.',
        },
        {
          title: 'Self-referencing Canonical Tag',
          status: Boolean(report.pageInfo.canonical),
          note: 'Ensures external backlinks pass PageRank to your primary canonical URL without loss.',
        },
        {
          title: 'Authoritative Entity Schema (JSON-LD)',
          status: report.schemas.length > 0,
          note: 'Establishes publisher identity and knowledge graph connections for Google trust.',
        },
        {
          title: 'High-Value Linkable Asset Volume',
          status: (report.content.wordCount || 0) > 600,
          note: 'In-depth guides and comprehensive tools provide stronger citation value for organic editorial links.',
        },
        {
          title: 'Secure HTTPS Endpoint with Valid SSL',
          status: report.pageInfo.isHttps,
          note: 'Reputable websites rarely link to insecure HTTP destinations.',
        },
      ]
    : [];

  const readinessScore = readinessChecklist.length
    ? Math.round(
        (readinessChecklist.filter((c) => c.status).length / readinessChecklist.length) * 100
      )
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
            <Globe className="w-3.5 h-3.5" />
            <span>Off-Page &amp; Backlink Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Off-Page SEO Checker &amp; Link Profile
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Audit external link ratios, inspect outlink anchor distributions, detect social entity connections, and verify your website’s link-earning readiness without fake fabricated metrics.
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
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !urlInput.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{loading ? 'Analyzing...' : 'Audit Link Profile'}</span>
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
            <div>
              <div className="font-bold">Error</div>
              <div className="text-xs">{error}</div>
            </div>
          </div>
        )}
      </div>

      {report && (
        <div className="space-y-6">
          {/* Transparency Banner */}
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
            <Info className="w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">Live DOM Off-Page Signals &amp; 3P Backlink Status</span>
              <p>
                {report.offPage?.apiStatusNote ||
                  'All values below reflect real live DOM inspection (social profile links, outbound dofollow/nofollow counts, and on-site authority readiness).'}
              </p>
              {report.offPage?.referringDomainsEst == null && (
                <p className="font-semibold text-amber-800 dark:text-amber-300">
                  Referring Domains &amp; 3P Backlink History: Real data is currently unavailable. Please try again later or configure the required data source.
                </p>
              )}
            </div>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Connected Social Profiles
              </span>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {socialProfiles.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">Official brand profiles discovered</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Dofollow Outbound Links
              </span>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {dofollowCount}
              </div>
              <p className="text-xs text-slate-500 mt-1">Passing PageRank to sources</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Nofollow Outbound Links
              </span>
              <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {nofollowCount}
              </div>
              <p className="text-xs text-slate-500 mt-1">Tagged with rel=&quot;nofollow&quot;</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Backlink Readiness
              </span>
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {readinessScore}%
              </div>
              <p className="text-xs text-slate-500 mt-1">Link-earning signals satisfied</p>
            </div>
          </div>

          {/* Social Media Profiles Discovered */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Connected Official Brand Profiles ({socialProfiles.length})
            </h2>

            {socialProfiles.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                No official social media channels detected on website. Adding links to LinkedIn, X/Twitter, or Facebook improves brand entity verification.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {socialProfiles.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs hover:border-blue-500 transition-all bg-slate-50/50 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-blue-500" />
                      <span className="font-bold text-slate-900 dark:text-white">{s.platform}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Backlink Readiness Checklist */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Backlink &amp; Authority Readiness Checklist
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Before conducting outreach or PR campaigns, ensure these structural linkability foundations are in place.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {readinessChecklist.map((item, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    item.status
                      ? 'border-emerald-200 dark:border-emerald-950/80 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <div
                    className={`p-1 rounded-full mt-0.5 ${
                      item.status
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.note}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Outbound External Links Table */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Detected Outbound Links ({externalSample.length} sampled)
              </h2>
              <span className="text-xs text-slate-500">Live DOM links</span>
            </div>

            {externalSample.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No outbound external links discovered on this page.
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {externalSample.map((l, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        &quot;{l.text}&quot;
                      </div>
                      <div className="text-slate-500 font-mono truncate mt-0.5">{l.href}</div>
                    </div>
                    <div className="shrink-0 flex items-center gap-1.5">
                      {l.isNofollow ? (
                        <span className="px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Nofollow
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Dofollow
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
