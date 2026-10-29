import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  hashVisitor,
  hashSession,
  parseUserAgent,
  parseReferrer,
  sanitizePath,
  sanitizeEventData,
} from "@/lib/privacy";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => null);
    if (!rawBody || typeof rawBody !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400, headers: corsHeaders });
    }

    const { website_id, event_name, path: rawPath, title, referrer: rawReferrer, event_data } = rawBody;

    if (!website_id || typeof website_id !== "string") {
      return NextResponse.json({ error: "Missing website_id" }, { status: 400, headers: corsHeaders });
    }

    const db = getDb();

    // Verify website and load settings
    const website = db
      .prepare(`
        SELECT w.id, w.domain, ws.respect_dnt, ws.allow_custom_events, ws.track_outbound, ws.track_downloads, ws.allowed_domains
        FROM websites w
        LEFT JOIN website_settings ws ON ws.website_id = w.id
        WHERE w.public_id = ? OR w.id = ?
      `)
      .get(website_id, website_id) as any;

    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404, headers: corsHeaders });
    }

    // Check Do Not Track
    const dntHeader = req.headers.get("dnt") || req.headers.get("sec-gpc");
    if (website.respect_dnt === 1 && dntHeader === "1") {
      return new NextResponse(null, { status: 204, headers: corsHeaders });
    }

    // Origin validation if allowed_domains is set
    const origin = req.headers.get("origin") || req.headers.get("referer");
    if (website.allowed_domains && website.allowed_domains.trim() !== "") {
      const allowed = website.allowed_domains.split(",").map((d: string) => d.trim().toLowerCase());
      if (origin) {
        try {
          const originHost = new URL(origin).hostname.toLowerCase();
          const match = allowed.some((d: string) => originHost === d || originHost.endsWith("." + d));
          if (!match) {
            return NextResponse.json({ error: "Unauthorized origin" }, { status: 403, headers: corsHeaders });
          }
        } catch {
          // ignore parsing error
        }
      }
    }

    // Check custom events allowed
    const isCustomEvent = event_name && event_name !== "pageview";
    if (isCustomEvent && website.allow_custom_events === 0) {
      return new NextResponse(null, { status: 204, headers: corsHeaders });
    }

    // Extract client IP safely (never saved raw to DB)
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const userAgent = req.headers.get("user-agent") || "";
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date();

    // Cryptographic privacy hashing (IP is transformed with daily salt)
    const visitorHash = hashVisitor(clientIp, website.id, today);
    const sessionId = hashSession(visitorHash, userAgent, now);

    const deviceInfo = parseUserAgent(userAgent);
    const referrerInfo = parseReferrer(rawReferrer, website.domain);
    const sanitizedPathname = sanitizePath(rawPath || "/");
    const sanitizedData = sanitizeEventData(event_data);

    // Country extraction (supports standard edge reverse-proxy headers)
    const country =
      req.headers.get("cf-ipcountry") ||
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("x-country-code") ||
      "United States";

    const eventId = "evt_" + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);

    db.prepare(`
      INSERT INTO events (
        id, website_id, session_id, visitor_hash, event_name, path, title,
        referrer_source, referrer_domain, browser, os, device, country,
        event_data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      eventId,
      website.id,
      sessionId,
      visitorHash,
      (event_name || "pageview").slice(0, 50),
      sanitizedPathname.slice(0, 255),
      (title || "").slice(0, 150),
      referrerInfo.source,
      referrerInfo.domain.slice(0, 100),
      deviceInfo.browser,
      deviceInfo.os,
      deviceInfo.device,
      country,
      JSON.stringify(sanitizedData),
      now.toISOString()
    );

    return NextResponse.json({ ok: true, id: eventId }, { status: 200, headers: corsHeaders });
  } catch (error: any) {
    console.error("Event collection error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500, headers: corsHeaders });
  }
}
