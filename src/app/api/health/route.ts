import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const result = db.prepare("SELECT 1 as healthy").get() as any;
    return NextResponse.json({
      status: "ok",
      healthy: result?.healthy === 1,
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      product: "Privacy-First Analytics",
    });
  } catch (err: any) {
    return NextResponse.json({ status: "error", error: err.message }, { status: 503 });
  }
}
