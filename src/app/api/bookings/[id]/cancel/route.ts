import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, CUSTOMER_TOKEN_NAME } from "@/lib/auth/jwt";
import { Pool } from "pg";

const globalForPg = globalThis as unknown as { __pgPool?: Pool };
const pool = globalForPg.__pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (!globalForPg.__pgPool) globalForPg.__pgPool = pool;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(CUSTOMER_TOKEN_NAME)?.value;
    const session = token ? await verifyToken(token) : null;
    if (!session || session.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookingId } = await params;

    // Verify ownership and cancellable status
    const { rows: bookings } = await pool.query(
      `SELECT id, booking_status, payment_status, user_id FROM bookings WHERE id = $1`,
      [bookingId]
    );

    if (bookings.length === 0) {
      return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
    }

    const booking = bookings[0];

    if (booking.user_id !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const canCancel =
      booking.booking_status === "waiting_payment" || booking.payment_status === "unpaid";

    if (!canCancel) {
      return NextResponse.json(
        { error: "Booking tidak bisa dibatalkan" },
        { status: 400 }
      );
    }

    const { rows: updated } = await pool.query(
      `UPDATE bookings SET booking_status = 'cancelled', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [bookingId]
    );

    return NextResponse.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error("Booking cancel error:", error);
    return NextResponse.json({ error: "Gagal membatalkan booking" }, { status: 500 });
  }
}
