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
  const now = new Date();
  const startDate = new Date();

  if (range === "24h") startDate.setHours(now.getHours() - 24);
  else if (range === "7d") startDate.setDate(now.getDate() - 7);
  else if (range === "30d") startDate.setDate(now.getDate() - 30);
  else if (range === "90d") startDate.setDate(now.getDate() - 90);

  const db = getDb();
  const pages = db
    .prepare(`
      SELECT
        path,
        title,
        COUNT(*) as pageviews,
        COUNT(DISTINCT visitor_hash) as visitors
      FROM events
      WHERE website_id = ? AND created_at >= ? AND event_name = 'pageview'
      GROUP BY path
      ORDER BY pageviews DESC
      LIMIT 15
    `)
    .all(id, startDate.toISOString()) as any[];

  return NextResponse.json({ pages });
}
