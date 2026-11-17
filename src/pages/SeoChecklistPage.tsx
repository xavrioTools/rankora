import React, { useState, useEffect } from 'react';
import { useNavigation, PageId } from '../context/NavigationContext';
import {
  CheckSquare,
  Square,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
  RotateCcw,
  Download,
  ExternalLink,
  Zap,
  ShieldCheck,
  Award,
  Code2,
  FileText,
  KeyRound,
  Globe,
  FileCode2,
  Share2,
  Layers,
  Flame,
  Gauge,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

export interface ChecklistItem {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'quick-win';
  toolId?: PageId;
  toolName?: string;
}

export interface ChecklistCategory {
  id: string;
  name: string;
  desc: string;
  icon: any;
  color: string;
}

const CATEGORIES: ChecklistCategory[] = [
  {
    id: 'technical',
    name: 'Technical SEO Foundation',
    desc: 'Crawlability, HTTPS, sitemaps, indexation, and core technical architecture',
    icon: Code2,
    color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-900',
  },
  {
    id: 'on-page',
    name: 'On-Page & Meta Tags',
    desc: 'Titles, meta descriptions, H1-H6 heading hierarchy, and image alt attributes',
    icon: FileText,
    color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900',
  },
  {
    id: 'content',
    name: 'Content & Keyword Strategy',
    desc: 'Keyword placement, semantic coverage, readability, and user intent alignment',
    icon: KeyRound,
    color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-900',
  },
  {
    id: 'schema',
    name: 'Schema & Rich Snippets',
    desc: 'Structured JSON-LD markup, OpenGraph social cards, and Google rich result signals',
    icon: FileCode2,
    color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-900',
  },
  {
    id: 'off-page',
    name: 'Off-Page & Analytics',
    desc: 'Google Search Console, GA4 setup, backlink readiness, and domain authority signals',
    icon: Globe,
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900',
  },
];

const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Technical
  {
    id: 'tech-1',
    categoryId: 'technical',
    title: 'Install SSL Certificate & Enforce HTTPS',
    description: 'Ensure your entire domain redirects to secure https:// and has no mixed content HTTP warnings.',
    priority: 'high',
    toolId: 'technical',
    toolName: 'Technical SEO Analyzer',
  },
  {
    id: 'tech-2',
    categoryId: 'technical',
    title: 'Create and Validate XML Sitemap',
    description: 'Build an XML sitemap containing all indexable URLs and submit it to Google Search Console.',
    priority: 'high',
    toolId: 'sitemap-generator',
    toolName: 'XML Sitemap Generator',
  },
  {
    id: 'tech-3',
    categoryId: 'technical',
    title: 'Configure Robots.txt Directives',
    description: 'Define crawl rules for search bot user-agents and prevent crawling of admin or private directories.',
    priority: 'high',
    toolId: 'robots-generator',
    toolName: 'Robots.txt Generator',
  },
  {
    id: 'tech-4',
    categoryId: 'technical',
    title: 'Audit Core Web Vitals & Page Latency',
    description: 'Measure Time to First Byte (TTFB), Largest Contentful Paint (LCP), and server response times.',
    priority: 'high',
    toolId: 'pagespeed',
    toolName: 'PageSpeed Analyzer',
  },
  {
    id: 'tech-5',
    categoryId: 'technical',
    title: 'Fix 404 Dead Ends & Broken Links',
    description: 'Scan your site for internal and external broken links to prevent link equity leakage.',
    priority: 'quick-win',
    toolId: 'broken-links',
    toolName: 'Broken Link Checker',
  },
  {
    id: 'tech-6',
    categoryId: 'technical',
    title: 'Set Up Self-Referential Canonical Tags',
    description: 'Prevent duplicate content penalties by specifying explicit rel="canonical" tags on every page.',
    priority: 'medium',
    toolId: 'on-page',
    toolName: 'On-Page SEO Checker',
  },

  // On-Page
  {
    id: 'onpage-1',
    categoryId: 'on-page',
    title: 'Write Unique Title Tags (< 60 Chars)',
    description: 'Craft descriptive, keyword-rich title tags that fit within Google desktop and mobile pixel limits.',
    priority: 'high',
    toolId: 'serp-preview',
    toolName: 'SERP Preview Tool',
  },
  {
    id: 'onpage-2',
    categoryId: 'on-page',
    title: 'Craft Engaging Meta Descriptions (< 160 Chars)',
    description: 'Write action-oriented meta descriptions with clear value propositions to boost Search CTR.',
    priority: 'high',
    toolId: 'meta-generator',
    toolName: 'Meta Tag Generator',
  },
  {
    id: 'onpage-3',
    categoryId: 'on-page',
    title: 'Enforce Single H1 Heading Per Page',
    description: 'Ensure each page has exactly one primary H1 header matching the main topic or keyword.',
    priority: 'quick-win',
    toolId: 'on-page',
    toolName: 'On-Page SEO Checker',
  },
  {
    id: 'onpage-4',
    categoryId: 'on-page',
    title: 'Add Descriptive Image Alt Attributes',
    description: 'Include descriptive alt text for all content images to improve accessibility and Google Image search ranking.',
    priority: 'quick-win',
    toolId: 'on-page',
    toolName: 'On-Page SEO Checker',
  },
  {
    id: 'onpage-5',
    categoryId: 'on-page',
    title: 'Configure Open Graph & Twitter Cards',
    description: 'Add og:title, og:description, and og:image tags so links look preview-rich when shared on social media.',
    priority: 'medium',
    toolId: 'meta-generator',
    toolName: 'Meta Tag Generator',
  },
  {
    id: 'onpage-6',
    categoryId: 'on-page',
    title: 'Establish Contextual Internal Links',
    description: 'Link relevant blog posts and product pages together using descriptive anchor text.',
    priority: 'medium',
    toolId: 'audit',
    toolName: 'Website SEO Audit',
  },

  // Content
  {
    id: 'content-1',
    categoryId: 'content',
    title: 'Conduct Primary & Secondary Keyword Research',
    description: 'Identify high-intent target search terms with realistic difficulty and solid search volume.',
    priority: 'high',
    toolId: 'keyword-research',
    toolName: 'Keyword Research Tool',
  },
  {
    id: 'content-2',
    categoryId: 'content',
    title: 'Discover Long-Tail & Question Keywords',
    description: 'Scrape real Google Autocomplete suggestions to answer common user questions in your niche.',
    priority: 'quick-win',
    toolId: 'keyword-suggestions',
    toolName: 'Keyword Suggestions Tool',
  },
  {
    id: 'content-3',
    categoryId: 'content',
    title: 'Audit Readability & Text Structure',
    description: 'Keep paragraphs concise, use active voice, and aim for a 7th-9th grade reading level.',
    priority: 'medium',
    toolId: 'content',
    toolName: 'Content SEO Analyzer',
  },
  {
    id: 'content-4',
    categoryId: 'content',
    title: 'Check and Prevent Keyword Stuffing',
    description: 'Maintain natural keyword density (1% - 2.5%) and eliminate unnatural word repetition.',
    priority: 'quick-win',
    toolId: 'keyword-stuffing',
    toolName: 'Keyword Stuffing Checker',
  },
  {
    id: 'content-5',
    categoryId: 'content',
    title: 'Enhance Semantic Depth with AI Assistance',
    description: 'Expand content depth with LSI synonyms, structured FAQ sections, and comprehensive answers.',
    priority: 'high',
    toolId: 'ai-optimizer',
    toolName: 'AI Content Optimizer',
  },
  {
    id: 'content-6',
    categoryId: 'content',
    title: 'Benchmark Against Top Ranking Competitors',
    description: 'Compare page length, heading count, and keyword coverage against top SERP rivals.',
    priority: 'medium',
    toolId: 'competitor',
    toolName: 'Competitor SEO Analyzer',
  },

  // Schema
  {
    id: 'schema-1',
    categoryId: 'schema',
    title: 'Implement Organization JSON-LD Schema',
    description: 'Add structured JSON-LD data for Organization logo, name, URL, and official social media handles.',
    priority: 'high',
    toolId: 'schema-generator',
    toolName: 'Schema Markup Generator',
  },
  {
    id: 'schema-2',
    categoryId: 'schema',
    title: 'Add FAQPage Structured Data',
    description: 'Mark up question-and-answer accordions to trigger expanded accordion snippets in Google search results.',
    priority: 'quick-win',
    toolId: 'schema-generator',
    toolName: 'Schema Markup Generator',
  },
  {
    id: 'schema-3',
    categoryId: 'schema',
    title: 'Implement BreadcrumbList Schema',
    description: 'Provide clear breadcrumb hierarchy in search results to guide users and search bots.',
    priority: 'medium',
    toolId: 'schema-generator',
    toolName: 'Schema Markup Generator',
  },
  {
    id: 'schema-4',
    categoryId: 'schema',
    title: 'Validate Schema with Rich Results Test',
    description: 'Ensure there are zero syntax errors or missing required fields in your JSON-LD code blocks.',
    priority: 'high',
    toolId: 'schema-generator',
    toolName: 'Schema Markup Generator',
  },

  // Off-Page & Analytics
  {
    id: 'offpage-1',
    categoryId: 'off-page',
    title: 'Register & Verify Google Search Console',
    description: 'Connect domain ownership to monitor search impressions, clicks, indexing issues, and manual penalties.',
    priority: 'high',
    toolId: 'off-page',
    toolName: 'Off-Page SEO Checker',
  },
  {
    id: 'offpage-2',
    categoryId: 'off-page',
    title: 'Install Google Analytics 4 (GA4)',
    description: 'Configure event tracking, scroll depth, conversion goals, and user traffic sources.',
    priority: 'high',
    toolId: 'off-page',
    toolName: 'Off-Page SEO Checker',
  },
  {
    id: 'offpage-3',
    categoryId: 'off-page',
    title: 'Audit Backlink Diversity & Anchor Text',
    description: 'Evaluate referring domain quality, dofollow/nofollow ratio, and anchor text distribution.',
    priority: 'medium',
    toolId: 'off-page',
    toolName: 'Off-Page SEO Checker',
  },
  {
    id: 'offpage-4',
    categoryId: 'off-page',
    title: 'Claim Core Social Profiles & Citation Accounts',
    description: 'Secure consistent Brand Name, Address, and Website URL across major social and industry platforms.',
    priority: 'quick-win',
    toolId: 'off-page',
    toolName: 'Off-Page SEO Checker',
  },
];

