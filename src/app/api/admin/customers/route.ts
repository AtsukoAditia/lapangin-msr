import { NextResponse } from "next/server";
import { Pool } from "pg";

const globalForPg = globalThis as unknown as { __pgPool?: Pool };
const pool = globalForPg.__pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (!globalForPg.__pgPool) globalForPg.__pgPool = pool;

export async function GET() {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, phone, loyalty_points, total_spent, member_since, created_at
       FROM customers
       ORDER BY created_at DESC`
    );

    const customers = rows.map((r) => {
      const points = r.loyalty_points || 0;
      let loyaltyTier = "bronze";
      if (points >= 10000) loyaltyTier = "platinum";
      else if (points >= 5000) loyaltyTier = "gold";
      else if (points >= 2000) loyaltyTier = "silver";

      return {
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        loyaltyPoints: points,
        loyaltyTier,
        totalSpent: r.total_spent || 0,
        memberSince: r.member_since || r.created_at,
      };
    });

    return NextResponse.json({ customers });
  } catch (error) {
    console.error("Admin customers error:", error);
    return NextResponse.json({ error: "Gagal mengambil data pelanggan" }, { status: 500 });
  }
}
