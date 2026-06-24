import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, CUSTOMER_TOKEN_NAME } from "@/lib/auth/jwt";
import { getDatabaseAdapter } from "@/lib/adapters";
import { BookingService } from "@/lib/services/booking-service";
import { validateBookingInput } from "@/lib/validators/booking-validator";

export async function GET() {
  return NextResponse.json(
    {
      error:
        "Public booking list is disabled. Use admin routes or customer-specific lookup endpoints.",
    },
    { status: 405 },
  );
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

    let userId: string | undefined;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(CUSTOMER_TOKEN_NAME)?.value;
      if (token) {
        const session = await verifyToken(token);
        if (session?.role === "customer" && session.userId) {
          userId = session.userId;
        }
      }
    } catch {
      // Guest booking — no userId
    }

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
      return NextResponse.json(
        { error: firstError, errors: validation.errors },
        { status: 400 },
      );
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
      userId,
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal memproses request.";
    const isConflict =
      message.includes("CONFLICT") ||
      message.includes("tidak tersedia") ||
      message.includes("dipesan") ||
      message.includes("diblokir");
    const status = isConflict ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
