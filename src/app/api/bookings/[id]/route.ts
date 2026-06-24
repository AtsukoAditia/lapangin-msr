import { NextResponse } from "next/server";
import { BookingService } from "@/lib/services/booking-service";
import { getDatabaseAdapter } from "@/lib/adapters";
import type { Booking } from "@/lib/types/domain";

/**
 * Public booking lookup by bookingCode.
 * Only exposes safe fields — no phone, email, or personal data.
 * Also runs expiry cleanup before responding.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: code } = await params;
    const adapter = getDatabaseAdapter();
    const service = new BookingService(adapter);

    // Expire stale bookings before lookup
    await service.expireBookings();

    const booking = await service.getBookingByCode(code);

    if (!booking) {
      return NextResponse.json(
        { error: "Booking tidak ditemukan." },
        { status: 404 },
      );
    }

    // Return only public-safe fields
    const safe = toPublicBooking(booking);
    return NextResponse.json(safe);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal mengambil data booking.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function toPublicBooking(b: Booking) {
  return {
    id: b.id,
    bookingCode: b.bookingCode,
    customerName: b.customerName,
    venueId: b.venueId,
    courtId: b.courtId,
    sportId: b.sportId,
    bookingDate: b.bookingDate,
    startTime: b.startTime,
    endTime: b.endTime,
    durationMinutes: b.durationMinutes,
    totalPrice: b.totalPrice,
    bookingStatus: b.bookingStatus,
    paymentStatus: b.paymentStatus,
    expiresAt: b.expiresAt,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}