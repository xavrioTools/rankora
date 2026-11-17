import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { ScoreGauge } from '../components/ScoreGauge';
import {
  FileText,
  Search,
  Loader2,
  BookOpen,
  Sparkles,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Type,
  Copy,
  Check,
  RotateCcw,
  Clipboard,
  Flame,
  Target,
  Users,
  Lightbulb,
  FileCode2,
  Layers,
  ArrowRight,
  Info,
  Sliders,
  Shield,
  Columns,
} from 'lucide-react';

export function ContentSeoPage() {
  const { sharedUrl } = useNavigation();

  // Inputs
  const [content, setContent] = useState(
    `Search engine optimization (SEO) is the process of improving the quality and quantity of website traffic to a website or a web page from search engines. SEO targets unpaid traffic rather than direct traffic or paid traffic. Unpaid traffic may originate from different kinds of searches, including image search, video search, academic search, news search, and industry-specific vertical search engines.

As an internet marketing strategy, SEO considers how search engines work, the computer-programmed algorithms that dictate search engine behavior, what people search for, the actual search terms or keywords typed into search engines, and which search engines are preferred by their targeted audience. SEO is performed because a website will receive more visitors from a search engine when websites rank higher on the search engine results page (SERP). These visitors can then potentially be converted into customers.`
  );
  const [primaryKeyword, setPrimaryKeyword] = useState('search engine optimization');
  const [secondaryKeywords, setSecondaryKeywords] = useState('seo audit, organic traffic, serp ranking');
  const [targetAudience, setTargetAudience] = useState('General Web Readers');
  const [searchIntent, setSearchIntent] = useState<'Informational' | 'Commercial' | 'Transactional' | 'Navigational'>('Informational');

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'stuffing' | 'keywords' | 'readability' | 'ai-optimize' | 'compare'>('overview');
  const [report, setReport] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Input counters
  const cleanText = content.trim();
  const wordCount = cleanText ? (cleanText.match(/\b[a-z0-9'-]{2,}\b/gi) || []).length : 0;
  const charCount = content.length;

  const handleClear = () => {
    setContent('');
    setReport(null);
    setError(null);
  };

  const handlePaste = async () => {
    setError(null);
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setContent(text);
      }
    } catch {
      setError('Clipboard permission denied. Please paste manually into the text area.');
    }
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai-content-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          primaryKeyword,
          secondaryKeywords,
          targetAudience,
          searchIntent,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Content analysis failed');
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Content analysis error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (textToCopy: string, fieldId: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Render text with highlighted overused words for the stuffing tab
  const renderHighlightedContent = () => {
    if (!report || !report.keywordStuffingReport) return content;
    const overused: string[] = report.keywordStuffingReport.overusedKeywordsToHighlight || [];
    if (overused.length === 0) return <p className="whitespace-pre-wrap">{content}</p>;

    // Escape regex
    const pattern = new RegExp(`\\b(${overused.map((w) => w.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})\\b`, 'gi');
    const parts = content.split(pattern);

    return (
      <div className="whitespace-pre-wrap leading-relaxed text-sm">
        {parts.map((part, i) => {
          const isMatch = overused.some((w) => w.toLowerCase() === part.toLowerCase());
          if (isMatch) {
            return (
              <mark
                key={i}
                className="bg-amber-200 dark:bg-amber-900/80 text-amber-950 dark:text-amber-100 font-bold px-1 rounded border border-amber-300 dark:border-amber-700"
                title={`Potentially overused keyword phrase: "${part}"`}
              >
                {part}
              </mark>
            );
          }
          return part;
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111625] rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-xs transition-colors">
        <div className="max-w-3xl space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>AI Content &amp; Readability Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Advanced AI Content SEO Analyzer
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Paste your article, blog draft, or landing page text. Evaluate 9 transparent content scoring categories, detect keyword stuffing patterns, inspect readability metrics, and generate AI-optimized copy with side-by-side comparison.
          </p>
        </div>

        {/* 1. CONTENT INPUT SECTION */}
        <form onSubmit={handleAnalyze} className="mt-6 space-y-4">
          {/* Main Content Textarea */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Content Editor &amp; Draft Area</span>
              </label>

              {/* Counters & Action Buttons */}
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold font-mono tabular-nums">
                  {wordCount} Words
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold font-mono tabular-nums">
                  {charCount} Chars
                </span>
                <button
                  type="button"
                  onClick={handlePaste}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1 transition-colors"
                >
                  <Clipboard className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Paste</span>
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/50 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 font-semibold flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste article, blog post, or sales copy here to evaluate SEO readability..."
              className="w-full p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm font-sans outline-none focus:ring-2 focus:ring-indigo-500 transition-all leading-relaxed"
            />
          </div>

          {/* Optional Keyword & Intent Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-indigo-500" />
                <span>Primary Keyword</span>
              </label>
              <input
                type="text"
                value={primaryKeyword}
                onChange={(e) => setPrimaryKeyword(e.target.value)}
                placeholder="e.g. search engine optimization"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-violet-500" />
                <span>Secondary Keywords</span>
              </label>
              <input
                type="text"
                value={secondaryKeywords}
                onChange={(e) => setSecondaryKeywords(e.target.value)}
                placeholder="e.g. organic traffic, serp ranking"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-purple-500" />
                <span>Target Audience</span>
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. General Web Readers"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                <span>Search Intent</span>
              </label>
              <select
                value={searchIntent}
                onChange={(e) => setSearchIntent(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                <option value="Informational">Informational (Guides, How-Tos)</option>
                <option value="Commercial">Commercial (Reviews, Vs, Best)</option>
                <option value="Transactional">Transactional (Buy, Pricing)</option>
                <option value="Navigational">Navigational (Brand Login, Portal)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-xs active:scale-98 disabled:opacity-60 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? 'Analyzing Content & Metrics...' : 'Analyze Content SEO'}</span>
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* RESULTS DISPLAY DASHBOARD */}
      {report && (
        <div className="space-y-6">
          {/* Header Status & Navigation Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 sm:p-4 rounded-xl bg-white dark:bg-[#111625] border border-slate-200/90 dark:border-slate-800/90 shadow-xs">
            {/* Status Engine Label */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{report.isAiPowered ? 'AI Semantic Engine (Gemini 4 Hydrogen)' : 'Deterministic NLP Metrics Only'}</span>
              </span>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-1 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'overview'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Overview (9 Checks)
              </button>
              <button
                onClick={() => setActiveTab('stuffing')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'stuffing'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Keyword Stuffing
              </button>
              <button
                onClick={() => setActiveTab('keywords')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'keywords'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Suggestions
              </button>
              <button
                onClick={() => setActiveTab('readability')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'readability'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Readability
              </button>
              <button
                onClick={() => setActiveTab('ai-optimize')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'ai-optimize'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                AI Copy
              </button>
              <button
                onClick={() => setActiveTab('compare')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'compare'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Side-by-Side Comparison
              </button>
            </div>
          </div>

          {/* TAB 1: OVERVIEW & 9-CATEGORY SCORE BREAKDOWN */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Score Gauge & Disclaimer Header */}
              <div className="bg-white dark:bg-[#111625] rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
                  <ScoreGauge score={report.overallScore} size="lg" label="Content SEO Score" />
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Transparent Content Evaluation
                    </h2>
                    <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                      Evaluated across keyword placement, content depth, readability grade, semantic coverage, and intent alignment.
                    </p>
                    <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-[11px] text-blue-900 dark:text-blue-300 flex items-start gap-2">
                      <Info className="w-4 h-4 shrink-0 text-blue-500 mt-0.5" />
                      <span>
                        <strong>Disclaimer:</strong> This score is calculated using industry-standard SEO algorithms &amp; semantic models. It is not an official Google ranking score.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Measured Category Score Breakdown Grid */}
              <div className="bg-white dark:bg-[#111625] rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Category Breakdown &amp; Measured Explanations
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(report.scoreBreakdown || {}).map(([key, catVal]: [string, any], index: number) => {
                    const labelMap: Record<string, string> = {
                      keywordOptimization: 'Keyword Optimization',
                      contentDepth: 'Content Depth',
                      contentRelevance: 'Content Relevance & Depth',
                      headingStructure: 'Heading Structure',
                      readability: 'Readability & Flow',
                      paragraphStructure: 'Paragraph Structure',
                      vocabularyVariety: 'Vocabulary Variety',
                      semanticCoverage: 'Semantic Coverage',
                      searchIntentAlignment: 'Search Intent Alignment',
                      contentCompleteness: 'Content Completeness',
                    };
                    const score = Number(catVal?.score ?? 0);
                    return (
                      <div
                        key={key}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {index + 1}. {labelMap[key] || key}
                          </span>
                          <span
                            className={`font-black font-mono text-sm ${
                              score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-600'
                            }`}
                          >
                            {score}/100
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed pt-1">
                          {catVal?.explanation || ''}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KEYWORD STUFFING & TEXT HIGHLIGHTER */}
          {activeTab === 'stuffing' && (
            <div className="bg-white dark:bg-[#111625] rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <span>Keyword Density &amp; Overuse Detector</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluates keyword frequency in context without forcing rigid universal limits. Highlights overused words directly in your text below.
                </p>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Primary Keyword Density
                  </span>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">
                    {report.keywordStuffingReport?.primaryKeywordDensity || 0}%
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Occurs {report.keywordStuffingReport?.primaryOccurrences || 0} times
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Stuffed / Overused Phrases
                  </span>
                  <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
                    {report.keywordStuffingReport?.stuffedPhrases?.length || 0}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Phrases exceeding natural density</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Keyword Placement Assessment
                  </span>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {report.keywordStuffingReport?.unnaturalPlacementNotes?.[0] || 'Natural keyword flow'}
                  </div>
                </div>
              </div>

              {/* Interactive Text Highlighter */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Interactive Content Keyword Highlighter
                  </span>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    Amber highlights indicate potentially overused terms
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 max-h-96 overflow-y-auto">
                  {renderHighlightedContent()}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ALTERNATIVE KEYWORD SUGGESTIONS */}
          {activeTab === 'keywords' && (
            <div className="bg-white dark:bg-[#111625] rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Semantic &amp; Topic Keyword Suggestions
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Related topical concepts generated via Gemini when configured. Search volume requires an external Ads keyword API.
                </p>
              </div>

              {(report.keywordSuggestions || []).length === 0 ? (
                <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{report.aiStatusNote || 'Real data is currently unavailable. Please try again later or configure the required data source.'}</span>
                  </div>
                  {report.aiErrorDetail && <p className="font-mono text-[11px]">{report.aiErrorDetail}</p>}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {report.keywordSuggestions.map((k: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{k.keyword}</div>
                        <div className="text-[10px] text-slate-500 capitalize mt-0.5">Type: {k.type}</div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-700">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          AI Semantic Suggestion
                        </span>
                        <span className="text-[10px] text-slate-400 italic">Vol: N/A</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: READABILITY & GRAMMAR ANALYSIS */}
          {activeTab === 'readability' && (
            <div className="bg-white dark:bg-[#111625] rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Readability &amp; Style Diagnostics
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluates sentence structure, Flesch reading ease score, passive voice occurrences, and difficult vocabulary.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    {report.readabilityMetrics?.fleschScore || 70}
                  </div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">Flesch Ease</div>
                  <div className="text-[10px] text-slate-500">{report.readabilityMetrics?.gradeLevel}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    {report.readabilityMetrics?.avgSentenceLength || 15}
                  </div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">Avg Sentence</div>
                  <div className="text-[10px] text-slate-500">Words per sentence</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    {report.readabilityMetrics?.avgParagraphLength || 60}
                  </div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">Avg Paragraph</div>
                  <div className="text-[10px] text-slate-500">Words per block</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
                    {report.readabilityMetrics?.passiveVoiceCount || 0}
                  </div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">Passive Voice</div>
                  <div className="text-[10px] text-slate-500">Sentence instances</div>
                </div>
              </div>

              {/* Diagnostic Notes */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Grammar &amp; Style Polish Recommendations
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {(report.readabilityMetrics?.spellingGrammarNotes || []).map((note: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 5: AI COPY RECOMMENDATIONS & OPTIMIZATIONS */}
          {activeTab === 'ai-optimize' && (
            <div className="space-y-6">
              {!report.aiOptimizations ? (
                <div className="bg-white dark:bg-[#111625] rounded-2xl p-6 sm:p-8 border border-amber-200 dark:border-amber-900/50 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{report.aiStatusNote || 'Real data is currently unavailable. Please try again later or configure the required data source.'}</span>
                  </div>
                  {report.aiErrorDetail && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{report.aiErrorDetail}</p>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* SEO Title & Meta Description */}
                    <div className="bg-white dark:bg-[#111625] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-4">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <span>Suggested SEO Title Tag</span>
                      </h3>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-900 dark:text-white">{report.aiOptimizations.suggestedSeoTitle}</span>
                        <button
                          onClick={() => handleCopyText(report.aiOptimizations.suggestedSeoTitle, 'seo-title')}
                          className="text-blue-600 hover:text-blue-700 font-semibold shrink-0 cursor-pointer"
                        >
                          {copiedField === 'seo-title' ? 'Copied' : 'Copy'}
                        </button>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pt-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span>Suggested Meta Description</span>
                      </h3>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{report.aiOptimizations.suggestedMetaDescription}</p>
                        <button
                          onClick={() => handleCopyText(report.aiOptimizations.suggestedMetaDescription, 'seo-meta')}
                          className="text-blue-600 hover:text-blue-700 font-semibold shrink-0 ml-2 cursor-pointer"
                        >
                          {copiedField === 'seo-meta' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    {/* Heading Outline */}
                    <div className="bg-white dark:bg-[#111625] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-4">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Suggested H1 &amp; Subheadings Outline
                      </h3>
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 font-bold text-blue-900 dark:text-blue-200">
                          H1: {report.aiOptimizations.suggestedH1}
                        </div>
                        {(report.aiOptimizations.suggestedH2s || []).map((h2: string, i: number) => (
                          <div key={i} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200">
                            H2: {h2}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* FAQ Section Suggestions */}
                  {report.aiOptimizations.faqSection?.length > 0 && (
                    <div className="bg-white dark:bg-[#111625] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-4">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Suggested FAQ Section (Search Intent Rich Cards)
                      </h3>
                      <div className="space-y-3">
                        {report.aiOptimizations.faqSection.map((faq: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                            <div className="font-bold text-slate-900 dark:text-white text-sm">Q: {faq.question}</div>
                            <div className="text-slate-600 dark:text-slate-300 leading-relaxed">A: {faq.answer}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 6: SIDE-BY-SIDE CONTENT COMPARISON */}
          {activeTab === 'compare' && (
            <div className="bg-white dark:bg-[#111625] rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-6">
              {!report.aiOptimizations?.fullOptimizedText ? (
                <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{report.aiStatusNote || 'Real data is currently unavailable. Please try again later or configure the required data source.'}</span>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Columns className="w-5 h-5 text-blue-600" />
                        <span>Side-by-Side Content Comparison</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Compare your original draft with the Gemini AI-optimized version.
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopyText(report.aiOptimizations.fullOptimizedText, 'optimized-full')}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all self-start sm:self-auto cursor-pointer"
                    >
                      {copiedField === 'optimized-full' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedField === 'optimized-full' ? 'Copied Optimized Copy!' : 'Copy Optimized Copy'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Original Content */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                        <span>Original Draft ({wordCount} words)</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-sans text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-[500px] overflow-y-auto leading-relaxed">
                        {content}
                      </div>
                    </div>

                    {/* AI Optimized Copy */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                        <span>AI Optimized Version</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 font-sans text-xs text-slate-900 dark:text-slate-100 whitespace-pre-wrap max-h-[500px] overflow-y-auto leading-relaxed">
                        {report.aiOptimizations.fullOptimizedText}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
