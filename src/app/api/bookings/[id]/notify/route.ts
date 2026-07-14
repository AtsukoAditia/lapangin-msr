import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { sendBookingCreated, sendAdminNewBookingAlert } from "@/lib/services/notification-service";

const globalForPg = globalThis as unknown as { __pgPool?: Pool };
const pool = globalForPg.__pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (!globalForPg.__pgPool) globalForPg.__pgPool = pool;

/**
 * POST — Send notification for a booking (admin or system use).
 * Resends the customer confirmation + admin alert for the given booking.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { rows } = await pool.query(
      `SELECT
         b.id, b.booking_code AS "bookingCode",
         b.customer_name AS "customerName",
         b.customer_phone AS "customerPhone",
         b.customer_email AS "customerEmail",
         b.venue_id AS "venueId",
         b.court_id AS "courtId",
         b.sport_id AS "sportId",
         b.booking_date AS "bookingDate",
         b.start_time AS "startTime",
         b.end_time AS "endTime",
         b.duration_minutes AS "durationMinutes",
         b.total_price AS "totalPrice",
         b.booking_status AS "bookingStatus",
         b.payment_status AS "paymentStatus",
         b.user_id AS "userId",
         b.expires_at AS "expiresAt",
         b.created_at AS "createdAt",
         b.updated_at AS "updatedAt"
       FROM bookings b
       WHERE b.id = $1 OR b.booking_code = $1`,
      [id],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Booking tidak ditemukan." },
        { status: 404 },
      );
    }

    const booking = rows[0];

    // Send notifications
    try {
      await sendBookingCreated(booking);
      await sendAdminNewBookingAlert(booking);
    } catch (err) {
      console.error("[notify] Failed to send notification:", err);
      return NextResponse.json(
        { error: "Gagal mengirim notifikasi." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notifikasi berhasil dikirim.",
      bookingCode: booking.bookingCode,
    });
  } catch (error) {
    console.error("[notify] Error:", error);
    return NextResponse.json(
      { error: "Gagal mengirim notifikasi." },
      { status: 500 },
    );
  }
}
