import React, { useState } from 'react';
import { Flame, AlertTriangle, CheckCircle2, Search, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

export function KeywordStuffingPage() {
  const [content, setContent] = useState(
    `Looking for the best coffee maker? Our best coffee maker guide helps you buy the best coffee maker online. When you want the best coffee maker, this coffee maker makes the best coffee. Buy your coffee maker today and get the best coffee maker deal.`
  );
  const [targetKeyword, setTargetKeyword] = useState('coffee maker');

  // Analyze n-grams
  const words = content.toLowerCase().match(/\b[a-z0-9'-]{2,}\b/g) || [];
  const totalWords = words.length;

  const stopWords = new Set([
    'the', 'and', 'for', 'that', 'this', 'with', 'you', 'have', 'are', 'from',
    'not', 'your', 'all', 'can', 'was', 'our', 'will', 'about', 'more', 'when',
    'they', 'what', 'their', 'which', 'there', 'who', 'been', 'out', 'into',
  ]);

  // Single words
  const singleFreq: Record<string, number> = {};
  for (const w of words) {
    if (!stopWords.has(w)) singleFreq[w] = (singleFreq[w] || 0) + 1;
  }

  // 2-word phrases
  const twoWordFreq: Record<string, number> = {};
  for (let i = 0; i < words.length - 1; i++) {
    const p = `${words[i]} ${words[i + 1]}`;
    if (!stopWords.has(words[i]) || !stopWords.has(words[i + 1])) {
      twoWordFreq[p] = (twoWordFreq[p] || 0) + 1;
    }
  }

  // Target keyword specific stats
  const targetCount = targetKeyword.trim()
    ? (
        content
          .toLowerCase()
          .match(new RegExp(`\\b${targetKeyword.trim().toLowerCase()}\\b`, 'g')) || []
      ).length
    : 0;

  const targetWordsCount = targetKeyword.trim().split(/\s+/).length;
  const targetDensity =
    totalWords > 0 && targetKeyword.trim()
      ? Number((((targetCount * targetWordsCount) / totalWords) * 100).toFixed(1))
      : 0;

  // Stuffed terms (> 3% with at least 3 occurrences)
  const stuffedSingles = Object.entries(singleFreq)
    .filter(([_, count]) => count >= 3 && (count / Math.max(totalWords, 1)) * 100 > 3.0)
    .sort((a, b) => b[1] - a[1]);

  const stuffedPairs = Object.entries(twoWordFreq)
    .filter(([_, count]) => count >= 3 && ((count * 2) / Math.max(totalWords, 1)) * 100 > 3.0)
    .sort((a, b) => b[1] - a[1]);

  const isStuffed = targetDensity > 3.0 || stuffedSingles.length > 0 || stuffedPairs.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-bold">
            <Flame className="w-3.5 h-3.5" />
            <span>Over-Optimization &amp; Penalty Guard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Keyword Stuffing Checker
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Repeatedly repeating keywords disrupts user experience and triggers algorithmic demotions from Google’s Helpful Content and spam systems. Verify keyword frequency safe thresholds (recommended below 2.5%).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Content Draft
            </label>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your content draft here..."
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-amber-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Target Keyword Focus
            </label>
            <input
              type="text"
              value={targetKeyword}
              onChange={(e) => setTargetKeyword(e.target.value)}
              placeholder="e.g. coffee maker"
              className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500"
            />

            <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <div className="font-bold text-slate-900 dark:text-white">Density Thresholds:</div>
              <div className="text-emerald-600 font-medium">✓ 0.5% – 2.0%: Natural &amp; Safe</div>
              <div className="text-amber-600 font-medium">⚠ 2.1% – 3.0%: Upper Limit</div>
              <div className="text-red-600 font-medium">✕ &gt; 3.0%: High Risk of Penalty</div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Card */}
      <div className="space-y-6">
        {/* Risk Status Banner */}
        <div
          className={`p-6 rounded-3xl border flex items-center justify-between gap-4 ${
            isStuffed
              ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-900 dark:text-red-200'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-2xl ${
                isStuffed ? 'bg-red-100 dark:bg-red-900 text-red-600' : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600'
              }`}
            >
              {isStuffed ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {isStuffed ? 'High Risk of Keyword Stuffing' : 'Keyword Density is Natural &amp; Balanced'}
              </h2>
              <p className="text-xs opacity-90 mt-0.5">
                {isStuffed
                  ? 'Your text contains repetitively clustered phrases exceeding the 3.0% threshold. Dilute with synonyms.'
                  : 'No over-optimized keyword stuffing detected. Content reads naturally for search engines and humans.'}
              </p>
            </div>
          </div>

          {targetKeyword && (
            <div className="text-right shrink-0">
              <span className="text-xs font-semibold uppercase tracking-wider block opacity-75">
                Target Density
              </span>
              <span className="text-2xl font-black">{targetDensity}%</span>
              <span className="text-xs block opacity-75">({targetCount} matches)</span>
            </div>
          )}
        </div>

        {/* 2-Word and Single Word Stuffed phrases */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Two-Word Phrases Analysis
            </h3>
            {Object.keys(twoWordFreq).length === 0 ? (
              <div className="text-xs text-slate-400">Add more content to analyze phrases.</div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {Object.entries(twoWordFreq)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .map(([phrase, count], i) => {
                    const density = Number((((count * 2) / Math.max(totalWords, 1)) * 100).toFixed(1));
                    return (
                      <div
                        key={i}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white capitalize">
                            &quot;{phrase}&quot;
                          </div>
                          <div className="text-slate-500">{count} times</div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-md font-bold ${
                            density > 3.0
                              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {density}%
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Single Word Density Analysis
            </h3>
            {Object.keys(singleFreq).length === 0 ? (
              <div className="text-xs text-slate-400">Add content to analyze words.</div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {Object.entries(singleFreq)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .map(([word, count], i) => {
                    const density = Number(((count / Math.max(totalWords, 1)) * 100).toFixed(1));
                    return (
                      <div
                        key={i}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white capitalize">
                            {word}
                          </div>
                          <div className="text-slate-500">{count} times</div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-md font-bold ${
                            density > 3.0
                              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {density}%
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
