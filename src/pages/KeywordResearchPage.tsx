import React, { useState } from 'react';
import { KeyRound, Search, Loader2, Download, Filter, AlertTriangle, Info, Clock } from 'lucide-react';
import { KeywordResult } from '../types/seo';
import { ToolPageLayout } from '../components/ToolPageLayout';

export function KeywordResearchPage() {
  const [query, setQuery] = useState('seo audit');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<KeywordResult[]>([]);
  const [sourceInfo, setSourceInfo] = useState<{
    source?: string;
    retrievedAt?: string;
    unavailableReason?: string;
  } | null>(null);
  const [intentFilter, setIntentFilter] = useState<'All' | 'Informational' | 'Commercial' | 'Transactional' | 'Navigational'>('All');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = query.trim();
    if (!clean) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/keyword-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: clean }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Keyword lookup failed');
      setResults(data.keywords || []);
      setSourceInfo({
        source: data.source,
        retrievedAt: data.retrievedAt,
        unavailableReason: data.unavailableReason,
      });
    } catch (err: any) {
      setError(err.message || 'Real data is currently unavailable. Please try again later or configure the required data source.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = results.filter((k) => (intentFilter === 'All' ? true : k.intent === intentFilter));

  const handleExportCsv = () => {
    if (results.length === 0) return;
    const header = 'Keyword,Intent,Search Volume,Keyword Difficulty,Estimated CPC,Source\n';
    const rows = results
      .map(
        (r) =>
          `"${r.keyword.replace(/"/g, '""')}","${r.intent}","${r.volumeTier ?? 'Unavailable'}","${r.difficulty ?? 'Unavailable'}","${r.cpcEstimate ?? 'Unavailable'}","Google Autocomplete API"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keyword-research-${query.replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolPageLayout
      title="Keyword Research Tool"
      description="Discover genuine search terms directly from Google Autocomplete with rule-based search intent classification (Informational, Commercial, Transactional, Navigational)."
      icon={<><KeyRound className="w-3.5 h-3.5" /><span>Live Autocomplete &amp; Search Intent Discovery</span></>}
    >
      <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full flex items-center">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Enter seed topic (e.g. coffee maker, web hosting, seo tools)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-xs active:scale-98 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          <span>{loading ? 'Querying Autocomplete...' : 'Research Keywords'}</span>
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Table */}
      {results.length > 0 && (
        <div className="mt-8 bg-white dark:bg-[#111625] rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Discovered Autocomplete Keywords ({filtered.length})
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span>Seed query: &quot;{query}&quot;</span>
                {sourceInfo?.source && <span>Source: {sourceInfo.source}</span>}
                {sourceInfo?.retrievedAt && (
                  <span className="inline-flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(sourceInfo.retrievedAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCsv}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>Ads Volume / CPC / Difficulty Metrics:</strong>{' '}
              {sourceInfo?.unavailableReason || 'Real data is currently unavailable. Please try again later or configure the required data source.'}{' '}
              All keyword phrases below are 100% live results from Google Autocomplete without synthetic numbers.
            </span>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500 mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Intent Filter:</span>
            </span>
            {(['All', 'Informational', 'Commercial', 'Transactional', 'Navigational'] as const).map(
              (intent) => (
                <button
                  key={intent}
                  onClick={() => setIntentFilter(intent)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    intentFilter === intent
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {intent}
                </button>
              )
            )}
          </div>

          {/* Mobile Card View (< sm) */}
          <div className="block sm:hidden space-y-3">
            {filtered.map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-sm break-all">
                    {item.keyword}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold text-[10px] shrink-0 ${
                      item.intent === 'Transactional'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        : item.intent === 'Commercial'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : item.intent === 'Informational'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {item.intent}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/50 dark:border-slate-800">
                  Volume / KD / CPC: <span className="italic">Unavailable (Google Ads API required)</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= sm) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Keyword Phrase (Live)</th>
                  <th className="py-3 px-4">Intent Classification</th>
                  <th className="py-3 px-4">Search Volume</th>
                  <th className="py-3 px-4">Keyword Difficulty</th>
                  <th className="py-3 px-4 rounded-r-xl">CPC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {item.keyword}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          item.intent === 'Transactional'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : item.intent === 'Commercial'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : item.intent === 'Informational'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {item.intent}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 italic">
                      {item.volumeTier ?? 'Unavailable'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 italic">
                      {item.difficulty !== null ? `${item.difficulty} (${item.difficultyLabel})` : 'Unavailable'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 italic">
                      {item.cpcEstimate ?? 'Unavailable'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}
