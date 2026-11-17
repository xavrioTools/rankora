import React, { useState, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { ScoreGauge } from '../components/ScoreGauge';
import {
  Zap,
  Search,
  Loader2,
  Clock,
  Smartphone,
  Monitor,
  Layers,
  HardDrive,
  AlertTriangle,
  Info,
  TrendingUp,
  Users,
  Cpu,
  CheckCircle2,
  Wrench,
} from 'lucide-react';

interface LabMetricItem {
  id: string;
  title: string;
  displayValue: string | null;
  numericValue: number | null;
  score: number | null;
}

interface CruxMetricItem {
  percentile: number;
  displayValue: string;
  category: 'FAST' | 'AVERAGE' | 'SLOW' | 'NONE' | null;
}

interface PageSpeedResponse {
  url: string;
  requestedUrl?: string;
  strategy: 'mobile' | 'desktop';
  source: string;
  lighthouseVersion?: string | null;
  apiKeyConfigured?: boolean;
  analysisTimestamp: string | null;
  retrievedAt: string;
  directMetrics: {
    finalUrl: string;
    httpStatus: number;
    ttfbMs: number;
    htmlSizeKb: number;
    compression: string;
  } | null;
  psiAvailable: boolean;
  psiErrorCode?: 'RATE_LIMITED' | 'TIMEOUT' | 'NETWORK_ERROR' | 'UPSTREAM_ERROR';
  psiError?: string;
  psiErrorDetail?: string;
  scores: {
    performance: number | null;
    accessibility: number | null;
    bestPractices: number | null;
    seo: number | null;
  } | null;
  labMetrics: {
    lcp: LabMetricItem | null;
    fcp: LabMetricItem | null;
    cls: LabMetricItem | null;
    tbt: LabMetricItem | null;
    speedIndex: LabMetricItem | null;
    tti: LabMetricItem | null;
    serverResponseTime: LabMetricItem | null;
  } | null;
  fieldData: {
    available: boolean;
    scope: 'page' | 'origin';
    overallCategory: 'FAST' | 'AVERAGE' | 'SLOW' | 'NONE' | null;
    lcp: CruxMetricItem | null;
    inp: CruxMetricItem | null;
    cls: CruxMetricItem | null;
    fcp: CruxMetricItem | null;
    ttfb: CruxMetricItem | null;
  } | null;
  opportunities?: Array<{
    id: string;
    title: string;
    description: string;
    displayValue: string | null;
    savingsMs: number;
    savingsBytes: number;
    score: number | null;
  }>;
  diagnostics?: Array<{
    id: string;
    category: string;
    title: string;
    description: string;
    displayValue: string | null;
    score: number | null;
  }>;
  passedAuditsCount?: number;
}

function getCruxBadgeStyle(category: CruxMetricItem['category']) {
  if (category === 'FAST') {
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
  }
  if (category === 'AVERAGE') {
    return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
  }
  if (category === 'SLOW') {
    return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
  }
  return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
}

function getLabMetricTone(score: number | null) {
  if (score === null) return 'text-slate-900 dark:text-white';
  if (score >= 0.9) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 0.5) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

export function PageSpeedPage() {
  const { sharedUrl, setSharedUrl } = useNavigation();
  const [urlInput, setUrlInput] = useState(sharedUrl && sharedUrl !== 'https://' ? sharedUrl : '');
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');
  const [psiData, setPsiData] = useState<PageSpeedResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (overrideUrl?: string, strategyOverride?: 'mobile' | 'desktop') => {
    const raw = (overrideUrl || urlInput).trim();
    if (!raw) return;

    const strategy = strategyOverride || deviceMode;
    let fullUrl = raw;
    if (!/^https?:\/\//i.test(fullUrl)) fullUrl = 'https://' + fullUrl;

    setSharedUrl(fullUrl);
    setUrlInput(fullUrl);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/pagespeed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fullUrl, strategy }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to measure PageSpeed Insights');
      setPsiData(data as PageSpeedResponse);
    } catch (err: any) {
      setError(err.message || 'Error running Google PageSpeed Insights v5 audit');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sharedUrl && sharedUrl !== 'https://' && !psiData && !loading) {
      handleAnalyze(sharedUrl, deviceMode);
    }
  }, []);

  const switchStrategy = (mode: 'mobile' | 'desktop') => {
    setDeviceMode(mode);
    if (urlInput.trim() && psiData) {
      handleAnalyze(urlInput, mode);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-[#111625] rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-xs transition-colors">
        <div className="max-w-3xl space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>Official Google PageSpeed Insights API v5</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            PageSpeed &amp; Core Web Vitals Analyzer
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Run live Mobile &amp; Desktop audits using Google PageSpeed Insights v5 (<code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">pagespeedonline.googleapis.com</code>) to inspect Lighthouse Performance, Accessibility, Best Practices, and SEO scores, separate real-user CrUX field metrics from simulated Lighthouse lab metrics, and review real optimization opportunities.
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
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !urlInput.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-xs active:scale-98 disabled:opacity-60 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{loading ? `Auditing (${deviceMode})...` : 'Analyze PageSpeed'}</span>
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>

      {psiData && (
        <div className="space-y-6">
          {/* Top Target Info, Source, Timestamp & Strategy Switcher */}
          <div className="bg-white dark:bg-[#111625] rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 space-y-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {psiData.strategy === 'mobile' ? 'Mobile' : 'Desktop'} PageSpeed Audit Summary
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 break-all">
                  Inspected URL: <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{psiData.url}</span>
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {psiData.directMetrics && (
                    <>
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold font-mono tabular-nums">
                        Direct Server TTFB: {psiData.directMetrics.ttfbMs} ms
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold font-mono tabular-nums">
                        HTML Size: {psiData.directMetrics.htmlSizeKb} KB
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold font-mono">
                        Compression: {psiData.directMetrics.compression}
                      </span>
                    </>
                  )}
                  {typeof psiData.passedAuditsCount === 'number' && psiData.psiAvailable && (
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold font-mono">
                      {psiData.passedAuditsCount} Passed Audits
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      Source: <strong className="text-slate-700 dark:text-slate-300">{psiData.source}</strong>
                      {psiData.lighthouseVersion ? ` · Lighthouse v${psiData.lighthouseVersion}` : ''}
                    </span>
                  </span>
                  <span>
                    Analysis Timestamp:{' '}
                    <strong className="font-mono text-slate-700 dark:text-slate-300">
                      {new Date(psiData.analysisTimestamp || psiData.retrievedAt).toLocaleString()}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Mobile / Desktop Strategy Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl shrink-0 self-start md:self-center">
                <button
                  type="button"
                  onClick={() => switchStrategy('mobile')}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    deviceMode === 'mobile'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Mobile</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchStrategy('desktop')}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    deviceMode === 'desktop'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  <span>Desktop</span>
                </button>
              </div>
            </div>

            {/* 4 Lighthouse Category Scores */}
            {psiData.psiAvailable && psiData.scores ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Performance', value: psiData.scores.performance },
                  { label: 'Accessibility', value: psiData.scores.accessibility },
                  { label: 'Best Practices', value: psiData.scores.bestPractices },
                  { label: 'SEO', value: psiData.scores.seo },
                ].map((cat) => (
                  <div
                    key={cat.label}
                    className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center gap-2"
                  >
                    {cat.value !== null ? (
                      <ScoreGauge score={cat.value} size="md" label={cat.label} />
                    ) : (
                      <div className="text-center py-4 space-y-1">
                        <div className="text-sm font-bold text-slate-500">N/A</div>
                        <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">{cat.label}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Honest PSI Unavailable / Error Banner */}
          {!psiData.psiAvailable || !psiData.labMetrics ? (
            <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{psiData.psiError || 'Real data is currently unavailable. Please try again later or configure the required data source.'}</span>
              </div>
              {psiData.psiErrorDetail && (
                <p className="text-xs text-amber-700 dark:text-amber-400 font-mono break-words">
                  {psiData.psiErrorDetail}
                </p>
              )}
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Direct live server TTFB and HTML payload size shown above were measured from the origin server. Lighthouse category scores, lab Core Web Vitals, and CrUX field data require an active Google PageSpeed Insights v5 API response.
              </p>
            </div>
          ) : (
            <>
              {/* SECTION 1: Real-User Field Data (Chrome UX Report - CrUX) */}
              <div className="bg-white dark:bg-[#111625] rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span>Real-User Experience (Chrome UX Report Field Data)</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Real-world 28-day Chrome user telemetry when sufficient field traffic exists
                      {psiData.fieldData?.available && psiData.fieldData.scope === 'origin'
                        ? ' (origin-level aggregate shown because page-level sample was below threshold).'
                        : '.'}
                    </p>
                  </div>

                  {psiData.fieldData?.available && psiData.fieldData.overallCategory && (
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold self-start sm:self-center ${getCruxBadgeStyle(
                        psiData.fieldData.overallCategory
                      )}`}
                    >
                      Overall CWV: {psiData.fieldData.overallCategory}
                    </span>
                  )}
                </div>

                {!psiData.fieldData?.available ? (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                    Real-user CrUX field data is unavailable for this URL (the Chrome User Experience Report only publishes field metrics for URLs/origins with sufficient eligible Chrome traffic). Simulated Lighthouse lab measurements are shown separately below.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {[
                      { label: 'Field LCP', metric: psiData.fieldData.lcp },
                      { label: 'Field INP', metric: psiData.fieldData.inp },
                      { label: 'Field CLS', metric: psiData.fieldData.cls },
                      { label: 'Field FCP', metric: psiData.fieldData.fcp },
                      { label: 'Field TTFB', metric: psiData.fieldData.ttfb },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {item.label}
                          </span>
                          {item.metric?.category && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getCruxBadgeStyle(item.metric.category)}`}>
                              {item.metric.category}
                            </span>
                          )}
                        </div>
                        <div className="text-xl font-black font-mono tabular-nums text-slate-900 dark:text-white">
                          {item.metric?.displayValue || 'Unavailable'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 2: Lighthouse Simulated Lab Data (Strictly Separated from Field Data) */}
              <div className="bg-white dark:bg-[#111625] rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <span>Lighthouse Simulated Lab Metrics</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Controlled Lighthouse {psiData.strategy} lab environment measurements (separate from real-user CrUX field telemetry).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    {
                      name: 'Largest Contentful Paint (Lab LCP)',
                      item: psiData.labMetrics.lcp,
                      icon: Clock,
                      note: 'Simulated render time of the largest visible content element.',
                    },
                    {
                      name: 'First Contentful Paint (Lab FCP)',
                      item: psiData.labMetrics.fcp,
                      icon: Zap,
                      note: 'Simulated time until first DOM text or image renders.',
                    },
                    {
                      name: 'Cumulative Layout Shift (Lab CLS)',
                      item: psiData.labMetrics.cls,
                      icon: Layers,
                      note: 'Simulated visual stability during page load.',
                    },
                    {
                      name: 'Speed Index (Lab)',
                      item: psiData.labMetrics.speedIndex,
                      icon: TrendingUp,
                      note: 'How quickly contents of the page are visibly populated.',
                    },
                    {
                      name: 'Total Blocking Time (Lab TBT)',
                      item: psiData.labMetrics.tbt,
                      icon: HardDrive,
                      note: 'Main-thread blocking time between FCP and Time to Interactive.',
                    },
                    {
                      name: 'Time to Interactive (Lab TTI)',
                      item: psiData.labMetrics.tti,
                      icon: Cpu,
                      note: 'Time until the page becomes reliably interactive in lab simulation.',
                    },
                  ].map((card) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={card.name}
                        className="p-5 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
                          <span>{card.name}</span>
                          <Icon className="w-4 h-4 text-indigo-500 shrink-0" />
                        </div>
                        <div
                          className={`text-2xl font-black font-mono tabular-nums ${getLabMetricTone(
                            card.item?.score ?? null
                          )}`}
                        >
                          {card.item?.displayValue || 'Unavailable'}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{card.note}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: Optimization Opportunities */}
              {psiData.opportunities && psiData.opportunities.length > 0 && (
                <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#111625] border border-slate-200/90 dark:border-slate-800/90 space-y-4 shadow-xs">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Info className="w-5 h-5 text-indigo-500" />
                    <span>Optimization Opportunities ({psiData.opportunities.length})</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {psiData.opportunities.map((opp) => (
                      <div
                        key={opp.id}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="font-bold text-slate-900 dark:text-white">{opp.title}</span>
                          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                            {opp.displayValue ||
                              (opp.savingsMs > 0
                                ? `~${opp.savingsMs} ms`
                                : opp.savingsBytes > 0
                                ? `~${Math.round(opp.savingsBytes / 1024)} KiB`
                                : 'Review')}
                          </span>
                        </div>
                        {opp.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            {opp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 4: Lighthouse Diagnostics & Recommendations */}
              {psiData.diagnostics && psiData.diagnostics.length > 0 && (
                <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#111625] border border-slate-200/90 dark:border-slate-800/90 space-y-4 shadow-xs">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-amber-500" />
                    <span>Diagnostics &amp; Recommendations ({psiData.diagnostics.length})</span>
                  </h2>
                  <div className="space-y-2.5 text-xs">
                    {psiData.diagnostics.map((diag) => (
                      <div
                        key={diag.id}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase">
                              {diag.category}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">{diag.title}</span>
                          </div>
                          {diag.displayValue && (
                            <span className="font-mono text-amber-700 dark:text-amber-300 font-semibold">
                              {diag.displayValue}
                            </span>
                          )}
                        </div>
                        {diag.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            {diag.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!psiData.opportunities || psiData.opportunities.length === 0) &&
                (!psiData.diagnostics || psiData.diagnostics.length === 0) && (
                  <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>No major Lighthouse optimization opportunities or failing diagnostics flagged for this URL.</span>
                  </div>
                )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
