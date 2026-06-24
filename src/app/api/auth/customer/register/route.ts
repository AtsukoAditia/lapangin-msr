import { NextRequest, NextResponse } from "next/server";
import { registerCustomer } from "@/lib/auth/service";
import { createToken, CUSTOMER_TOKEN_NAME } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, error: "Nama, email, telepon, dan password wajib diisi" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password minimal 8 karakter" },
        { status: 400 },
      );
    }

    const customer = await registerCustomer({ name, email, phone, password });

    const token = await createToken({
      userId: customer.id,
      role: "customer",
      name: customer.name,
      email: customer.email,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        userId: customer.id,
        role: "customer",
        name: customer.name,
        email: customer.email,
      },
    });

    response.cookies.set(CUSTOMER_TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("Customer register error:", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan server";
    return NextResponse.json(
      { success: false, error: message },
      { status: 409 },
    );
  }
}
