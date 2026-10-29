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

  const db = getDb();

  // Sources breakdown
  const sources = db
    .prepare(`
      SELECT
        referrer_source as source,
        COUNT(*) as visitors
      FROM events
      WHERE website_id = ? AND created_at >= ? AND event_name = 'pageview'
      GROUP BY referrer_source
      ORDER BY visitors DESC
    `)
    .all(id, startDate.toISOString()) as any[];

  // Top referring domains
  const referrers = db
    .prepare(`
      SELECT
        referrer_domain as domain,
        referrer_source as source,
        COUNT(*) as pageviews,
        COUNT(DISTINCT visitor_hash) as visitors
      FROM events
      WHERE website_id = ? AND created_at >= ? AND event_name = 'pageview' AND referrer_domain != '' AND referrer_domain != 'Direct'
      GROUP BY referrer_domain
      ORDER BY visitors DESC
      LIMIT 15
    `)
    .all(id, startDate.toISOString()) as any[];

  return NextResponse.json({ sources, referrers });
}
