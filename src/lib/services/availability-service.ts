import type { Booking, BlockedSlot } from "@/lib/types/domain";

const ACTIVE_BOOKING_STATUSES: Booking["bookingStatus"][] = [
  "pending",
  "waiting_payment",
  "paid",
  "confirmed",
];

export function isTimeRangeOverlapping(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  return startA < endB && startB < endA;
}

export function hasBookingConflict(
  bookings: Booking[],
  startTime: string,
  endTime: string,
): boolean {
  return bookings.some((booking) => {
    if (!ACTIVE_BOOKING_STATUSES.includes(booking.bookingStatus)) {
      return false;
    }

    return isTimeRangeOverlapping(startTime, endTime, booking.startTime, booking.endTime);
  });
}

export function hasBlockedSlotConflict(
  blockedSlots: BlockedSlot[],
  startTime: string,
  endTime: string,
): boolean {
  return blockedSlots.some((slot) =>
    isTimeRangeOverlapping(startTime, endTime, slot.startTime, slot.endTime),
  );
}
