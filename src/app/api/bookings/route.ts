import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, CUSTOMER_TOKEN_NAME } from "@/lib/auth/jwt";
import { getDatabaseAdapter } from "@/lib/adapters";
import { BookingService } from "@/lib/services/booking-service";
import { validateBookingInput } from "@/lib/validators/booking-validator";

export async function GET() {
  try {
    const adapter = getDatabaseAdapter();
    const service = new BookingService(adapter);
    const bookings = await service.getAllBookings();

    return NextResponse.json({
      data: bookings,
      total: bookings.length,
      message: "Daftar booking",
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data booking." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      courtId,
      venueId,
      sportId,
      bookingDate,
      startTime,
      endTime,
      durationMinutes,
      notes,
    } = body;

    // ── Server-side validation using schema ──
    const validation = validateBookingInput({
      customerName: customerName?.trim() ?? "",
      customerPhone: customerPhone?.trim() ?? "",
      customerEmail: customerEmail?.trim(),
      courtId: courtId ?? "",
      venueId: venueId ?? "",
      sportId: sportId ?? "",
      bookingDate: bookingDate ?? "",
      startTime: startTime ?? "",
      endTime: endTime ?? "",
      durationMinutes: durationMinutes ?? 60,
      notes: notes?.trim(),
    });

    if (!validation.success) {
      const firstError = validation.errors?.[0] ?? "Input tidak valid.";
      return NextResponse.json({ error: firstError, errors: validation.errors }, { status: 400 });
    }

    const adapter = getDatabaseAdapter();
    const service = new BookingService(adapter);

    const booking = await service.createBooking({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail?.trim(),
      courtId,
      venueId: venueId ?? "",
      sportId: sportId ?? "",
      bookingDate,
      startTime,
      endTime,
      durationMinutes: durationMinutes ?? 60,
      notes: notes?.trim(),
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal memproses request.";
    // Return 409 for any conflict-related errors (double-booking prevention)
    const isConflict =
      message.includes("CONFLICT") ||
      message.includes("tidak tersedia") ||
      message.includes("dipesan") ||
      message.includes("diblokir");
    const status = isConflict ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
