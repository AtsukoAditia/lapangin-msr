import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createToken, ADMIN_TOKEN_NAME } from "@/lib/auth/jwt";
import { getDatabaseAdapter } from "@/lib/adapters";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    const adapter = getDatabaseAdapter();
    const admin = await adapter.authenticateAdmin(email, password);

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Email atau password salah" },
        { status: 401 }
      );
    }

    const token = await createToken({
      userId: admin.id,
      role: "admin",
      name: admin.name,
      email: admin.email,
    });

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: { userId: admin.id, role: "admin", name: admin.name, email: admin.email },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}