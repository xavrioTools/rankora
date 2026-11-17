import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { HomePage } from './pages/Home';
import { WebsiteAuditPage } from './pages/WebsiteAuditPage';
import { OnPageSeoPage } from './pages/OnPageSeoPage';
import { OffPageSeoPage } from './pages/OffPageSeoPage';
import { TechnicalSeoPage } from './pages/TechnicalSeoPage';
import { ContentSeoPage } from './pages/ContentSeoPage';
import { KeywordStuffingPage } from './pages/KeywordStuffingPage';
import { KeywordResearchPage } from './pages/KeywordResearchPage';
import { KeywordSuggestionsPage } from './pages/KeywordSuggestionsPage';
import { CompetitorSeoPage } from './pages/CompetitorSeoPage';
import { PageSpeedPage } from './pages/PageSpeedPage';
import { BrokenLinkPage } from './pages/BrokenLinkPage';
import { SchemaGeneratorPage } from './pages/SchemaGeneratorPage';
import { MetaTagGeneratorPage } from './pages/MetaTagGeneratorPage';
import { XmlSitemapPage } from './pages/XmlSitemapPage';
import { RobotsTxtPage } from './pages/RobotsTxtPage';
import { SerpPreviewPage } from './pages/SerpPreviewPage';
import { AiContentOptimizerPage } from './pages/AiContentOptimizerPage';
import { BulkUrlCheckerPage } from './pages/BulkUrlCheckerPage';
import { SeoChecklistPage } from './pages/SeoChecklistPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';

import { Breadcrumbs } from './components/Breadcrumbs';

function MainRouter() {
  const { currentPage } = useNavigation();

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'audit':
        return <WebsiteAuditPage />;
      case 'on-page':
        return <OnPageSeoPage />;
      case 'off-page':
        return <OffPageSeoPage />;
      case 'technical':
        return <TechnicalSeoPage />;
      case 'content':
        return <ContentSeoPage />;
      case 'keyword-stuffing':
        return <KeywordStuffingPage />;
      case 'keyword-research':
        return <KeywordResearchPage />;
      case 'keyword-suggestions':
        return <KeywordSuggestionsPage />;
      case 'competitor':
        return <CompetitorSeoPage />;
      case 'pagespeed':
        return <PageSpeedPage />;
      case 'broken-links':
        return <BrokenLinkPage />;
      case 'schema-generator':
        return <SchemaGeneratorPage />;
      case 'meta-generator':
        return <MetaTagGeneratorPage />;
      case 'sitemap-generator':
        return <XmlSitemapPage />;
      case 'robots-generator':
        return <RobotsTxtPage />;
      case 'serp-preview':
        return <SerpPreviewPage />;
      case 'ai-optimizer':
        return <AiContentOptimizerPage />;
      case 'bulk-checker':
        return <BulkUrlCheckerPage />;
      case 'checklist':
        return <SeoChecklistPage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'privacy':
        return <PrivacyPolicyPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfe] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />
      <Breadcrumbs />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NavigationProvider>
        <MainRouter />
      </NavigationProvider>
    </ThemeProvider>
  );
}
