import Link from "next/link";
import { ShieldCheck, ArrowLeft, Terminal, Code2, Server, BookOpen, Layers } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <header className="border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20">
              <ShieldCheck className="h-5 w-5 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">Privacy-First</span>
            <span className="font-normal text-base tracking-tight text-sky-400">Analytics</span>
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 space-y-12">
        <div>
          <span className="text-xs font-semibold text-sky-400 tracking-wider uppercase">Documentation & Guides</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Platform Integration & Self-Hosting</h1>
          <p className="text-slate-400 text-sm mt-2">
            Everything you need to integrate the tracking script, track conversions, and deploy on your own servers.
          </p>
        </div>

        {/* Section 1: Basic Integration */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Code2 className="h-5 w-5 text-sky-400" />
            1. Basic Website Integration
          </h2>
          <p className="text-sm text-slate-300">
            Paste the following snippet into the <code className="text-sky-300 bg-slate-900 px-1 py-0.5 rounded">&lt;head&gt;</code> of your website. The script executes asynchronously and is only <strong>1.49 KB gzipped</strong>.
          </p>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto">
            <code>{`<script defer src="https://your-analytics.com/tracker.js" data-website-id="pfa_your_site_id"></script>`}</code>
          </div>
        </section>

        {/* Section 2: Custom Events API */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-400" />
            2. Custom Events API
          </h2>
          <p className="text-sm text-slate-300">
            Track custom actions such as user registrations, payment checkouts, or feature triggers using the global <code className="text-sky-300 bg-slate-900 px-1 py-0.5 rounded">window.privacyAnalytics</code> object.
          </p>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs font-mono text-slate-300 space-y-2 overflow-x-auto">
            <p className="text-slate-500">// Track simple named event</p>
            <p>window.privacyAnalytics.track(&quot;signup&quot;);</p>
            <br />
            <p className="text-slate-500">// Track event with non-PII properties</p>
            <p>window.privacyAnalytics.track(&quot;plan_upgrade&quot;, &#123;</p>
            <p>&nbsp;&nbsp;plan: &quot;enterprise&quot;,</p>
            <p>&nbsp;&nbsp;billing: &quot;annual&quot;</p>
            <p>&#125;);</p>
          </div>
          <p className="text-xs text-slate-500">
            *Note: Privacy-First Analytics automatically strips any property keys containing PII (such as email, password, token, or phone).
          </p>
        </section>

        {/* Section 3: Docker Compose Self-Hosting */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Server className="h-5 w-5 text-teal-400" />
            3. Self-Hosted Docker Compose Setup
          </h2>
          <p className="text-sm text-slate-300">
            Deploy Privacy-First Analytics on any Linux, macOS, or Windows VPS using Docker Compose.
          </p>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto">
            <pre>{`version: '3.8'

services:
  analytics:
    image: node:22-alpine
    container_name: privacy-first-analytics
    restart: always
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - NODE_ENV=production
      - JWT_SECRET=change-this-to-a-secure-random-token
      - PRIVACY_SALT=change-this-to-a-secure-salt
    volumes:
      - analytics_data:/app/data

volumes:
  analytics_data:
    driver: local`}</pre>
          </div>
        </section>
      </main>
    </div>
  );
}
