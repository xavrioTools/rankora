import React, { useState, useMemo } from 'react';
import {
  Wrench,
  Copy,
  Check,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Globe,
  Loader2,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

interface Rule {
  userAgent: string;
  disallows: string[];
  allows: string[];
  crawlDelay?: string;
  disallowsText?: string;
  allowsText?: string;
}

export function RobotsTxtPage() {
  const { sharedUrl } = useNavigation();
  const [rules, setRules] = useState<Rule[]>([
    {
      userAgent: '*',
      disallows: ['/admin/', '/private/', '/cart/', '/checkout/'],
      allows: ['/wp-admin/admin-ajax.php'],
      crawlDelay: '',
    },
    {
      userAgent: 'Googlebot-Image',
      disallows: ['/private-assets/'],
      allows: ['/'],
      crawlDelay: '',
    },
  ]);
  const [sitemapUrl, setSitemapUrl] = useState('https://example.com/sitemap.xml');
  const [copied, setCopied] = useState(false);

  // Live Fetch State
  const [fetchUrl, setFetchUrl] = useState(sharedUrl && sharedUrl !== 'https://' ? sharedUrl : '');
  const [fetching, setFetching] = useState(false);
  const [fetchMessage, setFetchMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  // Path Tester State
  const [testPath, setTestPath] = useState('/admin/dashboard');
  const [testBot, setTestBot] = useState('*');

  // Add rule
  const handleAddRule = () => {
    setRules([
      ...rules,
      { userAgent: 'Bingbot', disallows: ['/search/'], allows: ['/'], crawlDelay: '' },
    ]);
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  // Generate plain text
  const robotsOutput = useMemo(() => {
    const blocks = rules.map((r) => {
      let block = `User-agent: ${r.userAgent}\n`;
      if (r.disallows.length > 0) {
        block += r.disallows.map((d) => `Disallow: ${d}`).join('\n') + '\n';
      }
      if (r.allows.length > 0) {
        block += r.allows.map((a) => `Allow: ${a}`).join('\n') + '\n';
      }
      if (r.crawlDelay) {
        block += `Crawl-delay: ${r.crawlDelay}\n`;
      }
      return block.trim();
    });
    return `${blocks.join('\n\n')}\n\nSitemap: ${sitemapUrl}`;
  }, [rules, sitemapUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(robotsOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([robotsOutput], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Fetch Live robots.txt
  const handleFetchLive = async () => {
    const raw = fetchUrl.trim();
    if (!raw) return;

    setFetching(true);
    setFetchMessage(null);

    try {
      const res = await fetch('/api/fetch-robots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: raw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch robots.txt');

      if (data.found && Array.isArray(data.rules) && data.rules.length > 0) {
        setRules(data.rules);
        if (data.sitemapUrl) {
          setSitemapUrl(data.sitemapUrl);
        }
        setFetchMessage({
          type: 'success',
          text: `Imported ${data.rules.length} User-agent rule block(s) from ${data.robotsUrl} (HTTP ${data.status || 200}).`,
        });
      } else if (data.found) {
        if (data.sitemapUrl) {
          setSitemapUrl(data.sitemapUrl);
        }
        setFetchMessage({
          type: 'info',
          text: `Retrieved ${data.robotsUrl} (HTTP ${data.status || 200}), but it contains no User-agent directive blocks. Existing editor rules preserved.`,
        });
      } else {
        setFetchMessage({
          type: 'info',
          text:
            data.message ||
            `No live robots.txt found at ${data.robotsUrl || raw} (HTTP ${data.status || 404}). Existing editor draft preserved.`,
        });
      }
    } catch (err: any) {
      setFetchMessage({
        type: 'error',
        text: err.message || 'Could not retrieve robots.txt',
      });
    } finally {
      setFetching(false);
    }
  };

  // Simulate robots.txt path matching
  const testResult = useMemo(() => {
    let cleanPath = testPath.trim();
    if (!cleanPath.startsWith('/')) {
      cleanPath = '/' + cleanPath;
    }

    // 1. Find matching rule block for the requested bot
    let matchedRule = rules.find((r) => r.userAgent.toLowerCase() === testBot.toLowerCase());
    if (!matchedRule) {
      // Fallback to wildcard '*'
      matchedRule = rules.find((r) => r.userAgent === '*');
    }

    if (!matchedRule) {
      return {
        allowed: true,
        reason: 'No matching User-agent directive found. Crawlers default to allowed.',
        matchedDirective: 'Default (Allowed)',
      };
    }

    // 2. Evaluate Allow vs Disallow directives based on longest prefix match
    let longestAllow = '';
    for (const allow of matchedRule.allows) {
      if (allow === '/' || cleanPath.startsWith(allow)) {
        if (allow.length > longestAllow.length) {
          longestAllow = allow;
        }
      }
    }

    let longestDisallow = '';
    for (const disallow of matchedRule.disallows) {
      if (disallow && cleanPath.startsWith(disallow)) {
        if (disallow.length > longestDisallow.length) {
          longestDisallow = disallow;
        }
      }
    }

    // Google / REP RFC 9309 rule: longest match wins. If equal, Allow takes precedence.
    if (longestAllow.length >= longestDisallow.length && longestAllow.length > 0) {
      return {
        allowed: true,
        reason: `Explicitly allowed by rule: "Allow: ${longestAllow}"`,
        matchedDirective: `Allow: ${longestAllow}`,
      };
    }

    if (longestDisallow.length > longestAllow.length) {
      return {
        allowed: false,
        reason: `Blocked by rule: "Disallow: ${longestDisallow}" in [User-agent: ${matchedRule.userAgent}] block`,
        matchedDirective: `Disallow: ${longestDisallow}`,
      };
    }

    return {
      allowed: true,
      reason: 'No Disallow directive matched this path. Crawlers can index this page.',
      matchedDirective: 'Implicit Allow',
    };
  }, [rules, testPath, testBot]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold">
            <Wrench className="w-3.5 h-3.5" />
            <span>Crawler Directives &amp; Access Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Robots.txt Generator &amp; Syntax Validator
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Instruct Googlebot, Bingbot, and AI crawlers on which paths to index or ignore. Build valid User-Agent disallow blocks, test specific URLs with our real-time simulator, and link your XML sitemap.
          </p>
        </div>
      </div>

      {/* Live Import Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Import Existing Robots.txt from Website
            </span>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-xl">
            <input
              type="text"
              placeholder="e.g. example.com or https://example.com"
              value={fetchUrl}
              onChange={(e) => setFetchUrl(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleFetchLive}
              disabled={fetching || !fetchUrl.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
            >
              {fetching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{fetching ? 'Fetching...' : 'Fetch & Load'}</span>
            </button>
          </div>
        </div>

        {fetchMessage && (
          <div
            className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 ${
              fetchMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : fetchMessage.type === 'error'
                ? 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
            }`}
          >
            {fetchMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{fetchMessage.text}</span>
          </div>
        )}
      </div>

      {/* Interactive Path Tester / Simulator */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs uppercase tracking-wider">
                Live Simulator
              </span>
              <h2 className="text-lg font-bold text-white">Robots.txt Path Tester</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Verify if a specific crawler will be permitted or blocked on any path by your current rules.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
            <span>Quick test:</span>
            <button
              onClick={() => setTestPath('/admin/dashboard')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px]"
            >
              /admin/
            </button>
            <button
              onClick={() => setTestPath('/wp-admin/admin-ajax.php')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px]"
            >
              /wp-admin/ajax
            </button>
            <button
              onClick={() => setTestPath('/blog/seo-checklist')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px]"
            >
              /blog/
            </button>
            <button
              onClick={() => setTestPath('/cart/checkout')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px]"
            >
              /cart/
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              URL Path to Test
            </label>
            <input
              type="text"
              value={testPath}
              onChange={(e) => setTestPath(e.target.value)}
              placeholder="/admin/settings or /products/item"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-emerald-400 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              User-Agent Bot
            </label>
            <select
              value={testBot}
              onChange={(e) => setTestBot(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="*">* (All Search Bots)</option>
              <option value="Googlebot">Googlebot</option>
              <option value="Googlebot-Image">Googlebot-Image</option>
              <option value="Bingbot">Bingbot</option>
              <option value="Slurp">Yahoo Slurp</option>
              <option value="DuckDuckBot">DuckDuckBot</option>
              <option value="Baiduspider">Baiduspider</option>
            </select>
          </div>
        </div>

        {/* Live Result Card */}
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
            testResult.allowed
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
              : 'bg-red-950/40 border-red-800 text-red-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {testResult.allowed ? (
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-black uppercase tracking-wider ${
                    testResult.allowed ? 'bg-emerald-500 text-slate-950' : 'bg-red-500 text-white'
                  }`}
                >
                  {testResult.allowed ? 'ALLOWED' : 'BLOCKED'}
                </span>
                <span className="font-mono text-xs font-bold">
                  {testBot} &rarr; {testPath}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">{testResult.reason}</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Matched Directive</span>
            <code className="text-xs font-mono text-white font-bold">{testResult.matchedDirective}</code>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Visual Rule Builder */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Crawler Directives ({rules.length})
            </h2>
            <button
              onClick={handleAddRule}
              className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1 hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add User-Agent</span>
            </button>
          </div>

          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {rules.map((rule, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500">User-Agent:</span>
                    <select
                      value={rule.userAgent}
                      onChange={(e) => {
                        const upd = [...rules];
                        upd[idx].userAgent = e.target.value;
                        setRules(upd);
                      }}
                      className="p-1 bg-white dark:bg-slate-900 rounded border font-mono font-bold text-slate-900 dark:text-white"
                    >
                      <option value="*">* (All Search Bots)</option>
                      <option value="Googlebot">Googlebot</option>
                      <option value="Googlebot-Image">Googlebot-Image</option>
                      <option value="Googlebot-News">Googlebot-News</option>
                      <option value="Bingbot">Bingbot</option>
                      <option value="Slurp">Yahoo Slurp</option>
                      <option value="DuckDuckBot">DuckDuckBot</option>
                      <option value="Baiduspider">Baiduspider</option>
                      <option value="YandexBot">YandexBot</option>
                      <option value="GPTBot">GPTBot (OpenAI)</option>
                      <option value="CCBot">CCBot (Common Crawl)</option>
                    </select>
                  </div>

                  {rules.length > 1 && (
                    <button
                      onClick={() => handleRemoveRule(idx)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Disallowed Paths (comma separated)
                  </label>
                  <input
                    id="robots-txt-disallow-input"
                    type="text"
                    value={rule.disallowsText !== undefined ? rule.disallowsText : rule.disallows.join(', ')}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const parsed = raw
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean);
                      const upd = [...rules];
                      upd[idx] = {
                        ...upd[idx],
                        disallowsText: raw,
                        disallows: parsed,
                      };
                      setRules(upd);
                    }}
                    placeholder="/admin/, /cart/"
                    className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Allowed Paths (comma separated)
                  </label>
                  <input
                    id="robots-txt-allow-input"
                    type="text"
                    value={rule.allowsText !== undefined ? rule.allowsText : rule.allows.join(', ')}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const parsed = raw
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean);
                      const upd = [...rules];
                      upd[idx] = {
                        ...upd[idx],
                        allowsText: raw,
                        allows: parsed,
                      };
                      setRules(upd);
                    }}
                    placeholder="/"
                    className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Sitemap Location Directive
            </label>
            <input
              type="text"
              value={sitemapUrl}
              onChange={(e) => setSitemapUrl(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Live Output & Download */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Generated robots.txt
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download robots.txt</span>
                </button>
              </div>
            </div>

            <pre className="mt-4 p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-[380px] border border-slate-800 leading-relaxed">
              <code>{robotsOutput}</code>
            </pre>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>Valid Robots Exclusion Protocol (REP RFC 9309) syntax ready for deployment.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