const STORAGE_KEY = 'ff_seo_checklist_completed';

export function SeoChecklistPage() {
  const { navigateTo } = useNavigation();
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedIds));
    } catch {
      // Storage fallback
    }
  }, [completedIds]);

  const toggleItem = (id: string) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleMarkCategoryAll = (catId: string) => {
    const catItemIds = CHECKLIST_ITEMS.filter((i) => i.categoryId === catId).map((i) => i.id);
    const allChecked = catItemIds.every((id) => completedIds.includes(id));

    if (allChecked) {
      setCompletedIds((prev) => prev.filter((id) => !catItemIds.includes(id)));
    } else {
      setCompletedIds((prev) => Array.from(new Set([...prev, ...catItemIds])));
    }
  };

  const handleResetChecklist = () => {
    setCompletedIds([]);
    setConfirmReset(false);
  };

  const handleExportProgress = () => {
    const total = CHECKLIST_ITEMS.length;
    const completedCount = completedIds.length;
    const percent = Math.round((completedCount / total) * 100);

    const data = {
      exportDate: new Date().toISOString(),
      completionPercentage: percent,
      completedCount,
      totalItems: total,
      completedItemIds: completedIds,
      items: CHECKLIST_ITEMS.map((item) => ({
        id: item.id,
        category: item.categoryId,
        title: item.title,
        priority: item.priority,
        completed: completedIds.includes(item.id),
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-checklist-progress-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter items
  const filteredItems = CHECKLIST_ITEMS.filter((item) => {
    if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) return false;
    if (selectedPriority !== 'all' && item.priority !== selectedPriority) return false;
    if (selectedStatus === 'completed' && !completedIds.includes(item.id)) return false;
    if (selectedStatus === 'pending' && completedIds.includes(item.id)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    return true;
  });

  const totalItemsCount = CHECKLIST_ITEMS.length;
  const totalCompletedCount = completedIds.length;
  const overallPercentage = Math.round((totalCompletedCount / totalItemsCount) * 100);

  const getRankBadge = (percent: number) => {
    if (percent === 100) return { label: 'SEO Master', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
    if (percent >= 75) return { label: 'Ranking Ready', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' };
    if (percent >= 40) return { label: 'SEO Practitioner', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' };
    return { label: 'SEO Novice', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' };
  };

  const rank = getRankBadge(overallPercentage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title Card */}
      <div className="bg-white dark:bg-[#111625] rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Interactive SEO Roadmap</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Interactive SEO Checklist &amp; Milestone Tracker
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Step-by-step roadmap covering 26 essential SEO milestones across technical foundation, on-page tags, content quality, schema markup, and off-page signals. Your progress saves automatically in browser local storage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleExportProgress}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Export Progress</span>
            </button>
            {confirmReset ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleResetChecklist}
                  className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  Confirm Reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Overall Progress Widget */}
        <div className="mt-8 p-6 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800/90">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="relative w-16 h-16 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0 font-mono tabular-nums">
                {overallPercentage}%
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    Overall Website SEO Completion
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${rank.color}`}>
                    {rank.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Completed <strong className="text-slate-900 dark:text-white font-mono tabular-nums">{totalCompletedCount}</strong> of <span className="font-mono tabular-nums">{totalItemsCount}</span> action items
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full sm:w-64 space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>Progress</span>
                <span className="font-mono tabular-nums">{totalCompletedCount} / {totalItemsCount}</span>
              </div>
              <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-500 rounded-full"
                  style={{ width: `${overallPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#111625] rounded-2xl p-4 sm:p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Live Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search checklist tasks (e.g. 'sitemap', 'title', 'canonical')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Priority & Status Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Status Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl font-semibold text-slate-600 dark:text-slate-300">
              {(['all', 'pending', 'completed'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1 rounded-lg capitalize transition-all ${
                    selectedStatus === st
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                      : 'hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Priority Select */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="quick-win">Quick Wins</option>
              <option value="medium">Medium Priority</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs font-semibold">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Categories ({CHECKLIST_ITEMS.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = CHECKLIST_ITEMS.filter((i) => i.categoryId === cat.id).length;
            const completedCatCount = CHECKLIST_ITEMS.filter(
              (i) => i.categoryId === cat.id && completedIds.includes(i.id)
            ).length;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-700/60">
                  {completedCatCount}/{count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Checklist Sections by Category */}
      <div className="space-y-6">
        {CATEGORIES.filter((cat) => selectedCategory === 'all' || selectedCategory === cat.id).map((category) => {
          const categoryItems = filteredItems.filter((i) => i.categoryId === category.id);
          if (categoryItems.length === 0 && (selectedCategory !== 'all' || searchQuery || selectedStatus !== 'all')) {
            return null;
          }

          const allCatItems = CHECKLIST_ITEMS.filter((i) => i.categoryId === category.id);
          const catCompletedCount = allCatItems.filter((i) => completedIds.includes(i.id)).length;
          const isAllCatCompleted = allCatItems.length > 0 && catCompletedCount === allCatItems.length;

          const CategoryIcon = category.icon;

          return (
            <div
              key={category.id}
              className="bg-white dark:bg-[#111625] rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-4"
            >
              {/* Category Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-start sm:items-center gap-3">
                  <div className={`p-2.5 rounded-2xl border ${category.color}`}>
                    <CategoryIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{category.name}</span>
                      <span className="text-xs font-normal text-slate-400 font-mono">
                        ({catCompletedCount}/{allCatItems.length})
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500">{category.desc}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleMarkCategoryAll(category.id)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline self-start sm:self-auto"
                >
                  {isAllCatCompleted ? 'Uncheck All in Category' : 'Mark All Done in Category'}
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {categoryItems.map((item) => {
                  const isChecked = completedIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isChecked
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60 opacity-80'
                          : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleItem(item.id);
                          }}
                          className="mt-0.5 shrink-0 focus:outline-none"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-300 dark:text-slate-600 hover:text-indigo-500" />
                          )}
                        </button>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-sm font-semibold ${
                                isChecked
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {item.title}
                            </span>

                            {/* Priority Badge */}
                            {item.priority === 'high' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                                High Priority
                              </span>
                            )}
                            {item.priority === 'quick-win' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                Quick Win
                              </span>
                            )}
                            {item.priority === 'medium' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                Medium Priority
                              </span>
                            )}
                          </div>

                          <p
                            className={`text-xs leading-relaxed ${
                              isChecked
                                ? 'text-slate-400 dark:text-slate-600'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Tool launch shortcut if available */}
                      {item.toolId && item.toolName && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateTo(item.toolId!);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors self-start sm:self-auto shadow-xs"
                        >
                          <Zap className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Launch {item.toolName}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
