import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { ShieldCheck, Heart, Zap, Globe, Lock, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { RankoraLogo } from '../components/RankoraLogo';

export function AboutPage() {
  const { navigateTo } = useNavigation();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200/70 dark:border-indigo-800">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Smarter SEO. Open to Everyone.</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          About <span className="rankora-gradient-text">Rankora</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Rankora was created with a clear mission: provide creators, webmasters, indie hackers, and developers with enterprise-grade search intelligence, technical web diagnostics, and content analysis — without paywalls, subscriptions, or login barriers.
        </p>
      </div>

      {/* The Problem & Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
            ✕
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            The Industry Problem
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            The modern SEO software industry has become prohibitively expensive. Webmasters, small business owners, freelancers, and indie creators are regularly forced into $99 to $299 monthly subscriptions just to check whether their title tags are too long or if their site has 404 links.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Many &quot;free&quot; tools are merely deceptive lead-generation traps: they ask for your email address, demand a credit card for a trial, or lock the actual fix recommendations behind a paywall.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            ✓
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            The Rankora Standard
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Rankora eliminates the friction entirely. We built an enterprise-grade crawler, live Google autocomplete scraper, Schema.org generator, and AI-assisted content optimizer that costs zero dollars for every visitor.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            You don&apos;t need to register an account, remember another password, or worry about recurring charges. Every tool is immediately unlocked and ready for work.
          </p>
        </div>
      </div>

      {/* Core Principles */}
      <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white space-y-8 border border-slate-800">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            Rankora Architectural Guarantees
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Engineered with strict ethical standards and open-web best practices:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Lock className="w-6 h-6 text-indigo-400" />
            <h3 className="font-bold text-base">Privacy by Architecture</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We do not track your searches, log user credentials, or sell competitive intelligence. Your audit requests are ephemeral and secure.
            </p>
          </div>

          <div className="space-y-2">
            <Zap className="w-6 h-6 text-violet-400" />
            <h3 className="font-bold text-base">Real Data, Zero Fakes</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We never fabricate artificial backlinks, synthetic domain authority scores, or hallucinated traffic charts. Every metric is computed from real HTML DOM elements.
            </p>
          </div>

          <div className="space-y-2">
            <Globe className="w-6 h-6 text-indigo-400" />
            <h3 className="font-bold text-base">SSRF &amp; Server Hardened</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Our backend crawlers strictly block internal networks, localhost loopbacks, private subnets, and cloud metadata APIs to guarantee network integrity.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <button
          onClick={() => navigateTo('audit')}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/20 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <span>Start Auditing Now — 100% Free</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
