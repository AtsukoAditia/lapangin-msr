import { NextRequest, NextResponse } from "next/server";
import { BookingService } from "@/lib/services/booking-service";
import { getDatabaseAdapter } from "@/lib/adapters";
import type { Booking } from "@/lib/types/domain";
import { bookingLimiter, getClientIP, checkRateLimit, sanitizeHTML } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);

    // Rate limit
    const rateLimited = await checkRateLimit(bookingLimiter, ip);
    if (rateLimited) {
      return NextResponse.json(
        { error: `Terlalu banyak request. Coba lagi dalam ${rateLimited.retryAfter} detik.` },
        { status: 429 },
      );
    }

    const body = await request.json();
    const bookingCode = sanitizeHTML(String(body.bookingCode || "")).slice(0, 20);
    const bookingId = sanitizeHTML(String(body.bookingId || "")).slice(0, 50);
    const phone = String(body.phone || "").replace(/[^0-9+]/g, "").slice(0, 20);
    const proofUrl = sanitizeHTML(String(body.proofUrl || "")).slice(0, 2000);

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
