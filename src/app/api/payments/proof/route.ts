import { NextRequest, NextResponse } from "next/server";
import { BookingService } from "@/lib/services/booking-service";
import { getDatabaseAdapter } from "@/lib/adapters";
import type { Booking } from "@/lib/types/domain";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingCode, bookingId, phone, proofUrl } = body;

    if (!proofUrl) {
      return NextResponse.json(
        { error: "proofUrl is required" },
        { status: 400 },
      );
    }

    if (!bookingCode && !bookingId) {
      return NextResponse.json(
        { error: "bookingCode is required" },
        { status: 400 },
      );
    }

    const adapter = getDatabaseAdapter();
    const service = new BookingService(adapter);

    // Prefer public-safe lookup by booking code. `bookingId` is kept only as a
    // temporary compatibility path for the current success page and should be
    // removed after the UI sends bookingCode + phone verification consistently.
    const booking = bookingCode
      ? await service.submitPaymentProofByCode({
          bookingCode,
          phone,
          proofUrl,
        })
      : await service.submitPaymentProof(bookingId, proofUrl);

    return NextResponse.json({ success: true, booking: toPublicPaymentBooking(booking) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to submit payment proof";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

function toPublicPaymentBooking(booking: Booking) {
  return {
    id: booking.id,
    bookingCode: booking.bookingCode,
    bookingStatus: booking.bookingStatus,
    paymentStatus: booking.paymentStatus,
    expiresAt: booking.expiresAt,
    updatedAt: booking.updatedAt,
  };
}
