import { getDatabaseAdapter } from "@/lib/adapters";
import type { Booking, PaymentMethod } from "@/lib/types/domain";

// ponvian: midtrans-client has no types, any is unavoidable
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let MidtransClient: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  MidtransClient = require("midtrans-client");
} catch {
  // midtrans-client not installed — will fail gracefully
}

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "";
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true";

function getSnapClient() {
  if (!MidtransClient || !MIDTRANS_SERVER_KEY) return null;
  return new MidtransClient.Snap({
    isProduction: MIDTRANS_IS_PRODUCTION,
    serverKey: MIDTRANS_SERVER_KEY,
  });
}

export interface SnapTokenResult {
  token: string;
  redirectUrl: string;
}

export interface MidtransNotification {
  transaction_time: string;
  transaction_status: string;
  transaction_id: string;
  status_code: string;
  signature_key: string;
  payment_type: string;
  order_id: string;
  merchant_id: string;
  gross_amount: string;
  fraud_status?: string;
  settlement_time?: string;
}

export class PaymentService {
  private adapter = getDatabaseAdapter();

  async getActivePaymentMethods(): Promise<PaymentMethod[]> {
    return this.adapter.getActivePaymentMethods();
  }

  /**
   * Create a Midtrans Snap transaction token for a booking.
   * Returns null if Midtrans is not configured.
   */
  async createSnapToken(booking: Booking): Promise<SnapTokenResult | null> {
    const snap = getSnapClient();
    if (!snap) return null;

    const orderId = `LAP-${booking.bookingCode}-${Date.now()}`;
    const grossAmount = Math.round(booking.totalPrice);

    const param = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: booking.customerName,
        email: booking.customerEmail || undefined,
        phone: booking.customerPhone,
      },
      item_details: [
        {
          id: booking.courtId,
          price: grossAmount,
          quantity: 1,
          name: `Booking ${booking.bookingCode}`,
        },
      ],
      callbacks: {
        finish: `/booking/success?code=${booking.bookingCode}`,
      },
    };

    const transaction = await snap.createTransaction(param);

    // Store midtrans order id on booking
    await this.adapter.updateBookingMidtransOrderId(booking.id, orderId);

    return {
      token: transaction.token as string,
      redirectUrl: transaction.redirect_url as string,
    };
  }

  /**
   * Verify a Midtrans webhook notification.
   * Returns the parsed notification if signature is valid, null otherwise.
   */
  async verifyNotification(notification: MidtransNotification): Promise<MidtransNotification | null> {
    if (!MIDTRANS_SERVER_KEY) return null;

    // Verify signature using SHA-512

    const { createHash } = await import("crypto");
    const serverKey = MIDTRANS_SERVER_KEY;
    const statusCode = notification.status_code;
    const grossAmount = notification.gross_amount;
    const orderId = notification.order_id;
    const hash = createHash("sha512")
      .update(orderId + statusCode + grossAmount + serverKey)
      .digest("hex");

    if (notification.signature_key !== hash) {
      return null;
    }

    return notification;
  }

  /**
   * Process a verified Midtrans notification — update booking status.
   */
  async processNotification(notification: MidtransNotification): Promise<Booking | null> {
    const orderId = notification.order_id;
    // Extract booking code from order_id format: LAP-{code}-{timestamp}
    const match = orderId.match(/^LAP-(.+)-\d+$/);
    if (!match) return null;

    const bookingCode = match[1];
    const booking = await this.adapter.getBookingByCode(bookingCode);
    if (!booking) return null;

    // Store midtrans transaction id
    await this.adapter.updateBookingMidtransTransactionId(
      booking.id,
      notification.transaction_id,
    );

    const status = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    // Map Midtrans status to booking status
    if (status === "capture" && fraudStatus === "accept") {
      // Payment successful
      return this.adapter.updateBookingStatus(booking.id, "paid", "paid");
    }
    if (status === "settlement") {
      return this.adapter.updateBookingStatus(booking.id, "paid", "paid");
    }
    if (status === "deny" || status === "cancel" || status === "expire") {
      return this.adapter.updateBookingStatus(booking.id, "rejected", "rejected");
    }
    if (status === "pending") {
      // Keep waiting_payment
      return booking;
    }

    return booking;
  }

  async submitPaymentProof(
    bookingId: string,
    proofUrl: string,
    actorId?: string,
  ): Promise<Booking> {
    await this.adapter.expireBookings().catch(() => {});

    const booking = await this.adapter.getBookingById(bookingId);
    if (!booking) throw new Error("Booking not found");

    if (booking.bookingStatus === "expired") {
      throw new Error("Payment window has expired. Please create a new booking.");
    }

    if (
      booking.bookingStatus === "waiting_payment" &&
      booking.expiresAt &&
      new Date(booking.expiresAt).getTime() <= Date.now()
    ) {
      await this.adapter.expireBookings().catch(() => {});
      throw new Error("Payment window has expired. Please create a new booking.");
    }

    if (booking.bookingStatus !== "waiting_payment") {
      throw new Error(`Booking status ${booking.bookingStatus} cannot submit payment proof.`);
    }

    const updated = await this.adapter.submitPaymentProof(bookingId, proofUrl);

    await this.adapter.createAuditLog({
      action: "payment_proof_submitted",
      targetType: "booking",
      targetId: bookingId,
      actorType: "customer",
      actorId,
      details: `Payment proof submitted for booking ${booking.bookingCode}`,
      previousValue: booking.paymentStatus,
      newValue: "waiting_confirmation",
    });

    return updated;
  }

  async confirmPayment(bookingId: string, actorId?: string): Promise<Booking> {
    const booking = await this.adapter.getBookingById(bookingId);
    if (!booking) throw new Error("Booking not found");

    if (booking.paymentStatus !== "waiting_confirmation") {
      throw new Error("Payment is not awaiting confirmation");
    }

    const updated = await this.adapter.confirmPayment(bookingId, actorId);

    await this.adapter.createAuditLog({
      action: "payment_confirmed",
      targetType: "booking",
      targetId: bookingId,
      actorType: "admin",
      actorId,
      details: `Payment confirmed for booking ${booking.bookingCode}`,
      previousValue: booking.paymentStatus,
      newValue: "paid",
    });

    return updated;
  }

  async rejectPayment(bookingId: string, actorId?: string): Promise<Booking> {
    const booking = await this.adapter.getBookingById(bookingId);
    if (!booking) throw new Error("Booking not found");

    if (booking.paymentStatus !== "waiting_confirmation") {
      throw new Error("Payment is not awaiting confirmation");
    }

    const updated = await this.adapter.rejectPayment(bookingId, actorId);

    await this.adapter.createAuditLog({
      action: "payment_rejected",
      targetType: "booking",
      targetId: bookingId,
      actorType: "admin",
      actorId,
      details: `Payment rejected for booking ${booking.bookingCode}`,
      previousValue: booking.paymentStatus,
      newValue: "rejected",
    });

    return updated;
  }
}
