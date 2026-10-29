import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  organization_name: z.string().min(2).max(50).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, email, password, organization_name } = parsed.data;
    const db = getDb();

    // Check if user exists
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const userId = "usr_" + Math.random().toString(36).slice(2, 10);
    const orgId = "org_" + Math.random().toString(36).slice(2, 10);
    const orgName = organization_name || `${name}'s Team`;
    const orgSlug = orgName.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30);
    const now = new Date().toISOString();

    const passwordHash = await hashPassword(password);

    // Create user and default organization
    db.exec("BEGIN TRANSACTION;");
    try {
      db.prepare(`
        INSERT INTO users (id, name, email, password_hash, role, created_at)
        VALUES (?, ?, ?, ?, 'owner', ?)
      `).run(userId, name, email.toLowerCase(), passwordHash, now);

      db.prepare(`
        INSERT INTO organizations (id, name, slug, created_at)
        VALUES (?, ?, ?, ?)
      `).run(orgId, orgName, orgSlug + "-" + Math.random().toString(36).slice(2, 6), now);

      db.prepare(`
        INSERT INTO organization_members (id, organization_id, user_id, role, created_at)
        VALUES (?, ?, ?, 'owner', ?)
      `).run("mem_" + Math.random().toString(36).slice(2, 10), orgId, userId, now);

      db.exec("COMMIT;");
    } catch (err) {
      db.exec("ROLLBACK;");
      throw err;
    }

    await setSessionCookie({
      userId,
      email: email.toLowerCase(),
      role: "owner",
      organizationId: orgId,
    });

    return NextResponse.json({
      ok: true,
      user: { id: userId, name, email: email.toLowerCase(), role: "owner" },
      organization: { id: orgId, name: orgName },
    });
  } catch (err: any) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
