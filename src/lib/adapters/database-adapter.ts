import type { Booking, BlockedSlot, Court, PricingRule, Sport, Venue } from "@/lib/types/domain";

export interface CreateBookingInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  venueId: string;
  courtId: string;
  sportId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalPrice: number;
  notes?: string;
}

export interface DatabaseAdapter {
  getSports(): Promise<Sport[]>;
  getVenues(): Promise<Venue[]>;
  getCourts(): Promise<Court[]>;
  getBookings(): Promise<Booking[]>;
  getBookingsByCourtAndDate(courtId: string, date: string): Promise<Booking[]>;
  createBooking(input: CreateBookingInput): Promise<Booking>;
  updateBookingStatus(id: string, status: Booking["bookingStatus"]): Promise<Booking>;
  getPricingRules(courtId: string): Promise<PricingRule[]>;
  getBlockedSlots(courtId: string, date: string): Promise<BlockedSlot[]>;
}
