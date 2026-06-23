import type { CreateBookingInput, DatabaseAdapter } from "@/lib/adapters/database-adapter";
import { hasBlockedSlotConflict, hasBookingConflict } from "./availability-service";

export class BookingService {
  constructor(private readonly adapter: DatabaseAdapter) {}

  async createBooking(input: CreateBookingInput) {
    const [existingBookings, blockedSlots] = await Promise.all([
      this.adapter.getBookingsByCourtAndDate(input.courtId, input.bookingDate),
      this.adapter.getBlockedSlots(input.courtId, input.bookingDate),
    ]);

    const bookingConflict = hasBookingConflict(existingBookings, input.startTime, input.endTime);
    const blockedConflict = hasBlockedSlotConflict(blockedSlots, input.startTime, input.endTime);

    if (bookingConflict || blockedConflict) {
      throw new Error("Slot sudah tidak tersedia. Silakan pilih jam lain.");
    }

    return this.adapter.createBooking(input);
  }
}
