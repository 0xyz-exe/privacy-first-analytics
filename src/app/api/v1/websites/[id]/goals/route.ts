import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, verifyWebsiteAccess } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { z } from "zod";

const createGoalSchema = z.object({
  name: z.string().min(2).max(50),
  event_type: z.enum(["event", "path"]),
  target_value: z.string().min(1).max(100),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || !verifyWebsiteAccess(user.userId, id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const goals = db
    .prepare("SELECT * FROM goals WHERE website_id = ? ORDER BY created_at DESC")
    .all(id) as any[];

  // Calculate conversions for each goal
  const goalsWithStats = goals.map((goal) => {
    let count = 0;
    if (goal.event_type === "event") {
      const res = db
        .prepare("SELECT COUNT(*) as count FROM events WHERE website_id = ? AND event_name = ?")
        .get(id, goal.target_value) as any;
      count = res?.count || 0;
    } else {
      const res = db
        .prepare("SELECT COUNT(*) as count FROM events WHERE website_id = ? AND path = ?")
        .get(id, goal.target_value) as any;
      count = res?.count || 0;
    }
    return {
      ...goal,
      conversions: count,
    };
  });

  return NextResponse.json({ goals: goalsWithStats });
}

export async function POST(
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
    const parsed = createGoalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, event_type, target_value } = parsed.data;
    const db = getDb();
    const goalId = "gol_" + Math.random().toString(36).slice(2, 10);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO goals (id, website_id, name, event_type, target_value, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(goalId, id, name, event_type, target_value, now);

    return NextResponse.json({
      ok: true,
      goal: { id: goalId, website_id: id, name, event_type, target_value, created_at: now },
    });
  } catch (err: any) {
    console.error("Create goal error:", err);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}
