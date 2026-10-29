import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  Lock,
  BarChart3,
  Server,
  Globe2,
  CheckCircle2,
  ArrowRight,
  Code2,
  Cpu,
  Layers,
  Terminal,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between">
      {/* Navigation */}
      <header className="border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <ShieldCheck className="h-5 w-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white">Privacy-First</span>
              <span className="font-normal text-lg tracking-tight text-sky-400 ml-1">Analytics</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#architecture" className="hover:text-white transition-colors">Architecture</Link>
            <Link href="#comparison" className="hover:text-white transition-colors">Comparison</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm transition-all shadow-md shadow-sky-500/20"
            >
              Live Demo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-20 pb-24 overflow-hidden border-b border-slate-800/60">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))]" />

          <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs font-semibold mb-6">
              <Lock className="h-3.5 w-3.5" />
              Open Source • Self-Hosted • Cookie-Free Analytics
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-[1.15]">
              Understand Your Traffic. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400">
                Respect Your Visitors.
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
              A modern, privacy-friendly analytics platform you own. Zero invasive trackers, zero persistent cookies, and a tracking script under <strong className="text-white">1.5 KB gzipped</strong>.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-base transition-all shadow-lg shadow-sky-500/25 flex items-center gap-2"
              >
                <BarChart3 className="h-5 w-5" />
                Explore Live Dashboard
              </Link>
              <Link
                href="/docs"
                className="px-6 py-3 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 font-semibold text-base transition-all flex items-center gap-2"
              >
                <Code2 className="h-5 w-5 text-sky-400" />
                Self-Host Guide
              </Link>
            </div>

            {/* Quick Install Snippet */}
            <div className="mt-12 max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-left shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
                <span className="flex items-center gap-2 font-mono">
                  <Terminal className="h-3.5 w-3.5 text-sky-400" />
                  HTML Tracking Integration
                </span>
                <span className="text-emerald-400 font-mono font-medium">1.49 KB gzipped</span>
              </div>
              <pre className="mt-3 text-xs sm:text-sm font-mono text-slate-300 overflow-x-auto p-2 bg-slate-950 rounded-lg">
                <code>{`<script defer src="https://analytics.yourdomain.com/tracker.js" data-website-id="pfa_your_site"></script>`}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section id="features" className="py-20 max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white">Engineered for Absolute Data Sovereignty</h2>
            <p className="mt-4 text-slate-400 text-base">
              Get all the vital conversion and traffic metrics you need without compromising user privacy or violating global regulations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
              <div className="h-12 w-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-5">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Tracking Cookies</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Uses cryptographic daily-rotating salt hashes. Visitors cannot be cross-tracked across days or external domains. No annoying cookie banners required.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Lightweight (~1.5 KB)</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Over 40x lighter than Google Analytics (45KB+). Zero external runtime dependencies, asynchronous loading, and zero performance penalty on Core Web Vitals.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
              <div className="h-12 w-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-5">
                <Server className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">100% Self-Hosted</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Deploy on your own VPS, Docker container, or Kubernetes cluster. Your analytics data never leaves your infrastructure and is never sold to ad networks.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Custom Goals & Conversions</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Track custom events such as newsletter subscriptions, checkout completions, outbound link clicks, and file downloads with automated PII redaction.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
                <Globe2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">SPA & Dynamic Routing</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Native pushState, replaceState, and popstate interception seamlessly supports Next.js, React, Vue, Svelte, and static HTML websites out of the box.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Do Not Track (DNT) Support</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Honors browser privacy signals (`navigator.doNotTrack` and Global Privacy Control `sec-gpc`) automatically when configured by the site administrator.
              </p>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section id="comparison" className="py-20 border-t border-slate-800/80 bg-slate-950/40">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white">How It Compares</h2>
              <p className="mt-3 text-slate-400">See why privacy engineers choose Privacy-First Analytics over legacy trackers.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-4 px-4 font-semibold">Feature</th>
                    <th className="py-4 px-4 font-semibold text-sky-400 bg-sky-950/20">Privacy-First Analytics</th>
                    <th className="py-4 px-4 font-semibold">Google Analytics 4</th>
                    <th className="py-4 px-4 font-semibold">Matomo (On-Prem)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="py-4 px-4 font-medium">Script Size (gzipped)</td>
                    <td className="py-4 px-4 font-bold text-sky-400 bg-sky-950/20">&lt; 1.5 KB</td>
                    <td className="py-4 px-4 text-rose-400">~45 KB</td>
                    <td className="py-4 px-4 text-amber-400">~22 KB</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium">Tracking Cookies</td>
                    <td className="py-4 px-4 font-bold text-emerald-400 bg-sky-950/20">Zero Cookies</td>
                    <td className="py-4 px-4 text-rose-400">Persistent Cookies</td>
                    <td className="py-4 px-4 text-amber-400">Optional Cookies</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium">Cookie Banner Needed</td>
                    <td className="py-4 px-4 font-bold text-emerald-400 bg-sky-950/20">No</td>
                    <td className="py-4 px-4 text-rose-400">Yes (Mandatory in EU)</td>
                    <td className="py-4 px-4 text-amber-400">Depends on config</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium">Data Ownership</td>
                    <td className="py-4 px-4 font-bold text-emerald-400 bg-sky-950/20">100% You</td>
                    <td className="py-4 px-4 text-rose-400">Google / Alphabet</td>
                    <td className="py-4 px-4 text-emerald-400">You</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium">Single-Container Docker</td>
                    <td className="py-4 px-4 font-bold text-emerald-400 bg-sky-950/20">Yes (Zero Config)</td>
                    <td className="py-4 px-4 text-slate-500">N/A (Cloud Only)</td>
                    <td className="py-4 px-4 text-slate-400">Heavy Multi-Container</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 1-Line Docker Deployment */}
        <section id="architecture" className="py-20 border-t border-slate-800/80">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Deploy in 30 Seconds with Docker</h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Run Privacy-First Analytics on your server with a single command. Includes built-in auto-migrating SQLite and optional PostgreSQL integration.
            </p>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-left font-mono text-sm text-sky-300 shadow-2xl flex items-center justify-between">
              <code>docker compose up -d</code>
              <span className="text-xs text-slate-500 font-sans">Ready on port 3000</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-10 bg-[#070b12] text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-sky-400" />
            <span className="text-slate-400 font-medium">Privacy-First Analytics</span>
            <span>— Open Source under MIT License</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/docs" className="hover:text-slate-300">Docs</Link>
            <Link href="https://github.com/0xyz-exe/privacy-first-analytics" className="hover:text-slate-300">GitHub</Link>
            <Link href="/dashboard" className="text-sky-400 hover:text-sky-300">Live Demo</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
