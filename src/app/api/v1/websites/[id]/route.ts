import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, verifyWebsiteAccess } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  domain: z.string().min(3).max(100).optional(),
  respect_dnt: z.number().min(0).max(1).optional(),
  allow_custom_events: z.number().min(0).max(1).optional(),
  track_outbound: z.number().min(0).max(1).optional(),
  track_downloads: z.number().min(0).max(1).optional(),
  retention_days: z.number().min(0).max(365).optional(),
  allowed_domains: z.string().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || !verifyWebsiteAccess(user.userId, id)) {
    return NextResponse.json({ error: "Website not found or access denied" }, { status: 404 });
  }

  const db = getDb();
  const website = db
    .prepare(`
      SELECT w.*, ws.respect_dnt, ws.allow_custom_events, ws.track_outbound, ws.track_downloads,
             ws.retention_days, ws.allowed_domains
      FROM websites w
      LEFT JOIN website_settings ws ON ws.website_id = w.id
      WHERE w.id = ?
    `)
    .get(id) as any;

  if (!website) {
    return NextResponse.json({ error: "Website not found" }, { status: 404 });
  }

  return NextResponse.json({ website });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || !verifyWebsiteAccess(user.userId, id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const db = getDb();
    const data = parsed.data;
    const now = new Date().toISOString();

    if (data.name || data.domain) {
      db.prepare(`
        UPDATE websites
        SET name = COALESCE(?, name),
            domain = COALESCE(?, domain),
            updated_at = ?
        WHERE id = ?
      `).run(data.name ?? null, data.domain ?? null, now, id);
    }

    db.prepare(`
      UPDATE website_settings
      SET respect_dnt = COALESCE(?, respect_dnt),
          allow_custom_events = COALESCE(?, allow_custom_events),
          track_outbound = COALESCE(?, track_outbound),
          track_downloads = COALESCE(?, track_downloads),
          retention_days = COALESCE(?, retention_days),
          allowed_domains = COALESCE(?, allowed_domains)
      WHERE website_id = ?
    `).run(
      data.respect_dnt ?? null,
      data.allow_custom_events ?? null,
      data.track_outbound ?? null,
      data.track_downloads ?? null,
      data.retention_days ?? null,
      data.allowed_domains ?? null,
      id
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Update website error:", err);
    return NextResponse.json({ error: "Failed to update website" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || !verifyWebsiteAccess(user.userId, id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  db.prepare("DELETE FROM websites WHERE id = ?").run(id);

  return NextResponse.json({ ok: true });
}
