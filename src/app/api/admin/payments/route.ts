import { NextResponse } from "next/server";
import { Pool } from "pg";

const globalForPg = globalThis as unknown as { __pgPool?: Pool };
const pool = globalForPg.__pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (!globalForPg.__pgPool) globalForPg.__pgPool = pool;

export async function GET() {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM bookings WHERE payment_status = 'waiting_confirmation' ORDER BY created_at DESC`
    );
    return NextResponse.json({ payments: rows });
  } catch (error) {
    console.error("Admin payments error:", error);
    return NextResponse.json({ error: "Gagal mengambil data pembayaran" }, { status: 500 });
  }
}
