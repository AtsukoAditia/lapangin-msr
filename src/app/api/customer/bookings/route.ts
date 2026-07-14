import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, CUSTOMER_TOKEN_NAME } from "@/lib/auth/jwt";
import { Pool } from "pg";

const globalForPg = globalThis as unknown as { __pgPool?: Pool };
const pool = globalForPg.__pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (!globalForPg.__pgPool) globalForPg.__pgPool = pool;

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(CUSTOMER_TOKEN_NAME)?.value;
    const session = token ? await verifyToken(token) : null;
    if (!session || session.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let sql = `
      SELECT b.*, v.name as venue_name, c.name as court_name, s.name as sport_name
      FROM bookings b
      LEFT JOIN venues v ON v.id = b.venue_id
      LEFT JOIN courts c ON c.id = b.court_id
      LEFT JOIN sports s ON s.id = b.sport_id
      WHERE b.user_id = $1
    `;
    const params: (string | number)[] = [session.userId];

    if (status) {
      params.push(status);
      sql += ` AND b.booking_status = $${params.length}`;
    }

    sql += " ORDER BY b.created_at DESC";

    const { rows } = await pool.query(sql, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("Customer bookings GET error:", error);
    return NextResponse.json({ error: "Gagal mengambil data booking" }, { status: 500 });
  }
}
