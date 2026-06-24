import { NextRequest, NextResponse } from "next/server";
import { getDatabaseAdapter } from "@/lib/adapters";
import { AvailabilityService } from "@/lib/services/availability-service";
import { BookingService } from "@/lib/services/booking-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courtId = searchParams.get("courtId");
    const date = searchParams.get("date");
    const openTime = searchParams.get("openTime") ?? undefined;
    const closeTime = searchParams.get("closeTime") ?? undefined;
    const rawDuration = searchParams.get("slotDurationMinutes");
    const slotDurationMinutes = rawDuration ? Number(rawDuration) : undefined;

    if (!courtId || !date) {
      return NextResponse.json(
        { error: "Parameter courtId dan date wajib diisi." },
        { status: 400 }
      );
    }

    if (
      slotDurationMinutes !== undefined &&
      (!Number.isFinite(slotDurationMinutes) || slotDurationMinutes <= 0)
    ) {
      return NextResponse.json(
        { error: "slotDurationMinutes tidak valid." },
        { status: 400 }
      );
    }

    const adapter = getDatabaseAdapter();

    // Expire stale waiting_payment bookings before checking availability
    const bookingService = new BookingService(adapter);
    await bookingService.expireBookings().catch(() => {
      // non-critical — don't fail availability check
    });

    const service = new AvailabilityService(adapter);

    const slots = await service.getAvailableSlots({
      courtId,
      date,
      openTime,
      closeTime,
      slotDurationMinutes,
    });

    return NextResponse.json({
      data: slots,
      total: slots.length,
      available: slots.filter((s) => s.isAvailable).length,
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data ketersediaan." },
      { status: 500 }
    );
  }
}
