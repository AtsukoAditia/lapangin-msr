import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, CUSTOMER_TOKEN_NAME } from "@/lib/auth/jwt";
import { Pool } from "pg";

const globalForPg = globalThis as unknown as { __pgPool?: Pool };
const pool = globalForPg.__pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (!globalForPg.__pgPool) globalForPg.__pgPool = pool;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(CUSTOMER_TOKEN_NAME)?.value;
    const session = token ? await verifyToken(token) : null;
    if (!session || session.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rows } = await pool.query(
      `SELECT id, name, email, phone, loyalty_points, total_spent, created_at as member_since, avatar
       FROM customers WHERE id = $1`,
      [session.userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Customer tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Customer profile GET error:", error);
    return NextResponse.json({ error: "Gagal mengambil data profil" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(CUSTOMER_TOKEN_NAME)?.value;
    const session = token ? await verifyToken(token) : null;
    if (!session || session.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
    }

    if (!phone || typeof phone !== "string" || phone.trim().length === 0) {
      return NextResponse.json({ error: "Telepon wajib diisi" }, { status: 400 });
    }

    if (name.trim().length > 100) {
      return NextResponse.json({ error: "Nama maksimal 100 karakter" }, { status: 400 });
    }

    if (phone.trim().length > 20) {
      return NextResponse.json({ error: "Telepon maksimal 20 karakter" }, { status: 400 });
    }

    const { rows } = await pool.query(
      `UPDATE customers SET name = $1, phone = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
      [name.trim(), phone.trim(), session.userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Customer tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Customer profile PUT error:", error);
    return NextResponse.json({ error: "Gagal memperbarui profil" }, { status: 500 });
  }
}
