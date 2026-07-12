import { NextRequest, NextResponse } from "next/server";
import { registerOwner } from "@/lib/auth/service";
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

    const body = await request.json();
    const { name, email, phone, password, businessName, picName } = body as {
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
      businessName?: string;
      picName?: string;
    };

    // Validate required fields
    const missing = ["name", "email", "phone", "password", "businessName", "picName"]
      .filter((k) => !body[k]);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Field wajib: ${missing.join(", ")}` },
        { status: 400 },
      );
    }

    if (password!.length < 8) {
      return NextResponse.json(
        { error: "Password minimal 8 karakter" },
        { status: 400 },
      );
    }

    const result = await registerOwner({
      name: name!,
      email: email!,
      phone: phone!,
      password: password!,
      businessName: businessName!,
      picName: picName!,
    });

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil. Akun Anda sedang menunggu review dari tim Lapangin.",
      adminId: result.adminId,
      ownerId: result.ownerId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal registrasi";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
