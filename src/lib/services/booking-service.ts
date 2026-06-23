import type { CreateBookingInput, DatabaseAdapter } from "@/lib/adapters/database-adapter";
import type { Booking, AuditLogAction } from "@/lib/types/domain";
import { calculatePrice } from "./pricing-service";
import { hasBlockedSlotConflict, hasBookingConflict } from "./availability-service";
import {
  sendBookingCreated,
  sendBookingConfirmation,
  sendBookingRejection,
  sendBookingCancellation,
  sendAdminNewBookingAlert,
} from "./notification-service";

export class BookingService {
  constructor(private readonly adapter: DatabaseAdapter) {}

  async getAllBookings(): Promise<Booking[]> {
    return this.adapter.getBookings();
  }

  async getBookingsByCourtAndDate(courtId: string, date: string): Promise<Booking[]> {
    return this.adapter.getBookingsByCourtAndDate(courtId, date);
  }

  /**
   * Create a booking with double-booking prevention.
   *
   * Flow:
   * 1. Validate time range (start < end, valid format).
   * 2. Check for conflicts with existing bookings and blocked slots.
   * 3. Calculate price using pricing rules.
   * 4. Save booking (adapter layer also does a final conflict check).
   * 5. Log audit entry for booking creation.
   */
  async createBooking(input: Omit<CreateBookingInput, "totalPrice" | "durationMinutes"> & {
    durationMinutes: number;
  }): Promise<Booking> {
    // ── 1. Validate time range ──
    if (!isValidTimeRange(input.startTime, input.endTime)) {
      throw new Error("Format waktu tidak valid. Pastikan jam mulai < jam selesai.");
    }

    if (input.durationMinutes <= 0) {
      throw new Error("Durasi booking harus lebih dari 0 menit.");
    }

    if (input.durationMinutes % 30 !== 0) {
      throw new Error("Durasi booking harus kelipatan 30 menit.");
    }

    // ── 2. Check for conflicts (first pass — fast rejection) ──
    const [existingBookings, blockedSlots, pricingRules, courts] = await Promise.all([
      this.adapter.getBookingsByCourtAndDate(input.courtId, input.bookingDate),
      this.adapter.getBlockedSlots(input.courtId, input.bookingDate),
      this.adapter.getPricingRules(input.courtId),
      this.adapter.getCourts(),
    ]);

    const bookingConflict = hasBookingConflict(existingBookings, input.startTime, input.endTime);
    const blockedConflict = hasBlockedSlotConflict(blockedSlots, input.startTime, input.endTime);

    if (bookingConflict || blockedConflict) {
      throw new Error("CONFLICT: Slot sudah dipesan atau diblokir. Silakan pilih jam lain.");
    }

    // ── 3. Calculate price ──
    const courtData = courts.find((c) => c.id === input.courtId);
    if (!courtData) {
      throw new Error("Lapangan tidak ditemukan.");
    }

    const basePrice = courtData.basePrice ?? 0;
    const totalPrice = calculatePrice({
      durationMinutes: input.durationMinutes,
      basePrice,
      pricingRules,
    });

    // ── 4. Re-check conflicts right before save (double-booking prevention) ──
    // This prevents race conditions where two requests pass step 2 simultaneously.
    const freshBookings = await this.adapter.getBookingsByCourtAndDate(
      input.courtId,
      input.bookingDate,
    );
    const freshConflict = hasBookingConflict(freshBookings, input.startTime, input.endTime);
    if (freshConflict) {
      throw new Error("CONFLICT: Slot baru saja dipesan oleh pengguna lain. Silakan pilih jam lain.");
    }

    const booking = await this.adapter.createBooking({
      ...input,
      totalPrice,
    });

    // ── 5. Audit log ──
    await this.logAudit("booking_created", booking.id, "customer", undefined,
      `Booking ${booking.bookingCode} created: ${input.bookingDate} ${input.startTime}-${input.endTime}`
    );

    // ── 6. Send notifications (non-blocking) ──
    try {
      await sendBookingCreated(booking);
      await sendAdminNewBookingAlert(booking);
    } catch {
      console.error("[BookingService] Notification failed for booking creation");
    }

    return booking;
  }

  async confirmBooking(id: string, actorId?: string): Promise<Booking> {
    const booking = await this.getBookingOrThrow(id);
    const result = await this.adapter.updateBookingStatus(id, "confirmed");
    await this.logAudit("booking_status_changed", id, "admin", actorId,
      `Booking ${booking.bookingCode} confirmed`,
      booking.bookingStatus, "confirmed"
    );
    try { await sendBookingConfirmation(result); } catch { /* non-blocking */ }
    return result;
  }

  async rejectBooking(id: string, actorId?: string): Promise<Booking> {
    const booking = await this.getBookingOrThrow(id);
    const result = await this.adapter.updateBookingStatus(id, "rejected");
    await this.logAudit("booking_status_changed", id, "admin", actorId,
      `Booking ${booking.bookingCode} rejected`,
      booking.bookingStatus, "rejected"
    );
    try { await sendBookingRejection(result); } catch { /* non-blocking */ }
    return result;
  }

  async cancelBooking(id: string, actorId?: string): Promise<Booking> {
    const booking = await this.getBookingOrThrow(id);
    const result = await this.adapter.updateBookingStatus(id, "cancelled");
    await this.logAudit("booking_status_changed", id, "admin", actorId,
      `Booking ${booking.bookingCode} cancelled`,
      booking.bookingStatus, "cancelled"
    );
    try { await sendBookingCancellation(result); } catch { /* non-blocking */ }
    return result;
  }

  async completeBooking(id: string, actorId?: string): Promise<Booking> {
    const booking = await this.getBookingOrThrow(id);
    const result = await this.adapter.updateBookingStatus(id, "completed");
    await this.logAudit("booking_status_changed", id, "admin", actorId,
      `Booking ${booking.bookingCode} completed`,
      booking.bookingStatus, "completed"
    );
    return result;
  }

  async markNoShow(id: string, actorId?: string): Promise<Booking> {
    const booking = await this.getBookingOrThrow(id);
    const result = await this.adapter.updateBookingStatus(id, "no_show");
    await this.logAudit("booking_status_changed", id, "admin", actorId,
      `Booking ${booking.bookingCode} marked as no_show`,
      booking.bookingStatus, "no_show"
    );
    return result;
  }

  // ── Private helpers ──

  private async getBookingOrThrow(id: string): Promise<Booking> {
    const booking = await this.adapter.getBookingById(id);
    if (!booking) {
      throw new Error(`Booking dengan ID ${id} tidak ditemukan.`);
    }
    return booking;
  }

  private async logAudit(
    action: AuditLogAction,
    targetId: string,
    actorType: "customer" | "admin" | "system",
    actorId?: string,
    details?: string,
    previousValue?: string,
    newValue?: string,
  ): Promise<void> {
    try {
      await this.adapter.createAuditLog({
        action,
        targetType: "booking",
        targetId,
        actorType,
        actorId,
        details: details ?? "",
        previousValue,
        newValue,
      });
    } catch {
      // Audit logging should never break booking flow
      console.error(`[AuditLog] Failed to log action=${action} target=${targetId}`);
    }
  }
}

// ── Utility functions ──

function isValidTimeRange(startTime: string, endTime: string): boolean {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) return false;

  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;

  return endMinutes > startMinutes;
}
