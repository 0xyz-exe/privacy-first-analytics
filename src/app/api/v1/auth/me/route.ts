import { NextResponse } from "next/server";
import { clearSessionCookie, getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const db = getDb();
  const dbUser = db
    .prepare("SELECT id, name, email, role FROM users WHERE id = ?")
    .get(user.userId) as any;

  if (!dbUser) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      ...dbUser,
      organizationId: user.organizationId,
    },
  });
}
