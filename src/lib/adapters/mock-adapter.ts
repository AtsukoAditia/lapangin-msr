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
  PaymentMethod,
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

const paymentMethodsStore: PaymentMethod[] = [
  {
    id: "pm-1",
    name: "BCA Transfer",
    label: "BCA Transfer",
    type: "bank_transfer",
    accountName: "PT Lapangin Indonesia",
    accountNumber: "1234567890",
    provider: "BCA",
    details: "BCA 1234567890 a/n PT Lapangin Indonesia",
    instructions: "Transfer ke rekening BCA di atas, lalu upload bukti transfer.",
    isActive: true,
  },
  {
    id: "pm-2",
    name: "Mandiri Transfer",
    label: "Mandiri Transfer",
    type: "bank_transfer",
    accountName: "PT Lapangin Indonesia",
    accountNumber: "0987654321",
    provider: "Mandiri",
    details: "Mandiri 0987654321 a/n PT Lapangin Indonesia",
    instructions: "Transfer ke rekening Mandiri di atas, lalu upload bukti transfer.",
    isActive: true,
  },
  {
    id: "pm-3",
    name: "GoPay",
    label: "GoPay",
    type: "e_wallet",
    accountName: "Lapangin Official",
    accountNumber: "081234567890",
    provider: "GoPay",
    details: "GoPay: 081234567890 a/n Lapangin Official",
    instructions: "Kirim ke GoPay number di atas, lalu upload bukti transfer.",
    isActive: true,
  },
  {
    id: "pm-4",
    name: "OVO",
    label: "OVO",
    type: "e_wallet",
    accountName: "Lapangin Official",
    accountNumber: "081234567890",
    provider: "OVO",
    details: "OVO: 081234567890 a/n Lapangin Official",
    instructions: "Kirim ke OVO number di atas, lalu upload bukti transfer.",
    isActive: true,
  },
  {
    id: "pm-5",
    name: "QRIS",
    label: "QRIS",
    type: "qris",
    accountName: "Lapangin",
    provider: "QRIS",
    details: "Scan QRIS yang tersedia di lokasi",
    instructions: "Scan QRIS yang tersedia di lokasi, lalu upload bukti transfer.",
    isActive: true,
  },
];

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

  // ── Payment Methods ──
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return [...paymentMethodsStore];
  }

  async getActivePaymentMethods(): Promise<PaymentMethod[]> {
    return paymentMethodsStore.filter((m) => m.isActive);
  }

  // ── Payment Proof ──
  async submitPaymentProof(bookingId: string, proofUrl: string): Promise<Booking> {
    const index = bookingsStore.findIndex((b) => b.id === bookingId);
    if (index === -1) {
      throw new Error(`Booking not found: ${bookingId}`);
    }
    bookingsStore[index] = {
      ...bookingsStore[index],
      paymentProofUrl: proofUrl,
      paymentStatus: "waiting_confirmation",
      bookingStatus: "waiting_payment",
      updatedAt: new Date().toISOString(),
    };
    return { ...bookingsStore[index] };
  }

  async confirmPayment(bookingId: string, _actorId?: string): Promise<Booking> {
    const index = bookingsStore.findIndex((b) => b.id === bookingId);
    if (index === -1) {
      throw new Error(`Booking not found: ${bookingId}`);
    }
    bookingsStore[index] = {
      ...bookingsStore[index],
      paymentStatus: "paid",
      bookingStatus: "confirmed",
      updatedAt: new Date().toISOString(),
    };
    return { ...bookingsStore[index] };
  }

  async rejectPayment(bookingId: string, _actorId?: string): Promise<Booking> {
    const index = bookingsStore.findIndex((b) => b.id === bookingId);
    if (index === -1) {
      throw new Error(`Booking not found: ${bookingId}`);
    }
    bookingsStore[index] = {
      ...bookingsStore[index],
      paymentStatus: "unpaid",
      bookingStatus: "pending",
      paymentProofUrl: undefined,
      updatedAt: new Date().toISOString(),
    };
    return { ...bookingsStore[index] };
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
