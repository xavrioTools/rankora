export type PageCategory =
  | 'website'
  | 'content'
  | 'keywords'
  | 'technical'
  | 'company';

export interface AuditIssue {
  id: string;
  category: 'on-page' | 'technical' | 'content' | 'links' | 'off-page';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'warning' | 'passed';
  title: string;
  affected: string;
  whyItMatters: string;
  solution: string;
  suggestedFix?: string;
}

export interface CrawledPageSummary {
  url: string;
  status: number;
  title: string;
  metaDesc: string;
  wordCount: number;
  issuesCount: number;
  isDuplicateTitle?: boolean;
  isDuplicateMetaDesc?: boolean;
  responseTimeMs: number;
}

export interface OffPageDetails {
  socialLinks: Array<{ platform: string; url: string }>;
  referringDomainsEst: number | null;
  backlinkCountEst: number | null;
  dofollowCount: number;
  nofollowCount: number;
  suspiciousSignals: string[];
  apiStatusNote: string;
  has3pCoverage: boolean;
}

export interface AuditReport {
  url: string;
  timestamp: string;
  httpStatus: number;
  responseTimeMs: number;
  pageSizeKb: number;
  crawlDepth?: number;
  crawledPagesCount?: number;
  crawledPages?: CrawledPageSummary[];
  redirectChain?: Array<{ url: string; status: number }>;
  robotsTxtFound?: boolean;
  robotsTxtStatus?: number | null;
  sitemapUrl?: string;
  sitemapStatus?: number | null;
  sitemapUrlCount?: number | null;
  scores: {
    overall: number;
    onPage: number;
    technical: number;
    content: number;
    offPage: number;
  };
  counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    warnings: number;
    passed: number;
  };
  pageInfo: {
    title: string;
    titleLength: number;
    metaDescription: string;
    metaDescriptionLength: number;
    canonical: string;
    robotsMeta: string;
    xRobotsTag?: string;
    viewport: string;
    charset: string;
    language: string;
    favicon: string;
    isHttps: boolean;
    hasHsts: boolean;
    hasXFrameOptions: boolean;
    hasContentSecurityPolicy: boolean;
    compression: string;
  };
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
    h4: string[];
    h5: string[];
    h6: string[];
  };
  images: {
    total: number;
    withAlt: number;
    missingAlt: number;
    withoutLazyLoading?: number;
    sample: Array<{ src: string; alt: string; hasAlt: boolean; loading?: string }>;
  };
  links: {
    internalCount: number;
    externalCount: number;
    nofollowCount: number;
    sample: Array<{ href: string; text: string; isInternal: boolean; isNofollow: boolean }>;
  };
  content: {
    wordCount: number;
    sentenceCount: number;
    paragraphCount?: number;
    avgSentenceLength?: number;
    readingEase: number;
    readingLevel?: string;
    topKeywords: Array<{ keyword: string; count: number; density: number }>;
  };
  openGraph: {
    title: string;
    description: string;
    image: string;
    url: string;
    type: string;
    siteName: string;
  };
  twitterCard: {
    card: string;
    title: string;
    description: string;
    image: string;
  };
  schemas: any[];
  offPage: OffPageDetails;
  issues: AuditIssue[];
}

export interface KeywordResult {
  keyword: string;
  intent: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';
  difficulty: number | null;
  difficultyLabel: 'Easy' | 'Moderate' | 'Hard' | 'Unavailable';
  volumeTier: string | null;
  cpcEstimate: string | null;
  isSearchVolumeBacked?: boolean;
  category: string;
}

export interface BrokenLinkItem {
  href: string;
  anchorText: string;
  isInternal: boolean;
  status: number;
  statusText: string;
  timeMs: number;
  isBroken: boolean;
}

export interface BulkUrlItem {
  url: string;
  finalUrl: string;
  status: number;
  title: string;
  titleLength: number;
  metaDesc: string;
  metaDescLength: number;
  h1Count: number;
  isHttps: boolean;
  responseTimeMs: number;
  score: number;
  success: boolean;
}

export interface LighthouseSeoAuditItem {
  id: string;
  title: string;
  description: string;
  score: number | null;
  displayValue: string | null;
  passed: boolean | null;
}

export interface TechnicalAuditResponse {
  url: string;
  requestedUrl: string;
  auditedAt: string;
  dataSources: string[];
  technicalScore: number;
  status: {
    httpStatus: number | null;
    statusLabel: string;
    isHttps: boolean;
    ttfbMs: number | null;
    htmlSizeKb: number | null;
    compression: string;
    redirectChain: Array<{ url: string; status: number }>;
    redirectHops: number;
  };
  securityHeaders: {
    hsts: boolean;
    xFrameOptions: boolean;
    contentSecurityPolicy: boolean;
  };
  crawlability: {
    robotsTxtFound: boolean;
    robotsTxtStatus: number | null;
    robotsTxtAllowed: boolean;
    disallowedPathsCount: number;
    sitemapUrl: string;
    sitemapStatus: number | null;
    sitemapUrlCount: number | null;
    robotsMeta: string;
    xRobotsTag: string;
    isCrawlable: boolean;
    isIndexable: boolean;
    canonicalUrl: string;
    canonicalStatus: number | null;
    canonicalMatchesFinal: boolean;
    internalLinksCount: number;
    externalLinksCount: number;
    nofollowLinksCount: number;
  };
  lighthouseSeo: {
    available: boolean;
    source: string;
    seoScore: number | null;
    bestPracticesScore: number | null;
    audits: LighthouseSeoAuditItem[];
    error?: string;
  };
  auditReport: AuditReport | null;
}

