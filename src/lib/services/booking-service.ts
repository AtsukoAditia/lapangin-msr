import type { CreateBookingInput, DatabaseAdapter } from "@/lib/adapters/database-adapter";
import type { Booking } from "@/lib/types/domain";
import { calculatePrice } from "./pricing-service";
import { hasBlockedSlotConflict, hasBookingConflict } from "./availability-service";

export class BookingService {
  constructor(private readonly adapter: DatabaseAdapter) {}

  async getAllBookings(): Promise<Booking[]> {
    return this.adapter.getBookings();
  }

  async getBookingsByCourtAndDate(courtId: string, date: string): Promise<Booking[]> {
    return this.adapter.getBookingsByCourtAndDate(courtId, date);
  }

  async createBooking(input: Omit<CreateBookingInput, "totalPrice" | "durationMinutes"> & {
    durationMinutes: number;
  }): Promise<Booking> {
    const [existingBookings, blockedSlots, pricingRules, court] = await Promise.all([
      this.adapter.getBookingsByCourtAndDate(input.courtId, input.bookingDate),
      this.adapter.getBlockedSlots(input.courtId, input.bookingDate),
      this.adapter.getPricingRules(input.courtId),
      this.adapter.getCourts(),
    ]);

    // Check for booking conflicts
    const bookingConflict = hasBookingConflict(existingBookings, input.startTime, input.endTime);
    const blockedConflict = hasBlockedSlotConflict(blockedSlots, input.startTime, input.endTime);

    if (bookingConflict || blockedConflict) {
      throw new Error("Slot sudah tidak tersedia. Silakan pilih jam lain.");
    }

    // Calculate price
    const courtData = court.find((c) => c.id === input.courtId);
    const basePrice = courtData?.basePrice ?? 0;
    const totalPrice = calculatePrice({
      durationMinutes: input.durationMinutes,
      basePrice,
      pricingRules,
    });

    return this.adapter.createBooking({
      ...input,
      totalPrice,
    });
  }

  async confirmBooking(id: string): Promise<Booking> {
    return this.adapter.updateBookingStatus(id, "confirmed");
  }

  async rejectBooking(id: string): Promise<Booking> {
    return this.adapter.updateBookingStatus(id, "rejected");
  }

  async cancelBooking(id: string): Promise<Booking> {
    return this.adapter.updateBookingStatus(id, "cancelled");
  }

  async completeBooking(id: string): Promise<Booking> {
    return this.adapter.updateBookingStatus(id, "completed");
  }

  async markNoShow(id: string): Promise<Booking> {
    return this.adapter.updateBookingStatus(id, "no_show");
  }
}