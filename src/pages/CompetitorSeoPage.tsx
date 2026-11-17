import React, { useState } from 'react';
import { ScoreGauge } from '../components/ScoreGauge';
import { Users, Loader2, Trophy, Plus, Trash2, AlertCircle, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { AuditReport } from '../types/seo';

export function CompetitorSeoPage() {
  const [urlUser, setUrlUser] = useState('');
  const [compUrls, setCompUrls] = useState<string[]>(['', '']);
  const [loading, setLoading] = useState(false);
  const [userReport, setUserReport] = useState<AuditReport | null>(null);
  const [compReports, setCompReports] = useState<Array<{ url: string; report: AuditReport | null; error?: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAddCompetitor = () => {
    if (compUrls.length < 3) {
      setCompUrls([...compUrls, '']);
    }
  };

  const handleRemoveCompetitor = (index: number) => {
    if (compUrls.length > 1) {
      setCompUrls(compUrls.filter((_, i) => i !== index));
    }
  };

  const handleUpdateCompUrl = (index: number, val: string) => {
    const updated = [...compUrls];
    updated[index] = val;
    setCompUrls(updated);
  };

  const handleCompare = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let cleanUser = urlUser.trim();
    if (!cleanUser) {
      setError('Please enter your website URL.');
      return;
    }

    const cleanComps = compUrls.map((u) => u.trim()).filter(Boolean);
    if (cleanComps.length === 0) {
      setError('Please enter at least one competitor URL.');
      return;
    }

    if (!/^https?:\/\//i.test(cleanUser)) cleanUser = 'https://' + cleanUser;
    const formattedComps = cleanComps.map((u) => (/^https?:\/\//i.test(u) ? u : 'https://' + u));

    setLoading(true);
    setError(null);

    try {
      // Crawl user site
      const userRes = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUser }),
      });
      const userData = await userRes.json();
      if (!userRes.ok) throw new Error(`Failed to crawl your website: ${userData.error || 'Crawl error'}`);
      setUserReport(userData);

      // Crawl competitors concurrently
      const compPromises = formattedComps.map(async (cUrl) => {
        try {
          const res = await fetch('/api/crawl', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: cUrl }),
          });
          const data = await res.json();
          if (!res.ok) return { url: cUrl, report: null, error: data.error || 'Crawl failed' };
          return { url: cUrl, report: data };
        } catch (err: any) {
          return { url: cUrl, report: null, error: err.message || 'Crawl error' };
        }
      });

      const compResults = await Promise.all(compPromises);
      setCompReports(compResults);
    } catch (err: any) {
      setError(err.message || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  // Extract competitor keywords for content gap analysis
  const getCompetitorContentGaps = () => {
    if (!userReport || compReports.length === 0) return [];

    const userKeywords = new Set(userReport.content.topKeywords.map((k) => k.keyword.toLowerCase()));
    const gapMap = new Map<string, { count: number; sources: string[] }>();

    compReports.forEach((c) => {
      const rep = c.report;
      if (rep) {
        rep.content.topKeywords.forEach((k) => {
          const kw = k.keyword.toLowerCase();
          if (!userKeywords.has(kw)) {
            const existing = gapMap.get(kw) || { count: 0, sources: [] };
            gapMap.set(kw, {
              count: existing.count + k.count,
              sources: Array.from(new Set([...existing.sources, new URL(rep.url).hostname])),
            });
          }
        });
      }
    });

    return Array.from(gapMap.entries())
      .map(([keyword, data]) => ({ keyword, count: data.count, sources: data.sources }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const contentGaps = getCompetitorContentGaps();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>Multi-Competitor Benchmark Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Competitor SEO Analyzer &amp; Content Gap Matrix
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Benchmark your website against up to 3 SERP competitors simultaneously. Compare overall SEO scores, title tag optimizations, content word counts, heading hierarchies, server response latencies, and discover missing keyword opportunities.
          </p>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleCompare} className="mt-6 space-y-4">
          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
            <label className="block text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 mb-1">
              1. Your Website URL (Primary Target)
            </label>
            <input
              type="text"
              placeholder="https://yoursite.com"
              value={urlUser}
              onChange={(e) => setUrlUser(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                2. Competitors to Benchmark Against (1 to 3 Sites)
              </label>
              {compUrls.length < 3 && (
                <button
                  type="button"
                  onClick={handleAddCompetitor}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Competitor</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {compUrls.map((url, idx) => (
                <div key={idx} className="relative flex items-center">
                  <input
                    type="text"
                    placeholder={`https://competitor-${idx + 1}.com`}
                    value={url}
                    onChange={(e) => handleUpdateCompUrl(idx, e.target.value)}
                    disabled={loading}
                    className="w-full pl-3 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {compUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCompetitor(idx)}
                      className="absolute right-2 text-slate-400 hover:text-red-500 transition-colors"
                      title="Remove competitor input"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !urlUser.trim()}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 active:scale-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
            <span>{loading ? 'Crawling All Websites Simultaneously...' : 'Run Multi-Competitor SEO Comparison'}</span>
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}
      </div>

      {/* Comparison Results Dashboard */}
      {userReport && compReports.length > 0 && (
        <div className="space-y-6">
          {/* Top Score Comparison Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Your Site Card */}
            <div className="p-6 rounded-3xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-center relative overflow-hidden">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                Your Website
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate mt-1 font-mono">
                {userReport.url}
              </h3>
              <div className="my-3">
                <ScoreGauge score={userReport.scores.overall} size="md" label="Overall Score" />
              </div>
              <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300 border-t border-blue-200/60 dark:border-blue-900/60 pt-2">
                <div>On-Page: <strong>{userReport.scores.onPage}/100</strong></div>
                <div>Technical: <strong>{userReport.scores.technical}/100</strong></div>
                <div>Content: <strong>{userReport.scores.content}/100</strong></div>
              </div>
            </div>

            {/* Competitor Cards */}
            {compReports.map((c, i) => {
              if (!c.report) {
                return (
                  <div key={i} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center flex flex-col justify-center">
                    <span className="text-xs font-bold text-red-500">Competitor {i + 1} Failed</span>
                    <p className="text-xs text-slate-400 mt-1 truncate">{c.url}</p>
                    <p className="text-[11px] text-red-400 mt-2">{c.error}</p>
                  </div>
                );
              }

              const isWinner = c.report.scores.overall > userReport.scores.overall;

              return (
                <div key={i} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center relative overflow-hidden">
                  {isWinner && (
                    <div className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      <span>Leads</span>
                    </div>
                  )}
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Competitor {i + 1}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate mt-1 font-mono">
                    {c.report.url}
                  </h3>
                  <div className="my-3">
                    <ScoreGauge score={c.report.scores.overall} size="md" label="Overall Score" />
                  </div>
                  <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-2">
                    <div>On-Page: <strong>{c.report.scores.onPage}/100</strong></div>
                    <div>Technical: <strong>{c.report.scores.technical}/100</strong></div>
                    <div>Content: <strong>{c.report.scores.content}/100</strong></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Signal Comparison Matrix */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Signal-by-Signal Head-to-Head Comparison Table
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 rounded-l-xl">SEO Signal Metric</th>
                    <th className="py-3 px-4 text-blue-600 dark:text-blue-400">Your Website</th>
                    {compReports.map((c, idx) => (
                      <th key={idx} className="py-3 px-4 truncate max-w-[150px]">
                        Competitor {idx + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Page Title Length</td>
                    <td className="py-3 px-4 font-mono text-blue-600 font-bold">{userReport.pageInfo.titleLength} chars</td>
                    {compReports.map((c, i) => (
                      <td key={i} className="py-3 px-4 font-mono">
                        {c.report ? `${c.report.pageInfo.titleLength} chars` : 'N/A'}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Meta Description Length</td>
                    <td className="py-3 px-4 font-mono text-blue-600 font-bold">{userReport.pageInfo.metaDescriptionLength} chars</td>
                    {compReports.map((c, i) => (
                      <td key={i} className="py-3 px-4 font-mono">
                        {c.report ? `${c.report.pageInfo.metaDescriptionLength} chars` : 'N/A'}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">H1 Headings Count</td>
                    <td className="py-3 px-4 font-mono text-blue-600 font-bold">{userReport.headings.h1.length} H1 tag(s)</td>
                    {compReports.map((c, i) => (
                      <td key={i} className="py-3 px-4 font-mono">
                        {c.report ? `${c.report.headings.h1.length} H1 tag(s)` : 'N/A'}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Content Word Volume</td>
                    <td className="py-3 px-4 font-mono text-blue-600 font-bold">{userReport.content.wordCount.toLocaleString()} words</td>
                    {compReports.map((c, i) => (
                      <td key={i} className="py-3 px-4 font-mono">
                        {c.report ? `${c.report.content.wordCount.toLocaleString()} words` : 'N/A'}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Internal / External Links</td>
                    <td className="py-3 px-4 font-mono text-blue-600 font-bold">{userReport.links.internalCount} int / {userReport.links.externalCount} ext</td>
                    {compReports.map((c, i) => (
                      <td key={i} className="py-3 px-4 font-mono">
                        {c.report ? `${c.report.links.internalCount} int / ${c.report.links.externalCount} ext` : 'N/A'}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Server Response (TTFB)</td>
                    <td className="py-3 px-4 font-mono text-blue-600 font-bold">{userReport.responseTimeMs} ms</td>
                    {compReports.map((c, i) => (
                      <td key={i} className="py-3 px-4 font-mono">
                        {c.report ? `${c.report.responseTimeMs} ms` : 'N/A'}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Structured Data (JSON-LD)</td>
                    <td className="py-3 px-4 font-mono text-blue-600 font-bold">{userReport.schemas.length} block(s)</td>
                    {compReports.map((c, i) => (
                      <td key={i} className="py-3 px-4 font-mono">
                        {c.report ? `${c.report.schemas.length} block(s)` : 'N/A'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Content Gap Opportunities Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Content Gap Opportunities Discovered
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Top keywords and topic clusters used prominently by your competitors that are missing from your current page text:
            </p>

            {contentGaps.length === 0 ? (
              <div className="p-6 text-center text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900">
                Excellent! Your page covers all major keyword clusters found on competitor domains.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {contentGaps.map((gap, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white font-mono">{gap.keyword}</div>
                    <div className="text-[10px] text-slate-500">
                      Used by: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{gap.sources.join(', ')}</span>
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
