import React, { useState } from 'react';
import { Compass, Search, Loader2, Copy, Check, HelpCircle, AlertTriangle, Clock } from 'lucide-react';

export function KeywordSuggestionsPage() {
  const [query, setQuery] = useState('react web development');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ keywords: any[]; questions: string[]; source?: string; retrievedAt?: string } | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleFetchSuggestions = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/keyword-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch live suggestions');
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Real data is currently unavailable. Please try again later or configure the required data source.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleCopyAll = () => {
    if (!data) return;
    const all = data.keywords.map((k) => k.keyword).join('\n');
    handleCopy(all);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-[#111625] rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-xs transition-colors">
        <div className="max-w-3xl space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>Real-time Google Autocomplete Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Keyword Suggestions &amp; Autocomplete Expander
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Extract real-time search queries people type into Google. Aggregates genuine long-tail variations, question keywords (&quot;how to&quot;, &quot;what is&quot;, &quot;why&quot;), and intent phrases without synthetic padding.
          </p>
        </div>

        <form onSubmit={handleFetchSuggestions} className="mt-6 flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="e.g. running shoes, digital marketing, python tutorial"
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
            <span>{loading ? 'Fetching Queries...' : 'Get Live Suggestions'}</span>
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {data?.source && (
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-3">
            <span>Source: {data.source}</span>
            {data.retrievedAt && (
              <span className="inline-flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" />
                {new Date(data.retrievedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {data && (
        <div className="space-y-6">
          {/* Question queries card */}
          {data.questions.length > 0 && (
            <div className="bg-white dark:bg-[#111625] rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Popular Question Searches (People Also Ask)
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Use these for FAQ sections and blog post H2 headings to target Google Featured Snippets.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {data.questions.map((q, i) => (
                  <div
                    key={i}
                    onClick={() => handleCopy(q)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-semibold cursor-pointer group transition-all"
                  >
                    <span className="text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {q}
                    </span>
                    <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Suggestions Grid */}
          <div className="bg-white dark:bg-[#111625] rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  All Autocomplete Long-Tail Expansions ({data.keywords.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Click any keyword to copy to clipboard.</p>
              </div>

              <button
                onClick={handleCopyAll}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'Copied' : 'Copy All'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {data.keywords.map((item, i) => (
                <div
                  key={i}
                  onClick={() => handleCopy(item.keyword)}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-white dark:bg-slate-900/40 flex items-center justify-between gap-2 text-xs cursor-pointer group transition-all"
                >
                  <span className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                    {item.keyword}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 shrink-0">
                    {item.intent}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
