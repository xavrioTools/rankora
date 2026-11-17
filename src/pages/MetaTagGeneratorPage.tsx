import React, { useState } from 'react';
import { Share2, Copy, Check, Search, Eye, Globe, Sparkles } from 'lucide-react';

export function MetaTagGeneratorPage() {
  const [title, setTitle] = useState('Rankora – Smarter SEO. Open to Everyone.');
  const [description, setDescription] = useState('Analyze your website, discover critical SEO issues, inspect meta tags and optimize ranking performance with our 100% free open-access SEO toolkit.');
  const [url, setUrl] = useState('https://rankora.app');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80');
  const [siteName, setSiteName] = useState('Rankora');
  const [twitterUser, setTwitterUser] = useState('@rankora_seo');
  const [activePreview, setActivePreview] = useState<'google' | 'facebook' | 'twitter'>('google');
  const [copied, setCopied] = useState(false);

  const titleChars = title.length;
  const descChars = description.length;

  const codeSnippet = `<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title" content="${title}">
<meta name="description" content="${description}">
<link rel="canonical" href="${url}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${imageUrl}">
<meta property="og:site_name" content="${siteName}">

<!-- Twitter / X -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${url}">
<meta property="twitter:title" content="${title}">
<meta property="twitter:description" content="${description}">
<meta property="twitter:image" content="${imageUrl}">
<meta name="twitter:creator" content="${twitterUser}">`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs font-bold">
            <Share2 className="w-3.5 h-3.5" />
            <span>Social &amp; SERP Tags</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Meta Tag &amp; Open Graph Generator
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Create optimized HTML meta tags for Google search results and rich social cards for Facebook, Twitter/X, and LinkedIn. Preview how your link will appear across platforms in real-time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Inputs */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Metadata Configuration
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Page Title (max 60 recommended)
                </label>
                <span className={titleChars > 60 ? 'text-red-500 font-bold' : 'text-slate-400 font-mono'}>
                  {titleChars} / 60
                </span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-sky-500 text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Meta Description (140–160 recommended)
                </label>
                <span className={descChars > 160 ? 'text-red-500 font-bold' : 'text-slate-400 font-mono'}>
                  {descChars} / 160
                </span>
              </div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-sky-500 text-sm leading-relaxed"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Canonical URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-sky-500 text-sm font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Social Share Image URL (1200x630 recommended)
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-sky-500 text-sm font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Twitter Handle
                </label>
                <input
                  type="text"
                  value={twitterUser}
                  onChange={(e) => setTwitterUser(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview & Code */}
        <div className="space-y-6">
          {/* Preview Tabs */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-sky-500" />
                <span>Live Share Card Simulator</span>
              </span>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setActivePreview('google')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activePreview === 'google' ? 'bg-white dark:bg-slate-900 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Google SERP
                </button>
                <button
                  onClick={() => setActivePreview('facebook')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activePreview === 'facebook' ? 'bg-white dark:bg-slate-900 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Facebook
                </button>
                <button
                  onClick={() => setActivePreview('twitter')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activePreview === 'twitter' ? 'bg-white dark:bg-slate-900 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Twitter / X
                </button>
              </div>
            </div>

            {/* Google Preview */}
            {activePreview === 'google' && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 max-w-xl">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-sans">
                  <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px]">
                    🌐
                  </div>
                  <span className="truncate">{url}</span>
                </div>
                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-400 hover:underline cursor-pointer leading-snug">
                  {title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                  {description}
                </p>
              </div>
            )}

            {/* Facebook Preview */}
            {activePreview === 'facebook' && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950 max-w-xl">
                <img
                  src={imageUrl}
                  alt="Social Preview"
                  className="w-full h-48 object-cover bg-slate-200 dark:bg-slate-800"
                  onError={(e) => {
                    (e.target as any).src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
                <div className="p-3 space-y-1">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold truncate">
                    {new URL(url).hostname || 'example.com'}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug truncate">
                    {title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{description}</p>
                </div>
              </div>
            )}

            {/* Twitter Preview */}
            {activePreview === 'twitter' && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950 max-w-xl">
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt="Twitter Card"
                    className="w-full h-44 object-cover bg-slate-200 dark:bg-slate-800"
                    onError={(e) => {
                      (e.target as any).src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80';
                    }}
                  />
                  <span className="absolute bottom-2 left-2 bg-slate-950/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {siteName}
                  </span>
                </div>
                <div className="p-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{description}</p>
                </div>
              </div>
            )}
          </div>

          {/* Generated Code Block */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                HTML Code (Embed in &lt;head&gt;)
              </span>
              <button
                onClick={handleCopy}
                className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied HTML!' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-sky-400 font-mono text-xs overflow-x-auto max-h-52 rounded-2xl border border-slate-800">
              <code>{codeSnippet}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
