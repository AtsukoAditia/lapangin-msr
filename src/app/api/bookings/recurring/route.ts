import { NextRequest, NextResponse } from "next/server";
import { getDatabaseAdapter } from "@/lib/adapters";
import { BookingService } from "@/lib/services/booking-service";
import { bookingLimiter, getClientIP, checkRateLimit } from "@/lib/security";
import { cookies } from "next/headers";
import { verifyToken, CUSTOMER_TOKEN_NAME } from "@/lib/auth/jwt";
import { Pool } from "pg";

const globalForPg = globalThis as unknown as { __pgPool?: Pool };
const pool = globalForPg.__pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (!globalForPg.__pgPool) globalForPg.__pgPool = pool;

/**
 * POST /api/bookings/recurring
 * Creates a series of weekly/biweekly/monthly bookings linked by recurring_group_id.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const rateLimited = await checkRateLimit(bookingLimiter, ip);
    if (rateLimited) {
      return NextResponse.json(
        { error: `Terlalu banyak booking. Coba lagi dalam ${rateLimited.retryAfter} detik.` },
        { status: 429 },
      );
    }

    const rawBody = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      courtId,
      venueId,
      sportId,
      startDate,
      startTime,
      endTime,
      recurrenceType,
      recurrenceEndDate,
      notes,
    } = rawBody;

    if (!customerName?.trim() || !customerPhone?.trim()) {
      return NextResponse.json({ error: "Nama dan nomor HP wajib diisi." }, { status: 400 });
    }
    if (!venueId || !courtId || !sportId) {
      return NextResponse.json({ error: "Data lapangan tidak lengkap." }, { status: 400 });
    }
    if (!startDate || !startTime || !endTime) {
      return NextResponse.json({ error: "Tanggal dan waktu wajib diisi." }, { status: 400 });
    }
    if (!recurrenceType || !["weekly", "biweekly", "monthly"].includes(recurrenceType)) {
      return NextResponse.json({ error: "Tipe rekurensi tidak valid." }, { status: 400 });
    }
    if (!recurrenceEndDate) {
      return NextResponse.json({ error: "Tanggal akhir rekurensi wajib diisi." }, { status: 400 });
    }

    const start = new Date(startDate + "T00:00:00");
    const end = new Date(recurrenceEndDate + "T00:00:00");
    if (end <= start) {
      return NextResponse.json({ error: "Tanggal akhir harus setelah tanggal mulai." }, { status: 400 });
    }

    const maxEnd = new Date(start);
    maxEnd.setDate(maxEnd.getDate() + 12 * 7);
    if (end > maxEnd) {
      return NextResponse.json({ error: "Maksimal 12 minggu ke depan." }, { status: 400 });
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json({ error: "Format waktu tidak valid." }, { status: 400 });
    }
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const durationMinutes = (eh * 60 + em) - (sh * 60 + sm);
    if (durationMinutes <= 0) {
      return NextResponse.json({ error: "Jam selesai harus setelah jam mulai." }, { status: 400 });
    }

    // Generate dates
    const dates: string[] = [];
    const d = new Date(start);
    while (d <= end) {
      dates.push(d.toISOString().slice(0, 10));
      if (recurrenceType === "weekly") d.setDate(d.getDate() + 7);
      else if (recurrenceType === "biweekly") d.setDate(d.getDate() + 14);
      else d.setMonth(d.getMonth() + 1);
    }

    if (dates.length > 12) {
      return NextResponse.json({ error: "Maksimal 12 booking dalam satu seri." }, { status: 400 });
    }

    // Auth (optional)
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
      // Guest booking
    }

    const adapter = getDatabaseAdapter();
    const service = new BookingService(adapter);
    const groupId = `RG-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const created: { bookingCode: string; bookingDate: string }[] = [];
    const errors: { date: string; error: string }[] = [];

    for (const bookingDate of dates) {
      try {
        const booking = await service.createBooking({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail?.trim(),
          courtId,
          venueId,
          sportId,
          bookingDate,
          startTime,
          endTime,
          durationMinutes,
          notes: notes?.trim(),
          userId,
        });

        // Tag with recurring fields
        await pool.query(
          `UPDATE bookings SET
             recurring_group_id = $1,
             recurrence_type = $2,
             recurrence_end_date = $3,
             updated_at = NOW()
           WHERE id = $4`,
          [groupId, recurrenceType, recurrenceEndDate, booking.id],
        );

        created.push({ bookingCode: booking.bookingCode, bookingDate });
      } catch (err) {
        errors.push({
          date: bookingDate,
          error: err instanceof Error ? err.message : "Gagal membuat booking.",
        });
      }
    }

    return NextResponse.json(
      {
        groupId,
        recurrenceType,
        totalDates: dates.length,
        createdCount: created.length,
        errorCount: errors.length,
        bookings: created,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: created.length > 0 ? 201 : 409 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memproses request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
