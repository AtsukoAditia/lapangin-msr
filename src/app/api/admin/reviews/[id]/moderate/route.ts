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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { isVisible } = body;

    if (typeof isVisible !== "boolean") {
      return NextResponse.json({ error: "isVisible harus boolean" }, { status: 400 });
    }

    const adapter = getDatabaseAdapter();
    const review = await adapter.moderateReview(id, isVisible);
    return NextResponse.json({ review });
  } catch (error) {
    console.error("Moderate review error:", error);
    return NextResponse.json({ error: "Gagal memoderasi ulasan" }, { status: 500 });
  }
}
