import type { DatabaseAdapter, CreateBookingInput } from "./database-adapter";
import type { Booking, BlockedSlot, Court, PricingRule, Sport, Venue } from "@/lib/types/domain";

export class PostgresAdapter implements DatabaseAdapter {
  async getSports(): Promise<Sport[]> {
    throw new Error("PostgresAdapter getSports not implemented yet.");
  }

  async getVenues(): Promise<Venue[]> {
    throw new Error("PostgresAdapter getVenues not implemented yet.");
  }

  async getCourts(): Promise<Court[]> {
    throw new Error("PostgresAdapter getCourts not implemented yet.");
  }

  async getBookings(): Promise<Booking[]> {
    throw new Error("PostgresAdapter getBookings not implemented yet.");
  }

  async getBookingsByCourtAndDate(courtId: string, date: string): Promise<Booking[]> {
    throw new Error(`PostgresAdapter getBookingsByCourtAndDate not implemented yet: ${courtId} ${date}`);
  }

  async createBooking(input: CreateBookingInput): Promise<Booking> {
    throw new Error(`PostgresAdapter createBooking not implemented yet: ${input.courtId}`);
  }

  async updateBookingStatus(id: string, status: Booking["bookingStatus"]): Promise<Booking> {
    throw new Error(`PostgresAdapter updateBookingStatus not implemented yet: ${id} ${status}`);
  }

  async getPricingRules(courtId: string): Promise<PricingRule[]> {
    throw new Error(`PostgresAdapter getPricingRules not implemented yet: ${courtId}`);
  }

  async getBlockedSlots(courtId: string, date: string): Promise<BlockedSlot[]> {
    throw new Error(`PostgresAdapter getBlockedSlots not implemented yet: ${courtId} ${date}`);
  }
}
