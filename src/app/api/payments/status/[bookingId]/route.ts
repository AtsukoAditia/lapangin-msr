import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, CUSTOMER_TOKEN_NAME } from "@/lib/auth/jwt";
import { getDatabaseAdapter } from "@/lib/adapters";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(CUSTOMER_TOKEN_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const session = await verifyToken(token);
    if (!session || (session.role !== "customer" && session.role !== "admin" && session.role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await params;
    const adapter = getDatabaseAdapter();
    const booking = await adapter.getBookingById(bookingId);

    if (!booking) {
      return NextResponse.json({ error: "Booking tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      paymentStatus: booking.paymentStatus,
      paymentMethod: booking.paymentMethod ?? "manual",
      midtransOrderId: booking.midtransOrderId ?? null,
      totalPrice: booking.totalPrice,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal mengecek status.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
