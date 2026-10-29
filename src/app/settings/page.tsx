"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock, Trash2, Database, KeyRound, Check } from "lucide-react";

export default function SettingsPage() {
  const [retention, setRetention] = useState(90);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <header className="border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20">
                <ShieldCheck className="h-5 w-5 text-slate-950 stroke-[2.5]" />
              </div>
              <span className="font-bold text-base tracking-tight text-white">Privacy-First</span>
              <span className="font-normal text-base tracking-tight text-sky-400">Analytics</span>
            </Link>

            <nav className="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-400">
              <Link href="/dashboard" className="px-3 py-1.5 rounded-lg hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/websites" className="px-3 py-1.5 rounded-lg hover:text-white transition-colors">
                Websites
              </Link>
              <Link href="/settings" className="px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                Settings
              </Link>
              <Link href="/docs" className="px-3 py-1.5 rounded-lg hover:text-white transition-colors">
                Docs
              </Link>
            </nav>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Security & Privacy Settings</h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure system data retention, cryptographic salts, and privacy boundaries.
          </p>
        </div>

        {/* Card 1: Data Retention */}
        <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Automated Data Retention & Pruning</h2>
              <p className="text-xs text-slate-400">Purge raw analytics events older than the specified threshold.</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Retention Period (Days)</label>
              <select
                value={retention}
                onChange={(e) => setRetention(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
              >
                <option value={30}>30 Days (Recommended for strict GDPR minimalism)</option>
                <option value={90}>90 Days (Default)</option>
                <option value={180}>180 Days (6 Months)</option>
                <option value={365}>365 Days (1 Year)</option>
              </select>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved Changes
                </>
              ) : (
                "Save Retention Policy"
              )}
            </button>
          </form>
        </div>

        {/* Card 2: Cryptographic Anonymization */}
        <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Visitor Anonymization Engine</h2>
              <p className="text-xs text-slate-400">Daily rotating salt cryptographic status.</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400">Hash Algorithm:</span>
              <span className="font-mono text-sky-400">HMAC-SHA256 (Daily Salted)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400">Raw IP Address Persistence:</span>
              <span className="font-semibold text-emerald-400">Disabled (Never Stored)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400">Persistent Cookies:</span>
              <span className="font-semibold text-emerald-400">Zero Cookies Placed</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400">Browser Fingerprinting:</span>
              <span className="font-semibold text-emerald-400">Blocked (No Canvas/Audio APIs)</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
