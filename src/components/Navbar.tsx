import React, { useState, useRef, useEffect } from 'react';
import { useNavigation, PageId } from '../context/NavigationContext';
import {
  Globe,
  FileText,
  KeyRound,
  Wrench,
  Search,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Zap,
  Gauge,
  Layers,
  Code2,
  FileCode2,
  Share2,
  Link2,
  ShieldCheck,
  Flame,
  HelpCircle,
  FileQuestion,
  Users,
  Compass,
  ArrowRight,
  CheckSquare,
} from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { RankoraLogo } from './RankoraLogo';

interface ToolItem {
  id: PageId;
  name: string;
  desc: string;
  icon: any;
  badge?: string;
}

export function Navbar() {
  const { currentPage, navigateTo } = useNavigation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName);

      // Ctrl+K or Cmd+K -> Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
        return;
      }

      // ? or Ctrl+/ -> Keyboard shortcuts modal
      if ((e.key === '?' && !isInput) || ((e.ctrlKey || e.metaKey) && e.key === '/')) {
        e.preventDefault();
        setShortcutsModalOpen((prev) => !prev);
        return;
      }

      // If typing in input, don't trigger navigation shortcuts
      if (isInput) return;

      // Ctrl + H -> Home
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        navigateTo('home');
        return;
      }

      // Ctrl + Shift + C -> Checklist
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        navigateTo('checklist');
        return;
      }

      // Ctrl + Shift + U -> Audit
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        navigateTo('audit');
        return;
      }

      // Ctrl + Shift + O -> On-page
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        navigateTo('on-page');
        return;
      }

      // Ctrl + Shift + T -> Technical
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        navigateTo('technical');
        return;
      }

      // Ctrl + Shift + S -> SERP preview
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        navigateTo('serp-preview');
        return;
      }

      // Ctrl + Shift + A -> AI Content Optimizer
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        navigateTo('ai-optimizer');
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [navigateTo]);

  const websiteTools: ToolItem[] = [
    { id: 'checklist', name: 'Interactive SEO Checklist', desc: 'Track progress across 26 website SEO milestones', icon: CheckSquare, badge: 'New' },
    { id: 'audit', name: 'SEO Website Audit', desc: 'Full 360° health check & actionable issue fixes', icon: Gauge, badge: 'Popular' },
    { id: 'on-page', name: 'On-Page SEO Checker', desc: 'Inspect titles, meta, H1-H6, alt tags & schema', icon: FileText },
    { id: 'technical', name: 'Technical SEO Analyzer', desc: 'SSL, headers, TTFB, compression & crawlability', icon: Code2 },
    { id: 'pagespeed', name: 'PageSpeed Analyzer', desc: 'Core Web Vitals, payload sizes & latency', icon: Zap },
    { id: 'broken-links', name: 'Broken Link Checker', desc: 'Scan internal & external links for 404 dead ends', icon: Link2 },
    { id: 'bulk-checker', name: 'Bulk URL SEO Checker', desc: 'Batch audit multiple pages at once with CSV export', icon: Layers },
  ];

  const contentTools: ToolItem[] = [
    { id: 'content', name: 'Content SEO Analyzer', desc: 'Readability grade, word count & text-to-code', icon: FileText },
    { id: 'keyword-stuffing', name: 'Keyword Stuffing Checker', desc: 'Detect over-optimized repetition & penalty risks', icon: Flame },
    { id: 'ai-optimizer', name: 'AI Content Optimizer', desc: 'AI-assisted semantic expansion & title ideas', icon: Sparkles, badge: 'AI' },
    { id: 'serp-preview', name: 'SERP Preview Tool', desc: 'Pixel-accurate Google desktop & mobile snippet tester', icon: Search },
  ];

  const keywordTools: ToolItem[] = [
    { id: 'keyword-research', name: 'Keyword Research Tool', desc: 'Search intent, volume tiers & difficulty estimation', icon: KeyRound },
    { id: 'keyword-suggestions', name: 'Keyword Suggestions Tool', desc: 'Real Google Autocomplete & long-tail alphabet scraper', icon: Compass, badge: 'Live' },
    { id: 'competitor', name: 'Competitor SEO Analyzer', desc: 'Side-by-side URL head-to-head comparison', icon: Users },
  ];

  const technicalTools: ToolItem[] = [
    { id: 'schema-generator', name: 'Schema Markup Generator', desc: 'JSON-LD generator for FAQ, Article, Product & more', icon: FileCode2 },
    { id: 'meta-generator', name: 'Meta Tag Generator', desc: 'OpenGraph, Twitter card & social snippet tags', icon: Share2 },
    { id: 'sitemap-generator', name: 'XML Sitemap Generator', desc: 'Build and validate search-ready XML sitemaps', icon: Layers },
    { id: 'robots-generator', name: 'Robots.txt Generator', desc: 'Crawl rule builder, user-agent directives & validator', icon: Wrench },
    { id: 'off-page', name: 'Off-Page SEO Checker', desc: 'External link balance, anchor text & backlink readiness', icon: Globe },
  ];

  const allTools = [...websiteTools, ...contentTools, ...keywordTools, ...technicalTools];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToolClick = (id: PageId) => {
    navigateTo(id);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
    setSearchModalOpen(false);
  };

  const filteredTools = searchQuery.trim()
    ? allTools.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allTools;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#090d16]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={() => handleToolClick('home')}
                className="text-left group min-w-0 focus:outline-none cursor-pointer"
                aria-label="Rankora Home"
              >
                <RankoraLogo size="md" />
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav ref={dropdownRef} className="hidden lg:flex items-center space-x-0.5 xl:space-x-1">
              <button
                onClick={() => handleToolClick('home')}
                className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs xl:text-sm font-bold tracking-tight whitespace-nowrap transition-all cursor-pointer ${
                  currentPage === 'home'
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                Home
              </button>

              {/* Website SEO Tools Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'website' ? null : 'website')}
                  className={`flex items-center gap-1 px-2.5 xl:px-3 py-2 rounded-xl text-xs xl:text-sm font-bold tracking-tight whitespace-nowrap transition-all cursor-pointer ${
                    activeDropdown === 'website' || websiteTools.some((t) => t.id === currentPage)
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <span>Website SEO</span>
                  <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${activeDropdown === 'website' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'website' && (
                  <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white/95 dark:bg-[#111625]/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Core Website Audits
                    </div>
                    <div className="space-y-1 mt-1">
                      {websiteTools.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => handleToolClick(tool.id)}
                          className={`w-full text-left px-3 py-2 rounded-xl flex items-start gap-3 transition-colors cursor-pointer ${
                            currentPage === tool.id
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <tool.icon className="w-4 h-4 mt-0.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{tool.name}</span>
                              {tool.badge && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                  {tool.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{tool.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Content SEO Tools Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'content' ? null : 'content')}
                  className={`flex items-center gap-1 px-2.5 xl:px-3 py-2 rounded-xl text-xs xl:text-sm font-bold tracking-tight whitespace-nowrap transition-all ${
                    activeDropdown === 'content' || contentTools.some((t) => t.id === currentPage)
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>Content SEO</span>
                  <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${activeDropdown === 'content' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'content' && (
                  <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white/95 dark:bg-[#111625]/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      On-Page Content &amp; Readability
                    </div>
                    <div className="space-y-1 mt-1">
                      {contentTools.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => handleToolClick(tool.id)}
                          className={`w-full text-left px-3 py-2 rounded-xl flex items-start gap-3 transition-colors cursor-pointer ${
                            currentPage === tool.id
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <tool.icon className="w-4 h-4 mt-0.5 text-violet-600 dark:text-violet-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{tool.name}</span>
                              {tool.badge && (
                                <span className="text-[10px] font-medium text-slate-400">
                                  {tool.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{tool.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Keyword Tools Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'keywords' ? null : 'keywords')}
                  className={`flex items-center gap-1 px-2.5 xl:px-3 py-2 rounded-xl text-xs xl:text-sm font-bold tracking-tight whitespace-nowrap transition-all cursor-pointer ${
                    activeDropdown === 'keywords' || keywordTools.some((t) => t.id === currentPage)
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <span>Keywords</span>
                  <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${activeDropdown === 'keywords' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'keywords' && (
                  <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white/95 dark:bg-[#111625]/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Discovery &amp; Research
                    </div>
                    <div className="space-y-1 mt-1">
                      {keywordTools.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => handleToolClick(tool.id)}
                          className={`w-full text-left px-3 py-2 rounded-xl flex items-start gap-3 transition-colors cursor-pointer ${
                            currentPage === tool.id
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <tool.icon className="w-4 h-4 mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{tool.name}</span>
                              {tool.badge && (
                                <span className="text-[10px] font-medium text-slate-400">
                                  {tool.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{tool.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Technical SEO Tools Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'technical' ? null : 'technical')}
                  className={`flex items-center gap-1 px-2.5 xl:px-3 py-2 rounded-xl text-xs xl:text-sm font-bold tracking-tight whitespace-nowrap transition-all cursor-pointer ${
                    activeDropdown === 'technical' || technicalTools.some((t) => t.id === currentPage)
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <span>Technical</span>
                  <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${activeDropdown === 'technical' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'technical' && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white/95 dark:bg-[#111625]/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Markup, Sitemaps &amp; Robots
                    </div>
                    <div className="space-y-1 mt-1">
                      {technicalTools.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => handleToolClick(tool.id)}
                          className={`w-full text-left px-3 py-2 rounded-xl flex items-start gap-3 transition-colors cursor-pointer ${
                            currentPage === tool.id
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <tool.icon className="w-4 h-4 mt-0.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{tool.name}</span>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{tool.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* About dropdown */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'about' ? null : 'about')}
                  className={`flex items-center gap-1 px-2.5 xl:px-3 py-2 rounded-xl text-xs xl:text-sm font-bold tracking-tight whitespace-nowrap transition-all cursor-pointer ${
                    activeDropdown === 'about' || ['about', 'contact', 'privacy'].includes(currentPage)
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <span>About</span>
                  <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${activeDropdown === 'about' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'about' && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white/95 dark:bg-[#111625]/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-2 z-50">
                    <button
                      onClick={() => handleToolClick('about')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      About Rankora
                    </button>
                    <button
                      onClick={() => handleToolClick('contact')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Contact &amp; Feedback
                    </button>
                    <button
                      onClick={() => handleToolClick('privacy')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Privacy Policy
                    </button>
                  </div>
                )}
              </div>
            </nav>

            {/* Right side Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Quick Search palette trigger (Hidden on mobile, visible on tablet/desktop) */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="hidden md:flex p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Search Tools (Ctrl+K)"
              >
                <Search className="w-5 h-5" />
              </button>


              {/* Theme toggle switcher */}
              <ThemeSwitcher />

              {/* Start Free SEO Audit button (Hidden on mobile, visible on desktop) */}
              <button
                onClick={() => handleToolClick('audit')}
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-white font-bold text-sm shadow-md shadow-indigo-500/25 active:scale-95 transition-all shrink-0"
              >
                <Gauge className="w-4 h-4 shrink-0" />
                <span>Start Free SEO Audit</span>
              </button>

              {/* Mobile menu hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 max-h-[85vh] overflow-y-auto">
            <div className="space-y-4">
              {/* Prominent Start Free SEO Audit button in mobile menu */}
              <button
                onClick={() => handleToolClick('audit')}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-white font-bold text-sm shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Gauge className="w-4 h-4" />
                <span>Start Free SEO Audit</span>
              </button>

              {/* Mobile Quick Search button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchModalOpen(true);
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-slate-400" />
                <span>Search all free SEO tools...</span>
              </button>
              <div>
                <button
                  onClick={() => handleToolClick('home')}
                  className={`w-full text-left py-2 px-3 rounded-xl font-bold flex items-center gap-3 text-base ${
                    currentPage === 'home'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                      : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Home Dashboard</span>
                </button>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
                  Website SEO Tools
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {websiteTools.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleToolClick(t.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                        currentPage === t.id
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <t.icon className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span className="truncate">{t.name}</span>
                      </div>
                      {t.badge && (
                        <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full shrink-0">
                          {t.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
                  Content SEO Tools
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {contentTools.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleToolClick(t.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                        currentPage === t.id
                          ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-bold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <t.icon className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                        <span className="truncate">{t.name}</span>
                      </div>
                      {t.badge && (
                        <span className="text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full shrink-0">
                          {t.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
                  Keyword Tools
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {keywordTools.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleToolClick(t.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                        currentPage === t.id
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <t.icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">{t.name}</span>
                      </div>
                      {t.badge && (
                        <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full shrink-0">
                          {t.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
                  Technical SEO Tools
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {technicalTools.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleToolClick(t.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                        currentPage === t.id
                          ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 font-bold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <t.icon className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                        <span className="truncate">{t.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 pb-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Appearance</span>
                <ThemeSwitcher showLabel />
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400 px-2">
                <button onClick={() => handleToolClick('about')} className="hover:text-blue-600">About</button>
                <button onClick={() => handleToolClick('contact')} className="hover:text-blue-600">Contact</button>
                <button onClick={() => handleToolClick('privacy')} className="hover:text-blue-600">Privacy Policy</button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Quick Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search all 19 free SEO tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-none text-base font-medium"
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {filteredTools.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">
                  No tools found matching &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredTools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleToolClick(tool.id)}
                      className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                          <tool.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">
                            {tool.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {tool.desc}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcuts
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
        onOpenSearch={() => setSearchModalOpen(true)}
      />
    </>
  );
}
