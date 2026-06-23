import { getDatabaseAdapter } from "@/lib/adapters";
import type { Booking, PaymentMethod } from "@/lib/types/domain";

export class PaymentService {
  private adapter = getDatabaseAdapter();

  async getActivePaymentMethods(): Promise<PaymentMethod[]> {
    return this.adapter.getActivePaymentMethods();
  }

  async submitPaymentProof(
    bookingId: string,
    proofUrl: string,
    actorId?: string,
  ): Promise<Booking> {
    const booking = await this.adapter.getBookingById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.bookingStatus !== "pending") {
      throw new Error("Only pending bookings can submit payment proof");
    }

    const updated = await this.adapter.submitPaymentProof(bookingId, proofUrl);

    await this.adapter.createAuditLog({
      action: "payment_proof_submitted",
      targetType: "booking",
      targetId: bookingId,
      actorType: "customer",
      actorId,
      details: `Payment proof submitted for booking ${booking.bookingCode}`,
      newValue: proofUrl,
    });

    return updated;
  }

  async confirmPayment(bookingId: string, actorId?: string): Promise<Booking> {
    const booking = await this.adapter.getBookingById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

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
    if (!booking) {
      throw new Error("Booking not found");
    }

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
      newValue: "unpaid",
    });

    return updated;
  }
}