import React, { useState, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { ScoreGauge } from '../components/ScoreGauge';
import { exportAuditReportToPdf } from '../services/pdfExportService';
import {
  FileText,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Check,
  AlertTriangle,
  Info,
  Image,
  ExternalLink,
  Tag,
  Share2,
  FileDown,
} from 'lucide-react';

export function OnPageSeoPage() {
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
      if (!res.ok) throw new Error(data.error || 'Failed to inspect on-page SEO');
      setCachedReport(data);
    } catch (err: any) {
      setError(err.message || 'Error inspecting page');
    } finally {
      setLoading(false);
    }
  };

  const report = cachedReport;
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

  const titleLen = report?.pageInfo.titleLength || 0;
  const descLen = report?.pageInfo.metaDescriptionLength || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
            <FileText className="w-3.5 h-3.5" />
            <span>On-Page SEO Diagnostics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            On-Page SEO Checker
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Verify key ranking factors right in the HTML: title tag pixel widths, meta description effectiveness, H1-H6 heading hierarchy, image alt coverage, and OpenGraph snippet readiness.
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
              placeholder="https://yourwebsite.com/page"
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
            <span>{loading ? 'Analyzing...' : 'Check On-Page SEO'}</span>
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

      {/* Main Results View */}
      {report && (
        <div className="space-y-6">
          {/* Summary Score Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
              <ScoreGauge score={report.scores.onPage} size="lg" label="On-Page Score" />
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  On-Page SEO Assessment
                </h2>
                <p className="text-sm text-slate-500 mt-1 max-w-md">
                  Target URL: <span className="font-mono text-xs text-blue-600 break-all">{report.url}</span>
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mt-3 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                    {report.counts.passed} checks passed
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                    {report.counts.warnings + report.counts.high} improvements recommended
                  </span>
                </div>
                {pdfError && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">{pdfError}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
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
              <button
                onClick={() => handleAnalyze()}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Refresh Audit
              </button>
            </div>
          </div>

          {/* Title & Meta Description Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title Tag */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Page Title Tag
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    titleLen >= 30 && titleLen <= 60
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {titleLen} / 60 characters
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-900 dark:text-white text-base">
                {report.pageInfo.title || <span className="text-red-500">[Missing Title Tag]</span>}
              </div>

              {/* Progress bar */}
              <div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      titleLen >= 30 && titleLen <= 60
                        ? 'bg-emerald-500'
                        : titleLen > 60
                        ? 'bg-red-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, (titleLen / 60) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Optimal length: 50–60 characters. Search engines truncate titles beyond ~600px.
                </p>
              </div>
            </div>

            {/* Meta Description */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Meta Description Tag
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    descLen >= 120 && descLen <= 165
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {descLen} / 160 characters
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
                {report.pageInfo.metaDescription || (
                  <span className="text-red-500 font-semibold">[Missing Meta Description]</span>
                )}
              </div>

              <div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      descLen >= 120 && descLen <= 165
                        ? 'bg-emerald-500'
                        : descLen > 165
                        ? 'bg-red-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, (descLen / 160) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Optimal length: 140–160 characters. A strong meta description improves organic CTR.
                </p>
              </div>
            </div>
          </div>

          {/* Headings and Images Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Headings */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Heading Breakdown</span>
                <span className="text-xs font-semibold text-slate-500">
                  H1: {report.headings.h1.length} | H2: {report.headings.h2.length} | H3: {report.headings.h3.length}
                </span>
              </h3>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">H1 Heading:</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {report.headings.h1[0] || <span className="text-red-500">No H1 heading found</span>}
                  </div>
                </div>

                {report.headings.h2.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                      Sample H2 Subheadings:
                    </div>
                    <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-4">
                      {report.headings.h2.slice(0, 4).map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Images Alt Tag Status */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Image Optimization</span>
                <span className="text-xs font-semibold text-slate-500">
                  {report.images.total} images total
                </span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                    {report.images.withAlt}
                  </div>
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    With Alt Attribute
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-center">
                  <div className="text-2xl font-black text-red-700 dark:text-red-300">
                    {report.images.missingAlt}
                  </div>
                  <div className="text-xs font-semibold text-red-600 dark:text-red-400">
                    Missing Alt Attribute
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Images without alt tags hurt your Google Image rankings and fail accessibility compliance (WCAG).
              </p>
            </div>
          </div>

          {/* Open Graph & Canonical Info */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Canonical &amp; Social Sharing Tags
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="font-semibold text-slate-400">Canonical Tag</div>
                <div className="font-mono text-slate-800 dark:text-slate-200 truncate mt-1">
                  {report.pageInfo.canonical || 'Not Specified'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="font-semibold text-slate-400">Language (lang)</div>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-1">
                  {report.pageInfo.language || 'Unset'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="font-semibold text-slate-400">og:title Tag</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 truncate mt-1">
                  {report.openGraph.title || 'Missing'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="font-semibold text-slate-400">og:image Tag</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 truncate mt-1">
                  {report.openGraph.image || 'Missing'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
