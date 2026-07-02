// ── Domain Types for Lapangin ──

export interface Sport {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface Area {
  id: string;
  province: string;
  city: string;
  district: string;
  village: string;
  slug: string;
  label: string; // human-readable: "DKI Jakarta > Jakarta Selatan > Pancoran > Duren Tiga"
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type VenueOwnerStatus = "pending_review" | "active" | "suspended" | "rejected";

export interface VenueOwner {
  id: string;
  adminId: string;
  businessName: string;
  picName: string;
  phone: string;
  email: string;
  status: VenueOwnerStatus;
  createdAt: string;
  updatedAt: string;
}

export type VenueApprovalStatus = "draft" | "pending_review" | "active" | "rejected" | "suspended";

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
  ownerId?: string;
  areaId?: string;
  approvalStatus: VenueApprovalStatus;
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
    | "waiting_verification"
    | "paid"
    | "confirmed"
    | "rejected"
    | "cancelled"
    | "expired"
    | "completed"
    | "no_show";
  paymentStatus:
    | "unpaid"
    | "waiting_confirmation"
    | "dp_paid"
    | "paid"
    | "rejected"
    | "refunded";
  paymentProofUrl?: string;
  paymentRejectionReason?: string;
  notes?: string;
  userId?: string;
  expiresAt?: string;
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
  | "booking_confirmed"
  | "booking_rejected"
  | "booking_conflict_blocked"
  | "blocked_slot_created"
  | "blocked_slot_deleted"
  | "payment_proof_submitted"
  | "payment_confirmed"
  | "payment_rejected";

export interface PaymentMethod {
  id: string;
  name: string;
  label: string;
  type: "bank_transfer" | "e_wallet" | "qris" | "cash";
  accountName: string;
  accountNumber?: string;
  provider: string;
  details: string;
  instructions: string;
  isActive: boolean;
}

export interface PaymentInstruction {
  method: PaymentMethod;
  amount: number;
  bookingCode: string;
  notes?: string;
}

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

// ── Notification ──

export type NotificationChannel = "email" | "whatsapp" | "sms" | "web_push" | "in_app";
export type NotificationType =
  | "booking_created"
  | "booking_confirmed"
  | "booking_rejected"
  | "booking_cancelled"
  | "payment_received"
  | "payment_confirmed"
  | "payment_rejected"
  | "reminder_before_booking"
  | "admin_new_booking"
  | "admin_payment_proof";

export type NotificationStatus = "pending" | "sent" | "failed" | "read";

export interface NotificationLog {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  recipient: string;
  subject?: string;
  message: string;
  status: NotificationStatus;
  bookingId?: string;
  bookingCode?: string;
  errorMessage?: string;
  sentAt?: string;
  createdAt: string;
  readAt?: string;
}

export interface NotificationPayload {
  type: NotificationType;
  channel: NotificationChannel;
  recipient: string;
  subject?: string;
  message: string;
  bookingId?: string;
  bookingCode?: string;
}

export interface NotificationTemplate {
  type: NotificationType;
  channel: NotificationChannel;
  subjectTemplate: string;
  messageTemplate: string;
}

// ── Customer & Auth ──

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  loyaltyPoints: number;
  totalSpent: number;
  memberSince: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerPublic {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  loyaltyPoints: number;
  loyaltyTier?: string;
  totalSpent: number;
  memberSince: string;
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "super_admin" | "admin" | "staff";
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthSession {
  userId: string;
  role: "admin" | "customer";
  name: string;
  email: string;
  expiresAt: string;
}

// ── Loyalty Points ──

export type LoyaltyTransactionType =
  | "earned"
  | "redeemed"
  | "bonus"
  | "expired"
  | "adjusted";

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  bookingId?: string;
  bookingCode?: string;
  type: LoyaltyTransactionType;
  points: number;
  description: string;
  createdAt: string;
  expiresAt?: string;
}

export type RewardType =
  | "discount_percentage"
  | "discount_amount"
  | "free_hour"
  | "free_session";

export interface Reward {
  id: string;
  name: string;
  description: string;
  type: RewardType;
  pointsCost: number;
  value: number;
  isActive: boolean;
  createdAt: string;
}

export interface RewardRedemption {
  id: string;
  customerId: string;
  rewardId: string;
  rewardName: string;
  pointsUsed: number;
  bookingId?: string;
  status: "pending" | "applied" | "expired";
  createdAt: string;
  usedAt?: string;
}

// ── Booking with Customer ──

export interface BookingWithCustomer extends Booking {
  customerId?: string;
  pointsEarned?: number;
  pointsRedeemed?: number;
  discountAmount?: number;
}
