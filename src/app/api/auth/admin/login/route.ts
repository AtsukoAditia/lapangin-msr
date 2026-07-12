import { NextRequest, NextResponse } from "next/server";
import { ADMIN_TOKEN_NAME, createToken } from "@/lib/auth/jwt";
import { authenticateAdmin } from "@/lib/auth/service";
import { loginLimiter, getClientIP, checkRateLimit } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);

    // Rate limit
    const rateLimited = await checkRateLimit(loginLimiter, ip);
    if (rateLimited) {
      return NextResponse.json(
        { error: `Terlalu banyak percobaan. Coba lagi dalam ${rateLimited.retryAfter} detik.` },
        { status: 429 },
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 },
      );
    }

    const admin = await authenticateAdmin(email, password);

    if (!admin) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 },
      );
    }

    // Reset rate limit on successful login
    await loginLimiter.delete(ip);

    const token = await createToken({
      userId: admin.id,
      role: admin.role,
      name: admin.name,
      email: admin.email,
    });

    const adminSecret = process.env.ADMIN_SECRET_PATH || "";
    const dashboardUrl = adminSecret ? `/${adminSecret}` : "/admin";

    const response = NextResponse.json({
      success: true,
      dashboardUrl,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    response.cookies.set(ADMIN_TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
