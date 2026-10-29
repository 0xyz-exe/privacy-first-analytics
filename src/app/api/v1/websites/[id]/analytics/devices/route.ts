import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, verifyWebsiteAccess } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || !verifyWebsiteAccess(user.userId, id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "7d";
  const startDate = new Date();

  if (range === "24h") startDate.setHours(new Date().getHours() - 24);
  else if (range === "7d") startDate.setDate(new Date().getDate() - 7);
  else if (range === "30d") startDate.setDate(new Date().getDate() - 30);
  else if (range === "90d") startDate.setDate(new Date().getDate() - 90);

  const startIso = startDate.toISOString();
  const db = getDb();

  const devices = db
    .prepare(`
      SELECT device, COUNT(*) as count
      FROM events
      WHERE website_id = ? AND created_at >= ? AND event_name = 'pageview'
      GROUP BY device
      ORDER BY count DESC
    `)
    .all(id, startIso) as any[];

  const browsers = db
    .prepare(`
      SELECT browser, COUNT(*) as count
      FROM events
      WHERE website_id = ? AND created_at >= ? AND event_name = 'pageview'
      GROUP BY browser
      ORDER BY count DESC
      LIMIT 8
    `)
    .all(id, startIso) as any[];

  const osList = db
    .prepare(`
      SELECT os, COUNT(*) as count
      FROM events
      WHERE website_id = ? AND created_at >= ? AND event_name = 'pageview'
      GROUP BY os
      ORDER BY count DESC
      LIMIT 8
    `)
    .all(id, startIso) as any[];

  const countries = db
    .prepare(`
      SELECT country, COUNT(*) as count
      FROM events
      WHERE website_id = ? AND created_at >= ? AND event_name = 'pageview'
      GROUP BY country
      ORDER BY count DESC
      LIMIT 8
    `)
    .all(id, startIso) as any[];

  return NextResponse.json({ devices, browsers, os: osList, countries });
}
