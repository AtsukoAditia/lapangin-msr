import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, CUSTOMER_TOKEN_NAME } from "@/lib/auth/jwt";
import { getDatabaseAdapter } from "@/lib/adapters";
import { PaymentService } from "@/lib/services/payment-service";
import { PAYMENT_CONFIG } from "@/config/payment";

const paymentService = new PaymentService();

export async function POST(request: NextRequest) {
  try {
    if (!PAYMENT_CONFIG.enabled) {
      return NextResponse.json(
        { error: "Pembayaran online tidak tersedia." },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(CUSTOMER_TOKEN_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const session = await verifyToken(token);
    if (!session || (session.role !== "customer" && session.role !== "admin" && session.role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await request.json();
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId wajib diisi." }, { status: 400 });
    }

    const adapter = getDatabaseAdapter();
    const booking = await adapter.getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking tidak ditemukan." }, { status: 404 });
    }

    // Update payment method to midtrans
    await adapter.updateBookingPaymentMethod(bookingId, "midtrans");

    const result = await paymentService.createSnapToken({
      ...booking,
      paymentMethod: "midtrans" as const,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Gagal membuat transaksi Midtrans." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      snapToken: result.token,
      redirectUrl: result.redirectUrl,
      bookingCode: booking.bookingCode,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal memproses pembayaran.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
