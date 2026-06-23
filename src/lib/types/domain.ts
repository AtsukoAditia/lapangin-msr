export type BookingStatus =
  | "pending"
  | "waiting_payment"
  | "paid"
  | "confirmed"
  | "rejected"
  | "cancelled"
  | "completed"
  | "no_show";

export type PaymentStatus =
  | "unpaid"
  | "waiting_confirmation"
  | "dp_paid"
  | "paid"
  | "refunded";

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
  address?: string;
  mapsUrl?: string;
  phone?: string;
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
  surfaceType?: string;
  indoorType?: string;
  capacity?: number;
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
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentProofUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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

export interface BlockedSlot {
  id: string;
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}
