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

  // Custom events summary
  const eventTypes = db
    .prepare(`
      SELECT
        event_name,
        COUNT(*) as total_count,
        COUNT(DISTINCT visitor_hash) as unique_users
      FROM events
      WHERE website_id = ? AND created_at >= ? AND event_name != 'pageview'
      GROUP BY event_name
      ORDER BY total_count DESC
    `)
    .all(id, startIso) as any[];

  // Recent custom event logs (sanitized)
  const recentEvents = db
    .prepare(`
      SELECT id, event_name, path, event_data, created_at
      FROM events
      WHERE website_id = ? AND created_at >= ? AND event_name != 'pageview'
      ORDER BY created_at DESC
      LIMIT 25
    `)
    .all(id, startIso) as any[];

  return NextResponse.json({
    eventTypes,
    recentEvents: recentEvents.map((e) => ({
      ...e,
      event_data: JSON.parse(e.event_data || "{}"),
    })),
  });
}
