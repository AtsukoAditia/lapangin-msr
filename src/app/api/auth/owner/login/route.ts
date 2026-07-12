import { NextRequest, NextResponse } from "next/server";
import { OWNER_TOKEN_NAME, createToken } from "@/lib/auth/jwt";
import { authenticateOwner } from "@/lib/auth/service";
import { loginLimiter, getClientIP, checkRateLimit } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
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

    const result = await authenticateOwner(email, password);
    if (!result) {
      return NextResponse.json(
        { error: "Email atau password salah, atau akun bukan owner" },
        { status: 401 },
      );
    }

    await loginLimiter.delete(ip);

    const token = await createToken({
      userId: result.admin.id,
      role: "owner",
      name: result.admin.name,
      email: result.admin.email,
      ownerId: result.ownerId,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: result.admin.id,
        name: result.admin.name,
        email: result.admin.email,
        role: "owner",
        ownerId: result.ownerId,
      },
    });

    response.cookies.set(OWNER_TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
