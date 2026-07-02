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
  NotificationLog,
  NotificationPayload,
  AdminUser,
  CustomerPublic,
  Customer,
  LoyaltyTransaction,
  LoyaltyTransactionType,
  Reward,
  RewardRedemption,
} from "@/lib/types/domain";

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

  async getAllCourts(): Promise<Court[]> {
    throw new Error("PostgresAdapter getAllCourts not implemented yet.");
  }

  async getCourtById(_id: string): Promise<Court | null> {
    throw new Error("PostgresAdapter getCourtById not implemented yet.");
  }

  async updateCourt(_id: string, _input: UpdateCourtInput): Promise<Court> {
    throw new Error("PostgresAdapter updateCourt not implemented yet.");
  }

  async getBookings(): Promise<Booking[]> {
    throw new Error("PostgresAdapter getBookings not implemented yet.");
  }

  async getBookingById(_id: string): Promise<Booking | null> {
    throw new Error("PostgresAdapter getBookingById not implemented yet.");
  }

  async getBookingByCode(_code: string): Promise<Booking | null> {
    throw new Error("PostgresAdapter getBookingByCode not implemented yet.");
  }

  async expireBookings(): Promise<number> {
    throw new Error("PostgresAdapter expireBookings not implemented yet.");
  }

  async getBookingsByCourtAndDate(
    _courtId: string,
    _date: string,
  ): Promise<Booking[]> {
    throw new Error(
      "PostgresAdapter getBookingsByCourtAndDate not implemented yet.",
    );
  }

  async createBooking(_input: CreateBookingInput): Promise<Booking> {
    throw new Error("PostgresAdapter createBooking not implemented yet.");
  }

  async updateBookingStatus(
    _id: string,
    _status: Booking["bookingStatus"],
    _paymentStatus?: Booking["paymentStatus"],
  ): Promise<Booking> {
    throw new Error(
      "PostgresAdapter updateBookingStatus not implemented yet.",
    );
  }

  async getPricingRules(_courtId: string): Promise<PricingRule[]> {
    throw new Error("PostgresAdapter getPricingRules not implemented yet.");
  }

  async getAllPricingRules(): Promise<PricingRule[]> {
    throw new Error("PostgresAdapter getAllPricingRules not implemented yet.");
  }

  async createPricingRule(
    _input: CreatePricingRuleInput,
  ): Promise<PricingRule> {
    throw new Error(
      "PostgresAdapter createPricingRule not implemented yet.",
    );
  }

  async updatePricingRule(
    _id: string,
    _input: UpdatePricingRuleInput,
  ): Promise<PricingRule> {
    throw new Error(
      "PostgresAdapter updatePricingRule not implemented yet.",
    );
  }

  async deletePricingRule(_id: string): Promise<void> {
    throw new Error(
      "PostgresAdapter deletePricingRule not implemented yet.",
    );
  }

  async getBlockedSlots(_courtId: string, _date: string): Promise<BlockedSlot[]> {
    throw new Error(
      "PostgresAdapter getBlockedSlots not implemented yet.",
    );
  }

  async getAllBlockedSlots(): Promise<BlockedSlot[]> {
    throw new Error(
      "PostgresAdapter getAllBlockedSlots not implemented yet.",
    );
  }

  async createBlockedSlot(
    _input: CreateBlockedSlotInput,
  ): Promise<BlockedSlot> {
    throw new Error(
      "PostgresAdapter createBlockedSlot not implemented yet.",
    );
  }

  async deleteBlockedSlot(_id: string): Promise<void> {
    throw new Error(
      "PostgresAdapter deleteBlockedSlot not implemented yet.",
    );
  }

  // ── Audit Log ──
  async getAuditLogs(_targetId?: string): Promise<AuditLogEntry[]> {
    throw new Error("PostgresAdapter getAuditLogs not implemented yet.");
  }

  async createAuditLog(
    _entry: Omit<AuditLogEntry, "id" | "timestamp">,
  ): Promise<AuditLogEntry> {
    throw new Error("PostgresAdapter createAuditLog not implemented yet.");
  }

  // ── Payment Methods ──
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    throw new Error("PostgresAdapter getPaymentMethods not implemented yet.");
  }

  async getActivePaymentMethods(): Promise<PaymentMethod[]> {
    throw new Error("PostgresAdapter getActivePaymentMethods not implemented yet.");
  }

  // ── Payment Proof ──
  async submitPaymentProof(_bookingId: string, _proofUrl: string): Promise<Booking> {
    throw new Error("PostgresAdapter submitPaymentProof not implemented yet.");
  }

  async confirmPayment(_bookingId: string, _actorId?: string): Promise<Booking> {
    throw new Error("PostgresAdapter confirmPayment not implemented yet.");
  }

  async rejectPayment(_bookingId: string, _actorId?: string): Promise<Booking> {
    throw new Error("PostgresAdapter rejectPayment not implemented yet.");
  }

  // ── Notifications ──
  async getNotificationLogs(_bookingId?: string): Promise<NotificationLog[]> {
    throw new Error("PostgresAdapter getNotificationLogs not implemented yet.");
  }

  async createNotificationLog(
    _payload: NotificationPayload,
    _status: NotificationLog["status"],
    _errorMessage?: string,
  ): Promise<NotificationLog> {
    throw new Error("PostgresAdapter createNotificationLog not implemented yet.");
  }

  async markNotificationRead(_id: string): Promise<NotificationLog> {
    throw new Error("PostgresAdapter markNotificationRead not implemented yet.");
  }

  // Auth - Admin
  async authenticateAdmin(_email: string, _password: string): Promise<AdminUser | null> {
    throw new Error("PostgresAdapter authenticateAdmin not implemented yet.");
  }

  async getAdminById(_id: string): Promise<AdminUser | null> {
    throw new Error("PostgresAdapter getAdminById not implemented yet.");
  }

  // Auth - Customer
  async registerCustomer(_data: { name: string; email: string; phone: string; passwordHash: string }): Promise<CustomerPublic> {
    throw new Error("PostgresAdapter registerCustomer not implemented yet.");
  }

  async authenticateCustomer(_email: string, _password: string): Promise<CustomerPublic | null> {
    throw new Error("PostgresAdapter authenticateCustomer not implemented yet.");
  }

  async getCustomerById(_id: string): Promise<CustomerPublic | null> {
    throw new Error("PostgresAdapter getCustomerById not implemented yet.");
  }

  async getCustomerByEmail(_email: string): Promise<Customer | null> {
    throw new Error("PostgresAdapter getCustomerByEmail not implemented yet.");
  }

  // Loyalty
  async getLoyaltyTransactions(_customerId: string): Promise<LoyaltyTransaction[]> {
    throw new Error("PostgresAdapter getLoyaltyTransactions not implemented yet.");
  }

  async addLoyaltyPoints(_customerId: string, _points: number, _bookingId: string | undefined, _description: string, _type: LoyaltyTransactionType): Promise<LoyaltyTransaction> {
    throw new Error("PostgresAdapter addLoyaltyPoints not implemented yet.");
  }

  async redeemLoyaltyPoints(_customerId: string, _rewardId: string, _bookingId?: string): Promise<RewardRedemption> {
    throw new Error("PostgresAdapter redeemLoyaltyPoints not implemented yet.");
  }

  async getRewards(): Promise<Reward[]> {
    throw new Error("PostgresAdapter getRewards not implemented yet.");
  }

  async getActiveRewards(): Promise<Reward[]> {
    throw new Error("PostgresAdapter getActiveRewards not implemented yet.");
  }

  async getCustomerRedemptions(_customerId: string): Promise<RewardRedemption[]> {
    throw new Error("PostgresAdapter getCustomerRedemptions not implemented yet.");
  }

  async updateCustomerSpent(_customerId: string, _amount: number): Promise<void> {
    throw new Error("PostgresAdapter updateCustomerSpent not implemented yet.");
  }

  async getAreas(): Promise<import("@/lib/types/domain").Area[]> {
    throw new Error("PostgresAdapter getAreas not implemented yet.");
  }

  async getAreaById(_id: string): Promise<import("@/lib/types/domain").Area | null> {
    throw new Error("PostgresAdapter getAreaById not implemented yet.");
  }

  async getVenueOwners(): Promise<import("@/lib/types/domain").VenueOwner[]> {
    throw new Error("PostgresAdapter getVenueOwners not implemented yet.");
  }

  async getVenueOwnerById(_id: string): Promise<import("@/lib/types/domain").VenueOwner | null> {
    throw new Error("PostgresAdapter getVenueOwnerById not implemented yet.");
  }

  async getVenueOwnerByAdminId(_adminId: string): Promise<import("@/lib/types/domain").VenueOwner | null> {
    throw new Error("PostgresAdapter getVenueOwnerByAdminId not implemented yet.");
  }

  async getVenuesByOwner(_ownerId: string): Promise<Venue[]> {
    throw new Error("PostgresAdapter getVenuesByOwner not implemented yet.");
  }

  async getVenuesByArea(_areaId: string, _sportId?: string): Promise<Venue[]> {
    throw new Error("PostgresAdapter getVenuesByArea not implemented yet.");
  }

  async getBookingsByOwner(_ownerId: string): Promise<Booking[]> {
    throw new Error("PostgresAdapter getBookingsByOwner not implemented yet.");
  }

  async updateBooking(_id: string, _updates: Partial<Booking>): Promise<Booking> {
    throw new Error("PostgresAdapter updateBooking not implemented yet.");
  }
}
