import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, ADMIN_TOKEN_NAME, OWNER_TOKEN_NAME, CUSTOMER_TOKEN_NAME } from "@/lib/auth/jwt";

export async function GET() {
  const cookieStore = await cookies();

  const adminToken = cookieStore.get(ADMIN_TOKEN_NAME)?.value;
  const ownerToken = cookieStore.get(OWNER_TOKEN_NAME)?.value;
  const customerToken = cookieStore.get(CUSTOMER_TOKEN_NAME)?.value;
  const token = adminToken || ownerToken || customerToken;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  const session = await verifyToken(token);
  if (!session) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      userId: session.userId,
      role: session.role,
      name: session.name,
      email: session.email,
      ownerId: session.ownerId,
      impersonating: session.impersonating,
    },
  });
}
