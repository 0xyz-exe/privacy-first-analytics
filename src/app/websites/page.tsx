"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Globe2,
  Plus,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Code2,
  Sliders,
  ArrowLeft,
} from "lucide-react";

export default function WebsitesPage() {
  const [websites, setWebsites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newSiteName, setNewSiteName] = useState("");
  const [newSiteDomain, setNewSiteDomain] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchWebsites = () => {
    setLoading(true);
    fetch("/api/v1/websites")
      .then((r) => r.json())
      .then((data) => setWebsites(data.websites || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName || !newSiteDomain) return;

    try {
      const res = await fetch("/api/v1/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSiteName, domain: newSiteDomain }),
      });
      if (res.ok) {
        setNewSiteName("");
        setNewSiteDomain("");
        setIsAddOpen(false);
        fetchWebsites();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this website and all associated analytics data?")) return;
    await fetch(`/api/v1/websites/${id}`, { method: "DELETE" });
    fetchWebsites();
  };

  const copySnippet = (publicId: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://analytics.yourdomain.com";
    const snippet = `<script defer src="${origin}/tracker.js" data-website-id="${publicId}"></script>`;
    navigator.clipboard.writeText(snippet);
    setCopiedId(publicId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Top Navbar */}
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
              <Link href="/websites" className="px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                Websites
              </Link>
              <Link href="/settings" className="px-3 py-1.5 rounded-lg hover:text-white transition-colors">
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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Websites & Tracking Snippets</h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage all connected websites, integration snippets, and tracking policies.
            </p>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-sky-500/20"
          >
            <Plus className="h-4 w-4" />
            Add New Website
          </button>
        </div>

        {/* Modal: Add Website */}
        {isAddOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h2 className="text-lg font-bold text-white mb-2">Connect a New Website</h2>
              <p className="text-xs text-slate-400 mb-6">
                Enter your website name and primary domain to generate its lightweight tracking snippet.
              </p>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Website Name</label>
                  <input
                    type="text"
                    required
                    value={newSiteName}
                    onChange={(e) => setNewSiteName(e.target.value)}
                    placeholder="e.g. My SaaS Landing Page"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Primary Domain</label>
                  <input
                    type="text"
                    required
                    value={newSiteDomain}
                    onChange={(e) => setNewSiteDomain(e.target.value)}
                    placeholder="e.g. myproduct.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20"
                  >
                    Create & Generate Snippet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Websites List */}
        <div className="space-y-6">
          {websites.map((site) => (
            <div
              key={site.id}
              className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6 shadow-sm hover:border-slate-700/80 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                    <Globe2 className="h-5 w-5 text-sky-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{site.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="font-mono text-slate-300">{site.domain}</span>
                      <span>•</span>
                      <span>Public ID: <code className="text-sky-300">{site.public_id}</code></span>
                      <span>•</span>
                      <span>{site.total_events || 0} total events</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard?site=${site.id}`}
                    className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    View Analytics
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>

                  <button
                    onClick={() => handleDelete(site.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Website"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Snippet Card */}
              <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                    <Code2 className="h-4 w-4 text-sky-400" />
                    Tracking Snippet (Embed before &lt;/head&gt;)
                  </span>
                  <button
                    onClick={() => copySnippet(site.public_id)}
                    className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold"
                  >
                    {copiedId === site.public_id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy Snippet
                      </>
                    )}
                  </button>
                </div>

                <pre className="text-xs font-mono text-slate-300 bg-slate-900/90 p-3 rounded-lg overflow-x-auto">
                  <code>{`<script defer src="${typeof window !== "undefined" ? window.location.origin : "https://analytics.yourdomain.com"}/tracker.js" data-website-id="${site.public_id}"></script>`}</code>
                </pre>
              </div>

              {/* Settings Badges */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 font-medium">
                  Retention: {site.retention_days || 90} Days
                </span>
                <span className={`px-2.5 py-1 rounded-md font-medium ${site.respect_dnt ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                  DNT Respected: {site.respect_dnt ? "Yes" : "No"}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 font-medium">
                  Outbound Links: {site.track_outbound ? "Enabled" : "Disabled"}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 font-medium">
                  Downloads: {site.track_downloads ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
