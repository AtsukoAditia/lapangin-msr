import { NextRequest, NextResponse } from "next/server";

// In-memory mock store (persists only during server lifetime)
const mockBookings: Array<{
  id: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  courtId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  paymentStatus: string;
  bookingStatus: string;
  notes?: string;
  createdAt: string;
}> = [];

function generateBookingCode(): string {
  const now = new Date();
  const datePart =
    String(now.getFullYear()).slice(2) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${datePart}-${rand}`;
}

export async function GET() {
  return NextResponse.json({
    data: mockBookings,
    total: mockBookings.length,
    message: "Daftar booking (mock)",
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, customerEmail, courtId, bookingDate, startTime, endTime, notes } = body;

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

    // Double booking check against active statuses
    const activeStatuses = ["pending", "waiting_payment", "paid", "confirmed"];
    const conflict = mockBookings.find(
      (b) =>
        b.courtId === courtId &&
        b.bookingDate === bookingDate &&
        b.startTime === startTime &&
        b.endTime === endTime &&
        activeStatuses.includes(b.bookingStatus)
    );

    if (conflict) {
      return NextResponse.json(
        { error: "Slot sudah dibooking. Silakan pilih jam lain." },
        { status: 409 }
      );
    }

    const bookingCode = generateBookingCode();
    const now = new Date().toISOString();

    const booking = {
      id: crypto.randomUUID(),
      bookingCode,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail?.trim() || undefined,
      courtId,
      bookingDate,
      startTime,
      endTime,
      totalPrice: 0, // Will be calculated by pricing service later
      paymentStatus: "unpaid",
      bookingStatus: "pending",
      notes: notes?.trim() || undefined,
      createdAt: now,
    };

    mockBookings.push(booking);

    return NextResponse.json(booking, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Gagal memproses request." },
      { status: 500 }
    );
  }
}