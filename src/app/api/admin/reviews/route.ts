import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, ADMIN_TOKEN_NAME } from "@/lib/auth/jwt";
import { getDatabaseAdapter } from "@/lib/adapters";

async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_TOKEN_NAME)?.value;
  if (!token) return null;
  const session = await verifyToken(token);
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) return null;
  return session;
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const adapter = getDatabaseAdapter();
    const reviews = await adapter.getPendingReviews();
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Admin reviews error:", error);
    return NextResponse.json({ error: "Gagal mengambil data ulasan" }, { status: 500 });
  }
}
