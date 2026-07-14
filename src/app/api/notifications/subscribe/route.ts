import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, CUSTOMER_TOKEN_NAME, ADMIN_TOKEN_NAME, OWNER_TOKEN_NAME } from "@/lib/auth/jwt";

// In-memory token store — ponvian: swap for DB table in production
const tokenStore = new Map<string, { userId: string; role: string; createdAt: string }>();

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "token wajib diisi." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const customerToken = cookieStore.get(CUSTOMER_TOKEN_NAME)?.value;
    const adminToken = cookieStore.get(ADMIN_TOKEN_NAME)?.value;
    const ownerToken = cookieStore.get(OWNER_TOKEN_NAME)?.value;
    const authToken = customerToken || adminToken || ownerToken;

    let userId = "anonymous";
    let role = "customer";

    if (authToken) {
      const session = await verifyToken(authToken);
      if (session) {
        userId = session.userId;
        role = session.role;
      }
    }

    tokenStore.set(token, { userId, role, createdAt: new Date().toISOString() });

    return NextResponse.json({ success: true, message: "Token berhasil didaftarkan." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menyimpan token.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ count: tokenStore.size });
}
