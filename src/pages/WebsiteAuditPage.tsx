import React, { useState, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { AuditReportView } from '../components/AuditReportView';
import { Search, Loader2, AlertCircle, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Layers } from 'lucide-react';
import { ToolPageLayout } from '../components/ToolPageLayout';


export function WebsiteAuditPage() {
  const { sharedUrl, setSharedUrl, cachedReport, setCachedReport } = useNavigation();
  const [urlInput, setUrlInput] = useState(sharedUrl && sharedUrl !== 'https://' ? sharedUrl : '');
  const [crawlDepth, setCrawlDepth] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-run if sharedUrl was set from homepage and no cached report exists
  useEffect(() => {
    if (sharedUrl && sharedUrl !== 'https://' && !cachedReport && !loading) {
      handleRunAudit(sharedUrl);
    }
  }, []);

  const handleRunAudit = async (targetUrl?: string) => {
    const raw = (targetUrl || urlInput).trim();
    if (!raw) return;

    let fullUrl = raw;
    if (!/^https?:\/\//i.test(fullUrl)) {
      fullUrl = 'https://' + fullUrl;
    }

    setSharedUrl(fullUrl);
    setUrlInput(fullUrl);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fullUrl, maxPages: crawlDepth }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to crawl website');
      }

      setCachedReport(data);
    } catch (err: any) {
      setError(err.message || 'Error occurred while auditing website');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolPageLayout
      title="Free SEO Website Audit Tool"
      description="Run an in-depth audit of any public website or webpage. We inspect technical response headers, meta elements, heading hierarchies, image alt attributes, robots/sitemap accessibility, OpenGraph social cards, and structured schemas."
      icon={<><ShieldCheck className="w-3.5 h-3.5" /><span>Comprehensive 360° Health Scan</span></>}
    >
      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleRunAudit();
        }}
        className="mt-6 space-y-3"
      >
        <div className="flex flex-col sm:flex-row items-center gap-2">
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
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Crawling Website...</span>
              </>
            ) : (
              <>
                <span>Run SEO Audit</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Crawl Depth Selector */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>Crawl Scope:</span>
          </span>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setCrawlDepth(1)}
              className={`px-3 py-1 rounded-lg transition-colors ${
                crawlDepth === 1
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Single Page (1 URL)
            </button>
            <button
              type="button"
              onClick={() => setCrawlDepth(5)}
              className={`px-3 py-1 rounded-lg transition-colors ${
                crawlDepth === 5
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Deep Audit (5 Pages)
            </button>
            <button
              type="button"
              onClick={() => setCrawlDepth(10)}
              className={`px-3 py-1 rounded-lg transition-colors ${
                crawlDepth === 10
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Full Site (10 Pages)
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <div>
            <div className="font-bold">Audit Failed</div>
            <div className="text-xs mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-4 animate-pulse">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Auditing {urlInput} ({crawlDepth} Page{crawlDepth > 1 ? 's' : ''} Scope)...
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Crawling page HTML, inspecting headings, testing TTFB, validating OpenGraph, Schema markup, robots.txt, and duplicate titles.
          </p>
        </div>
      )}

      {/* Render Audit Report if available */}
      {!loading && cachedReport && (
        <AuditReportView report={cachedReport} onReAudit={() => handleRunAudit()} />
      )}

      {/* Empty State when no audit is loaded */}
      {!loading && !cachedReport && !error && (
        <div className="p-12 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Ready to Audit Any Website
          </h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            Type your URL above or try common sample sites like <code className="text-blue-600 font-mono">wikipedia.org</code>, <code className="text-blue-600 font-mono">github.com</code>, or your own domain.
          </p>
        </div>
      )}
    </ToolPageLayout>
  );
}

