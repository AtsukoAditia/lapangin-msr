import type { DatabaseAdapter, CreateBookingInput } from "./database-adapter";
import type { Booking, BlockedSlot, Court, PricingRule, Sport, Venue } from "@/lib/types/domain";
import {
  mockSports,
  mockVenues,
  mockCourts,
  mockPricingRules,
} from "@/lib/mock-data";

// In-memory booking store (persists during server lifetime)
const bookingsStore: Booking[] = [];

function generateBookingCode(): string {
  const now = new Date();
  const datePart =
    String(now.getFullYear()).slice(2) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${datePart}-${rand}`;
}

export class MockAdapter implements DatabaseAdapter {
  async getSports(): Promise<Sport[]> {
    return mockSports.filter((s) => s.isActive);
  }

  async getVenues(): Promise<Venue[]> {
    return mockVenues.filter((v) => v.isActive);
  }

  async getCourts(): Promise<Court[]> {
    return mockCourts.filter((c) => c.isActive);
  }

  async getBookings(): Promise<Booking[]> {
    return [...bookingsStore];
  }

  async getBookingsByCourtAndDate(courtId: string, date: string): Promise<Booking[]> {
    return bookingsStore.filter(
      (b) => b.courtId === courtId && b.bookingDate === date,
    );
  }

  async createBooking(input: CreateBookingInput): Promise<Booking> {
    const now = new Date().toISOString();
    const booking: Booking = {
      id: crypto.randomUUID(),
      bookingCode: generateBookingCode(),
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail,
      venueId: input.venueId,
      courtId: input.courtId,
      sportId: input.sportId,
      bookingDate: input.bookingDate,
      startTime: input.startTime,
      endTime: input.endTime,
      durationMinutes: input.durationMinutes,
      totalPrice: input.totalPrice,
      bookingStatus: "pending",
      paymentStatus: "unpaid",
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };

    bookingsStore.push(booking);
    return { ...booking };
  }

  async updateBookingStatus(id: string, status: Booking["bookingStatus"]): Promise<Booking> {
    const index = bookingsStore.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new Error(`Booking not found: ${id}`);
    }

    bookingsStore[index] = {
      ...bookingsStore[index],
      bookingStatus: status,
      updatedAt: new Date().toISOString(),
    };

    return { ...bookingsStore[index] };
  }

  async getPricingRules(courtId: string): Promise<PricingRule[]> {
    return mockPricingRules.filter((p) => p.courtId === courtId && p.isActive);
  }

  async getBlockedSlots(_courtId: string, _date: string): Promise<BlockedSlot[]> {
    // Mock: no blocked slots
    return [];
  }
}