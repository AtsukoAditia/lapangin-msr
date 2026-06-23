import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/lib/services/payment-service";

const paymentService = new PaymentService();

type RouteContext = { params: Promise<{ id: string }> };

async function handlePaymentAction(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body as { action?: string };

    if (!action || !["confirm", "reject"].includes(action)) {
      return NextResponse.json(
        { error: 'action harus "confirm" atau "reject"' },
        { status: 400 },
      );
    }

    const booking =
      action === "confirm"
        ? await paymentService.confirmPayment(id, "admin")
        : await paymentService.rejectPayment(id, "admin");

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal memproses pembayaran";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  return handlePaymentAction(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return handlePaymentAction(request, context);
}
