import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { z } from "zod";

const createWebsiteSchema = z.object({
  name: z.string().min(2).max(100),
  domain: z.string().min(3).max(100),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const websites = db
    .prepare(`
      SELECT w.id, w.name, w.domain, w.public_id, w.created_at, w.updated_at,
             ws.respect_dnt, ws.allow_custom_events, ws.track_outbound, ws.track_downloads, ws.retention_days,
             (SELECT COUNT(*) FROM events e WHERE e.website_id = w.id) as total_events,
             (SELECT MAX(created_at) FROM events e WHERE e.website_id = w.id) as last_event_at
      FROM websites w
      JOIN organization_members om ON om.organization_id = w.organization_id
      LEFT JOIN website_settings ws ON ws.website_id = w.id
      WHERE om.user_id = ?
      ORDER BY w.created_at DESC
    `)
    .all(user.userId);

  return NextResponse.json({ websites });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createWebsiteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, domain } = parsed.data;
    const cleanDomain = domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const db = getDb();

    const websiteId = "web_" + Math.random().toString(36).slice(2, 10);
    const publicId = "pfa_" + Math.random().toString(36).slice(2, 12);
    const now = new Date().toISOString();

    db.exec("BEGIN TRANSACTION;");
    try {
      db.prepare(`
        INSERT INTO websites (id, organization_id, name, domain, public_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(websiteId, user.organizationId, name, cleanDomain, publicId, now, now);

      db.prepare(`
        INSERT INTO website_settings (website_id, respect_dnt, allow_custom_events, track_outbound, track_downloads, retention_days, allowed_domains)
        VALUES (?, 1, 1, 1, 1, 90, ?)
      `).run(websiteId, cleanDomain);

      db.prepare(`
        INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details, created_at)
        VALUES (?, ?, 'create_website', 'website', ?, ?, ?)
      `).run("aud_" + Math.random().toString(36).slice(2, 10), user.userId, websiteId, `Created ${name} (${cleanDomain})`, now);

      db.exec("COMMIT;");
    } catch (err) {
      db.exec("ROLLBACK;");
      throw err;
    }

    return NextResponse.json({
      ok: true,
      website: {
        id: websiteId,
        name,
        domain: cleanDomain,
        public_id: publicId,
        created_at: now,
      },
    });
  } catch (err: any) {
    console.error("Create website error:", err);
    return NextResponse.json({ error: "Failed to create website" }, { status: 500 });
  }
}
