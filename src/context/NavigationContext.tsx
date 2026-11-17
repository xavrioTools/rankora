import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuditReport } from '../types/seo';
import { useTheme } from './ThemeContext';

export type PageId =
  | 'home'
  | 'audit'
  | 'on-page'
  | 'off-page'
  | 'technical'
  | 'content'
  | 'keyword-stuffing'
  | 'keyword-research'
  | 'keyword-suggestions'
  | 'competitor'
  | 'pagespeed'
  | 'broken-links'
  | 'schema-generator'
  | 'meta-generator'
  | 'sitemap-generator'
  | 'robots-generator'
  | 'serp-preview'
  | 'ai-optimizer'
  | 'bulk-checker'
  | 'checklist'
  | 'about'
  | 'contact'
  | 'privacy';

interface NavigationContextType {
  currentPage: PageId;
  navigateTo: (page: PageId, targetUrl?: string) => void;
  sharedUrl: string;
  setSharedUrl: (url: string) => void;
  cachedReport: AuditReport | null;
  setCachedReport: (report: AuditReport | null) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [sharedUrl, setSharedUrl] = useState<string>('https://');
  const [cachedReport, setCachedReport] = useState<AuditReport | null>(null);
  const { theme, setTheme, toggleTheme } = useTheme();

  useEffect(() => {
    // Handle initial hash
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as PageId;
      if (hash && isValidPage(hash)) {
        setCurrentPage(hash);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = (page: PageId, targetUrl?: string) => {
    if (targetUrl) {
      setSharedUrl(targetUrl);
    }
    setCurrentPage(page);
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <NavigationContext.Provider
      value={{
        currentPage,
        navigateTo,
        sharedUrl,
        setSharedUrl,
        cachedReport,
        setCachedReport,
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

function isValidPage(id: string): id is PageId {
  const validPages: PageId[] = [
    'home',
    'audit',
    'on-page',
    'off-page',
    'technical',
    'content',
    'keyword-stuffing',
    'keyword-research',
    'keyword-suggestions',
    'competitor',
    'pagespeed',
    'broken-links',
    'schema-generator',
    'meta-generator',
    'sitemap-generator',
    'robots-generator',
    'serp-preview',
    'ai-optimizer',
    'bulk-checker',
    'checklist',
    'about',
    'contact',
    'privacy',
  ];
  return validPages.includes(id as PageId);
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
