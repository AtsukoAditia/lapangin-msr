import { NextRequest, NextResponse } from "next/server";
import { getDatabaseAdapter } from "@/lib/adapters";
import { sanitizeHTML, bookingLimiter, getClientIP, checkRateLimit } from "@/lib/security";
import { Pool } from "pg";

// Reuse same pool as postgres-adapter
const globalForPg = globalThis as unknown as { __pgPool?: Pool };
const pool = globalForPg.__pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (!globalForPg.__pgPool) globalForPg.__pgPool = pool;

function formatPrice(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function generateBookingConfirmMessage(booking: {
  bookingCode: string; customerName: string; bookingDate: string;
  startTime: string; endTime: string; totalPrice: number;
  venueName?: string; courtName?: string;
}): string {
  return encodeURIComponent(
    `Halo ${booking.customerName}! 👋\n\n` +
    `Booking kamu sudah DIKONFIRMASI ✅\n\n` +
    `📋 Kode: ${booking.bookingCode}\n` +
    `🏟️ Venue: ${booking.venueName || "-"}\n` +
    `🏸 Lapangan: ${booking.courtName || "-"}\n` +
    `📅 Tanggal: ${formatDate(booking.bookingDate)}\n` +
    `⏰ Jam: ${booking.startTime} - ${booking.endTime}\n` +
    `💰 Total: ${formatPrice(booking.totalPrice)}\n\n` +
    `Tunjukkan kode booking ini saat datang. Terima kasih! 🙏`
  );
}

function generateReminderMessage(booking: {
  bookingCode: string; customerName: string; bookingDate: string;
  startTime: string; venueName?: string; courtName?: string;
}): string {
  return encodeURIComponent(
    `Halo ${booking.customerName}! 👋\n\n` +
    `⏰ Reminder: Booking kamu BESOK!\n\n` +
    `📋 Kode: ${booking.bookingCode}\n` +
    `🏟️ Venue: ${booking.venueName || "-"}\n` +
    `🏸 Lapangan: ${booking.courtName || "-"}\n` +
    `📅 Tanggal: ${formatDate(booking.bookingDate)}\n` +
    `⏰ Jam: ${booking.startTime}\n\n` +
    `Jangan terlambat ya! See you there 🏃‍♂️`
  );
}

function generateRatingMessage(booking: {
  bookingCode: string; customerName: string; venueName?: string;
}): string {
  return encodeURIComponent(
    `Halo ${booking.customerName}! 👋\n\n` +
    `Gimana pengalaman main di ${booking.venueName || "venue"} kemarin? 🏸\n\n` +
    `Kasih rating dan review yuk biar venue bisa makin bagus! ⭐\n\n` +
    `Terima kasih! 🙏`
  );
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const rateLimited = await checkRateLimit(bookingLimiter, ip);
    if (rateLimited) {
      return NextResponse.json(
        { error: `Terlalu banyak request. Coba lagi dalam ${rateLimited.retryAfter} detik.` },
        { status: 429 }
      );
    }

    const raw = await request.json();
    const bookingId = sanitizeHTML(String(raw.bookingId || "")).slice(0, 50);
    const type = sanitizeHTML(String(raw.type || "confirm")).slice(0, 20);
    const phone = sanitizeHTML(String(raw.phone || "")).slice(0, 20);

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId wajib diisi" }, { status: 400 });
    }

    const adapter = getDatabaseAdapter();
    const booking = await adapter.getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
    }

    const venues = await adapter.getVenues();
    const courts = await adapter.getCourts();
    const venue = venues.find((v) => v.id === booking.venueId);
    const court = courts.find((c) => c.id === booking.courtId);

    const customerPhone = phone || booking.customerPhone;
    if (!customerPhone) {
      return NextResponse.json({ error: "Nomor telepon customer tidak tersedia" }, { status: 400 });
    }

    const formattedPhone = customerPhone.replace(/^0/, "62").replace(/[^0-9]/g, "");

    let message: string;
    let messageType: string;

    switch (type) {
      case "confirm":
        message = generateBookingConfirmMessage({ ...booking, venueName: venue?.name, courtName: court?.name });
        messageType = "booking_confirmed";
        break;
      case "reminder":
        message = generateReminderMessage({ ...booking, venueName: venue?.name, courtName: court?.name });
        messageType = "reminder";
        break;
      case "rating":
        message = generateRatingMessage({ ...booking, venueName: venue?.name });
        messageType = "rating_request";
        break;
      default:
        return NextResponse.json({ error: "Type tidak valid. Gunakan: confirm, reminder, rating" }, { status: 400 });
    }

    await pool.query(
      `INSERT INTO notification_logs (id, booking_id, type, channel, recipient, message, status)
       VALUES (gen_random_uuid(), $1, $2, 'whatsapp', $3, $4, 'sent')`,
      [bookingId, messageType, formattedPhone, decodeURIComponent(message)]
    );

    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${message}`;

    return NextResponse.json({
      success: true,
      type: messageType,
      phone: formattedPhone,
      whatsappUrl,
      message: decodeURIComponent(message),
    });
  } catch (error) {
    console.error("WhatsApp notification error:", error);
    return NextResponse.json({ error: "Gagal mengirim notifikasi WhatsApp" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM notification_logs WHERE channel = 'whatsapp' ORDER BY created_at DESC LIMIT 100`
    );
    return NextResponse.json({ logs: rows });
  } catch (error) {
    console.error("WhatsApp logs error:", error);
    return NextResponse.json({ error: "Gagal mengambil log notifikasi" }, { status: 500 });
  }
}
