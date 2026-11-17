import React from 'react';
import { Lock } from 'lucide-react';

export function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200/60 dark:border-indigo-800">
          <Lock className="w-3.5 h-3.5" />
          <span>Rankora Privacy &amp; Data Safeguards</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-500">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 space-y-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            1. Our Absolute Commitment to User Privacy
          </h2>
          <p>
            Rankora is fundamentally designed without user tracking, accounts, or persistent personal profiles. Because our tools do not require user login, registration, or credit cards, we do not collect names, passwords, billing addresses, or payment credentials.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            2. How Website Audits &amp; Crawling Work
          </h2>
          <p>
            When you enter a public website URL to test on-page elements, technical headers, or broken links:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
            <li>Our server performs a standard, non-invasive HTTP GET/HEAD request to fetch the public HTML.</li>
            <li>The response is parsed ephemerally in memory to extract meta tags, heading outlines, and image alt tags.</li>
            <li>We do not store or sell competitive intelligence, proprietary crawl datasets, or private traffic analytics.</li>
            <li>Our crawlers obey standard robots.txt directives and employ strict Server-Side Request Forgery (SSRF) protections.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            3. Server-Side Request Forgery (SSRF) &amp; Security Protections
          </h2>
          <p>
            To protect network integrity, our crawling proxy enforces strict access controls:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
            <li>Requests to <code className="font-mono text-xs">localhost</code>, loopback IP addresses (127.0.0.1, ::1), and link-local ranges are blocked.</li>
            <li>Private IPv4 subnet blocks (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) and cloud instance metadata endpoints (169.254.169.254) are rejected.</li>
            <li>Strict 9-second timeout limits and 5MB payload size caps prevent denial-of-service abuse.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            4. Cookies &amp; Local Storage
          </h2>
          <p>
            We do not use tracking cookies, retargeting pixels, or invasive behavioral analytics. The only local storage utilized is your browser&apos;s native preference for dark/light mode and temporary offline tool state (like the SEO Checklist progress), ensuring your experience is seamless.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            5. Contact Information
          </h2>
          <p>
            If you have questions regarding our security protocols or open access data practices, please reach out via our Contact page.
          </p>
        </section>
      </div>
    </div>
  );
}
