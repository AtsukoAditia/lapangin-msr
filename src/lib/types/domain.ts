// ── Domain Types for Lapangin ──

export interface Sport {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface Venue {
  id: string;
  name: string;
  slug: string;
  address: string;
  mapsUrl: string;
  phone: string;
  openTime: string;
  closeTime: string;
  isActive: boolean;
}

export interface Court {
  id: string;
  venueId: string;
  sportId: string;
  name: string;
  slug: string;
  surfaceType: string;
  indoorType: "indoor" | "outdoor" | "semi_outdoor";
  capacity: number;
  basePrice: number;
  isActive: boolean;
}

export interface Booking {
  id: string;
  bookingCode: string;
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
  bookingStatus:
    | "pending"
    | "waiting_payment"
    | "paid"
    | "confirmed"
    | "rejected"
    | "cancelled"
    | "completed"
    | "no_show";
  paymentStatus:
    | "unpaid"
    | "waiting_confirmation"
    | "dp_paid"
    | "paid"
    | "refunded";
  paymentProofUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlockedSlot {
  id: string;
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

export interface PricingRule {
  id: string;
  courtId: string;
  dayType: "weekday" | "weekend" | "holiday" | "all";
  startTime: string;
  endTime: string;
  pricePerHour: number;
  priority: number;
  isActive: boolean;
}

// ── Audit Log ──

export type AuditLogAction =
  | "booking_created"
  | "booking_status_changed"
  | "booking_conflict_blocked"
  | "blocked_slot_created"
  | "blocked_slot_deleted";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: AuditLogAction;
  targetType: "booking" | "blocked_slot";
  targetId: string;
  actorType: "customer" | "admin" | "system";
  actorId?: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}