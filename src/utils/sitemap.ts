export type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export interface SitemapEntry {
  url: string;
  changefreq: ChangeFreq;
  priority: string;
  lastmod: string;
}

export interface SitemapXmlOptions {
  includeLastmod?: boolean;
  includeChangefreq?: boolean;
  includePriority?: boolean;
}

export const CHANGEFREQ_OPTIONS: ChangeFreq[] = [
  'always',
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'never',
];

export const PRIORITY_OPTIONS = ['1.0', '0.9', '0.8', '0.7', '0.6', '0.5', '0.4', '0.3', '0.2', '0.1'];

const CHANGEFREQ_SET = new Set<string>(CHANGEFREQ_OPTIONS);
const MAX_SITEMAP_URL_LENGTH = 2048;

/**
 * Strips XML 1.0 disallowed control characters and escapes special XML entities.
 */
export function escapeXml(value: string): string {
  // Remove ASCII control chars disallowed in XML 1.0 except tab, LF, CR
  const cleaned = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  return cleaned
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Normalizes, validates, and sanitizes a user-entered URL for XML sitemap inclusion
 * according to the sitemaps.org 0.9 specification.
 */
export function normalizeSitemapUrl(raw: string): { valid: true; url: string } | { valid: false; error: string } {
  const trimmed = raw.replace(/[\u0000-\u001F\u007F]/g, '').trim();
  if (!trimmed) {
    return { valid: false, error: 'Please enter a URL.' };
  }

  if (/\s/.test(trimmed)) {
    return { valid: false, error: 'URL cannot contain spaces.' };
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'Only http:// and https:// URLs are supported.' };
    }
    if (parsed.username || parsed.password) {
      return { valid: false, error: 'URLs cannot contain embedded username or password credentials.' };
    }
    const host = parsed.hostname;
    if (
      !host ||
      !host.includes('.') ||
      host.startsWith('.') ||
      host.endsWith('.') ||
      host.includes('..')
    ) {
      return { valid: false, error: 'Please enter a valid domain name (e.g. https://example.com/page).' };
    }
    // Strip hash fragments since search engines ignore fragments in sitemaps
    parsed.hash = '';
    const finalHref = parsed.href;
    if (finalHref.length > MAX_SITEMAP_URL_LENGTH) {
      return { valid: false, error: `URL exceeds the ${MAX_SITEMAP_URL_LENGTH}-character sitemap limit.` };
    }
    return { valid: true, url: finalHref };
  } catch {
    return { valid: false, error: 'Invalid URL format. Example: https://example.com/about' };
  }
}

/**
 * Validates YYYY-MM-DD date string or falls back to today's ISO date.
 */
export function normalizeLastmod(value: string): string {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const parsed = new Date(`${trimmed}T00:00:00Z`);
    if (!Number.isNaN(parsed.getTime())) {
      return trimmed;
    }
  }
  return new Date().toISOString().split('T')[0];
}

/**
 * Normalizes changefreq to a valid sitemaps.org enum value.
 */
export function normalizeChangefreq(value: string): ChangeFreq {
  const lower = value.trim().toLowerCase();
  return CHANGEFREQ_SET.has(lower) ? (lower as ChangeFreq) : 'weekly';
}

/**
 * Normalizes priority to a valid decimal string between 0.0 and 1.0.
 */
export function normalizePriority(value: string): string {
  const num = Number.parseFloat(value);
  if (Number.isNaN(num)) return '0.8';
  const clamped = Math.max(0, Math.min(1, num));
  return clamped.toFixed(1);
}

/**
 * Generates a sitemaps.org 0.9 compliant XML sitemap string from validated entries.
 */
export function generateXmlSitemap(entries: SitemapEntry[], options: SitemapXmlOptions = {}): string {
  const {
    includeLastmod = true,
    includeChangefreq = true,
    includePriority = true,
  } = options;

  const validBlocks: string[] = [];
  const seenUrls = new Set<string>();

  for (const entry of entries) {
    const normalized = normalizeSitemapUrl(entry.url);
    if (!normalized.valid) continue;

    const dedupeKey = normalized.url.toLowerCase();
    if (seenUrls.has(dedupeKey)) continue;
    seenUrls.add(dedupeKey);

    const lines = [`  <url>`, `    <loc>${escapeXml(normalized.url)}</loc>`];
    if (includeLastmod && entry.lastmod) {
      lines.push(`    <lastmod>${escapeXml(normalizeLastmod(entry.lastmod))}</lastmod>`);
    }
    if (includeChangefreq && entry.changefreq) {
      lines.push(`    <changefreq>${escapeXml(normalizeChangefreq(entry.changefreq))}</changefreq>`);
    }
    if (includePriority && entry.priority) {
      lines.push(`    <priority>${escapeXml(normalizePriority(entry.priority))}</priority>`);
    }
    lines.push(`  </url>`);
    validBlocks.push(lines.join('\n'));
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...validBlocks,
    '</urlset>',
  ].join('\n');
}
