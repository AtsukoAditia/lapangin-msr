import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CUSTOMER_TOKEN_NAME } from "@/lib/auth/jwt";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_TOKEN_NAME);
  return NextResponse.json({ success: true });
}