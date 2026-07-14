import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { cookies } from "next/headers";
import { verifyToken, CUSTOMER_TOKEN_NAME } from "@/lib/auth/jwt";

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
      `SELECT * FROM notification_logs
       WHERE recipient = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [session.userId || ""],
    );

    return NextResponse.json({ notifications: rows });
  } catch (error) {
    console.error("Customer notifications GET error:", error);
    return NextResponse.json({ error: "Gagal mengambil notifikasi" }, { status: 500 });
  }
}
