import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, CUSTOMER_TOKEN_NAME, hashPassword, verifyPassword } from "@/lib/auth/jwt";
import { Pool } from "pg";

const globalForPg = globalThis as unknown as { __pgPool?: Pool };
const pool = globalForPg.__pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (!globalForPg.__pgPool) globalForPg.__pgPool = pool;

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(CUSTOMER_TOKEN_NAME)?.value;
    const session = token ? await verifyToken(token) : null;
    if (!session || session.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Password lama dan baru wajib diisi" }, { status: 400 });
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password baru minimal 8 karakter" },
        { status: 400 }
      );
    }

    const { rows } = await pool.query(
      "SELECT password_hash FROM customers WHERE id = $1",
      [session.userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Customer tidak ditemukan" }, { status: 404 });
    }

    const valid = verifyPassword(currentPassword, rows[0].password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Password lama salah" }, { status: 400 });
    }

    const newHash = hashPassword(newPassword);
    await pool.query(
      "UPDATE customers SET password_hash = $1, updated_at = NOW() WHERE id = $2",
      [newHash, session.userId]
    );

    return NextResponse.json({ success: true, message: "Password berhasil diubah" });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Gagal mengubah password" }, { status: 500 });
  }
}
