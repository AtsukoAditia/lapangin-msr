import type { DatabaseAdapter, CreateBookingInput } from "./database-adapter";
import type { Booking, BlockedSlot, Court, PricingRule, Sport, Venue } from "@/lib/types/domain";

export class GoogleSheetsAdapter implements DatabaseAdapter {
  async getSports(): Promise<Sport[]> {
    // TODO: Read from Google Sheets tab: sports
    return [];
  }

  async getVenues(): Promise<Venue[]> {
    // TODO: Read from Google Sheets tab: venues
    return [];
  }

  async getCourts(): Promise<Court[]> {
    // TODO: Read from Google Sheets tab: courts
    return [];
  }

  async getBookings(): Promise<Booking[]> {
    // TODO: Read from Google Sheets tab: bookings
    return [];
  }

  async getBookingsByCourtAndDate(courtId: string, date: string): Promise<Booking[]> {
    const bookings = await this.getBookings();
    return bookings.filter(
      (booking) => booking.courtId === courtId && booking.bookingDate === date,
    );
  }

  async createBooking(input: CreateBookingInput): Promise<Booking> {
    const now = new Date().toISOString();

    const booking: Booking = {
      id: crypto.randomUUID(),
      bookingCode: `AB-${Date.now()}`,
      ...input,
      bookingStatus: "pending",
      paymentStatus: "unpaid",
      createdAt: now,
      updatedAt: now,
    };

    // TODO: Append row to Google Sheets tab: bookings
    return booking;
  }

  async updateBookingStatus(id: string, status: Booking["bookingStatus"]): Promise<Booking> {
    // TODO: Update row in Google Sheets tab: bookings
    throw new Error(`updateBookingStatus not implemented for ${id} -> ${status}`);
  }

  async getPricingRules(courtId: string): Promise<PricingRule[]> {
    // TODO: Read from Google Sheets tab: pricing_rules
    return [];
  }

  async getBlockedSlots(courtId: string, date: string): Promise<BlockedSlot[]> {
    // TODO: Read from Google Sheets tab: blocked_slots
    return [];
  }
}
