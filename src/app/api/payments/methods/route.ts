import { NextResponse } from "next/server";
import { PaymentService } from "@/lib/services/payment-service";

const paymentService = new PaymentService();

export async function GET() {
  try {
    const methods = await paymentService.getActivePaymentMethods();
    return NextResponse.json({ methods });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch payment methods";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}