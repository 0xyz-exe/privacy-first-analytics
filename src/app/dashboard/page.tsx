"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Globe2,
  Users,
  Eye,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Monitor,
  Smartphone,
  Tablet,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  Target,
  LogOut,
  Settings,
  Plus,
  RefreshCw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const router = useRouter();
  const [websites, setWebsites] = useState<any[]>([]);
  const [selectedWebId, setSelectedWebId] = useState<string>("web_demo_1");
  const [range, setRange] = useState<string>("7d");
  const [loading, setLoading] = useState(true);

  // Analytics states
  const [metrics, setMetrics] = useState<any>(null);
  const [timeseries, setTimeseries] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [sources, setSources] = useState<any>({ sources: [], referrers: [] });
  const [devices, setDevices] = useState<any>({ devices: [], browsers: [], os: [], countries: [] });
  const [events, setEvents] = useState<any>({ eventTypes: [], recentEvents: [] });
  const [goals, setGoals] = useState<any[]>([]);

  // Load user websites
  useEffect(() => {
    fetch("/api/v1/websites")
      .then((r) => {
        if (r.status === 401) {
          // If not logged in, attempt auto-login with demo credentials
          return fetch("/api/v1/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "demo@privacyanalytics.dev", password: "password123" }),
          }).then(() => fetch("/api/v1/websites"));
        }
        return r;
      })
      .then((r) => r.json())
      .then((data) => {
        if (data.websites && data.websites.length > 0) {
          setWebsites(data.websites);
          setSelectedWebId(data.websites[0].id);
        }
      })
      .catch((err) => console.error("Websites fetch error:", err));
  }, []);

  // Fetch website analytics when selected website or range changes
  useEffect(() => {
    if (!selectedWebId) return;
    setLoading(true);

    Promise.all([
      fetch(`/api/v1/websites/${selectedWebId}/analytics/overview?range=${range}`).then((r) => r.json()),
      fetch(`/api/v1/websites/${selectedWebId}/analytics/pages?range=${range}`).then((r) => r.json()),
      fetch(`/api/v1/websites/${selectedWebId}/analytics/sources?range=${range}`).then((r) => r.json()),
      fetch(`/api/v1/websites/${selectedWebId}/analytics/devices?range=${range}`).then((r) => r.json()),
      fetch(`/api/v1/websites/${selectedWebId}/analytics/events?range=${range}`).then((r) => r.json()),
      fetch(`/api/v1/websites/${selectedWebId}/goals`).then((r) => r.json()),
    ])
      .then(([overviewData, pagesData, sourcesData, devicesData, eventsData, goalsData]) => {
        if (overviewData.metrics) {
          setMetrics(overviewData.metrics);
          setTimeseries(overviewData.timeseries || []);
        }
        setPages(pagesData.pages || []);
        setSources(sourcesData || { sources: [], referrers: [] });
        setDevices(devicesData || { devices: [], browsers: [], os: [], countries: [] });
        setEvents(eventsData || { eventTypes: [], recentEvents: [] });
        setGoals(goalsData.goals || []);
      })
      .catch((err) => console.error("Analytics fetch error:", err))
      .finally(() => setLoading(false));
  }, [selectedWebId, range]);

  const handleLogout = async () => {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.push("/");
  };

  const selectedSite = websites.find((w) => w.id === selectedWebId) || {
    name: "Acme Tech Blog",
    domain: "techblog.acme.dev",
    public_id: "pfa_demo_acme",
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20">
                <ShieldCheck className="h-5 w-5 text-slate-950 stroke-[2.5]" />
              </div>
              <span className="font-bold text-base tracking-tight text-white">Privacy-First</span>
              <span className="font-normal text-base tracking-tight text-sky-400">Analytics</span>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-400">
              <Link href="/dashboard" className="px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                Dashboard
              </Link>
              <Link href="/websites" className="px-3 py-1.5 rounded-lg hover:text-white transition-colors">
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

          <div className="flex items-center gap-4">
            {/* Live Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Engine Active
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors p-1.5"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* Sub-header: Website Switcher & Range Picker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl text-white tracking-tight">{selectedSite.name}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {selectedSite.domain}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-mono mt-0.5">
                ID: {selectedSite.public_id || selectedSite.id}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Date Range Selector */}
            <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center text-xs font-semibold">
              {(["24h", "7d", "30d", "90d"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    range === r ? "bg-sky-500 text-slate-950 font-bold shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>

            <Link
              href="/websites"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors"
              title="Add Website"
            >
              <Plus className="h-4 w-4 text-sky-400" />
            </Link>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {/* Card 1: Pageviews */}
          <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium">Total Pageviews</span>
              <Eye className="h-4 w-4 text-sky-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {metrics ? metrics.pageviews.toLocaleString() : "..."}
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs">
              {metrics && metrics.pageviews_delta >= 0 ? (
                <span className="inline-flex items-center text-emerald-400 font-semibold">
                  <ArrowUpRight className="h-3.5 w-3.5" />+{metrics.pageviews_delta}%
                </span>
              ) : (
                <span className="inline-flex items-center text-rose-400 font-semibold">
                  <ArrowDownRight className="h-3.5 w-3.5" />{metrics?.pageviews_delta}%
                </span>
              )}
              <span className="text-slate-500 ml-1">vs prior period</span>
            </div>
          </div>

          {/* Card 2: Visitors */}
          <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium">Unique Visitors</span>
              <Users className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {metrics ? metrics.visitors.toLocaleString() : "..."}
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs">
              {metrics && metrics.visitors_delta >= 0 ? (
                <span className="inline-flex items-center text-emerald-400 font-semibold">
                  <ArrowUpRight className="h-3.5 w-3.5" />+{metrics.visitors_delta}%
                </span>
              ) : (
                <span className="inline-flex items-center text-rose-400 font-semibold">
                  <ArrowDownRight className="h-3.5 w-3.5" />{metrics?.visitors_delta}%
                </span>
              )}
              <span className="text-slate-500 ml-1">daily-salted hash</span>
            </div>
          </div>

          {/* Card 3: Bounce Rate */}
          <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium">Bounce Rate</span>
              <Layers className="h-4 w-4 text-teal-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {metrics ? `${metrics.bounce_rate}%` : "..."}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              {metrics ? `${metrics.pages_per_session} pages / session` : "..."}
            </div>
          </div>

          {/* Card 4: Avg Visit Duration */}
          <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium">Avg Duration</span>
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {metrics ? `${Math.floor(metrics.avg_duration_sec / 60)}m ${metrics.avg_duration_sec % 60}s` : "..."}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              {metrics ? `${metrics.sessions.toLocaleString()} total sessions` : "..."}
            </div>
          </div>
        </div>

        {/* Time-Series Interactive Chart */}
        <div className="mt-8 bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white">Traffic Over Time</h2>
              <p className="text-xs text-slate-400">Comparing pageviews and daily unique visitors</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                <span className="text-slate-300">Pageviews</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                <span className="text-slate-300">Visitors</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            {timeseries && timeseries.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeseries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pageviewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#475569"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#1e293b" }}
                  />
                  <YAxis
                    stroke="#475569"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#1e293b" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#f8fafc",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pageviews"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#pageviewsGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#visitorsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                {loading ? "Loading analytics timeseries..." : "No analytics recorded in this timeframe."}
              </div>
            )}
          </div>
        </div>

        {/* 2-Column Analytics Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Section: Top Pages */}
          <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
              <span>Top Pages</span>
              <span className="text-xs font-normal text-slate-400">Views & Visitors</span>
            </h3>

            <div className="space-y-3">
              {pages.length > 0 ? (
                pages.slice(0, 7).map((p, idx) => {
                  const maxViews = pages[0]?.pageviews || 1;
                  const pct = Math.round((p.pageviews / maxViews) * 100);
                  return (
                    <div key={idx} className="relative group p-2 rounded-xl hover:bg-slate-800/40 transition-colors">
                      <div
                        className="absolute inset-y-0 left-0 bg-sky-500/10 rounded-xl transition-all"
                        style={{ width: `${pct}%` }}
                      />
                      <div className="relative flex items-center justify-between text-xs">
                        <div className="flex flex-col truncate pr-2">
                          <span className="font-mono text-slate-200 truncate">{p.path}</span>
                          <span className="text-[11px] text-slate-500 truncate">{p.title || "Untitled"}</span>
                        </div>
                        <div className="flex items-center gap-4 text-right shrink-0">
                          <span className="font-bold text-white">{p.pageviews.toLocaleString()}</span>
                          <span className="text-slate-400 w-12">{p.visitors.toLocaleString()} u</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-slate-500 py-6 text-center">No pageview data found.</div>
              )}
            </div>
          </div>

          {/* Section: Traffic Sources */}
          <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
              <span>Traffic Sources & Channels</span>
              <span className="text-xs font-normal text-slate-400">Referrers</span>
            </h3>

            {/* Channels Pill Summary */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {["Direct", "Search", "Social", "Referral"].map((sourceName) => {
                const item = sources.sources?.find((s: any) => s.source === sourceName) || { visitors: 0 };
                return (
                  <div key={sourceName} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-center">
                    <span className="text-[11px] text-slate-400 block font-medium">{sourceName}</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">{item.visitors.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>

            {/* Top Referring Domains */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Top External Referrers
              </span>
              {sources.referrers && sources.referrers.length > 0 ? (
                sources.referrers.slice(0, 5).map((ref: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-slate-950/40">
                    <span className="font-mono text-slate-300 flex items-center gap-1.5">
                      <ExternalLink className="h-3 w-3 text-slate-500" />
                      {ref.domain}
                    </span>
                    <span className="font-semibold text-white">{ref.visitors.toLocaleString()} visitors</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 py-4 text-center">No external referrer traffic recorded.</div>
              )}
            </div>
          </div>
        </div>

        {/* 3-Column Bottom Analytics Grids */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {/* Widget 1: Device Breakdown */}
          <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Device & Hardware</h3>
            <div className="space-y-4">
              {devices.devices && devices.devices.length > 0 ? (
                devices.devices.map((d: any, idx: number) => {
                  const total = devices.devices.reduce((acc: number, curr: any) => acc + curr.count, 0) || 1;
                  const pct = Math.round((d.count / total) * 100);
                  const Icon = d.device === "Mobile" ? Smartphone : d.device === "Tablet" ? Tablet : Monitor;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-slate-300">
                          <Icon className="h-4 w-4 text-sky-400" />
                          {d.device}
                        </span>
                        <span className="font-semibold text-white">{pct}% ({d.count})</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-sky-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-slate-500 py-4">No device data.</div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-xs">
              <span className="text-slate-400 font-semibold block mb-2">Operating Systems</span>
              <div className="flex flex-wrap gap-1.5">
                {devices.os?.slice(0, 4).map((o: any, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 font-mono text-[11px]">
                    {o.os}: {o.count}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Widget 2: Geographic Distribution */}
          <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
              <span>Geographic Reach</span>
              <Globe2 className="h-4 w-4 text-teal-400" />
            </h3>
            <div className="space-y-2.5">
              {devices.countries && devices.countries.length > 0 ? (
                devices.countries.slice(0, 6).map((c: any, idx: number) => {
                  const total = devices.countries.reduce((acc: number, curr: any) => acc + curr.count, 0) || 1;
                  const pct = Math.round((c.count / total) * 100);
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-950/40">
                      <span className="text-slate-200">{c.country}</span>
                      <span className="font-semibold text-white">{pct}% ({c.count})</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-slate-500 py-4">No country data.</div>
              )}
            </div>
          </div>

          {/* Widget 3: Conversion Goals & Custom Events */}
          <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
              <span>Goals & Conversions</span>
              <Target className="h-4 w-4 text-emerald-400" />
            </h3>

            <div className="space-y-3">
              {goals && goals.length > 0 ? (
                goals.map((g: any) => (
                  <div key={g.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-white">{g.name}</span>
                      <span className="text-emerald-400 font-semibold">{g.conversions} conversions</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Target: {g.target_value} ({g.event_type})
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 py-2">No conversion goals configured yet.</div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-400 block mb-2">Custom Events</span>
              <div className="space-y-1.5">
                {events.eventTypes?.slice(0, 3).map((e: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1">
                    <span className="font-mono text-sky-400 text-[11px]">{e.event_name}</span>
                    <span className="font-semibold text-white">{e.total_count} events</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
