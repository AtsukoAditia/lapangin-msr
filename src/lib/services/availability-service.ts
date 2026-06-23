import type { DatabaseAdapter } from "@/lib/adapters/database-adapter";
import type { Booking, BlockedSlot } from "@/lib/types/domain";

const ACTIVE_STATUSES: Booking["bookingStatus"][] = [
  "pending",
  "waiting_payment",
  "paid",
  "confirmed",
];

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface AvailableSlotsInput {
  courtId: string;
  date: string;
  slotDurationMinutes?: number;
  openTime?: string;
  closeTime?: string;
}

export class AvailabilityService {
  constructor(private readonly adapter: DatabaseAdapter) {}

  async getAvailableSlots(input: AvailableSlotsInput): Promise<TimeSlot[]> {
    const {
      courtId,
      date,
      slotDurationMinutes = 60,
      openTime = "06:00",
      closeTime = "23:00",
    } = input;

    const [bookings, blockedSlots] = await Promise.all([
      this.adapter.getBookingsByCourtAndDate(courtId, date),
      this.adapter.getBlockedSlots(courtId, date),
    ]);

    const activeBookings = bookings.filter((b) =>
      ACTIVE_STATUSES.includes(b.bookingStatus),
    );

    const slots: TimeSlot[] = [];
    const openMinutes = timeToMinutes(openTime);
    const closeMinutes = timeToMinutes(closeTime);

    for (let start = openMinutes; start + slotDurationMinutes <= closeMinutes; start += slotDurationMinutes) {
      const end = start + slotDurationMinutes;
      const startStr = minutesToTime(start);
      const endStr = minutesToTime(end);

      const isBooked = activeBookings.some(
        (b) => b.startTime < endStr && b.endTime > startStr,
      );
      const isBlocked = blockedSlots.some(
        (bs) => bs.startTime < endStr && bs.endTime > startStr,
      );

      slots.push({
        startTime: startStr,
        endTime: endStr,
        isAvailable: !isBooked && !isBlocked,
      });
    }

    return slots;
  }
}

export function hasBookingConflict(
  bookings: Booking[],
  startTime: string,
  endTime: string,
): boolean {
  return bookings.some(
    (b) =>
      ACTIVE_STATUSES.includes(b.bookingStatus) &&
      b.startTime < endTime &&
      b.endTime > startTime,
  );
}

export function hasBlockedSlotConflict(
  blockedSlots: BlockedSlot[],
  startTime: string,
  endTime: string,
): boolean {
  return blockedSlots.some(
    (bs) => bs.startTime < endTime && bs.endTime > startTime,
  );
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}