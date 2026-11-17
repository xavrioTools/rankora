import React, { useEffect, useState, useRef, useId } from 'react';
import { useNavigation, PageId } from '../context/NavigationContext';
import {
  Keyboard,
  Search,
  X,
  ArrowRight,
  Compass,
  Gauge,
  FileText,
  Code2,
  Share2,
  Sparkles,
  Link2,
  Layers,
  CheckSquare,
  Zap,
  CornerDownLeft,
} from 'lucide-react';

export interface ShortcutItem {
  id: string;
  keys: string[];
  action: string;
  description: string;
  category: 'Navigation' | 'Tools' | 'Quick Actions' | 'Accessibility';
  pageId?: PageId;
  icon?: any;
}

export interface KeyboardShortcutsProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenSearch?: () => void;
}

export function KeyboardShortcuts({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  onOpenSearch,
}: KeyboardShortcutsProps) {
  const { navigateTo } = useNavigation();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const handleClose = () => {
    if (isControlled && controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Navigation' | 'Tools' | 'Quick Actions' | 'Accessibility'>('All');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  // All application global shortcuts
  const allShortcuts: ShortcutItem[] = [
    // Quick Actions
    {
      id: 'open-shortcuts',
      keys: ['?'],
      action: 'Open Keyboard Shortcuts',
      description: 'Display this shortcuts reference modal from any page',
      category: 'Quick Actions',
      icon: Keyboard,
    },
    {
      id: 'quick-search',
      keys: ['Ctrl', 'K'],
      action: 'Quick Tool Search',
      description: 'Open the instant palette to search and launch all 19 tools',
      category: 'Quick Actions',
      icon: Search,
    },
    {
      id: 'close-modals',
      keys: ['Esc'],
      action: 'Close Modal or Overlay',
      description: 'Dismiss any active dialog, drawer, or search palette',
      category: 'Quick Actions',
      icon: X,
    },

    // Navigation
    {
      id: 'nav-home',
      keys: ['Ctrl', 'H'],
      action: 'Go to Home Dashboard',
      description: 'Return to the main dashboard with all SEO tools and recent history',
      category: 'Navigation',
      pageId: 'home',
      icon: Compass,
    },
    {
      id: 'nav-checklist',
      keys: ['Ctrl', 'Shift', 'C'],
      action: 'Interactive SEO Checklist',
      description: 'Track and verify 35+ on-page and technical SEO tasks',
      category: 'Navigation',
      pageId: 'checklist',
      icon: CheckSquare,
    },
    {
      id: 'nav-audit',
      keys: ['Ctrl', 'Shift', 'U'],
      action: 'SEO Website Audit',
      description: 'Run deep 360° crawler audit with issue severity breakdown',
      category: 'Navigation',
      pageId: 'audit',
      icon: Gauge,
    },
    {
      id: 'nav-onpage',
      keys: ['Ctrl', 'Shift', 'O'],
      action: 'On-Page SEO Checker',
      description: 'Analyze titles, meta descriptions, H1-H6 tags, and images',
      category: 'Navigation',
      pageId: 'on-page',
      icon: FileText,
    },
    {
      id: 'nav-technical',
      keys: ['Ctrl', 'Shift', 'T'],
      action: 'Technical SEO Analyzer',
      description: 'Inspect HTTPS, status codes, TTFB latency, and compression',
      category: 'Navigation',
      pageId: 'technical',
      icon: Code2,
    },
    {
      id: 'nav-serp',
      keys: ['Ctrl', 'Shift', 'S'],
      action: 'SERP Google Preview',
      description: 'Simulate desktop and mobile search engine result snippets',
      category: 'Navigation',
      pageId: 'serp-preview',
      icon: Search,
    },
    {
      id: 'nav-ai-content',
      keys: ['Ctrl', 'Shift', 'A'],
      action: 'AI Content Optimizer',
      description: 'Enhance content depth, readability, and topic coverage',
      category: 'Navigation',
      pageId: 'ai-optimizer',
      icon: Sparkles,
    },

    // Tools
    {
      id: 'nav-keyword-research',
      keys: ['Ctrl', 'Shift', 'K'],
      action: 'Keyword Research Tool',
      description: 'Discover search volume tiers, intent, and keyword difficulty',
      category: 'Tools',
      pageId: 'keyword-research',
      icon: Search,
    },
    {
      id: 'nav-pagespeed',
      keys: ['Ctrl', 'Shift', 'P'],
      action: 'PageSpeed & Core Web Vitals',
      description: 'Analyze LCP, FCP, CLS, INP, and server response times',
      category: 'Tools',
      pageId: 'pagespeed',
      icon: Zap,
    },
    {
      id: 'nav-broken-links',
      keys: ['Ctrl', 'Shift', 'B'],
      action: 'Broken Link Checker',
      description: 'Scan pages for 404 dead ends, broken internal/external links',
      category: 'Tools',
      pageId: 'broken-links',
      icon: Link2,
    },
    {
      id: 'nav-schema',
      keys: ['Ctrl', 'Shift', 'M'],
      action: 'Schema Markup Generator',
      description: 'Generate valid JSON-LD tags for Google Rich Snippets',
      category: 'Tools',
      pageId: 'schema-generator',
      icon: Code2,
    },
    {
      id: 'nav-bulk',
      keys: ['Ctrl', 'Shift', 'L'],
      action: 'Bulk URL Checker',
      description: 'Batch inspect multiple website URLs simultaneously',
      category: 'Tools',
      pageId: 'bulk-checker',
      icon: Layers,
    },

    // Accessibility
    {
      id: 'acc-tab',
      keys: ['Tab'],
      action: 'Navigate Next Interactive Element',
      description: 'Move focus sequentially through links, buttons, and inputs',
      category: 'Accessibility',
    },
    {
      id: 'acc-shift-tab',
      keys: ['Shift', 'Tab'],
      action: 'Navigate Previous Element',
      description: 'Move focus backwards through interactive controls',
      category: 'Accessibility',
    },
    {
      id: 'acc-enter',
      keys: ['Enter'],
      action: 'Activate Selected Item',
      description: 'Select buttons, trigger searches, or submit audit forms',
      category: 'Accessibility',
    },
  ];

  // Global keydown listener for '?' and navigation triggers
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName);

      // '?' key triggers the modal (when not focused on a form input)
      if ((e.key === '?' && !isInput) || ((e.ctrlKey || e.metaKey) && e.key === '/' && !isInput)) {
        e.preventDefault();
        if (isControlled && controlledOnClose && isOpen) {
          controlledOnClose();
        } else if (!isControlled) {
          setInternalIsOpen((prev) => !prev);
        }
        return;
      }

      // Escape closes the modal
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        handleClose();
        return;
      }

      // If user is inside an input, do not trigger navigation hotkeys
      if (isInput) return;

      // Handle direct key combos when modal is not blocking
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();

        // Ctrl + H -> Home
        if (!e.shiftKey && key === 'h') {
          e.preventDefault();
          navigateTo('home');
          handleClose();
        }
        // Ctrl + Shift + C -> Checklist
        else if (e.shiftKey && key === 'c') {
          e.preventDefault();
          navigateTo('checklist');
          handleClose();
        }
        // Ctrl + Shift + U -> Audit
        else if (e.shiftKey && key === 'u') {
          e.preventDefault();
          navigateTo('audit');
          handleClose();
        }
        // Ctrl + Shift + O -> On-page
        else if (e.shiftKey && key === 'o') {
          e.preventDefault();
          navigateTo('on-page');
          handleClose();
        }
        // Ctrl + Shift + T -> Technical
        else if (e.shiftKey && key === 't') {
          e.preventDefault();
          navigateTo('technical');
          handleClose();
        }
        // Ctrl + Shift + S -> SERP
        else if (e.shiftKey && key === 's') {
          e.preventDefault();
          navigateTo('serp-preview');
          handleClose();
        }
        // Ctrl + Shift + A -> AI Content Optimizer
        else if (e.shiftKey && key === 'a') {
          e.preventDefault();
          navigateTo('ai-optimizer');
          handleClose();
        }
        // Ctrl + Shift + K -> Keyword Research
        else if (e.shiftKey && key === 'k') {
          e.preventDefault();
          navigateTo('keyword-research');
          handleClose();
        }
        // Ctrl + Shift + P -> PageSpeed
        else if (e.shiftKey && key === 'p') {
          e.preventDefault();
          navigateTo('pagespeed');
          handleClose();
        }
        // Ctrl + Shift + B -> Broken Links
        else if (e.shiftKey && key === 'b') {
          e.preventDefault();
          navigateTo('broken-links');
          handleClose();
        }
        // Ctrl + Shift + M -> Schema Generator
        else if (e.shiftKey && key === 'm') {
          e.preventDefault();
          navigateTo('schema-generator');
          handleClose();
        }
        // Ctrl + Shift + L -> Bulk Checker
        else if (e.shiftKey && key === 'l') {
          e.preventDefault();
          navigateTo('bulk-checker');
          handleClose();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, isControlled, controlledOnClose, navigateTo]);

  // Focus input whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setActiveCategory('All');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter shortcuts by activeCategory and searchQuery
  const filteredShortcuts = allShortcuts.filter((sc) => {
    const matchesCategory = activeCategory === 'All' || sc.category === activeCategory;
    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      sc.action.toLowerCase().includes(q) ||
      sc.description.toLowerCase().includes(q) ||
      sc.keys.some((k) => k.toLowerCase().includes(q)) ||
      sc.category.toLowerCase().includes(q)
    );
  });

  const handleShortcutClick = (sc: ShortcutItem) => {
    if (sc.pageId) {
      navigateTo(sc.pageId);
      handleClose();
    } else if (sc.id === 'quick-search' && onOpenSearch) {
      handleClose();
      onOpenSearch();
    }
  };

  const categories: Array<'All' | 'Navigation' | 'Tools' | 'Quick Actions' | 'Accessibility'> = [
    'All',
    'Navigation',
    'Tools',
    'Quick Actions',
    'Accessibility',
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 pt-16 sm:pt-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Keyboard className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id={titleId} className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  Keyboard Shortcuts
                </h2>
                <kbd className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm">
                  ?
                </kbd>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Fast keyboard navigation &amp; workflow triggers across the platform
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            title="Close (Esc)"
            aria-label="Close keyboard shortcuts dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-50/70 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search shortcuts (e.g., 'audit', 'Ctrl+K', 'navigation', 'search')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
              aria-label="Search available keyboard shortcuts"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                aria-label="Clear shortcut search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
            <span className="text-[11px] text-slate-400 font-medium ml-auto pl-2 shrink-0">
              {filteredShortcuts.length} {filteredShortcuts.length === 1 ? 'shortcut' : 'shortcuts'}
            </span>
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-2.5 flex-1 max-h-[55vh]">
          {filteredShortcuts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Keyboard className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No keyboard shortcuts found matching &quot;{searchQuery}&quot;
              </p>
              <p className="text-xs text-slate-500">
                Try searching for &quot;home&quot;, &quot;Ctrl&quot;, or switch category tabs above.
              </p>
            </div>
          ) : (
            filteredShortcuts.map((sc) => {
              const isClickable = !!sc.pageId || sc.id === 'quick-search';
              const Icon = sc.icon || Keyboard;

              return (
                <div
                  key={sc.id}
                  onClick={() => handleShortcutClick(sc)}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all ${
                    isClickable
                      ? 'cursor-pointer bg-white dark:bg-slate-900 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 border-slate-200/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-sm'
                      : 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800/60'
                  }`}
                  role={isClickable ? 'button' : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleShortcutClick(sc);
                    }
                  }}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {sc.action}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {sc.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {sc.description}
                      </p>
                    </div>
                  </div>

                  {/* Keyboard Key Combination Pill */}
                  <div className="flex items-center gap-1 sm:self-center shrink-0 self-end">
                    {sc.keys.map((k, kIdx) => (
                      <React.Fragment key={kIdx}>
                        {kIdx > 0 && <span className="text-slate-400 text-xs font-bold">+</span>}
                        <kbd className="px-2.5 py-1 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-blue-600 dark:text-blue-400 shadow-sm">
                          {k}
                        </kbd>
                      </React.Fragment>
                    ))}
                    {isClickable && (
                      <ArrowRight className="w-3.5 h-3.5 text-blue-500 ml-1.5 opacity-60 hidden sm:inline-block" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <CornerDownLeft className="w-3.5 h-3.5 text-blue-500" />
            <span>Click any navigation shortcut to jump directly to that tool</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border rounded font-mono font-bold text-[10px]">?</kbd> anywhere to toggle</span>
            <span>•</span>
            <span>Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border rounded font-mono font-bold text-[10px]">Esc</kbd> to exit</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export default and alias for backwards compatibility
export default KeyboardShortcuts;
export { KeyboardShortcuts as KeyboardShortcutsModal };
