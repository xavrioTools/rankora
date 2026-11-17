import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { Heart, Sparkles, CheckCircle2, Keyboard } from 'lucide-react';
import { RankoraLogo } from './RankoraLogo';

export function Footer() {
  const { navigateTo } = useNavigation();

  return (
    <footer className="bg-white dark:bg-[#0c101c] border-t border-slate-200/90 dark:border-slate-800/90 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand & Manifesto Column */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={() => navigateTo('home')}
              className="text-left group cursor-pointer focus:outline-none"
            >
              <RankoraLogo size="md" />
            </button>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Professional, AI-assisted SEO audit &amp; optimization toolkit. Built for webmasters, agencies, developers, and creators. Smarter SEO. Open to Everyone.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 font-semibold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Rankora Open Access Commitment</span>
              </div>
              <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
                <li>• 100% Free Forever for all users</li>
                <li>• No credit cards or payment info required</li>
                <li>• No accounts, registration, or login walls</li>
                <li>• No artificial paywalls or locked tools</li>
              </ul>
            </div>
          </div>

          {/* Website Tools Column */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Website SEO
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => navigateTo('audit')}
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  SEO Website Audit
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('on-page')}
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  On-Page SEO Checker
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('technical')}
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Technical SEO Analyzer
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('pagespeed')}
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  PageSpeed Analyzer
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('broken-links')}
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Broken Link Checker
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('bulk-checker')}
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Bulk URL SEO Checker
                </button>
              </li>
            </ul>
          </div>

          {/* Content Tools Column */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Content & SERP
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => navigateTo('content')}
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Content SEO Analyzer
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('keyword-stuffing')}
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Keyword Stuffing Checker
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('ai-optimizer')}
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>AI Content Optimizer</span>
                  <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('serp-preview')}
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  SERP Preview Tool
                </button>
              </li>
            </ul>
          </div>

          {/* Keyword Tools Column */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Keyword Tools
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => navigateTo('keyword-research')}
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Keyword Research Tool
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('keyword-suggestions')}
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Keyword Suggestions Tool
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('competitor')}
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Competitor SEO Analyzer
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('off-page')}
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Off-Page SEO Checker
                </button>
              </li>
            </ul>
          </div>

          {/* Technical Generators & Company */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Generators & Info
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => navigateTo('schema-generator')}
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Schema Generator
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('meta-generator')}
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Meta Tag Generator
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('sitemap-generator')}
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  XML Sitemap Generator
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('robots-generator')}
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Robots.txt Generator
                </button>
              </li>
              <li className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => navigateTo('about')}
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  About Rankora
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('contact')}
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Contact & Feedback
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('privacy')}
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} Rankora. Smarter SEO. Open to Everyone. Real crawling, zero fake metrics.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }))}
              className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              title="Open Keyboard Shortcuts (?)"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Shortcuts (<kbd className="font-mono text-[11px] font-bold">?</kbd>)</span>
            </button>
            <span>•</span>
            <span>Server-side SSRF Protected</span>
            <span>•</span>
            <span>Zero Tracking Cookies</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for the open web
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
