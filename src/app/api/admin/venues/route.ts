import { NextResponse } from "next/server";
import { Pool } from "pg";

const globalForPg = globalThis as unknown as { __pgPool?: Pool };
const pool = globalForPg.__pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (!globalForPg.__pgPool) globalForPg.__pgPool = pool;

export async function GET() {
  try {
    const { rows: venues } = await pool.query(
      `SELECT v.*, vo.business_name, vo.pic_name
       FROM venues v
       LEFT JOIN venue_owners vo ON vo.id = v.owner_id
       WHERE v.approval_status = 'pending_review'
       ORDER BY v.created_at DESC`,
    );
    return NextResponse.json({ venues });
  } catch (error) {
    console.error("Admin venues GET error:", error);
    return NextResponse.json({ error: "Gagal memuat data venue" }, { status: 500 });
  }
}
