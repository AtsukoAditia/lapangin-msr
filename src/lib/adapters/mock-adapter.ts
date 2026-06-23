import type {
  DatabaseAdapter,
  CreateBookingInput,
  UpdateCourtInput,
  CreatePricingRuleInput,
  UpdatePricingRuleInput,
  CreateBlockedSlotInput,
} from "./database-adapter";
import type {
  Booking,
  BlockedSlot,
  Court,
  PricingRule,
  Sport,
  Venue,
  AuditLogEntry,
} from "@/lib/types/domain";
import {
  mockSports,
  mockVenues,
  mockCourts,
  mockPricingRules,
} from "@/lib/mock-data";

// In-memory stores (persists during server lifetime)
const bookingsStore: Booking[] = [];
const pricingRulesStore: PricingRule[] = [...mockPricingRules];
const blockedSlotsStore: BlockedSlot[] = [];
const auditLogStore: AuditLogEntry[] = [];

function generateBookingCode(): string {
  const now = new Date();
  const datePart =
    String(now.getFullYear()).slice(2) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${datePart}-${rand}`;
}

function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export class MockAdapter implements DatabaseAdapter {
  // ── Sports ──
  async getSports(): Promise<Sport[]> {
    return mockSports.filter((s) => s.isActive);
  }

  // ── Venues ──
  async getVenues(): Promise<Venue[]> {
    return mockVenues.filter((v) => v.isActive);
  }

  // ── Courts ──
  async getCourts(): Promise<Court[]> {
    return mockCourts.filter((c) => c.isActive);
  }

  async getAllCourts(): Promise<Court[]> {
    return [...mockCourts];
  }

  async getCourtById(id: string): Promise<Court | null> {
    return mockCourts.find((c) => c.id === id) ?? null;
  }

  async updateCourt(id: string, input: UpdateCourtInput): Promise<Court> {
    const index = mockCourts.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error(`Court not found: ${id}`);
    }
    const updated = { ...mockCourts[index], ...input };
    mockCourts[index] = {
      ...updated,
      indoorType: updated.indoorType as Court["indoorType"],
    };
    return { ...mockCourts[index] };
  }

  // ── Bookings ──
  async getBookings(): Promise<Booking[]> {
    return [...bookingsStore];
  }

  async getBookingById(id: string): Promise<Booking | null> {
    return bookingsStore.find((b) => b.id === id) ?? null;
  }

  async getBookingsByCourtAndDate(
    courtId: string,
    date: string,
  ): Promise<Booking[]> {
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

  async updateBookingStatus(
    id: string,
    status: Booking["bookingStatus"],
  ): Promise<Booking> {
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

  // ── Pricing Rules ──
  async getPricingRules(courtId: string): Promise<PricingRule[]> {
    return pricingRulesStore.filter(
      (p) => p.courtId === courtId && p.isActive,
    );
  }

  async getAllPricingRules(): Promise<PricingRule[]> {
    return [...pricingRulesStore];
  }

  async createPricingRule(input: CreatePricingRuleInput): Promise<PricingRule> {
    const rule: PricingRule = {
      id: generateId("pr"),
      courtId: input.courtId,
      dayType: input.dayType,
      startTime: input.startTime,
      endTime: input.endTime,
      pricePerHour: input.pricePerHour,
      priority: input.priority,
      isActive: input.isActive ?? true,
    };
    pricingRulesStore.push(rule);
    return { ...rule };
  }

  async updatePricingRule(
    id: string,
    input: UpdatePricingRuleInput,
  ): Promise<PricingRule> {
    const index = pricingRulesStore.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Pricing rule not found: ${id}`);
    }
    pricingRulesStore[index] = { ...pricingRulesStore[index], ...input };
    return { ...pricingRulesStore[index] };
  }

  async deletePricingRule(id: string): Promise<void> {
    const index = pricingRulesStore.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Pricing rule not found: ${id}`);
    }
    pricingRulesStore.splice(index, 1);
  }

  // ── Blocked Slots ──
  async getBlockedSlots(courtId: string, date: string): Promise<BlockedSlot[]> {
    return blockedSlotsStore.filter(
      (s) => s.courtId === courtId && s.date === date,
    );
  }

  async getAllBlockedSlots(): Promise<BlockedSlot[]> {
    return [...blockedSlotsStore];
  }

  async createBlockedSlot(input: CreateBlockedSlotInput): Promise<BlockedSlot> {
    const slot: BlockedSlot = {
      id: generateId("bs"),
      courtId: input.courtId,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      reason: input.reason,
    };
    blockedSlotsStore.push(slot);
    return { ...slot };
  }

  async deleteBlockedSlot(id: string): Promise<void> {
    const index = blockedSlotsStore.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error(`Blocked slot not found: ${id}`);
    }
    blockedSlotsStore.splice(index, 1);
  }

  // ── Audit Log ──
  async getAuditLogs(targetId?: string): Promise<AuditLogEntry[]> {
    if (targetId) {
      return auditLogStore.filter((entry) => entry.targetId === targetId);
    }
    return [...auditLogStore];
  }

  async createAuditLog(
    entry: Omit<AuditLogEntry, "id" | "timestamp">,
  ): Promise<AuditLogEntry> {
    const logEntry: AuditLogEntry = {
      id: generateId("audit"),
      timestamp: new Date().toISOString(),
      ...entry,
    };
    auditLogStore.push(logEntry);
    return { ...logEntry };
  }
}
