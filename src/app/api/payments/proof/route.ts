import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/lib/services/payment-service";
import type { Booking } from "@/lib/types/domain";

const paymentService = new PaymentService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, proofUrl } = body;

    if (!bookingId || !proofUrl) {
      return NextResponse.json(
        { error: "bookingId and proofUrl are required" },
        { status: 400 },
      );
    }

    const booking = await paymentService.submitPaymentProof(bookingId, proofUrl);
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
