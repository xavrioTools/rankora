import React, { useState } from 'react';
import { Layers, Search, Loader2, Download, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { BulkUrlItem } from '../types/seo';

export function BulkUrlCheckerPage() {
  const [urlsText, setUrlsText] = useState(
    `https://wikipedia.org\nhttps://github.com\nhttps://news.ycombinator.com\nhttps://developer.mozilla.org`
  );
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BulkUrlItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleRunBulk = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const list = urlsText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (list.length === 0) {
      setError('Please enter at least one URL.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/bulk-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: list }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bulk check failed');
      setResults(data.results || []);
    } catch (err: any) {
      setError(err.message || 'Error executing bulk check');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (results.length === 0) return;
    const header = 'URL,HTTP Status,SEO Score,Title,Title Length,Meta Description,H1 Count,HTTPS,TTFB (ms)\n';
    const rows = results
      .map(
        (r) =>
          `"${r.url}",${r.status},${r.score},"${r.title.replace(/"/g, '""')}",${r.titleLength},"${r.metaDesc.replace(/"/g, '""')}",${r.h1Count},${r.isHttps},${r.responseTimeMs}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-seo-audit-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span>Batch Diagnostic Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Bulk URL SEO Checker
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Audit up to 15 URLs in a single automated scan. Inspect HTTP response codes, title tag lengths, meta descriptions, H1 headings, HTTPS protocols, and server TTFB in bulk, then export directly to CSV.
          </p>
        </div>

        <form onSubmit={handleRunBulk} className="mt-6 space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Enter URLs (One per line, up to 15 per batch)
            </label>
            <textarea
              rows={5}
              value={urlsText}
              onChange={(e) => setUrlsText(e.target.value)}
              disabled={loading}
              placeholder="https://example.com/page-1&#10;https://example.com/page-2"
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !urlsText.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
            <span>{loading ? 'Crawling Multiple URLs...' : 'Run Bulk SEO Audit'}</span>
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Results Table */}
      {results.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Bulk Audit Results ({results.length} URLs)
              </h2>
              <p className="text-xs text-slate-500">Live crawl diagnostic summary</p>
            </div>

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Mobile Card View (< sm) */}
          <div className="block sm:hidden space-y-3">
            {results.map((r, i) => (
              <div key={i} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      r.status === 200
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    }`}
                  >
                    HTTP {r.status || 'Failed'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px]">Score:</span>
                    <span
                      className={`font-black font-mono text-sm ${
                        r.score >= 80 ? 'text-emerald-600' : r.score >= 60 ? 'text-amber-600' : 'text-red-600'
                      }`}
                    >
                      {r.score}/100
                    </span>
                  </div>
                </div>

                <div className="font-mono text-slate-900 dark:text-white font-semibold break-all text-xs">
                  {r.url}
                </div>

                <div className="text-slate-800 dark:text-slate-200 font-medium">
                  <strong>Title ({r.titleLength} chars):</strong> {r.title || '[Missing Title]'}
                </div>

                <div className="text-slate-500 text-[11px]">
                  <strong>Meta Desc:</strong> {r.metaDesc || '[Missing Description]'}
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/50 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <span>H1 tags: <strong className="font-mono">{r.h1Count}</strong></span>
                  <span>HTTPS: <strong>{r.isHttps ? 'Yes ✓' : 'No ✕'}</strong></span>
                  <span>TTFB: <strong className="font-mono">{r.responseTimeMs} ms</strong></span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= sm) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">URL</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Title Tag</th>
                  <th className="py-3 px-4">Meta Description</th>
                  <th className="py-3 px-4">H1s</th>
                  <th className="py-3 px-4">HTTPS</th>
                  <th className="py-3 px-4 rounded-r-xl">TTFB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {results.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium max-w-[200px] truncate text-slate-900 dark:text-white">
                      {r.url}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          r.status === 200
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}
                      >
                        {r.status || 'Failed'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-black font-mono ${
                          r.score >= 80 ? 'text-emerald-600' : r.score >= 60 ? 'text-amber-600' : 'text-red-600'
                        }`}
                      >
                        {r.score}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-[180px] truncate text-slate-700 dark:text-slate-300">
                      {r.title} ({r.titleLength})
                    </td>
                    <td className="py-3.5 px-4 max-w-[200px] truncate text-slate-500">
                      {r.metaDesc}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {r.h1Count}
                    </td>
                    <td className="py-3.5 px-4">
                      {r.isHttps ? '✓' : '✕'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {r.responseTimeMs} ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
