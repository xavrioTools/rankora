import React from 'react';
import { useNavigation, PageId } from '../context/NavigationContext';
import { ChevronRight, Home } from 'lucide-react';

const PAGE_METADATA: Record<PageId, { title: string; category: string }> = {
  home: { title: 'Dashboard', category: 'Overview' },
  audit: { title: 'Website SEO Audit', category: 'Website Audits' },
  'on-page': { title: 'On-Page SEO Checker', category: 'Website Audits' },
  'off-page': { title: 'Off-Page SEO Checker', category: 'Website Audits' },
  competitor: { title: 'Competitor SEO Analyzer', category: 'Website Audits' },
  technical: { title: 'Technical SEO Analyzer', category: 'Technical Diagnostics' },
  pagespeed: { title: 'PageSpeed Analyzer', category: 'Technical Diagnostics' },
  'broken-links': { title: 'Broken Link Checker', category: 'Technical Diagnostics' },
  'bulk-checker': { title: 'Bulk URL SEO Checker', category: 'Technical Diagnostics' },
  content: { title: 'Content SEO Analyzer', category: 'Content & SERP' },
  'keyword-stuffing': { title: 'Keyword Stuffing Checker', category: 'Content & SERP' },
  'ai-optimizer': { title: 'AI Content Optimizer', category: 'Content & SERP' },
  'serp-preview': { title: 'SERP Preview Tool', category: 'Content & SERP' },
  'keyword-research': { title: 'Keyword Research Tool', category: 'Keyword Intelligence' },
  'keyword-suggestions': { title: 'Keyword Suggestions Tool', category: 'Keyword Intelligence' },
  'schema-generator': { title: 'Schema Markup Generator', category: 'Markup & Utilities' },
  'meta-generator': { title: 'Meta Tag Generator', category: 'Markup & Utilities' },
  'sitemap-generator': { title: 'XML Sitemap Generator', category: 'Markup & Utilities' },
  'robots-generator': { title: 'Robots.txt Generator', category: 'Markup & Utilities' },
  checklist: { title: 'Interactive SEO Checklist', category: 'Milestones' },
  about: { title: 'About Rankora', category: 'Company' },
  contact: { title: 'Contact & Feedback', category: 'Company' },
  privacy: { title: 'Privacy Policy', category: 'Company' },
};

export function Breadcrumbs() {
  const { currentPage, navigateTo } = useNavigation();

  if (currentPage === 'home') return null;

  const current = PAGE_METADATA[currentPage] || { title: 'Tool', category: 'Tools' };

  return (
    <nav
      aria-label="Breadcrumbs"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium"
    >
      <button
        onClick={() => navigateTo('home')}
        className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
        title="Return to Rankora Dashboard"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Rankora</span>
      </button>

      <span className="text-slate-300 dark:text-slate-600 select-none">/</span>

      <span className="text-slate-600 dark:text-slate-400">
        {current.category}
      </span>

      <span className="text-slate-300 dark:text-slate-600 select-none">/</span>

      <span className="font-semibold text-slate-900 dark:text-white truncate">
        {current.title}
      </span>
    </nav>
  );
}
