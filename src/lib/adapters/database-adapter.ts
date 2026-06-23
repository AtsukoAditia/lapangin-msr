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

export interface UpdateCourtInput {
  name?: string;
  slug?: string;
  surfaceType?: string;
  indoorType?: string;
  capacity?: number;
  basePrice?: number;
  isActive?: boolean;
}

export interface CreatePricingRuleInput {
  courtId: string;
  dayType: "weekday" | "weekend" | "holiday" | "all";
  startTime: string;
  endTime: string;
  pricePerHour: number;
  priority: number;
  isActive?: boolean;
}

export interface UpdatePricingRuleInput {
  dayType?: "weekday" | "weekend" | "holiday" | "all";
  startTime?: string;
  endTime?: string;
  pricePerHour?: number;
  priority?: number;
  isActive?: boolean;
}

export interface CreateBlockedSlotInput {
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

export interface DatabaseAdapter {
  // Sports
  getSports(): Promise<Sport[]>;

  // Venues
  getVenues(): Promise<Venue[]>;

  // Courts
  getCourts(): Promise<Court[]>;
  getAllCourts(): Promise<Court[]>;
  getCourtById(id: string): Promise<Court | null>;
  updateCourt(id: string, input: UpdateCourtInput): Promise<Court>;

  // Bookings
  getBookings(): Promise<Booking[]>;
  getBookingById(id: string): Promise<Booking | null>;
  getBookingsByCourtAndDate(courtId: string, date: string): Promise<Booking[]>;
  createBooking(input: CreateBookingInput): Promise<Booking>;
  updateBookingStatus(id: string, status: Booking["bookingStatus"]): Promise<Booking>;

  // Pricing
  getPricingRules(courtId: string): Promise<PricingRule[]>;
  getAllPricingRules(): Promise<PricingRule[]>;
  createPricingRule(input: CreatePricingRuleInput): Promise<PricingRule>;
  updatePricingRule(
    id: string,
    input: UpdatePricingRuleInput,
  ): Promise<PricingRule>;
  deletePricingRule(id: string): Promise<void>;

  // Blocked Slots
  getBlockedSlots(courtId: string, date: string): Promise<BlockedSlot[]>;
  getAllBlockedSlots(): Promise<BlockedSlot[]>;
  createBlockedSlot(input: CreateBlockedSlotInput): Promise<BlockedSlot>;
  deleteBlockedSlot(id: string): Promise<void>;

  // Audit Log
  getAuditLogs(targetId?: string): Promise<AuditLogEntry[]>;
  createAuditLog(
    entry: Omit<AuditLogEntry, "id" | "timestamp">,
  ): Promise<AuditLogEntry>;

  // Payment Methods
  getPaymentMethods(): Promise<PaymentMethod[]>;
  getActivePaymentMethods(): Promise<PaymentMethod[]>;

  // Payment Proof
  submitPaymentProof(bookingId: string, proofUrl: string): Promise<Booking>;
  confirmPayment(bookingId: string, actorId?: string): Promise<Booking>;
  rejectPayment(bookingId: string, actorId?: string): Promise<Booking>;
}
