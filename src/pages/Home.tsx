import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigation, PageId } from '../context/NavigationContext';
import { moderateReview } from '../utils/moderation';
import { SeoPerformanceTracker } from '../components/SeoPerformanceTracker';
import {
  Search,
  ArrowRight,
  Gauge,
  FileText,
  Code2,
  Zap,
  Link2,
  Sparkles,
  KeyRound,
  Compass,
  Users,
  Layers,
  FileCode2,
  Share2,
  Wrench,
  Flame,
  CheckCircle2,
  ChevronDown,
  CheckSquare,
  Clock,
  History,
  Trash2,
  Globe,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Star,
  MessageSquarePlus,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface RecentAuditItem {
  url: string;
  timestamp: string;
}

interface ReviewItem {
  id: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
  date: string;
}

export function HomePage() {
  const { navigateTo, sharedUrl, setSharedUrl } = useNavigation();
  const [inputUrl, setInputUrl] = useState(sharedUrl && sharedUrl !== 'https://' ? sharedUrl : '');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [recentAudits, setRecentAudits] = useState<RecentAuditItem[]>([]);

  // Real Server-Persisted User Reviews State (no fake seeded testimonials)
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsLoadError, setReviewsLoadError] = useState<string | null>(null);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRole, setNewReviewRole] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const REVIEWS_PER_PAGE = 3;
  const totalPages = Math.max(1, Math.ceil(reviews.length / REVIEWS_PER_PAGE));

  const liveCheck = moderateReview(newReviewComment);
  const isInvalid = newReviewComment.trim().length > 0 && !liveCheck.valid;

  useEffect(() => {
    try {
      const stored = localStorage.getItem('rankora_recent_audits');
      if (stored) {
        setRecentAudits(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }

    const loadReviews = async () => {
      setReviewsLoading(true);
      setReviewsLoadError(null);
      try {
        const res = await fetch('/api/reviews');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load reviews');
        setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      } catch (err: any) {
        setReviewsLoadError(err.message || 'Unable to load community reviews right now.');
      } finally {
        setReviewsLoading(false);
      }
    };
    loadReviews();
  }, []);


  const handleAnalyze = (e?: React.FormEvent, overrideUrl?: string) => {
    if (e) e.preventDefault();
    let url = (overrideUrl || inputUrl).trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    try {
      const updated = [
        { url, timestamp: new Date().toISOString() },
        ...recentAudits.filter((a) => a.url.toLowerCase() !== url.toLowerCase()),
      ].slice(0, 5);
      setRecentAudits(updated);
      localStorage.setItem('rankora_recent_audits', JSON.stringify(updated));
    } catch {
      // Ignore
    }

    setSharedUrl(url);
    navigateTo('audit', url);
  };

  const clearRecentAudits = () => {
    setRecentAudits([]);
    localStorage.removeItem('rankora_recent_audits');
  };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingReview) return;
    setReviewError(null);

    const clientCheck = moderateReview(newReviewComment);
    if (!clientCheck.valid) {
      setReviewError(clientCheck.error || 'Prohibited content detected.');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch('/api/submit-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newReviewName,
          role: newReviewRole,
          rating: newReviewRating,
          comment: newReviewComment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Review validation or save failed.');

      const updated = [data.review, ...reviews];
      setReviews(updated);

      setNewReviewName('');
      setNewReviewRole('');
      setNewReviewRating(5);
      setNewReviewComment('');
      setShowReviewModal(false);
      setReviewSuccess(true);
      setCurrentPage(1);
      setTimeout(() => setReviewSuccess(false), 4000);
    } catch (err: any) {
      setReviewError(err.message || 'Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Categories including All Tools (19)
  const categories = [
    { id: 'all', label: 'All Tools (19)' },
    { id: 'website', label: 'Website SEO Tools' },
    { id: 'content', label: 'Content SEO Tools' },
    { id: 'keywords', label: 'Keyword Research Tools' },
    { id: 'technical', label: 'Technical SEO Tools' },
    { id: 'ai', label: 'AI SEO Tools' },
  ];

  const toolsByCategory: Record<string, { id: PageId; name: string; desc: string; icon: any; action: string }[]> = {
    website: [
      { id: 'audit', name: 'SEO Website Audit Engine', desc: 'Complete 360° health scan covering on-page tags, headers, TTFB latency, and code fixes.', icon: Gauge, action: 'Run Website Audit' },
      { id: 'on-page', name: 'On-Page SEO Checker', desc: 'Inspect title tags, meta descriptions, H1-H6 outlines, canonical tags, and mobile viewports.', icon: FileText, action: 'Check On-Page SEO' },
      { id: 'competitor', name: 'Competitor SEO Analyzer', desc: 'Side-by-side URL head-to-head comparison against top SERP rivals with gap identification.', icon: Users, action: 'Compare Competitors' },
      { id: 'off-page', name: 'Off-Page SEO Checker', desc: 'Audit brand social profile connectivity, outbound link profile ratios, and trust posture.', icon: Globe, action: 'Audit Off-Page' },
      { id: 'meta-generator', name: 'Meta Tag Generator', desc: 'Live social card previews for OpenGraph, Twitter/X, LinkedIn, and search engine snippets.', icon: Share2, action: 'Generate Meta Tags' },
    ],
    content: [
      { id: 'content', name: 'Content SEO Analyzer', desc: 'Evaluate 9 transparent content categories, readability grade, word counts, and heading structure.', icon: FileText, action: 'Analyze Content' },
      { id: 'keyword-stuffing', name: 'Keyword Stuffing Checker', desc: 'Detect unnatural keyword repetition and over-optimization risks with an interactive text highlighter.', icon: Flame, action: 'Check Keyword Density' },
      { id: 'serp-preview', name: 'SERP Google Snippet Preview', desc: 'Pixel-accurate Google Desktop & Mobile simulator with real-time character and pixel truncation alerts.', icon: Search, action: 'Preview SERP' },
      { id: 'checklist', name: 'Interactive SEO Checklist', desc: 'Track website launch progress across 26 essential SEO milestones with auto-saved storage.', icon: CheckSquare, action: 'View Checklist' },
    ],
    keywords: [
      { id: 'keyword-research', name: 'Keyword Research Tool', desc: 'Search intent classification, difficulty estimates, volume tiers, and high-value long-tail seeds.', icon: KeyRound, action: 'Research Keywords' },
      { id: 'keyword-suggestions', name: 'Keyword Suggestions Tool', desc: 'Real Google Autocomplete scraper with alphabet expansions and question-based query trees.', icon: Compass, action: 'Get Suggestions' },
    ],
    technical: [
      { id: 'technical', name: 'Technical SEO Analyzer', desc: 'Inspect SSL certificates, HTTP response headers, compression (gzip/br), and crawl directives.', icon: Code2, action: 'Inspect Technicals' },
      { id: 'pagespeed', name: 'PageSpeed & Web Vitals', desc: 'Evaluate Core Web Vitals (LCP, FCP, INP, CLS, Speed Index) with actionable remediation steps.', icon: Zap, action: 'Test PageSpeed' },
      { id: 'broken-links', name: 'Broken Link Checker', desc: 'Scan internal and external links for 404 dead ends, HTTP status codes, and redirect loops.', icon: Link2, action: 'Check Broken Links' },
      { id: 'bulk-checker', name: 'Bulk URL SEO Checker', desc: 'Batch audit up to 15 URLs simultaneously with status codes, scores, latency, and CSV export.', icon: Layers, action: 'Batch Audit URLs' },
      { id: 'schema-generator', name: 'Schema Markup Generator', desc: 'Generate valid JSON-LD schemas for Articles, FAQs, LocalBusiness, Products, and Organization.', icon: FileCode2, action: 'Generate Schema' },
      { id: 'sitemap-generator', name: 'XML Sitemap Generator', desc: 'Build search-engine compliant XML sitemaps from entered URLs or crawled website links.', icon: Layers, action: 'Build Sitemap' },
      { id: 'robots-generator', name: 'Robots.txt Generator & Fetcher', desc: 'Visual crawler directive builder with User-Agent rules, Disallow paths, and live fetch.', icon: Wrench, action: 'Build Robots.txt' },
    ],
    ai: [
      { id: 'ai-optimizer', name: 'AI Content Optimizer', desc: 'AI-assisted semantic analysis, missing LSI entities, high-CTR title ideas, and draft scoring.', icon: Sparkles, action: 'Optimize with AI' },
    ],
  };

  const allTools = [
    ...toolsByCategory.website,
    ...toolsByCategory.content,
    ...toolsByCategory.keywords,
    ...toolsByCategory.technical,
    ...toolsByCategory.ai,
  ];

  const currentTools = selectedCategory === 'all'
    ? allTools
    : (toolsByCategory[selectedCategory] || toolsByCategory['website']);

  const faqs = [
    {
      q: 'Is Rankora really 100% free with no hidden charges or limits?',
      a: 'Yes, absolutely. Rankora is built on the philosophy of open web intelligence. There are no credit card requirements, no paid subscription tiers, no login walls, and no artificial limits designed to force upgrades. Every single tool is 100% accessible to every visitor forever.',
    },
    {
      q: 'Do I need to create an account or sign up to use Rankora?',
      a: 'No. You do not need to register, provide an email address, or create a password. You can start using every tool right away directly in your browser.',
    },
    {
      q: 'How does the Rankora Website SEO Audit work?',
      a: 'Our server securely fetches your public webpage using a compliant crawler. It parses the actual HTML structure, measures server latency (TTFB), inspects titles, meta tags, headings H1-H6, images, internal/external links, and schema markup, then calculates weighted scores with step-by-step fix recommendations.',
    },
    {
      q: 'Does Rankora fabricate or mock data?',
      a: 'No. All results are generated from real webpage fetching, actual HTML DOM parsing, live Google Suggest autocomplete queries, and genuine server responses. We never produce fake metrics or mock data.',
    },
    {
      q: 'How does the AI Content Optimizer work?',
      a: 'The AI Content Optimizer utilizes Google Gemini to semantically evaluate your copy against search intent. It identifies missing semantic entities (LSI keywords), evaluates readability, and generates high-CTR title and meta description ideas.',
    },
  ];

  return (
    <div className="space-y-20 pb-24">
      {/* 1. HERO SECTION */}
      <section className="relative pt-10 sm:pt-16 pb-8 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Unboxed Metadata Header */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Rankora Platform</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span>19 Professional Tools</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span>100% Free Forever</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12] text-balance">
              Your Entire SEO Toolkit. <span className="rankora-gradient-text">One Powerful Platform.</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed text-balance">
              Analyze websites, uncover SEO opportunities, optimize content and make smarter search decisions with free tools built for everyone.
            </p>

            {/* Prominent Website URL Input & CTAs */}
            <div className="space-y-3 pt-2">
              <form
                onSubmit={handleAnalyze}
                className="max-w-2xl mx-auto p-1.5 sm:p-2 bg-white dark:bg-[#111625] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-2 transition-all focus-within:border-indigo-500 dark:focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20"
              >
                <div className="relative flex-1 w-full flex items-center">
                  <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 pointer-events-none shrink-0" />
                  <input
                    type="text"
                    placeholder="Enter your website URL..."
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-xs active:scale-98"
                >
                  <span>Analyze Website</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Secondary CTA & Subtle Content Analyzer Option */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs pt-1">
                <button
                  onClick={() => {
                    const el = document.getElementById('tools-directory');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Explore SEO Tools</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="hidden sm:inline text-slate-300 dark:text-slate-700">·</span>
                <button
                  onClick={() => navigateTo('ai-optimizer')}
                  className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Or paste your content to check its SEO score.
                </button>
              </div>
            </div>

            {/* Recent Audit History Strip */}
            {recentAudits.length > 0 && (
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#111625] border border-slate-200/90 dark:border-slate-800 text-left space-y-2 max-w-xl mx-auto">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <History className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Recent Audits</span>
                  </div>
                  <button
                    onClick={clearRecentAudits}
                    className="text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {recentAudits.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnalyze(undefined, item.url)}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 dark:bg-slate-900 dark:hover:bg-indigo-950/50 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 font-mono tabular-nums cursor-pointer"
                    >
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{item.url.replace(/^https?:\/\//i, '').replace(/\/$/, '')}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. HERO VISUAL: Verified Live Analysis Engines Quick-Launch */}
          <div className="max-w-4xl mx-auto rounded-3xl bg-white dark:bg-[#111625] border border-slate-200/90 dark:border-slate-800/90 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Real-Time Diagnostics Architecture
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    100% Live Server Fetching, DOM Inspection &amp; External APIs
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                  SSRF Protected
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
                  Zero Synthetic Data
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => navigateTo('audit')}
                className="text-left p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors space-y-1.5 cursor-pointer"
              >
                <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Technical &amp; On-Page
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Full Site Audit</span>
                </div>
                <p className="text-xs text-slate-500">Live HTML crawl, robots.txt, XML sitemaps, headers &amp; meta tags.</p>
              </button>

              <button
                type="button"
                onClick={() => navigateTo('pagespeed')}
                className="text-left p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors space-y-1.5 cursor-pointer"
              >
                <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Performance Engine
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-violet-500 shrink-0" />
                  <span>PageSpeed Insights v5</span>
                </div>
                <p className="text-xs text-slate-500">Official Google Lighthouse Core Web Vitals &amp; server TTFB timing.</p>
              </button>

              <button
                type="button"
                onClick={() => navigateTo('keyword-suggestions')}
                className="text-left p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors space-y-1.5 cursor-pointer"
              >
                <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Search Discovery
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Live Keyword Queries</span>
                </div>
                <p className="text-xs text-slate-500">Direct Google Autocomplete suggestions &amp; intent categorization.</p>
              </button>
            </div>
          </div>
        </div>
      </section>




      {/* 3. TRUST SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: ShieldCheck, title: '100% Free Forever', desc: 'No trial limits, no sudden subscription upgrades, and no paywalled features ever.' },
            { icon: CheckCircle2, title: 'No Registration Required', desc: 'Start using any of our 19 professional SEO tools instantly without creating an account.' },
            { icon: Cpu, title: 'No Credit Card', desc: 'We never ask for payment info, credit cards, or billing details. Completely free access.' },
            { icon: Globe, title: 'Open Access for Everyone', desc: 'Built for bloggers, website owners, developers, marketers, and SEO professionals worldwide.' },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-white dark:bg-[#111625] border border-slate-200/90 dark:border-slate-800 space-y-2 shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
                <card.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{card.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {card.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SEO PERFORMANCE TRACKER DASHBOARD */}
      <SeoPerformanceTracker />

      {/* 4. TOOLS DIRECTORY SECTION */}
      <section id="tools-directory" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Professional Suite
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Explore Our SEO Tools Directory
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Select a category below to access specialized website, content, keyword, technical, and AI tools.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar max-w-5xl mx-auto p-1.5 bg-slate-100 dark:bg-[#111625] rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm whitespace-nowrap">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>

        {/* Tools Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentTools.map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: (i % 3) * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              onClick={() => navigateTo(tool.id)}
              className="p-6 rounded-2xl bg-white dark:bg-[#111625] border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50 group-hover:scale-105 transition-transform">
                  <tool.icon className="w-6 h-6" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span>{tool.action}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Simple 3-Step Process
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            How Rankora Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111625] border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-mono font-bold flex items-center justify-center text-sm shadow-xs">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Choose Your SEO Tool</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Select from 19 specialized tools for website audits, content optimization, keyword research, or technical diagnostics.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#111625] border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-mono font-bold flex items-center justify-center text-sm shadow-xs">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Analyze Your Website or Content</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Enter any URL or paste your article draft. Our live crawler and AI semantic engines evaluate your page in seconds.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#111625] border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-mono font-bold flex items-center justify-center text-sm shadow-xs">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Discover Issues and Improve SEO</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Review actionable fix recommendations, export CSV reports, and optimize your rankings without subscription paywalls.
            </p>
          </div>
        </div>
      </section>

      {/* 6. WHY RANKORA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 border border-slate-800 space-y-6">
          <div className="max-w-3xl space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Our Philosophy
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Why Rankora Exists
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Search engine optimization is critical for creators, small businesses, and developers. Yet, traditional SEO platforms gate essential technical audits and keyword data behind expensive monthly subscriptions. Rankora was created to provide professional-grade open-access intelligence to everyone, unconditionally.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
            <div className="space-y-1">
              <div className="text-sm font-bold text-white">No Subscription Walls</div>
              <div className="text-xs text-slate-400">Every feature is fully unlocked from day one.</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-bold text-white">Lightning Fast</div>
              <div className="text-xs text-slate-400">Optimized client-side and server crawlers.</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-bold text-white">Transparent Metrics</div>
              <div className="text-xs text-slate-400">Clear calculations with actionable fixes.</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-bold text-white">Community Driven</div>
              <div className="text-xs text-slate-400">Built for the open web and creators worldwide.</div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. USER GENERATED REVIEWS (UGR) SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Community Trust
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              User Generated Reviews (UGR)
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Real feedback from webmasters, developers, and SEO professionals using Rankora.
            </p>
          </div>

          <button
            onClick={() => setShowReviewModal(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-xs active:scale-98 shrink-0"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Write a Review</span>
          </button>
        </div>

        {reviewSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Thank you! Your review has been successfully posted and displayed below.</span>
          </div>
        )}

        {reviewsLoading ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#111625] border border-slate-200/90 dark:border-slate-800 text-center text-xs text-slate-500">
            Loading verified community reviews...
          </div>
        ) : reviewsLoadError ? (
          <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-center text-xs text-red-700 dark:text-red-300">
            {reviewsLoadError}
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#111625] border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              No community reviews submitted yet
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              All submitted reviews are verified against strict moderation rules and saved cleanly on the server. Be the first to share genuine feedback.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.slice((currentPage - 1) * REVIEWS_PER_PAGE, currentPage * REVIEWS_PER_PAGE).map((rev) => (
              <div
                key={rev.id}
                className="p-6 rounded-2xl bg-white dark:bg-[#111625] border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : 'text-slate-300 dark:text-slate-700'}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{rev.name}</div>
                    <div className="text-slate-400">{rev.role}</div>
                  </div>
                  <div className="text-slate-400 font-mono text-[11px]">
                    {rev.date.includes('T') ? new Date(rev.date).toLocaleDateString() : rev.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer shadow-xs transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 font-mono tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer shadow-xs transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* Write Review Modal / Inline Form */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Write Your Rankora Review</span>
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={newReviewName}
                  onChange={(e) => setNewReviewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Role / Company
                </label>
                <input
                  type="text"
                  placeholder="e.g. SEO Consultant @ TechCorp"
                  value={newReviewRole}
                  onChange={(e) => setNewReviewRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rating
                </label>
                <select
                  value={newReviewRating}
                  onChange={(e) => setNewReviewRating(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={5}>★★★★★ (5 Stars - Exceptional)</option>
                  <option value={4}>★★★★☆ (4 Stars - Great)</option>
                  <option value={3}>★★★☆☆ (3 Stars - Good)</option>
                  <option value={2}>★★☆☆☆ (2 Stars - Fair)</option>
                  <option value={1}>★☆☆☆☆ (1 Star - Poor)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Review *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share your experience using Rankora SEO tools..."
                  value={newReviewComment}
                  onChange={(e) => {
                    setNewReviewComment(e.target.value);
                    setReviewError(null);
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:ring-2 leading-relaxed transition-colors ${
                    isInvalid
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500'
                  }`}
                />
                {isInvalid && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                    {liveCheck.error}
                  </p>
                )}
                {reviewError && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                    {reviewError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview || isInvalid || !newReviewName.trim() || !newReviewComment.trim()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. FAQ SECTION */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Got Questions?
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-white dark:bg-[#111625] border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-slate-900 dark:text-white text-sm sm:text-base hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-0 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 mt-1">
                    <p className="pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
