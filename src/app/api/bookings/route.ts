import { NextRequest, NextResponse } from "next/server";
import { getDatabaseAdapter } from "@/lib/adapters";
import { BookingService } from "@/lib/services/booking-service";

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

    // Server-side validation
    if (!customerName?.trim()) {
      return NextResponse.json({ error: "Nama wajib diisi." }, { status: 400 });
    }
    if (!customerPhone?.trim()) {
      return NextResponse.json({ error: "Nomor HP wajib diisi." }, { status: 400 });
    }
    if (!courtId) {
      return NextResponse.json({ error: "Court ID wajib diisi." }, { status: 400 });
    }
    if (!bookingDate || !startTime || !endTime) {
      return NextResponse.json({ error: "Tanggal dan jam wajib diisi." }, { status: 400 });
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
    const status = message.includes("tidak tersedia") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}