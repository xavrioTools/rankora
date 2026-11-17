import React, { useState } from 'react';
import { Search, Smartphone, Monitor, Star, Globe, AlertCircle, CheckCircle2 } from 'lucide-react';

export function SerpPreviewPage() {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [title, setTitle] = useState('Rankora – Smarter SEO. Open to Everyone.');
  const [description, setDescription] = useState(
    'Audit your website with zero paywalls. Inspect on-page SEO, technical headers, Core Web Vitals, keyword density and AI-assisted content optimization.'
  );
  const [url, setUrl] = useState('https://rankora.app/tools/audit');
  const [date, setDate] = useState('Mar 15, 2026');
  const [showStars, setShowStars] = useState(true);
  const [rating, setRating] = useState('4.9');
  const [reviews, setReviews] = useState('248');

  // Approximate desktop pixel width for typical Arial 20px title font: ~9.5px per character
  const approxPixelWidth = Math.round(title.length * 9.6);
  const maxPixels = device === 'desktop' ? 600 : 680;
  const isTruncated = approxPixelWidth > maxPixels;

  // Format breadcrumbs: https://example.com/tools/audit -> example.com › tools › audit
  let breadcrumbs = 'example.com';
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    breadcrumbs = parsed.hostname + (parts.length > 0 ? ' › ' + parts.join(' › ') : '');
  } catch {
    breadcrumbs = url;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
            <Search className="w-3.5 h-3.5" />
            <span>Search Snippet Simulator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Google SERP Preview &amp; Pixel Width Meter
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Google measures snippet titles in pixels, not just raw character counts. Simulate your exact Google desktop and mobile search snippet, test rich star ratings, and prevent awkward title truncation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Configuration */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Snippet Elements
            </h2>

            {/* Device Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setDevice('desktop')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  device === 'desktop' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
              <button
                onClick={() => setDevice('mobile')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  device === 'mobile' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  SEO Title
                </label>
                <span className={isTruncated ? 'text-red-500 font-bold' : 'text-slate-500 font-mono'}>
                  ~{approxPixelWidth}px / {maxPixels}px ({title.length} chars)
                </span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Meta Description
                </label>
                <span className={description.length > 160 ? 'text-red-500 font-bold' : 'text-slate-500 font-mono'}>
                  {description.length} / 160 chars
                </span>
              </div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Display URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-xs outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Rich snippet toggles */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Include Star Rating (Schema Rich Snippet)
                </span>
                <input
                  type="checkbox"
                  checked={showStars}
                  onChange={(e) => setShowStars(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
              </div>

              {showStars && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-500 block mb-1">Rating Value</label>
                    <input
                      type="text"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-500 block mb-1">Review Count</label>
                    <input
                      type="text"
                      value={reviews}
                      onChange={(e) => setReviews(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Simulator View */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Google {device === 'desktop' ? 'Desktop' : 'Mobile'} Result Simulator
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  isTruncated
                    ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {isTruncated ? 'Likely Truncated' : 'Optimal Length'}
              </span>
            </div>

            {/* Google Search Result Box */}
            <div className="mt-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-sans">
              {/* Favicon & Breadcrumb */}
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs">
                  🌐
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {breadcrumbs.split(' › ')[0]}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{breadcrumbs}</div>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg sm:text-xl font-normal text-blue-800 dark:text-blue-400 hover:underline cursor-pointer leading-snug">
                {title}
                {isTruncated && <span className="text-slate-400"> ...</span>}
              </h3>

              {/* Rich snippet stars */}
              {showStars && (
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mt-1">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Rating: {rating}
                  </span>
                  <span>·</span>
                  <span>{reviews} reviews</span>
                </div>
              )}

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
                {date && <span className="text-slate-400 font-medium mr-1.5">{date} —</span>}
                {description}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-300 space-y-1">
            <div className="font-bold">Pro-Tip for Maximum Click-Through Rate (CTR):</div>
            <p className="leading-relaxed">
              Place your target keyword near the beginning of the title and include an engaging action verb (e.g. &quot;Discover&quot;, &quot;Analyze&quot;, &quot;Master&quot;) in the meta description.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
