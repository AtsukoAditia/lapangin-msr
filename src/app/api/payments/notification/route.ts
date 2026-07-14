import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/lib/services/payment-service";
import { PAYMENT_CONFIG } from "@/config/payment";
import type { MidtransNotification } from "@/lib/services/payment-service";

const paymentService = new PaymentService();

export async function POST(request: NextRequest) {
  try {
    if (!PAYMENT_CONFIG.enabled) {
      return NextResponse.json({ status: "N/A" });
    }

    const notification: MidtransNotification = await request.json();

    // Verify signature
    const verified = await paymentService.verifyNotification(notification);
    if (!verified) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 },
      );
    }

    // Process booking status update
    const booking = await paymentService.processNotification(verified);

    return NextResponse.json({
      status: "ok",
      bookingId: booking?.id ?? null,
    });
  } catch (error) {
    console.error("Midtrans notification error:", error);
    // Always return 200 to Midtrans to prevent retries
    return NextResponse.json({ status: "ok" });
  }
}
