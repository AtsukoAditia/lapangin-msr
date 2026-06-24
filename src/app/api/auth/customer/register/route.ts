import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createToken, hashPassword, CUSTOMER_TOKEN_NAME } from "@/lib/auth/jwt";
import { getDatabaseAdapter } from "@/lib/adapters";

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, error: "Nama, email, telepon, dan password wajib diisi" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    const adapter = getDatabaseAdapter();

    // Check if email already registered
    const existing = await adapter.getCustomerByEmail(email);
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Email sudah terdaftar" },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);

    const customer = await adapter.registerCustomer({
      name,
      email,
      phone,
      passwordHash,
    });

    const token = await createToken({
      userId: customer.id,
      role: "customer",
      name: customer.name,
      email: customer.email,
    });

    const cookieStore = await cookies();
    cookieStore.set(CUSTOMER_TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        userId: customer.id,
        role: "customer",
        name: customer.name,
        email: customer.email,
      },
    });
  } catch (error) {
    console.error("Customer register error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}