import { NextResponse } from "next/server";
import { Pool } from "pg";

const globalForPg = globalThis as unknown as { __pgPool?: Pool };
const pool = globalForPg.__pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (!globalForPg.__pgPool) globalForPg.__pgPool = pool;

/**
 * GET /api/bookings/[id]/invoice
 * Returns invoice data for a booking. Public with phone verification.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: bookingIdOrCode } = await params;
    const url = new URL(request.url);
    const phone = url.searchParams.get("phone")?.replace(/[^0-9+]/g, "") || "";

    const { rows } = await pool.query(
      `SELECT
         b.id, b.booking_code, b.customer_name, b.customer_phone,
         b.customer_email, b.booking_date, b.start_time, b.end_time,
         b.duration_minutes, b.total_price, b.booking_status, b.payment_status,
         b.notes, b.created_at, b.payment_verified_at,
         v.name AS venue_name, v.address AS venue_address,
         v.phone AS venue_phone,
         c.name AS court_name, c.base_price,
         s.name AS sport_name
       FROM bookings b
       LEFT JOIN venues v ON v.id = b.venue_id
       LEFT JOIN courts c ON c.id = b.court_id
       LEFT JOIN sports s ON s.id = b.sport_id
       WHERE b.id = $1 OR b.booking_code = $1
       LIMIT 1`,
      [bookingIdOrCode],
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Booking tidak ditemukan." }, { status: 404 });
    }

    const b = rows[0];

    // Phone verification
    if (phone && b.customer_phone) {
      const normalize = (p: string) => p.replace(/\D/g, "").replace(/^62/, "0");
      if (normalize(phone) !== normalize(b.customer_phone)) {
        return NextResponse.json({ error: "Nomor telepon tidak sesuai." }, { status: 403 });
      }
    }

    // Calculate pricing breakdown
    const baseHourly = b.base_price ?? 0;
    const hours = b.duration_minutes / 60;
    const baseTotal = Math.round(hours * baseHourly);
    const dynamicPrice = b.total_price;
    const discount = baseTotal - dynamicPrice;

    return NextResponse.json({
      bookingId: b.id,
      bookingCode: b.booking_code,
      customerName: b.customer_name,
      customerPhone: b.customer_phone,
      customerEmail: b.customer_email,
      bookingDate: b.booking_date,
      startTime: b.start_time,
      endTime: b.end_time,
      durationMinutes: b.duration_minutes,
      venueName: b.venue_name,
      venueAddress: b.venue_address,
      venuePhone: b.venue_phone,
      courtName: b.court_name,
      sportName: b.sport_name,
      pricing: {
        basePricePerHour: baseHourly,
        hours,
        baseTotal,
        discount,
        total: dynamicPrice,
      },
      bookingStatus: b.booking_status,
      paymentStatus: b.payment_status,
      notes: b.notes,
      createdAt: b.created_at,
      paidAt: b.payment_verified_at,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil data invoice.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
