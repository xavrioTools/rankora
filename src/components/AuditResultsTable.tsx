import React, { useState, useMemo } from 'react';
import { AuditIssue } from '../types/seo';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Search,
  Filter,
  Code,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';

interface AuditResultsTableProps {
  issues: AuditIssue[];
  title?: string;
  subtitle?: string;
  initialSeverityFilter?: string;
  initialCategoryFilter?: string;
}

export function AuditResultsTable({
  issues,
  title = 'Audit Issues & Code-Level Recommendations',
  subtitle = 'Review critical errors, high-priority fixes, and suggested HTML code replacements discovered during crawl.',
  initialSeverityFilter = 'all',
  initialCategoryFilter = 'all',
}: AuditResultsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>(initialSeverityFilter);
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategoryFilter);
  const [sortBy, setSortBy] = useState<'severity' | 'category' | 'title'>('severity');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedCodeIds, setExpandedCodeIds] = useState<Record<string, boolean>>({});

  // Severity metadata definitions
  const severityConfig: Record<
    string,
    {
      label: string;
      bg: string;
      border: string;
      text: string;
      badgeBg: string;
      icon: React.ComponentType<{ className?: string }>;
      weight: number;
    }
  > = {
    critical: {
      label: 'Critical Error',
      bg: 'bg-red-50 dark:bg-red-950/40',
      border: 'border-red-200 dark:border-red-900/80',
      text: 'text-red-700 dark:text-red-400',
      badgeBg: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800',
      icon: AlertCircle,
      weight: 1,
    },
    high: {
      label: 'High Priority',
      bg: 'bg-orange-50 dark:bg-orange-950/40',
      border: 'border-orange-200 dark:border-orange-900/80',
      text: 'text-orange-700 dark:text-orange-400',
      badgeBg: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      icon: AlertTriangle,
      weight: 2,
    },
    medium: {
      label: 'Medium Priority',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-900/80',
      text: 'text-amber-700 dark:text-amber-400',
      badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      icon: Info,
      weight: 3,
    },
    warning: {
      label: 'Warning',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-900/80',
      text: 'text-amber-700 dark:text-amber-400',
      badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      icon: Info,
      weight: 3,
    },
    low: {
      label: 'Low Priority',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-200 dark:border-blue-900/80',
      text: 'text-blue-700 dark:text-blue-400',
      badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      icon: Info,
      weight: 4,
    },
    passed: {
      label: 'Passed Check',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-900/80',
      text: 'text-emerald-700 dark:text-emerald-400',
      badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      icon: CheckCircle2,
      weight: 5,
    },
  };

  // Pre-calculate counts for top toggle strip
  const counts = useMemo(() => {
    const res = { critical: 0, high: 0, medium: 0, low: 0, passed: 0, total: issues.length };
    issues.forEach((issue) => {
      const s = issue.severity;
      if (s === 'critical') res.critical++;
      else if (s === 'high') res.high++;
      else if (s === 'medium' || (s as string) === 'warning') res.medium++;
      else if (s === 'low') res.low++;
      else if (s === 'passed') res.passed++;
    });
    return res;
  }, [issues]);

  // Filter & Sort Logic
  const filteredIssues = useMemo(() => {
    return issues
      .filter((issue) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = issue.title.toLowerCase().includes(q);
          const matchAffected = issue.affected.toLowerCase().includes(q);
          const matchSolution = issue.solution.toLowerCase().includes(q);
          const matchCode = (issue.suggestedFix || '').toLowerCase().includes(q);
          if (!matchTitle && !matchAffected && !matchSolution && !matchCode) return false;
        }

        // Severity filter
        if (severityFilter !== 'all') {
          if (severityFilter === 'medium' && (issue.severity === 'medium' || (issue.severity as any) === 'warning')) {
            // match
          } else if (issue.severity !== severityFilter) {
            return false;
          }
        }

        // Category filter
        if (categoryFilter !== 'all' && issue.category !== categoryFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'severity') {
          const wA = severityConfig[a.severity]?.weight || 99;
          const wB = severityConfig[b.severity]?.weight || 99;
          return wA - wB;
        }
        if (sortBy === 'category') {
          return a.category.localeCompare(b.category);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [issues, searchQuery, severityFilter, categoryFilter, sortBy]);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleCodeExpand = (id: string) => {
    setExpandedCodeIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSeverityFilter('all');
    setCategoryFilter('all');
    setSortBy('severity');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || severityFilter !== 'all' || categoryFilter !== 'all';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Audit Matrix</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">
            Showing <strong className="text-slate-900 dark:text-white">{filteredIssues.length}</strong> of{' '}
            <strong className="text-slate-900 dark:text-white">{issues.length}</strong> Issues
          </span>
        </div>
      </div>

      {/* Severity Counters Toggle Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => setSeverityFilter(severityFilter === 'critical' ? 'all' : 'critical')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            severityFilter === 'critical'
              ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800'
              : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
              Critical
            </span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {counts.critical}
          </div>
          <div className="text-[11px] text-slate-500 truncate">Blocking Crawls</div>
        </button>

        <button
          type="button"
          onClick={() => setSeverityFilter(severityFilter === 'high' ? 'all' : 'high')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            severityFilter === 'high'
              ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-950/60 border-orange-300 dark:border-orange-800'
              : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
              High
            </span>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {counts.high}
          </div>
          <div className="text-[11px] text-slate-500 truncate">Core Ranking Impact</div>
        </button>

        <button
          type="button"
          onClick={() => setSeverityFilter(severityFilter === 'medium' ? 'all' : 'medium')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            severityFilter === 'medium'
              ? 'ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800'
              : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Medium
            </span>
            <Info className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {counts.medium}
          </div>
          <div className="text-[11px] text-slate-500 truncate">Optimizations</div>
        </button>

        <button
          type="button"
          onClick={() => setSeverityFilter(severityFilter === 'low' ? 'all' : 'low')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            severityFilter === 'low'
              ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800'
              : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Low
            </span>
            <Info className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {counts.low}
          </div>
          <div className="text-[11px] text-slate-500 truncate">Minor Tweaks</div>
        </button>

        <button
          type="button"
          onClick={() => setSeverityFilter(severityFilter === 'passed' ? 'all' : 'passed')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            severityFilter === 'passed'
              ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800'
              : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Passed
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {counts.passed}
          </div>
          <div className="text-[11px] text-slate-500 truncate">Valid Checks</div>
        </button>
      </div>

      {/* Search, Filter Toolbar & Controls */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Live Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by issue title, keyword, affected element, or fix..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Severity Dropdown */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Filter className="w-3.5 h-3.5 text-indigo-500" />
            <span>Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only ({counts.critical})</option>
              <option value="high">High Only ({counts.high})</option>
              <option value="medium">Medium Only ({counts.medium})</option>
              <option value="low">Low Only ({counts.low})</option>
              <option value="passed">Passed Only ({counts.passed})</option>
            </select>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-900 dark:text-white outline-none cursor-pointer capitalize"
            >
              <option value="all">All Categories</option>
              <option value="on-page">On-Page SEO</option>
              <option value="technical">Technical SEO</option>
              <option value="content">Content Quality</option>
              <option value="links">Links Profile</option>
              <option value="off-page">Off-Page</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
            >
              <option value="severity">Severity Impact</option>
              <option value="category">Category</option>
              <option value="title">Title A–Z</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Results Table / List */}
      {filteredIssues.length === 0 ? (
        <div className="p-12 text-center bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No issues match your current filters
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try resetting your search query or expanding the severity filter dropdown to view all items.
          </p>
          <button
            onClick={resetAllFilters}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIssues.map((issue) => {
            const config = severityConfig[issue.severity] || severityConfig.medium;
            const Icon = config.icon;
            const isCodeExpanded = Boolean(expandedCodeIds[issue.id]);

            return (
              <div
                key={issue.id}
                className={`rounded-2xl border p-5 sm:p-6 transition-all bg-white dark:bg-slate-900/90 shadow-sm ${config.border}`}
              >
                {/* Issue Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${config.bg} ${config.text}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                          {issue.title}
                        </h3>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${config.badgeBg}`}>
                          {config.label}
                        </span>
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 capitalize">
                          {issue.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-mono mt-1 break-all bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg inline-block border border-slate-100 dark:border-slate-800">
                        Affected: {issue.affected}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Explanation & Solution Split */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                  {/* Why It Matters */}
                  <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                      Why It Matters (Impact)
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {issue.whyItMatters}
                    </p>
                  </div>

                  {/* Step-by-Step Solution */}
                  <div className="bg-blue-50/50 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-100 dark:border-blue-900/40">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 block mb-1">
                      Step-by-Step Recommended Fix
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                      {issue.solution}
                    </p>
                  </div>
                </div>

                {/* Code-Level Suggested Fix */}
                {issue.suggestedFix && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between px-3.5 py-2 bg-slate-800 text-slate-300 text-xs font-mono rounded-t-xl">
                      <div className="flex items-center gap-2">
                        <Code className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-bold text-white">Suggested Code Fix</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleCodeExpand(issue.id)}
                          className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                        >
                          {isCodeExpanded ? (
                            <>
                              <span>Collapse</span>
                              <ChevronUp className="w-3.5 h-3.5" />
                            </>
                          ) : (
                            <>
                              <span>Expand</span>
                              <ChevronDown className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(issue.suggestedFix!, issue.id)}
                          className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 px-2.5 py-1 rounded-md transition-colors text-[11px] font-semibold"
                        >
                          {copiedId === issue.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Fix</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <pre
                      className={`p-4 bg-slate-950 text-emerald-400 text-xs font-mono rounded-b-xl overflow-x-auto border-t border-slate-800 transition-all ${
                        isCodeExpanded ? 'max-h-96' : 'max-h-32'
                      }`}
                    >
                      <code>{issue.suggestedFix}</code>
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
