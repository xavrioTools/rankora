import React, { useEffect, useMemo, useState } from 'react';
import {
  Layers,
  Copy,
  Check,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  Globe,
  Loader2,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import {
  CHANGEFREQ_OPTIONS,
  ChangeFreq,
  PRIORITY_OPTIONS,
  SitemapEntry,
  escapeXml,
  normalizeChangefreq,
  normalizeLastmod,
  normalizePriority,
  normalizeSitemapUrl,
} from '../utils/sitemap';

const getTodayIsoDate = () => new Date().toISOString().split('T')[0];

export function XmlSitemapPage() {
  const { sharedUrl } = useNavigation();
  const today = getTodayIsoDate();

  const [entries, setEntries] = useState<SitemapEntry[]>([
    { url: 'https://example.com/', changefreq: 'daily', priority: '1.0', lastmod: today },
    { url: 'https://example.com/about', changefreq: 'monthly', priority: '0.8', lastmod: today },
    { url: 'https://example.com/blog', changefreq: 'weekly', priority: '0.9', lastmod: today },
    { url: 'https://example.com/contact', changefreq: 'monthly', priority: '0.7', lastmod: today },
  ]);

  const [newUrl, setNewUrl] = useState('');
  const [defaultChangefreq, setDefaultChangefreq] = useState<ChangeFreq>('weekly');
  const [defaultPriority, setDefaultPriority] = useState('0.8');
  const [urlError, setUrlError] = useState<string | null>(null);

  const [bulkInput, setBulkInput] = useState('');
  const [bulkMessage, setBulkMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [includeLastmod, setIncludeLastmod] = useState(true);
  const [includeChangefreq, setIncludeChangefreq] = useState(true);
  const [includePriority, setIncludePriority] = useState(true);

  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [previousEntries, setPreviousEntries] = useState<SitemapEntry[] | null>(null);

  // Auto-Extract from live website
  const [crawlUrl, setCrawlUrl] = useState(sharedUrl && sharedUrl !== 'https://' ? sharedUrl : '');
  const [crawling, setCrawling] = useState(false);
  const [extractMessage, setExtractMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (sharedUrl && sharedUrl !== 'https://') {
      setCrawlUrl(sharedUrl);
    }
  }, [sharedUrl]);

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setUrlError(null);

    const normalized = normalizeSitemapUrl(newUrl);
    if (!normalized.valid) {
      setUrlError(normalized.error);
      return;
    }

    const exists = entries.some((entry) => entry.url.toLowerCase() === normalized.url.toLowerCase());
    if (exists) {
      setUrlError('This URL is already in your sitemap list.');
      return;
    }

    setPreviousEntries(null);
    setEntries((prev) => [
      ...prev,
      {
        url: normalized.url,
        changefreq: defaultChangefreq,
        priority: defaultPriority,
        lastmod: getTodayIsoDate(),
      },
    ]);
    setNewUrl('');
  };

  const handleBulkAdd = () => {
    setBulkMessage(null);
    const rawTokens = bulkInput
      .split(/\r?\n/)
      .flatMap((line) => (line.includes(',') && !line.includes('?') ? line.split(',') : [line]))
      .map((l) => l.trim())
      .filter(Boolean);

    if (rawTokens.length === 0) return;

    const existingSet = new Set(entries.map((e) => e.url.toLowerCase()));
    const added: SitemapEntry[] = [];
    let invalidCount = 0;
    let duplicateCount = 0;

    for (const token of rawTokens) {
      const res = normalizeSitemapUrl(token);
      if (!res.valid) {
        invalidCount++;
        continue;
      }
      const key = res.url.toLowerCase();
      if (existingSet.has(key)) {
        duplicateCount++;
        continue;
      }
      existingSet.add(key);
      added.push({
        url: res.url,
        changefreq: defaultChangefreq,
        priority: defaultPriority,
        lastmod: getTodayIsoDate(),
      });
    }

    if (added.length > 0) {
      setPreviousEntries(null);
      setEntries((prev) => [...prev, ...added]);
      setBulkInput('');
    }

    if (added.length === 0) {
      setBulkMessage({
        type: 'error',
        text: `No new URLs added (${duplicateCount} duplicate, ${invalidCount} invalid).`,
      });
    } else {
      const notes: string[] = [];
      if (duplicateCount > 0) notes.push(`${duplicateCount} duplicate skipped`);
      if (invalidCount > 0) notes.push(`${invalidCount} invalid skipped`);
      setBulkMessage({
        type: 'success',
        text: `Added ${added.length} URL${added.length > 1 ? 's' : ''}${notes.length ? ` (${notes.join(', ')})` : ''}.`,
      });
    }
  };

  const handleRemove = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    if (entries.length === 0) return;
    setPreviousEntries(entries);
    setEntries([]);
    setUrlError(null);
    setBulkMessage(null);
  };

  const handleUndoClear = () => {
    if (previousEntries && previousEntries.length > 0) {
      setEntries(previousEntries);
      setPreviousEntries(null);
    }
  };

  // Crawl and extract links
  const handleExtractFromWebsite = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const normalizedTarget = normalizeSitemapUrl(crawlUrl);
    if (!normalizedTarget.valid) {
      setExtractMessage({ type: 'error', text: normalizedTarget.error });
      return;
    }

    setCrawling(true);
    setExtractMessage(null);
    const target = normalizedTarget.url;

    try {
      const res = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to crawl website for links');

      const currentDate = getTodayIsoDate();
      const foundUrls = new Set<string>();

      const baseUrl = typeof data.url === 'string' && data.url ? data.url : target;
      const baseNormalized = normalizeSitemapUrl(baseUrl);
      if (baseNormalized.valid) {
        foundUrls.add(baseNormalized.url);
      }

      if (Array.isArray(data.crawledPages)) {
        for (const page of data.crawledPages) {
          if (page?.url) {
            const norm = normalizeSitemapUrl(page.url);
            if (norm.valid) foundUrls.add(norm.url);
          }
        }
      }

      // Extract internal links from sample
      if (data.links && Array.isArray(data.links.sample)) {
        for (const lnk of data.links.sample) {
          if (lnk.isInternal && lnk.href) {
            try {
              const abs = new URL(lnk.href, baseUrl);
              const norm = normalizeSitemapUrl(abs.href);
              if (norm.valid) {
                foundUrls.add(norm.url);
              }
            } catch {
              // Ignore invalid url strings
            }
          }
        }
      }

      const newEntries: SitemapEntry[] = Array.from(foundUrls).map((u, i) => ({
        url: u,
        changefreq: i === 0 ? 'daily' : defaultChangefreq,
        priority: i === 0 ? '1.0' : defaultPriority,
        lastmod: currentDate,
      }));

      setPreviousEntries(null);
      setEntries(newEntries);
      setExtractMessage({
        type: 'success',
        text: `Successfully discovered and populated ${newEntries.length} internal URL${newEntries.length === 1 ? '' : 's'} from ${baseUrl}!`,
      });
    } catch (err: any) {
      setExtractMessage({
        type: 'error',
        text: err.message || 'Error extracting links from website',
      });
    } finally {
      setCrawling(false);
    }
  };

  const xmlOutput = useMemo(() => {
    const seen = new Set<string>();
    const urlNodes: string[] = [];

    for (const entry of entries) {
      const normalized = normalizeSitemapUrl(entry.url);
      if (!normalized.valid) continue;

      const dedupeKey = normalized.url.toLowerCase();
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      const childTags: string[] = [`    <loc>${escapeXml(normalized.url)}</loc>`];
      if (includeLastmod && entry.lastmod) {
        childTags.push(`    <lastmod>${escapeXml(normalizeLastmod(entry.lastmod))}</lastmod>`);
      }
      if (includeChangefreq && entry.changefreq) {
        childTags.push(`    <changefreq>${escapeXml(normalizeChangefreq(entry.changefreq))}</changefreq>`);
      }
      if (includePriority && entry.priority) {
        childTags.push(`    <priority>${escapeXml(normalizePriority(entry.priority))}</priority>`);
      }

      urlNodes.push(['  <url>', ...childTags, '  </url>'].join('\n'));
    }

    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urlNodes,
      '</urlset>',
    ].join('\n');
  }, [entries, includeLastmod, includeChangefreq, includePriority]);

  const xmlValidation = useMemo(() => {
    const byteSize = new Blob([xmlOutput]).size;
    const sizeLabel = byteSize < 1024 ? `${byteSize} B` : `${(byteSize / 1024).toFixed(1)} KB`;
    let isWellFormed = true;
    if (typeof DOMParser !== 'undefined') {
      try {
        const doc = new DOMParser().parseFromString(xmlOutput, 'application/xml');
        isWellFormed = doc.getElementsByTagName('parsererror').length === 0;
      } catch {
        isWellFormed = true;
      }
    }
    return { sizeLabel, isWellFormed };
  }, [xmlOutput]);

  const handleCopy = async () => {
    if (entries.length === 0) return;
    try {
      await navigator.clipboard.writeText(xmlOutput);
    } catch {
      // Fallback for restricted iframe clipboard contexts
      const textarea = document.createElement('textarea');
      textarea.value = xmlOutput;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (entries.length === 0 || !xmlValidation.isWellFormed) return;

    const blob = new Blob([xmlOutput], { type: 'application/xml;charset=utf-8' });
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = 'sitemap.xml';
    link.rel = 'noopener';
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.setTimeout(() => {
      window.URL.revokeObjectURL(objectUrl);
    }, 1000);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span>Search Engine Index Map</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            XML Sitemap Generator
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Generate compliant XML sitemaps compatible with Google Search Console and Bing Webmaster Tools. Auto-extract internal URLs directly from your live website, adjust crawling priorities, and download your ready-to-deploy <code className="text-emerald-600 dark:text-emerald-400 font-mono">sitemap.xml</code> file.
          </p>
        </div>
      </div>

      {/* Auto-Extract from Live Website Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <form
          onSubmit={handleExtractFromWebsite}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Auto-Extract Internal Pages from Website
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 max-w-xl">
            <input
              type="text"
              placeholder="e.g. example.com or https://example.com"
              value={crawlUrl}
              onChange={(e) => setCrawlUrl(e.target.value)}
              disabled={crawling}
              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={crawling || !crawlUrl.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
            >
              {crawling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{crawling ? 'Extracting...' : 'Crawl & Populate'}</span>
            </button>
          </div>
        </form>

        {extractMessage && (
          <div
            className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 ${
              extractMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}
          >
            {extractMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{extractMessage.text}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Manage Sitemap URLs ({entries.length})
            </h2>
            {entries.length > 0 ? (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-red-500 hover:text-red-600 font-bold cursor-pointer"
              >
                Clear All
              </button>
            ) : previousEntries && previousEntries.length > 0 ? (
              <button
                type="button"
                onClick={handleUndoClear}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Undo Clear ({previousEntries.length})</span>
              </button>
            ) : null}
          </div>

          {/* Single Add */}
          <form onSubmit={handleAdd} className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="https://example.com/new-page"
                value={newUrl}
                onChange={(e) => {
                  setNewUrl(e.target.value);
                  if (urlError) setUrlError(null);
                }}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add URL</span>
              </button>
            </div>

            {urlError && (
              <div className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{urlError}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <label className="flex items-center gap-1.5">
                <span className="font-semibold">Default Freq:</span>
                <select
                  value={defaultChangefreq}
                  onChange={(e) => setDefaultChangefreq(e.target.value as ChangeFreq)}
                  className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium"
                >
                  {CHANGEFREQ_OPTIONS.map((freq) => (
                    <option key={freq} value={freq}>
                      {freq}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-1.5">
                <span className="font-semibold">Default Priority:</span>
                <select
                  value={defaultPriority}
                  onChange={(e) => setDefaultPriority(e.target.value)}
                  className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono"
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </form>

          {/* Bulk Paste */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
              Or Paste Multiple URLs (One per line)
            </label>
            <textarea
              rows={3}
              value={bulkInput}
              onChange={(e) => {
                setBulkInput(e.target.value);
                if (bulkMessage) setBulkMessage(null);
              }}
              placeholder={'https://example.com/page-1\nhttps://example.com/page-2'}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            />
            {bulkInput.trim() && (
              <button
                type="button"
                onClick={handleBulkAdd}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Append Bulk URLs
              </button>
            )}
            {bulkMessage && (
              <div
                className={`text-xs flex items-center gap-1.5 ${
                  bulkMessage.type === 'success'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {bulkMessage.type === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{bulkMessage.text}</span>
              </div>
            )}
          </div>

          {/* Current Entries Table */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {entries.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                No URLs currently added. Type a URL above or use the website extractor.
              </div>
            ) : (
              entries.map((entry, idx) => (
                <div
                  key={entry.url}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-2 text-xs bg-slate-50/50 dark:bg-slate-800/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-mono text-slate-900 dark:text-white break-all min-w-0 flex-1">
                      {entry.url}
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${entry.url}`}
                      onClick={() => handleRemove(idx)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                    <select
                      aria-label="Change frequency"
                      value={entry.changefreq}
                      onChange={(e) => {
                        const val = e.target.value as ChangeFreq;
                        setEntries((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, changefreq: val } : item))
                        );
                      }}
                      className="px-2 py-1 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      {CHANGEFREQ_OPTIONS.map((freq) => (
                        <option key={freq} value={freq}>
                          {freq}
                        </option>
                      ))}
                    </select>

                    <select
                      aria-label="Priority"
                      value={entry.priority}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEntries((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, priority: val } : item))
                        );
                      }}
                      className="px-2 py-1 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                    >
                      {PRIORITY_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>

                    <input
                      type="date"
                      aria-label="Last modified date"
                      value={entry.lastmod}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEntries((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, lastmod: val } : item))
                        );
                      }}
                      className="px-2 py-1 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* XML Preview & Actions */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Generated sitemap.xml
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={entries.length === 0}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied XML!' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={entries.length === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  {downloaded ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{downloaded ? 'Downloaded!' : 'Download .xml'}</span>
                </button>
              </div>
            </div>

            {/* Optional XML tag toggles */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLastmod}
                  onChange={(e) => setIncludeLastmod(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-mono">&lt;lastmod&gt;</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeChangefreq}
                  onChange={(e) => setIncludeChangefreq(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-mono">&lt;changefreq&gt;</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePriority}
                  onChange={(e) => setIncludePriority(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-mono">&lt;priority&gt;</span>
              </label>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[380px] border border-slate-800 leading-relaxed">
              <code>{xmlOutput}</code>
            </pre>
          </div>

          {entries.length > 0 && xmlValidation.isWellFormed ? (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>
                Valid sitemaps.org XML schema specification ({entries.length} URL{entries.length === 1 ? '' : 's'} · {xmlValidation.sizeLabel}). Ready for Google Search Console submission.
              </span>
            </div>
          ) : entries.length > 0 && !xmlValidation.isWellFormed ? (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-2 text-xs text-red-800 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>XML validation detected malformed characters. Please check your URL entries.</span>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
              <span>Add at least one URL to generate and download a valid sitemap.xml file.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
