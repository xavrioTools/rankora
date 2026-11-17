import React, { useState } from 'react';
import { AuditReport, AuditIssue } from '../types/seo';
import { useNavigation } from '../context/NavigationContext';
import { ScoreGauge } from './ScoreGauge';
import { AuditResultsTable } from './AuditResultsTable';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  Copy,
  Check,
  Download,
  Printer,
  ExternalLink,
  ChevronRight,
  Shield,
  Clock,
  HardDrive,
  FileText,
  Image,
  Link,
  Search,
  Code,
  Tag,
  Share2,
  Zap,
  Layers,
  Wrench,
  Globe,
  Globe2,
  Sparkles,
  ShieldAlert,
  Share,
} from 'lucide-react';

import { exportAuditReportToPdf } from '../services/pdfExportService';
import { Loader2, FileDown } from 'lucide-react';

interface AuditReportViewProps {
  report: AuditReport;
  onReAudit?: () => void;
}

export function AuditReportView({ report, onReAudit }: AuditReportViewProps) {
  const { navigateTo } = useNavigation();
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'high' | 'medium' | 'low' | 'passed'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'on-page' | 'technical' | 'content' | 'off-page'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'issues' | 'crawled-pages' | 'headings' | 'images' | 'links' | 'schema' | 'off-page'>('issues');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await exportAuditReportToPdf(report);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const filteredIssues = report.issues.filter((issue) => {
    if (filterSeverity !== 'all') {
      if (filterSeverity === 'medium' && (issue.severity === 'medium' || issue.severity === ('warning' as any))) return true;
      if (issue.severity !== filterSeverity) return false;
    }
    if (filterCategory !== 'all' && issue.category !== filterCategory) return false;
    return true;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-audit-${new URL(report.url).hostname}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const severityBadges: Record<string, { bg: string; icon: any; label: string }> = {
    critical: {
      bg: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900',
      icon: AlertCircle,
      label: 'Critical Error',
    },
    high: {
      bg: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900',
      icon: AlertTriangle,
      label: 'High Priority',
    },
    medium: {
      bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900',
      icon: Info,
      label: 'Medium Priority',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900',
      icon: Info,
      label: 'Warning',
    },
    low: {
      bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900',
      icon: Info,
      label: 'Low Priority',
    },
    passed: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
      icon: CheckCircle2,
      label: 'Passed Check',
    },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-[#111625] rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800/80">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">Rankora Audit Engine</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="tabular-nums">
                {new Date(report.timestamp).toLocaleString()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white break-all tracking-tight">
              {report.url}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2 font-medium">
              <span>
                Status:{' '}
                <strong
                  className={`font-semibold ${
                    report.httpStatus >= 400
                      ? 'text-red-600 dark:text-red-400'
                      : report.httpStatus >= 300
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {report.httpStatus}{' '}
                  {report.httpStatus >= 400 ? 'Error' : report.httpStatus >= 300 ? 'Redirect' : 'OK'}
                </strong>
              </span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="flex items-center gap-1 font-mono tabular-nums">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {report.responseTimeMs} ms TTFB
              </span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="flex items-center gap-1 font-mono tabular-nums">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                {report.pageSizeKb} KB
              </span>
              {report.crawledPagesCount && report.crawledPagesCount > 1 ? (
                <>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {report.crawledPagesCount} Pages Crawled
                  </span>
                </>
              ) : null}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-xs active:scale-98"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Export PDF Report</span>
                </>
              )}
            </button>
            <button
              onClick={handleExportJson}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200/90 dark:border-slate-700/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200/90 dark:border-slate-700/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Print</span>
            </button>
            {onReAudit && (
              <button
                onClick={onReAudit}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Re-Analyze
              </button>
            )}
          </div>
        </div>

        {/* Score Gauges Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-6 pt-6">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
            <ScoreGauge score={report.scores.overall} size="lg" label="Overall Score" />
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800">
            <ScoreGauge score={report.scores.onPage} size="md" label="On-Page SEO" />
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800">
            <ScoreGauge score={report.scores.technical} size="md" label="Technical SEO" />
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800">
            <ScoreGauge score={report.scores.content} size="md" label="Content Quality" />
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800">
            <ScoreGauge score={report.scores.offPage ?? 0} size="md" label="Off-Page &amp; Trust" />
          </div>
        </div>

        {/* Severity counters strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <button
            onClick={() => { setFilterSeverity('critical'); setActiveTab('issues'); }}
            className={`p-3 rounded-2xl border text-left transition-all ${
              filterSeverity === 'critical'
                ? 'ring-2 ring-red-500 bg-red-50/70 dark:bg-red-950/40 border-red-300 dark:border-red-800'
                : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-800 hover:border-red-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Critical</span>
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {report.counts.critical}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300">Urgent indexing blockers</div>
          </button>

          <button
            onClick={() => { setFilterSeverity('high'); setActiveTab('issues'); }}
            className={`p-3 rounded-2xl border text-left transition-all ${
              filterSeverity === 'high'
                ? 'ring-2 ring-orange-500 bg-orange-50/70 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800'
                : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-800 hover:border-orange-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">High</span>
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {report.counts.high}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300">Important ranking factors</div>
          </button>

          <button
            onClick={() => { setFilterSeverity('medium'); setActiveTab('issues'); }}
            className={`p-3 rounded-2xl border text-left transition-all ${
              filterSeverity === 'medium'
                ? 'ring-2 ring-amber-500 bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-800 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Medium / Low</span>
              <Info className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {report.counts.medium + (report.counts.low || 0) + (report.counts.warnings || 0)}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300">Optimization opportunities</div>
          </button>

          <button
            onClick={() => { setFilterSeverity('passed'); setActiveTab('issues'); }}
            className={`p-3 rounded-2xl border text-left transition-all ${
              filterSeverity === 'passed'
                ? 'ring-2 ring-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Passed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {report.counts.passed}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300">Audits fully satisfied</div>
          </button>
        </div>

        {/* Quick Launch Specialized Tools Strip */}
        <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-500" />
              <span>Launch Specialized SEO Tools for this Website</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigateTo('on-page', report.url)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              <span>On-Page SEO Checker</span>
            </button>
            <button
              onClick={() => navigateTo('technical', report.url)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              <span>Technical SEO Analyzer</span>
            </button>
            <button
              onClick={() => navigateTo('pagespeed', report.url)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>PageSpeed Analyzer</span>
            </button>
            <button
              onClick={() => navigateTo('broken-links', report.url)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Link className="w-3.5 h-3.5 text-red-500" />
              <span>Broken Link Checker</span>
            </button>
            <button
              onClick={() => navigateTo('serp-preview', report.url)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-purple-500" />
              <span>SERP Google Preview</span>
            </button>
            <button
              onClick={() => navigateTo('sitemap-generator', report.url)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              <span>Extract to XML Sitemap</span>
            </button>
            <button
              onClick={() => navigateTo('robots-generator', report.url)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Wrench className="w-3.5 h-3.5 text-cyan-500" />
              <span>Test in Robots.txt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200/90 dark:border-slate-800/90 pb-2">
        <button
          onClick={() => setActiveTab('issues')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'issues'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Detailed Issues ({report.issues.length})
        </button>

        {report.crawledPages && report.crawledPages.length > 0 && (
          <button
            onClick={() => setActiveTab('crawled-pages')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'crawled-pages'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Crawled Pages ({report.crawledPages.length})
          </button>
        )}

        <button
          onClick={() => setActiveTab('off-page')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'off-page'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Off-Page &amp; Trust
        </button>

        <button
          onClick={() => setActiveTab('headings')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'headings'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Headings (H1–H6)
        </button>

        <button
          onClick={() => setActiveTab('images')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'images'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Images ({report.images.total})
        </button>

        <button
          onClick={() => setActiveTab('links')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'links'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Links ({report.links.internalCount + report.links.externalCount})
        </button>

        <button
          onClick={() => setActiveTab('schema')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'schema'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Schema ({report.schemas.length})
        </button>
      </div>

      {/* TAB 1: Issues View */}
      {activeTab === 'issues' && (
        <AuditResultsTable
          issues={report.issues}
          initialSeverityFilter={filterSeverity}
          initialCategoryFilter={filterCategory}
        />
      )}

      {/* TAB 2: Crawled Site Pages Table */}
      {activeTab === 'crawled-pages' && report.crawledPages && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Crawled Pages Architecture ({report.crawledPages.length} Pages Inspected)
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Multi-page crawler inspection comparing internal URL metadata, duplicate titles, and HTTP status codes.
            </p>
          </div>

          {/* Mobile Card Stack View (< sm) */}
          <div className="block sm:hidden space-y-3">
            {report.crawledPages.map((p, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${p.status === 200 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-800'}`}>
                    HTTP {p.status || 'Err'}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>{p.wordCount} words</span>
                    <span>•</span>
                    <span className="font-mono">{p.responseTimeMs} ms</span>
                  </div>
                </div>

                <div className="font-mono text-slate-900 dark:text-white font-semibold break-all text-xs">
                  {p.url}
                </div>

                <div className="text-slate-700 dark:text-slate-300 font-medium">
                  {p.title || '[Missing Title]'}
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {p.isDuplicateTitle && (
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 text-[10px] font-bold">
                      Duplicate Title
                    </span>
                  )}
                  {p.isDuplicateMetaDesc && (
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold">
                      Duplicate Meta Desc
                    </span>
                  )}
                  {!p.isDuplicateTitle && !p.isDuplicateMetaDesc && (
                    <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">Unique Metadata</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= sm) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">Page URL</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Page Title</th>
                  <th className="p-3">Word Count</th>
                  <th className="p-3">TTFB</th>
                  <th className="p-3 rounded-r-xl">Flags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {report.crawledPages.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-mono text-slate-900 dark:text-white max-w-xs truncate">
                      {p.url}
                    </td>
                    <td className="p-3 font-bold">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${p.status === 200 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-800'}`}>
                        {p.status || 'Err'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-800 dark:text-slate-200 max-w-sm truncate">
                      {p.title || '[Missing Title]'}
                    </td>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                      {p.wordCount} words
                    </td>
                    <td className="p-3 font-mono text-slate-500">
                      {p.responseTimeMs} ms
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {p.isDuplicateTitle && (
                          <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 text-[10px] font-bold">
                            Duplicate Title
                          </span>
                        )}
                        {p.isDuplicateMetaDesc && (
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold">
                            Duplicate Meta Desc
                          </span>
                        )}
                        {!p.isDuplicateTitle && !p.isDuplicateMetaDesc && (
                          <span className="text-slate-400 text-[10px]">Unique</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Off-Page & Social Signals */}
      {activeTab === 'off-page' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Off-Page SEO &amp; Brand Authority Signals
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Social profile connectivity, outbound link profile ratios, and domain trust infrastructure.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
            <span className="font-bold block mb-0.5">3P Backlink Coverage Status:</span>
            {report.offPage.apiStatusNote}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Social Profiles Discovered
              </span>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {report.offPage.socialLinks.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">Connected official brand pages</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                Dofollow Outbound
              </span>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {report.offPage.dofollowCount}
              </div>
              <p className="text-xs text-slate-500 mt-1">Passing authority out</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
                Nofollow Outbound
              </span>
              <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
                {report.offPage.nofollowCount}
              </div>
              <p className="text-xs text-slate-500 mt-1">Attribute rel=&quot;nofollow&quot;</p>
            </div>
          </div>

          {/* Social Profiles Grid */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Linked Social Channels ({report.offPage.socialLinks.length})
            </h3>
            {report.offPage.socialLinks.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                No official social media channels detected on the homepage DOM. Adding social links improves Google E-E-A-T score.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.offPage.socialLinks.map((s, idx) => (
                  <a
                    key={idx}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs hover:border-blue-500 transition-all bg-white dark:bg-slate-900"
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
        </div>
      )}

      {/* TAB 4: Headings Hierarchy */}
      {activeTab === 'headings' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Heading Tag Architecture (H1–H6)
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Search engines use heading hierarchy to construct an outline of your content topic.
            </p>
          </div>

          <div className="space-y-4">
            {/* H1 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  H1 Headings ({report.headings.h1.length})
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Recommended: Exactly 1</span>
              </div>
              {report.headings.h1.length === 0 ? (
                <div className="text-sm text-red-500 font-medium">No H1 heading found on page.</div>
              ) : (
                <ul className="space-y-1.5">
                  {report.headings.h1.map((h, i) => (
                    <li key={i} className="text-base font-bold text-slate-900 dark:text-white font-mono bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* H2 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  H2 Subheadings ({report.headings.h2.length})
                </span>
              </div>
              {report.headings.h2.length === 0 ? (
                <div className="text-sm text-slate-400">No H2 headings detected.</div>
              ) : (
                <ul className="space-y-1.5 max-h-60 overflow-y-auto">
                  {report.headings.h2.map((h, i) => (
                    <li key={i} className="text-sm font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* H3 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-2">
                H3 Headings ({report.headings.h3.length})
              </span>
              {report.headings.h3.length === 0 ? (
                <div className="text-sm text-slate-400">No H3 headings detected.</div>
              ) : (
                <ul className="space-y-1 max-h-48 overflow-y-auto">
                  {report.headings.h3.map((h, i) => (
                    <li key={i} className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Images & Alt Tags */}
      {activeTab === 'images' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Image Alt Text &amp; Optimization Audit
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Alt attributes enable Google Image indexing and screen-reader accessibility.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                {report.images.withAlt} with Alt
              </div>
              <div className="text-xs px-3 py-1.5 rounded-xl bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-bold">
                {report.images.missingAlt} Missing Alt
              </div>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {report.images.sample.map((img, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl border flex items-center justify-between gap-4 text-xs ${
                  img.hasAlt
                    ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    : 'border-red-200 dark:border-red-950/80 bg-red-50/40 dark:bg-red-950/20'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-slate-700 dark:text-slate-300 truncate">
                    {img.src}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-semibold text-slate-500">Alt:</span>
                    <span className={img.hasAlt ? 'text-slate-900 dark:text-white font-medium' : 'text-red-500 font-bold'}>
                      {img.hasAlt ? img.alt : '[MISSING ALT ATTRIBUTE]'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {img.loading && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      loading={img.loading}
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold ${
                      img.hasAlt
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    }`}
                  >
                    {img.hasAlt ? 'Pass' : 'Missing'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: Links Profile */}
      {activeTab === 'links' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                Internal Links
              </span>
              <div className="text-3xl font-extrabold text-blue-900 dark:text-blue-100 mt-1">
                {report.links.internalCount}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Distributes PageRank internally</p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                External Outbound
              </span>
              <div className="text-3xl font-extrabold text-indigo-900 dark:text-indigo-100 mt-1">
                {report.links.externalCount}
              </div>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">Links pointing to other domains</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Nofollow Outbound
              </span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                {report.links.nofollowCount}
              </div>
              <p className="text-xs text-slate-500 mt-1">rel=&quot;nofollow&quot; tags present</p>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {report.links.sample.map((lnk, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 text-xs bg-white dark:bg-slate-900"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-900 dark:text-white truncate">
                    &quot;{lnk.text}&quot;
                  </div>
                  <div className="text-slate-500 font-mono truncate mt-0.5">{lnk.href}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded font-bold ${
                      lnk.isInternal
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                    }`}
                  >
                    {lnk.isInternal ? 'Internal' : 'External'}
                  </span>
                  {lnk.isNofollow && (
                    <span className="px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      Nofollow
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: Schema Markup */}
      {activeTab === 'schema' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              JSON-LD Structured Data ({report.schemas.length} entities found)
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Structured data helps Google understand business, articles, FAQs, and product rich cards.
            </p>
          </div>

          {report.schemas.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <Code className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No JSON-LD schemas detected on this page.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Use our free <strong>Schema Markup Generator</strong> tool to create Article, LocalBusiness, or FAQ JSON-LD tags.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {report.schemas.map((schema, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Schema Entity: {schema['@type'] || 'Structured Data'}</span>
                    <button
                      onClick={() => handleCopy(JSON.stringify(schema, null, 2), `schema-${i}`)}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold"
                    >
                      {copiedId === `schema-${i}` ? 'Copied' : 'Copy JSON'}
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-72">
                    <code>{JSON.stringify(schema, null, 2)}</code>
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
