import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { Link2, Search, Loader2, AlertCircle, CheckCircle2, Download, Filter, ExternalLink, RefreshCw } from 'lucide-react';
import { BrokenLinkItem } from '../types/seo';

export function BrokenLinkPage() {
  const { sharedUrl } = useNavigation();
  const [url, setUrl] = useState(sharedUrl && sharedUrl !== 'https://' ? sharedUrl : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{
    targetUrl: string;
    totalChecked: number;
    workingCount: number;
    brokenCount: number;
    links: BrokenLinkItem[];
  } | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'broken' | 'internal' | 'external'>('all');

  const handleCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let clean = url.trim();
    if (!clean) return;
    if (!/^https?:\/\//i.test(clean)) clean = 'https://' + clean;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/check-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: clean, maxLinks: 30 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to check links');
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Error occurred while checking links');
    } finally {
      setLoading(false);
    }
  };

  const filteredLinks = (results?.links || []).filter((l) => {
    if (filterMode === 'broken') return l.isBroken;
    if (filterMode === 'internal') return l.isInternal;
    if (filterMode === 'external') return !l.isInternal;
    return true;
  });

  const handleExportCsv = () => {
    if (!results || results.links.length === 0) return;
    const header = 'Anchor Text,Target URL,Type,Status Code,Status Text,Latency (ms),Is Broken\n';
    const rows = results.links
      .map(
        (l) =>
          `"${l.anchorText.replace(/"/g, '""')}","${l.href}","${l.isInternal ? 'Internal' : 'External'}",${l.status},"${l.statusText}",${l.timeMs},${l.isBroken}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u;
    a.download = `broken-links-${new URL(results.targetUrl).hostname}.csv`;
    a.click();
    URL.revokeObjectURL(u);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-[#111625] rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-xs transition-colors">
        <div className="max-w-3xl space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5" />
            <span>Hyperlink Integrity Scanner</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Broken Link Checker (404 Dead Link Detector)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Crawls a webpage, extracts internal and external hyperlinks, and tests each target destination with live network requests to detect 404 Not Found errors, timeout failures, and broken redirects.
          </p>
        </div>

        <form onSubmit={handleCheck} className="mt-6 flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="https://example.com/page-to-test"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-xs active:scale-98 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{loading ? 'Checking Links...' : 'Scan For Broken Links'}</span>
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

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Summary counters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-xl bg-white dark:bg-[#111625] border border-slate-200/90 dark:border-slate-800/90 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Links Checked
              </span>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
                {results.totalChecked}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Inspected on {results.targetUrl}</p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-[#111625] border border-slate-200/90 dark:border-slate-800/90 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Working Links (200 / 3xx)
              </span>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono tabular-nums">
                {results.workingCount}
              </div>
              <p className="text-xs text-slate-500 mt-1">Accessible with valid HTTP status</p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                Broken Links (404 / 5xx / Timeout)
              </span>
              <div className="text-3xl font-black text-red-600 dark:text-red-400 mt-1">
                {results.brokenCount}
              </div>
              <p className="text-xs text-slate-500 mt-1">Require immediate replacement or removal</p>
            </div>
          </div>

          {/* Links Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-500 mr-2 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filter:</span>
                </span>
                {(['all', 'broken', 'internal', 'external'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setFilterMode(m)}
                    className={`px-3 py-1.5 rounded-lg capitalize font-bold transition-colors ${
                      filterMode === m
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {m === 'broken' ? `Broken Only (${results.brokenCount})` : m}
                  </button>
                ))}
              </div>

              <button
                onClick={handleExportCsv}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>

            {filteredLinks.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                No links match current filter criteria.
              </div>
            ) : (
              <>
                {/* Mobile Card Stack View (< sm) */}
                <div className="block sm:hidden space-y-3">
                  {filteredLinks.map((link, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-2xl border space-y-2 text-xs ${
                        link.isBroken
                          ? 'border-red-200 dark:border-red-950 bg-red-50/40 dark:bg-red-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            link.isInternal
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          }`}
                        >
                          {link.isInternal ? 'Internal' : 'External'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            link.status >= 200 && link.status < 300
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : link.status >= 300 && link.status < 400
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          }`}
                        >
                          {link.status > 0 ? `${link.status} ${link.statusText}` : link.statusText}
                        </span>
                      </div>

                      <div className="font-bold text-slate-900 dark:text-white text-xs">
                        Anchor: {link.anchorText}
                      </div>

                      <div className="font-mono text-slate-700 dark:text-slate-300 text-[11px] break-all">
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-1"
                        >
                          <span className="break-all">{link.href}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                        </a>
                      </div>

                      <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-200/50 dark:border-slate-800">
                        Latency: {link.timeMs} ms
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View (>= sm) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4 rounded-l-xl">Anchor Text</th>
                        <th className="py-3 px-4">Destination URL</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">HTTP Status</th>
                        <th className="py-3 px-4 rounded-r-xl">Latency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredLinks.map((link, i) => (
                        <tr
                          key={i}
                          className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors ${
                            link.isBroken ? 'bg-red-50/30 dark:bg-red-950/20' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white max-w-[180px] truncate">
                            {link.anchorText}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300 max-w-[280px] truncate">
                            <a
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline flex items-center gap-1"
                            >
                              <span>{link.href}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                            </a>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                link.isInternal
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                  : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                              }`}
                            >
                              {link.isInternal ? 'Internal' : 'External'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-md font-bold text-xs ${
                                link.status >= 200 && link.status < 300
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : link.status >= 300 && link.status < 400
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              }`}
                            >
                              {link.status > 0 ? `${link.status} ${link.statusText}` : link.statusText}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-500">
                            {link.timeMs} ms
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
