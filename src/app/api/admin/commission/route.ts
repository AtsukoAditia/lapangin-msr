import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, ADMIN_TOKEN_NAME } from "@/lib/auth/jwt";
import { getDatabaseAdapter } from "@/lib/adapters";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_TOKEN_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const session = await verifyToken(token);
    if (!session || !["admin", "super_admin"].includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const adapter = getDatabaseAdapter();
    const [venues, bookings, sports] = await Promise.all([
      adapter.getVenues(),
      adapter.getBookings(),
      adapter.getSports(),
    ]);

    const confirmed = bookings.filter(
      (b) => b.bookingStatus === "confirmed" || b.bookingStatus === "completed"
    );

    const venueMap = new Map(venues.map((v) => [v.id, v]));

    // Per-venue commission summary
    const byVenue = venues.map((v) => {
      const venueBookings = confirmed.filter((b) => b.venueId === v.id);
      const totalRevenue = venueBookings.reduce((s, b) => s + b.totalPrice, 0);
      const rate = v.commissionRate ?? 10;
      const feeType = v.platformFeeType ?? "percentage";
      const feeValue = v.platformFeeValue ?? 0;

      let totalCommission: number;
      if (feeType === "fixed") {
        totalCommission = venueBookings.length * feeValue;
      } else {
        totalCommission = Math.round(totalRevenue * (rate / 100));
      }

      return {
        venueId: v.id,
        venueName: v.name,
        commissionRate: rate,
        platformFeeType: feeType,
        platformFeeValue: feeValue,
        totalRevenue,
        totalCommission,
        ownerPayout: totalRevenue - totalCommission,
        bookingCount: venueBookings.length,
      };
    });

    const totalRevenue = confirmed.reduce((s, b) => s + b.totalPrice, 0);
    const totalCommission = byVenue.reduce((s, v) => s + v.totalCommission, 0);

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalCommission,
        ownerPayout: totalRevenue - totalCommission,
        venueCount: venues.length,
      },
      venues: byVenue,
    });
  } catch (error) {
    console.error("Commission API error:", error);
    return NextResponse.json({ error: "Gagal mengambil data komisi" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_TOKEN_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const session = await verifyToken(token);
    if (!session || session.role !== "super_admin") {
      return NextResponse.json({ error: "Hanya super admin" }, { status: 403 });
    }

    const body = await request.json();
    const { venueId, commissionRate, platformFeeType, platformFeeValue } = body;

    if (!venueId) return NextResponse.json({ error: "venueId wajib" }, { status: 400 });

    const adapter = getDatabaseAdapter();
    const config: Record<string, unknown> = {};
    if (commissionRate !== undefined) config.commission_rate = commissionRate;
    if (platformFeeType !== undefined) config.platform_fee_type = platformFeeType;
    if (platformFeeValue !== undefined) config.platform_fee_value = platformFeeValue;

    // ponytail: updateVenueConfig only updates JSONB columns. Direct SQL needed for commission columns.
    const { Pool } = await import("pg");
    const pool = globalThis.__pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
    if (!globalThis.__pgPool) globalThis.__pgPool = pool;

    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    if (commissionRate !== undefined) { sets.push(`commission_rate = $${i++}`); vals.push(commissionRate); }
    if (platformFeeType !== undefined) { sets.push(`platform_fee_type = $${i++}`); vals.push(platformFeeType); }
    if (platformFeeValue !== undefined) { sets.push(`platform_fee_value = $${i++}`); vals.push(platformFeeValue); }
    sets.push("updated_at = NOW()");
    vals.push(venueId);

    await pool.query(`UPDATE venues SET ${sets.join(", ")} WHERE id = $${i}`, vals);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Commission update error:", error);
    return NextResponse.json({ error: "Gagal update komisi" }, { status: 500 });
  }
}
