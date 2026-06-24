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
  Customer,
  CustomerPublic,
  LoyaltyTransaction,
  LoyaltyTransactionType,
  Reward,
  RewardRedemption,
} from "@/lib/types/domain";
import {
  mockSports,
  mockVenues,
  mockCourts,
  mockPricingRules,
} from "@/lib/mock-data";
import { hashPassword, verifyPassword } from "@/lib/auth/jwt";

// Use globalThis for all stores to survive Next.js dev module reloading
const g = globalThis as unknown as {
  __lapanginBookings: Booking[];
  __lapanginPricingRules: PricingRule[];
  __lapanginBlockedSlots: BlockedSlot[];
  __lapanginAuditLog: AuditLogEntry[];
  __lapanginNotifications: NotificationLog[];
  __lapanginAdmins: AdminUser[];
  __lapanginCustomers: Customer[];
  __lapanginLoyalty: LoyaltyTransaction[];
  __lapanginRewards: Reward[];
  __lapanginRedemptions: RewardRedemption[];
  __lapanginPaymentMethods: PaymentMethod[];
};

function getBookings(): Booking[] {
  if (!g.__lapanginBookings) g.__lapanginBookings = [];
  return g.__lapanginBookings;
}
function getPricingRules(): PricingRule[] {
  if (!g.__lapanginPricingRules) g.__lapanginPricingRules = [...mockPricingRules];
  return g.__lapanginPricingRules;
}
function getBlockedSlots(): BlockedSlot[] {
  if (!g.__lapanginBlockedSlots) g.__lapanginBlockedSlots = [];
  return g.__lapanginBlockedSlots;
}
function getAuditLog(): AuditLogEntry[] {
  if (!g.__lapanginAuditLog) g.__lapanginAuditLog = [];
  return g.__lapanginAuditLog;
}
function getNotifications(): NotificationLog[] {
  if (!g.__lapanginNotifications) g.__lapanginNotifications = [];
  return g.__lapanginNotifications;
}
function getAdmins(): AdminUser[] {
  if (!g.__lapanginAdmins) {
    g.__lapanginAdmins = [
      {
        id: "admin-1",
        username: "superadmin",
        name: "Super Admin",
        email: "admin@lapangin.id",
        passwordHash: hashPassword("Admin123!@#"),
        role: "super_admin",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "owner-1",
        username: "venueowner",
        name: "Venue Owner",
        email: "owner@lapangin.id",
        passwordHash: hashPassword("Owner123!@#"),
        role: "admin",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];
  }
  return g.__lapanginAdmins;
}
function getCustomers(): Customer[] {
  if (!g.__lapanginCustomers) g.__lapanginCustomers = [];
  return g.__lapanginCustomers;
}
function getLoyalty(): LoyaltyTransaction[] {
  if (!g.__lapanginLoyalty) g.__lapanginLoyalty = [];
  return g.__lapanginLoyalty;
}
function getRewards(): Reward[] {
  if (!g.__lapanginRewards) {
    g.__lapanginRewards = [
      {
        id: "reward-1",
        name: "Diskon 10%",
        description: "Potongan harga 10% untuk booking berikutnya",
        type: "discount_percentage",
        pointsCost: 500,
        value: 10,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "reward-2",
        name: "Diskon Rp 25.000",
        description: "Potongan harga Rp 25.000 untuk booking berikutnya",
        type: "discount_amount",
        pointsCost: 750,
        value: 25000,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "reward-3",
        name: "Bonus 1 Jam",
        description: "Gratis 1 jam tambahan untuk booking berikutnya",
        type: "free_hour",
        pointsCost: 1000,
        value: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "reward-4",
        name: "Gratis 1 Sesi (2 Jam)",
        description: "Gratis booking 1 sesi penuh (2 jam)",
        type: "free_session",
        pointsCost: 2500,
        value: 2,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];
  }
  return g.__lapanginRewards;
}
function getRedemptions(): RewardRedemption[] {
  if (!g.__lapanginRedemptions) g.__lapanginRedemptions = [];
  return g.__lapanginRedemptions;
}
function getPaymentMethods(): PaymentMethod[] {
  if (!g.__lapanginPaymentMethods) {
    g.__lapanginPaymentMethods = [
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
  }
  return g.__lapanginPaymentMethods;
}

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
    if (index === -1) throw new Error(`Court not found: ${id}`);
    const updated = { ...mockCourts[index], ...input };
    mockCourts[index] = { ...updated, indoorType: updated.indoorType as Court["indoorType"] };
    return { ...mockCourts[index] };
  }

  // ── Bookings ──
  async getBookings(): Promise<Booking[]> {
    return [...getBookings()];
  }

  async getBookingById(id: string): Promise<Booking | null> {
    return getBookings().find((b) => b.id === id) ?? null;
  }

  async getBookingsByCourtAndDate(courtId: string, date: string): Promise<Booking[]> {
    return getBookings().filter((b) => b.courtId === courtId && b.bookingDate === date);
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
      userId: input.userId,
      createdAt: now,
      updatedAt: now,
    };
    getBookings().push(booking);
    return { ...booking };
  }

  async updateBookingStatus(id: string, status: Booking["bookingStatus"], paymentStatus?: Booking["paymentStatus"]): Promise<Booking> {
    const store = getBookings();
    const index = store.findIndex((b) => b.id === id);
    if (index === -1) throw new Error(`Booking not found: ${id}`);
    const update: Partial<Booking> = { bookingStatus: status, updatedAt: new Date().toISOString() };
    if (paymentStatus) update.paymentStatus = paymentStatus;
    store[index] = { ...store[index], ...update };
    return { ...store[index] };
  }

  // ── Pricing Rules ──
  async getPricingRules(courtId: string): Promise<PricingRule[]> {
    return getPricingRules().filter((p) => p.courtId === courtId && p.isActive);
  }

  async getAllPricingRules(): Promise<PricingRule[]> {
    return [...getPricingRules()];
  }

  async createPricingRule(input: CreatePricingRuleInput): Promise<PricingRule> {
    const rule: PricingRule = { id: generateId("pr"), courtId: input.courtId, dayType: input.dayType, startTime: input.startTime, endTime: input.endTime, pricePerHour: input.pricePerHour, priority: input.priority, isActive: input.isActive ?? true };
    getPricingRules().push(rule);
    return { ...rule };
  }

  async updatePricingRule(id: string, input: UpdatePricingRuleInput): Promise<PricingRule> {
    const store = getPricingRules();
    const index = store.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Pricing rule not found: ${id}`);
    store[index] = { ...store[index], ...input };
    return { ...store[index] };
  }

  async deletePricingRule(id: string): Promise<void> {
    const store = getPricingRules();
    const index = store.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Pricing rule not found: ${id}`);
    store.splice(index, 1);
  }

  // ── Blocked Slots ──
  async getBlockedSlots(courtId: string, date: string): Promise<BlockedSlot[]> {
    return getBlockedSlots().filter((s) => s.courtId === courtId && s.date === date);
  }

  async getAllBlockedSlots(): Promise<BlockedSlot[]> {
    return [...getBlockedSlots()];
  }

  async createBlockedSlot(input: CreateBlockedSlotInput): Promise<BlockedSlot> {
    const slot: BlockedSlot = { id: generateId("bs"), courtId: input.courtId, date: input.date, startTime: input.startTime, endTime: input.endTime, reason: input.reason };
    getBlockedSlots().push(slot);
    return { ...slot };
  }

  async deleteBlockedSlot(id: string): Promise<void> {
    const store = getBlockedSlots();
    const index = store.findIndex((s) => s.id === id);
    if (index === -1) throw new Error(`Blocked slot not found: ${id}`);
    store.splice(index, 1);
  }

  // ── Payment Methods ──
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return [...getPaymentMethods()];
  }

  async getActivePaymentMethods(): Promise<PaymentMethod[]> {
    return getPaymentMethods().filter((m) => m.isActive);
  }

  // ── Payment Proof ──
  async submitPaymentProof(bookingId: string, proofUrl: string): Promise<Booking> {
    const store = getBookings();
    const index = store.findIndex((b) => b.id === bookingId);
    if (index === -1) throw new Error(`Booking not found: ${bookingId}`);
    store[index] = { ...store[index], paymentProofUrl: proofUrl, paymentStatus: "waiting_confirmation", bookingStatus: "waiting_payment", updatedAt: new Date().toISOString() };
    return { ...store[index] };
  }

  async confirmPayment(bookingId: string, _actorId?: string): Promise<Booking> {
    const store = getBookings();
    const index = store.findIndex((b) => b.id === bookingId);
    if (index === -1) throw new Error(`Booking not found: ${bookingId}`);
    store[index] = { ...store[index], paymentStatus: "paid", bookingStatus: "confirmed", updatedAt: new Date().toISOString() };
    return { ...store[index] };
  }

  async rejectPayment(bookingId: string, _actorId?: string): Promise<Booking> {
    const store = getBookings();
    const index = store.findIndex((b) => b.id === bookingId);
    if (index === -1) throw new Error(`Booking not found: ${bookingId}`);
    store[index] = { ...store[index], paymentStatus: "unpaid", bookingStatus: "pending", paymentProofUrl: undefined, updatedAt: new Date().toISOString() };
    return { ...store[index] };
  }

  // ── Notifications ──
  async getNotificationLogs(bookingId?: string): Promise<NotificationLog[]> {
    if (bookingId) return getNotifications().filter((n) => n.bookingId === bookingId);
    return [...getNotifications()];
  }

  async createNotificationLog(payload: NotificationPayload, status: NotificationLog["status"], errorMessage?: string): Promise<NotificationLog> {
    const log: NotificationLog = { id: generateId("notif"), type: payload.type, channel: payload.channel, recipient: payload.recipient, subject: payload.subject, message: payload.message, status, bookingId: payload.bookingId, bookingCode: payload.bookingCode, errorMessage, sentAt: status === "sent" ? new Date().toISOString() : undefined, createdAt: new Date().toISOString() };
    getNotifications().push(log);
    return { ...log };
  }

  async markNotificationRead(id: string): Promise<NotificationLog> {
    const store = getNotifications();
    const index = store.findIndex((n) => n.id === id);
    if (index === -1) throw new Error(`Notification not found: ${id}`);
    store[index] = { ...store[index], status: "read", readAt: new Date().toISOString() };
    return { ...store[index] };
  }

  // ── Audit Log ──
  async getAuditLogs(targetId?: string): Promise<AuditLogEntry[]> {
    if (targetId) return getAuditLog().filter((entry) => entry.targetId === targetId);
    return [...getAuditLog()];
  }

  async createAuditLog(entry: Omit<AuditLogEntry, "id" | "timestamp">): Promise<AuditLogEntry> {
    const logEntry: AuditLogEntry = { id: generateId("audit"), timestamp: new Date().toISOString(), ...entry };
    getAuditLog().push(logEntry);
    return { ...logEntry };
  }

  // ── Auth - Admin ──
  async authenticateAdmin(email: string, password: string): Promise<AdminUser | null> {
    const admin = getAdmins().find((a) => a.email === email && a.isActive);
    if (!admin) return null;
    if (!verifyPassword(password, admin.passwordHash)) return null;
    admin.lastLoginAt = new Date().toISOString();
    return { ...admin };
  }

  async getAdminById(id: string): Promise<AdminUser | null> {
    return getAdmins().find((a) => a.id === id) ?? null;
  }

  // ── Auth - Customer ──
  async registerCustomer(data: { name: string; email: string; phone: string; passwordHash: string }): Promise<CustomerPublic> {
    const existing = getCustomers().find((c) => c.email === data.email);
    if (existing) throw new Error("Email sudah terdaftar");
    const now = new Date().toISOString();
    const customer: Customer = {
      id: generateId("cust"),
      name: data.name,
      email: data.email,
      phone: data.phone,
      passwordHash: data.passwordHash,
      isVerified: true,
      isActive: true,
      loyaltyPoints: 100,
      totalSpent: 0,
      memberSince: now,
      createdAt: now,
      updatedAt: now,
    };
    getCustomers().push(customer);
    // Welcome bonus
    getLoyalty().push({
      id: generateId("loy"),
      customerId: customer.id,
      type: "bonus",
      points: 100,
      description: "Bonus selamat datang member baru Lapangin!",
      createdAt: now,
    });
    return { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone, loyaltyPoints: customer.loyaltyPoints, totalSpent: customer.totalSpent, memberSince: customer.memberSince };
  }

  async authenticateCustomer(email: string, password: string): Promise<CustomerPublic | null> {
    const customer = getCustomers().find((c) => c.email === email && c.isActive);
    if (!customer) return null;
    if (!verifyPassword(password, customer.passwordHash)) return null;
    customer.lastLoginAt = new Date().toISOString();
    return { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone, loyaltyPoints: customer.loyaltyPoints, totalSpent: customer.totalSpent, memberSince: customer.memberSince };
  }

  async getCustomerById(id: string): Promise<CustomerPublic | null> {
    const customer = getCustomers().find((c) => c.id === id);
    if (!customer) return null;
    return { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone, loyaltyPoints: customer.loyaltyPoints, totalSpent: customer.totalSpent, memberSince: customer.memberSince };
  }

  async getCustomerByEmail(email: string): Promise<Customer | null> {
    return getCustomers().find((c) => c.email === email) ?? null;
  }

  // ── Loyalty ──
  async getLoyaltyTransactions(customerId: string): Promise<LoyaltyTransaction[]> {
    return getLoyalty().filter((t) => t.customerId === customerId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async addLoyaltyPoints(customerId: string, points: number, bookingId: string | undefined, description: string, type: LoyaltyTransactionType): Promise<LoyaltyTransaction> {
    const customer = getCustomers().find((c) => c.id === customerId);
    if (!customer) throw new Error("Customer not found");
    const now = new Date().toISOString();
    const tx: LoyaltyTransaction = { id: generateId("loy"), customerId, bookingId, type, points, description, createdAt: now };
    getLoyalty().push(tx);
    customer.loyaltyPoints += points;
    customer.updatedAt = now;
    return { ...tx };
  }

  async redeemLoyaltyPoints(customerId: string, rewardId: string, bookingId?: string): Promise<RewardRedemption> {
    const customer = getCustomers().find((c) => c.id === customerId);
    if (!customer) throw new Error("Customer not found");
    const reward = getRewards().find((r) => r.id === rewardId && r.isActive);
    if (!reward) throw new Error("Reward not found");
    if (customer.loyaltyPoints < reward.pointsCost) throw new Error("Poin tidak mencukupi");
    const now = new Date().toISOString();
    customer.loyaltyPoints -= reward.pointsCost;
    customer.updatedAt = now;
    // Log transaction
    getLoyalty().push({ id: generateId("loy"), customerId, type: "redeemed", points: -reward.pointsCost, description: `Tukar: ${reward.name}`, createdAt: now });
    const redemption: RewardRedemption = { id: generateId("rdm"), customerId, rewardId, rewardName: reward.name, pointsUsed: reward.pointsCost, bookingId, status: "applied", createdAt: now, usedAt: now };
    getRedemptions().push(redemption);
    return { ...redemption };
  }

  async getRewards(): Promise<Reward[]> {
    return [...getRewards()];
  }

  async getActiveRewards(): Promise<Reward[]> {
    return getRewards().filter((r) => r.isActive);
  }

  async getCustomerRedemptions(customerId: string): Promise<RewardRedemption[]> {
    return getRedemptions().filter((r) => r.customerId === customerId);
  }

  async updateCustomerSpent(customerId: string, amount: number): Promise<void> {
    const customer = getCustomers().find((c) => c.id === customerId);
    if (customer) {
      customer.totalSpent += amount;
      customer.updatedAt = new Date().toISOString();
    }
  }
}