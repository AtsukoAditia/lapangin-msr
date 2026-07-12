import { Pool } from "pg";
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
  Area,
  VenueOwner,
  VenueOwnerStatus,
  Review,
  ReviewWithDetails,
} from "@/lib/types/domain";

// ── Singleton Pool ──
declare global {
  var __pgPool: Pool | undefined;
}

const pool = globalThis.__pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (!globalThis.__pgPool) globalThis.__pgPool = pool;

// ── Helpers ──
function snakeToCamel(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    const camel = k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
    out[camel] = v;
  }
  return out;
}

function mapRow<T>(row: Record<string, unknown>): T {
  return snakeToCamel(row) as T;
}

async function query<T>(sql: string, params?: unknown[]): Promise<T[]> {
  const { rows } = await pool.query(sql, params);
  return rows.map((r) => mapRow<T>(r));
}

async function queryOne<T>(sql: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

function formatTime(t: string | null | undefined): string {
  if (!t) return "00:00";
  // pg returns "HH:MM:SS" or "HH:MM" — strip seconds
  const parts = t.split(":");
  return `${parts[0]}:${parts[1]}`;
}

function fmtDate(d: unknown): string {
  if (!d) return "";
  if (typeof d === "string") return d.slice(0, 10);
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d).slice(0, 10);
}

function fmtTs(d: unknown): string {
  if (!d) return "";
  if (typeof d === "string") return d;
  if (d instanceof Date) return d.toISOString();
  return String(d);
}

function mapBooking(row: Record<string, unknown>): Booking {
  const r = snakeToCamel(row);
  return {
    id: r.id as string,
    bookingCode: r.bookingCode as string,
    customerName: r.customerName as string,
    customerPhone: r.customerPhone as string,
    customerEmail: (r.customerEmail as string) || undefined,
    venueId: r.venueId as string,
    courtId: r.courtId as string,
    sportId: r.sportId as string,
    bookingDate: fmtDate(r.bookingDate),
    startTime: formatTime(r.startTime as string),
    endTime: formatTime(r.endTime as string),
    durationMinutes: r.durationMinutes as number,
    totalPrice: r.totalPrice as number,
    bookingStatus: r.bookingStatus as Booking["bookingStatus"],
    paymentStatus: r.paymentStatus as Booking["paymentStatus"],
    paymentProofUrl: (r.paymentProofUrl as string) || undefined,
    paymentRejectionReason: (r.paymentRejectionReason as string) || undefined,
    notes: (r.notes as string) || undefined,
    userId: (r.userId as string) || undefined,
    expiresAt: r.expiresAt ? fmtTs(r.expiresAt) : undefined,
    createdAt: fmtTs(r.createdAt),
    updatedAt: fmtTs(r.updatedAt),
  };
}

function mapCourt(row: Record<string, unknown>): Court {
  const r = snakeToCamel(row);
  return {
    id: r.id as string,
    venueId: r.venueId as string,
    sportId: r.sportId as string,
    name: r.name as string,
    slug: r.slug as string,
    surfaceType: r.surfaceType as string,
    indoorType: r.indoorType as Court["indoorType"],
    capacity: r.capacity as number,
    basePrice: r.basePrice as number,
    isActive: r.isActive as boolean,
  };
}

function mapPricing(row: Record<string, unknown>): PricingRule {
  const r = snakeToCamel(row);
  return {
    id: r.id as string,
    courtId: r.courtId as string,
    dayType: r.dayType as PricingRule["dayType"],
    startTime: formatTime(r.startTime as string),
    endTime: formatTime(r.endTime as string),
    pricePerHour: r.pricePerHour as number,
    priority: r.priority as number,
    isActive: r.isActive as boolean,
  };
}

// ── Adapter ──
export class PostgresAdapter implements DatabaseAdapter {
  // ── Sports ──
  async getSports(): Promise<Sport[]> {
    const rows = await query<Record<string, unknown>>("SELECT id, name, slug, is_active FROM sports WHERE is_active = true");
    return rows.map((r) => ({ id: r.id as string, name: r.name as string, slug: r.slug as string, isActive: (r.isActive ?? r.is_active) as boolean }));
  }

  // ── Areas ──
  async getAreas(): Promise<Area[]> {
    const rows = await query<Record<string, unknown>>("SELECT * FROM areas WHERE is_active = true ORDER BY province, city");
    return rows.map((r) => {
      const a = snakeToCamel(r);
      return { id: a.id as string, province: a.province as string, city: a.city as string, district: a.district as string, village: (a.village as string) || "", slug: a.slug as string, label: (a.label as string) || "", isActive: a.isActive as boolean, createdAt: fmtTs(a.createdAt), updatedAt: fmtTs(a.updatedAt) };
    });
  }

  async getAreaById(id: string): Promise<Area | null> {
    const r = await queryOne<Record<string, unknown>>("SELECT * FROM areas WHERE id = $1", [id]);
    if (!r) return null;
    const a = snakeToCamel(r);
    return { id: a.id as string, province: a.province as string, city: a.city as string, district: a.district as string, village: (a.village as string) || "", slug: a.slug as string, label: (a.label as string) || "", isActive: a.isActive as boolean, createdAt: fmtTs(a.createdAt), updatedAt: fmtTs(a.updatedAt) };
  }

  // ── Venue Owners ──
  async getVenueOwners(): Promise<VenueOwner[]> {
    const rows = await query<Record<string, unknown>>("SELECT * FROM venue_owners");
    return rows.map((r) => { const o = snakeToCamel(r); return { id: o.id as string, adminId: (o.adminId as string) || "", businessName: o.businessName as string, picName: o.picName as string, phone: o.phone as string, email: o.email as string, status: o.status as VenueOwner["status"], createdAt: fmtTs(o.createdAt), updatedAt: fmtTs(o.updatedAt) }; });
  }

  async getVenueOwnerById(id: string): Promise<VenueOwner | null> {
    const r = await queryOne<Record<string, unknown>>("SELECT * FROM venue_owners WHERE id = $1", [id]);
    if (!r) return null;
    const o = snakeToCamel(r);
    return { id: o.id as string, adminId: (o.adminId as string) || "", businessName: o.businessName as string, picName: o.picName as string, phone: o.phone as string, email: o.email as string, status: o.status as VenueOwner["status"], createdAt: fmtTs(o.createdAt), updatedAt: fmtTs(o.updatedAt) };
  }

  async getVenueOwnerByAdminId(adminId: string): Promise<VenueOwner | null> {
    const r = await queryOne<Record<string, unknown>>("SELECT * FROM venue_owners WHERE admin_id = $1", [adminId]);
    if (!r) return null;
    const o = snakeToCamel(r);
    return { id: o.id as string, adminId: (o.adminId as string) || "", businessName: o.businessName as string, picName: o.picName as string, phone: o.phone as string, email: o.email as string, status: o.status as VenueOwner["status"], createdAt: fmtTs(o.createdAt), updatedAt: fmtTs(o.updatedAt) };
  }

  // ── Venues ──
  async getVenues(): Promise<Venue[]> {
    const rows = await query<Record<string, unknown>>("SELECT * FROM venues WHERE is_active = true AND approval_status = 'active'");
    return rows.map((r) => mapRow<Venue>(r));
  }

  async getVenuesByArea(areaId: string): Promise<Venue[]> {
    const rows = await query<Record<string, unknown>>("SELECT * FROM venues WHERE area_id = $1 AND is_active = true AND approval_status = 'active'", [areaId]);
    return rows.map((r) => mapRow<Venue>(r));
  }

  async getVenuesByOwner(ownerId: string): Promise<Venue[]> {
    const rows = await query<Record<string, unknown>>("SELECT * FROM venues WHERE owner_id = $1", [ownerId]);
    return rows.map((r) => mapRow<Venue>(r));
  }

  async getVenueById(id: string): Promise<Venue | null> {
    const rows = await query<Record<string, unknown>>("SELECT * FROM venues WHERE id = $1", [id]);
    return rows[0] ? mapRow<Venue>(rows[0]) : null;
  }

  // ── Courts ──
  async getCourts(): Promise<Court[]> {
    const rows = await query<Record<string, unknown>>("SELECT * FROM courts WHERE is_active = true");
    return rows.map(mapCourt);
  }

  async getAllCourts(): Promise<Court[]> {
    const rows = await query<Record<string, unknown>>("SELECT * FROM courts");
    return rows.map(mapCourt);
  }

  async getCourtById(id: string): Promise<Court | null> {
    const r = await queryOne<Record<string, unknown>>("SELECT * FROM courts WHERE id = $1", [id]);
    return r ? mapCourt(r) : null;
  }

  async updateCourt(id: string, input: UpdateCourtInput): Promise<Court> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    if (input.name !== undefined) { sets.push(`name = $${i++}`); vals.push(input.name); }
    if (input.slug !== undefined) { sets.push(`slug = $${i++}`); vals.push(input.slug); }
    if (input.surfaceType !== undefined) { sets.push(`surface_type = $${i++}`); vals.push(input.surfaceType); }
    if (input.indoorType !== undefined) { sets.push(`indoor_type = $${i++}`); vals.push(input.indoorType); }
    if (input.capacity !== undefined) { sets.push(`capacity = $${i++}`); vals.push(input.capacity); }
    if (input.basePrice !== undefined) { sets.push(`base_price = $${i++}`); vals.push(input.basePrice); }
    if (input.isActive !== undefined) { sets.push(`is_active = $${i++}`); vals.push(input.isActive); }
    if (sets.length === 0) throw new Error("No fields to update");
    sets.push(`updated_at = NOW()`);
    vals.push(id);
    const r = await queryOne<Record<string, unknown>>(`UPDATE courts SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`, vals);
    if (!r) throw new Error(`Court not found: ${id}`);
    return mapCourt(r);
  }

  // ── Bookings ──
  async getBookings(): Promise<Booking[]> {
    const rows = await query<Record<string, unknown>>("SELECT * FROM bookings ORDER BY created_at DESC");
    return rows.map(mapBooking);
  }

  async getBookingById(id: string): Promise<Booking | null> {
    const r = await queryOne<Record<string, unknown>>("SELECT * FROM bookings WHERE id = $1", [id]);
    return r ? mapBooking(r) : null;
  }

  async getBookingByCode(code: string): Promise<Booking | null> {
    const r = await queryOne<Record<string, unknown>>("SELECT * FROM bookings WHERE booking_code = $1", [code]);
    return r ? mapBooking(r) : null;
  }

  async getBookingsByCourtAndDate(courtId: string, date: string): Promise<Booking[]> {
    const rows = await query<Record<string, unknown>>("SELECT * FROM bookings WHERE court_id = $1 AND booking_date = $2", [courtId, date]);
    return rows.map(mapBooking);
  }

  async expireBookings(): Promise<number> {
    const { rowCount } = await pool.query("UPDATE bookings SET booking_status = 'expired', payment_status = 'unpaid', updated_at = NOW() WHERE booking_status = 'waiting_payment' AND expires_at < NOW()");
    return rowCount ?? 0;
  }

  async createBooking(input: CreateBookingInput): Promise<Booking> {
    const id = `bk-${crypto.randomUUID().slice(0, 8)}`;
    const code = (() => {
      const now = new Date();
      const d = String(now.getFullYear()).slice(2) + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0");
      const r = crypto.randomUUID().slice(0, 4).toUpperCase();
      return `BK-${d}-${r}`;
    })();
    const { rows } = await pool.query(
      `INSERT INTO bookings (id, booking_code, customer_name, customer_phone, customer_email, user_id, venue_id, court_id, sport_id, booking_date, start_time, end_time, duration_minutes, total_price, booking_status, payment_status, notes, expires_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'waiting_payment','unpaid',$15,(NOW() + INTERVAL '15 minutes'))
       RETURNING *`,
      [id, code, input.customerName, input.customerPhone, input.customerEmail || null, input.userId || null, input.venueId, input.courtId, input.sportId, input.bookingDate, input.startTime, input.endTime, input.durationMinutes, input.totalPrice, input.notes || null],
    );
    return mapBooking(rows[0]);
  }

  async updateBookingStatus(id: string, status: Booking["bookingStatus"], paymentStatus?: Booking["paymentStatus"]): Promise<Booking> {
    if (paymentStatus) {
      const { rows } = await pool.query("UPDATE bookings SET booking_status = $1, payment_status = $2, updated_at = NOW() WHERE id = $3 RETURNING *", [status, paymentStatus, id]);
      if (!rows[0]) throw new Error(`Booking not found: ${id}`);
      return mapBooking(rows[0]);
    }
    const { rows } = await pool.query("UPDATE bookings SET booking_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *", [status, id]);
    if (!rows[0]) throw new Error(`Booking not found: ${id}`);
    return mapBooking(rows[0]);
  }

  // ── Pricing Rules ──
  async getPricingRules(courtId: string): Promise<PricingRule[]> {
    const rows = await query<Record<string, unknown>>("SELECT * FROM pricing_rules WHERE court_id = $1 AND is_active = true ORDER BY priority", [courtId]);
    return rows.map(mapPricing);
  }

  async getAllPricingRules(): Promise<PricingRule[]> {
    const rows = await query<Record<string, unknown>>("SELECT * FROM pricing_rules ORDER BY court_id, priority");
    return rows.map(mapPricing);
  }

  async createPricingRule(input: CreatePricingRuleInput): Promise<PricingRule> {
    const id = `pr-${crypto.randomUUID().slice(0, 8)}`;
    const r = await queryOne<Record<string, unknown>>(
      "INSERT INTO pricing_rules (id, court_id, day_type, start_time, end_time, price_per_hour, priority, is_active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
      [id, input.courtId, input.dayType, input.startTime, input.endTime, input.pricePerHour, input.priority, input.isActive ?? true],
    );
    return mapPricing(r!);
  }

  async updatePricingRule(id: string, input: UpdatePricingRuleInput): Promise<PricingRule> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    if (input.dayType !== undefined) { sets.push(`day_type = $${i++}`); vals.push(input.dayType); }
    if (input.startTime !== undefined) { sets.push(`start_time = $${i++}`); vals.push(input.startTime); }
    if (input.endTime !== undefined) { sets.push(`end_time = $${i++}`); vals.push(input.endTime); }
    if (input.pricePerHour !== undefined) { sets.push(`price_per_hour = $${i++}`); vals.push(input.pricePerHour); }
    if (input.priority !== undefined) { sets.push(`priority = $${i++}`); vals.push(input.priority); }
    if (input.isActive !== undefined) { sets.push(`is_active = $${i++}`); vals.push(input.isActive); }
    if (sets.length === 0) throw new Error("No fields to update");
    sets.push("updated_at = NOW()");
    vals.push(id);
    const r = await queryOne<Record<string, unknown>>(`UPDATE pricing_rules SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`, vals);
    if (!r) throw new Error(`Pricing rule not found: ${id}`);
    return mapPricing(r);
  }

  async deletePricingRule(id: string): Promise<void> {
    await pool.query("DELETE FROM pricing_rules WHERE id = $1", [id]);
  }

  // ── Blocked Slots ──
  async getBlockedSlots(courtId: string, date: string): Promise<BlockedSlot[]> {
    const rows = await query<Record<string, unknown>>("SELECT * FROM blocked_slots WHERE court_id = $1 AND date = $2", [courtId, date]);
    return rows.map((r) => { const b = snakeToCamel(r); return { id: b.id as string, courtId: b.courtId as string, date: fmtDate(b.date), startTime: formatTime(b.startTime as string), endTime: formatTime(b.endTime as string), reason: (b.reason as string) || undefined }; });
  }

  async getAllBlockedSlots(): Promise<BlockedSlot[]> {
    const rows = await query<Record<string, unknown>>("SELECT * FROM blocked_slots ORDER BY date");
    return rows.map((r) => { const b = snakeToCamel(r); return { id: b.id as string, courtId: b.courtId as string, date: fmtDate(b.date), startTime: formatTime(b.startTime as string), endTime: formatTime(b.endTime as string), reason: (b.reason as string) || undefined }; });
  }

  async createBlockedSlot(input: CreateBlockedSlotInput): Promise<BlockedSlot> {
    const r = await queryOne<Record<string, unknown>>("INSERT INTO blocked_slots (court_id, date, start_time, end_time, reason) VALUES ($1,$2,$3,$4,$5) RETURNING *", [input.courtId, input.date, input.startTime, input.endTime, input.reason || null]);
    const b = snakeToCamel(r!);
    return { id: b.id as string, courtId: b.courtId as string, date: fmtDate(b.date), startTime: formatTime(b.startTime as string), endTime: formatTime(b.endTime as string), reason: (b.reason as string) || undefined };
  }

  async deleteBlockedSlot(id: string): Promise<void> {
    await pool.query("DELETE FROM blocked_slots WHERE id = $1", [id]);
  }

  // ── Audit Log ──
  async getAuditLogs(targetId?: string): Promise<AuditLogEntry[]> {
    if (targetId) {
      const rows = await query<Record<string, unknown>>("SELECT * FROM audit_logs WHERE target_id = $1 ORDER BY timestamp DESC", [targetId]);
      return rows.map(mapRow<AuditLogEntry>);
    }
    const rows = await query<Record<string, unknown>>("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100");
    return rows.map(mapRow<AuditLogEntry>);
  }

  async createAuditLog(entry: Omit<AuditLogEntry, "id" | "timestamp">): Promise<AuditLogEntry> {
    const r = await queryOne<Record<string, unknown>>(
      "INSERT INTO audit_logs (action, target_type, target_id, actor_type, actor_id, details, previous_value, new_value) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
      [entry.action, entry.targetType, entry.targetId, entry.actorType, entry.actorId || null, entry.details, entry.previousValue || null, entry.newValue || null],
    );
    return mapRow<AuditLogEntry>(r!);
  }

  // ── Payment Methods ──
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const rows = await query<Record<string, unknown>>("SELECT * FROM payment_methods");
    return rows.map((r) => { const p = snakeToCamel(r); return { id: p.id as string, name: p.name as string, label: p.label as string, type: p.type as PaymentMethod["type"], accountName: p.accountName as string, accountNumber: (p.accountNumber as string) || undefined, provider: p.provider as string, details: p.details as string, instructions: p.instructions as string, isActive: p.isActive as boolean }; });
  }

  async getActivePaymentMethods(): Promise<PaymentMethod[]> {
    const rows = await query<Record<string, unknown>>("SELECT * FROM payment_methods WHERE is_active = true");
    return rows.map((r) => { const p = snakeToCamel(r); return { id: p.id as string, name: p.name as string, label: p.label as string, type: p.type as PaymentMethod["type"], accountName: p.accountName as string, accountNumber: (p.accountNumber as string) || undefined, provider: p.provider as string, details: p.details as string, instructions: p.instructions as string, isActive: p.isActive as boolean }; });
  }

  // ── Payment Proof ──
  async submitPaymentProof(bookingId: string, proofUrl: string): Promise<Booking> {
    const r = await queryOne<Record<string, unknown>>("UPDATE bookings SET payment_proof_url = $1, payment_status = 'waiting_confirmation', booking_status = 'waiting_verification', expires_at = NULL, payment_submitted_at = NOW(), updated_at = NOW() WHERE id = $2 RETURNING *", [proofUrl, bookingId]);
    if (!r) throw new Error(`Booking not found: ${bookingId}`);
    return mapBooking(r);
  }

  async confirmPayment(bookingId: string, _actorId?: string): Promise<Booking> {
    const r = await queryOne<Record<string, unknown>>("UPDATE bookings SET payment_status = 'paid', booking_status = 'confirmed', payment_verified_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *", [bookingId]);
    if (!r) throw new Error(`Booking not found: ${bookingId}`);
    return mapBooking(r);
  }

  async rejectPayment(bookingId: string, _actorId?: string): Promise<Booking> {
    const r = await queryOne<Record<string, unknown>>("UPDATE bookings SET payment_status = 'rejected', booking_status = 'rejected', payment_rejected_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *", [bookingId]);
    if (!r) throw new Error(`Booking not found: ${bookingId}`);
    return mapBooking(r);
  }

  // ── Notifications ──
  async getNotificationLogs(bookingId?: string): Promise<NotificationLog[]> {
    if (bookingId) {
      const rows = await query<Record<string, unknown>>("SELECT * FROM notification_logs WHERE booking_id = $1 ORDER BY created_at DESC", [bookingId]);
      return rows.map(mapRow<NotificationLog>);
    }
    const rows = await query<Record<string, unknown>>("SELECT * FROM notification_logs ORDER BY created_at DESC LIMIT 100");
    return rows.map(mapRow<NotificationLog>);
  }

  async createNotificationLog(payload: NotificationPayload, status: NotificationLog["status"], errorMessage?: string): Promise<NotificationLog> {
    const r = await queryOne<Record<string, unknown>>(
      "INSERT INTO notification_logs (type, channel, recipient, subject, message, status, booking_id, booking_code, error_message, sent_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *",
      [payload.type, payload.channel, payload.recipient, payload.subject || null, payload.message, status, payload.bookingId || null, payload.bookingCode || null, errorMessage || null, status === "sent" ? "NOW()" : null],
    );
    return mapRow<NotificationLog>(r!);
  }

  async markNotificationRead(id: string): Promise<NotificationLog> {
    const r = await queryOne<Record<string, unknown>>("UPDATE notification_logs SET status = 'read', read_at = NOW() WHERE id = $1 RETURNING *", [id]);
    if (!r) throw new Error(`Notification not found: ${id}`);
    return mapRow<NotificationLog>(r);
  }

  // ── Auth - Admin ──
  async authenticateAdmin(email: string, _password: string): Promise<AdminUser | null> {
    // Password verification done in service layer with bcryptjs
    const r = await queryOne<Record<string, unknown>>("SELECT * FROM admins WHERE email = $1 AND is_active = true", [email]);
    if (!r) return null;
    const a = snakeToCamel(r);
    return { id: a.id as string, username: a.username as string, name: a.name as string, email: a.email as string, passwordHash: a.passwordHash as string, role: a.role as AdminUser["role"], isActive: a.isActive as boolean, createdAt: fmtTs(a.createdAt), lastLoginAt: a.lastLoginAt ? fmtTs(a.lastLoginAt) : undefined };
  }

  async getAdminById(id: string): Promise<AdminUser | null> {
    const r = await queryOne<Record<string, unknown>>("SELECT * FROM admins WHERE id = $1", [id]);
    if (!r) return null;
    const a = snakeToCamel(r);
    return { id: a.id as string, username: a.username as string, name: a.name as string, email: a.email as string, passwordHash: a.passwordHash as string, role: a.role as AdminUser["role"], isActive: a.isActive as boolean, createdAt: fmtTs(a.createdAt), lastLoginAt: a.lastLoginAt ? fmtTs(a.lastLoginAt) : undefined };
  }

  // ── Auth - Customer ──

  async createAdmin(data: Omit<AdminUser, "createdAt" | "lastLoginAt">): Promise<AdminUser> {
    const r = await queryOne<Record<string, unknown>>(
      "INSERT INTO admins (id, username, name, email, password_hash, role, is_active) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
      [data.id, data.username, data.name, data.email, data.passwordHash, data.role, data.isActive],
    );
    if (!r) throw new Error("Failed to create admin");
    const a = snakeToCamel(r);
    return { id: a.id as string, username: a.username as string, name: a.name as string, email: a.email as string, passwordHash: a.passwordHash as string, role: a.role as AdminUser["role"], isActive: a.isActive as boolean, createdAt: fmtTs(a.createdAt) };
  }

  async getAllAdmins(): Promise<AdminUser[]> {
    const rows = await query<Record<string, unknown>>("SELECT * FROM admins");
    return rows.map(r => {
      const a = snakeToCamel(r);
      return { id: a.id as string, username: a.username as string, name: a.name as string, email: a.email as string, passwordHash: a.passwordHash as string, role: a.role as AdminUser["role"], isActive: a.isActive as boolean, createdAt: fmtTs(a.createdAt), lastLoginAt: a.lastLoginAt ? fmtTs(a.lastLoginAt) : undefined };
    });
  }

  async createVenueOwner(data: Omit<VenueOwner, "createdAt" | "updatedAt">): Promise<VenueOwner> {
    const r = await queryOne<Record<string, unknown>>(
      "INSERT INTO venue_owners (id, admin_id, business_name, pic_name, phone, email, status) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
      [data.id, data.adminId, data.businessName, data.picName, data.phone, data.email, data.status],
    );
    if (!r) throw new Error("Failed to create venue owner");
    const o = snakeToCamel(r);
    return { id: o.id as string, adminId: o.adminId as string, businessName: o.businessName as string, picName: o.picName as string, phone: o.phone as string, email: o.email as string, status: o.status as VenueOwner["status"], createdAt: fmtTs(o.createdAt), updatedAt: fmtTs(o.updatedAt) };
  }

  async updateVenueOwnerStatus(id: string, status: VenueOwnerStatus): Promise<VenueOwner> {
    const r = await queryOne<Record<string, unknown>>(
      "UPDATE venue_owners SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *",
      [id, status],
    );
    if (!r) throw new Error(`Venue owner not found: ${id}`);
    const o = snakeToCamel(r);
    return { id: o.id as string, adminId: o.adminId as string, businessName: o.businessName as string, picName: o.picName as string, phone: o.phone as string, email: o.email as string, status: o.status as VenueOwner["status"], createdAt: fmtTs(o.createdAt), updatedAt: fmtTs(o.updatedAt) };
  }

  // ── Auth - Customer ──
  async registerCustomer(data: { name: string; email: string; phone: string; passwordHash: string }): Promise<CustomerPublic> {
    const r = await queryOne<Record<string, unknown>>(
      "INSERT INTO customers (name, email, phone, password_hash) VALUES ($1,$2,$3,$4) RETURNING *",
      [data.name, data.email, data.phone, data.passwordHash],
    );
    const c = snakeToCamel(r!);
    return { id: c.id as string, name: c.name as string, email: c.email as string, phone: c.phone as string, loyaltyPoints: c.loyaltyPoints as number, totalSpent: c.totalSpent as number, memberSince: fmtTs(c.memberSince) };
  }

  async authenticateCustomer(email: string, _password: string): Promise<CustomerPublic | null> {
    const r = await queryOne<Record<string, unknown>>("SELECT * FROM customers WHERE email = $1 AND is_active = true", [email]);
    if (!r) return null;
    const c = snakeToCamel(r);
    return { id: c.id as string, name: c.name as string, email: c.email as string, phone: c.phone as string, loyaltyPoints: c.loyaltyPoints as number, totalSpent: c.totalSpent as number, memberSince: fmtTs(c.memberSince) };
  }

  async getCustomerById(id: string): Promise<CustomerPublic | null> {
    const r = await queryOne<Record<string, unknown>>("SELECT * FROM customers WHERE id = $1", [id]);
    if (!r) return null;
    const c = snakeToCamel(r);
    return { id: c.id as string, name: c.name as string, email: c.email as string, phone: c.phone as string, loyaltyPoints: c.loyaltyPoints as number, totalSpent: c.totalSpent as number, memberSince: fmtTs(c.memberSince) };
  }

  async getCustomerByEmail(email: string): Promise<Customer | null> {
    const r = await queryOne<Record<string, unknown>>("SELECT * FROM customers WHERE email = $1", [email]);
    if (!r) return null;
    const c = snakeToCamel(r);
    return { id: c.id as string, name: c.name as string, email: c.email as string, phone: c.phone as string, passwordHash: c.passwordHash as string, avatar: c.avatar as string | undefined, isVerified: c.isVerified as boolean, isActive: c.isActive as boolean, loyaltyPoints: c.loyaltyPoints as number, totalSpent: c.totalSpent as number, memberSince: fmtTs(c.memberSince), lastLoginAt: c.lastLoginAt ? fmtTs(c.lastLoginAt) : undefined, createdAt: fmtTs(c.createdAt), updatedAt: fmtTs(c.updatedAt) };
  }

  // ── Loyalty ──
  async getLoyaltyTransactions(customerId: string): Promise<LoyaltyTransaction[]> {
    const rows = await query<Record<string, unknown>>("SELECT * FROM loyalty_transactions WHERE customer_id = $1 ORDER BY created_at DESC", [customerId]);
    return rows.map(mapRow<LoyaltyTransaction>);
  }

  async addLoyaltyPoints(customerId: string, points: number, bookingId: string | undefined, description: string, type: LoyaltyTransactionType): Promise<LoyaltyTransaction> {
    await pool.query("UPDATE customers SET loyalty_points = loyalty_points + $1, updated_at = NOW() WHERE id = $2", [points, customerId]);
    const r = await queryOne<Record<string, unknown>>("INSERT INTO loyalty_transactions (customer_id, booking_id, type, points, description) VALUES ($1,$2,$3,$4,$5) RETURNING *", [customerId, bookingId || null, type, points, description]);
    return mapRow<LoyaltyTransaction>(r!);
  }

  async redeemLoyaltyPoints(customerId: string, rewardId: string, bookingId?: string): Promise<RewardRedemption> {
    const reward = await queryOne<Record<string, unknown>>("SELECT * FROM rewards WHERE id = $1 AND is_active = true", [rewardId]);
    if (!reward) throw new Error("Reward not found");
    const rc = snakeToCamel(reward);
    const pointsCost = rc.pointsCost as number;
    const name = rc.name as string;

    await pool.query("UPDATE customers SET loyalty_points = loyalty_points - $1, updated_at = NOW() WHERE id = $2", [pointsCost, customerId]);
    await pool.query("INSERT INTO loyalty_transactions (customer_id, type, points, description) VALUES ($1, 'redeemed', $2, $3)", [customerId, -pointsCost, `Tukar: ${name}`]);

    // ponytail: rewards table not in schema — skip redemption record until schema updated. add when rewards table added.
    const redemption = { id: `rdm-${crypto.randomUUID().slice(0, 8)}`, customerId, rewardId, rewardName: name, pointsUsed: pointsCost, bookingId, status: "applied" as const, createdAt: new Date().toISOString(), usedAt: new Date().toISOString() };
    return redemption;
  }

  async getRewards(): Promise<Reward[]> {
    // ponytail: rewards table not in schema — return empty. add when schema updated.
    return [];
  }

  async getActiveRewards(): Promise<Reward[]> {
    return [];
  }

  async getCustomerRedemptions(_customerId: string): Promise<RewardRedemption[]> {
    // ponytail: reward_redemptions table not in schema — return empty. add when schema updated.
    return [];
  }

  async updateCustomerSpent(customerId: string, amount: number): Promise<void> {
    await pool.query("UPDATE customers SET total_spent = total_spent + $1, updated_at = NOW() WHERE id = $2", [amount, customerId]);
  }

  // ── Reviews ──

  async createReview(data: {
    bookingId: string;
    customerId: string;
    venueId: string;
    courtId?: string;
    rating: number;
    comment: string;
    photos?: string[];
  }): Promise<Review> {
    const id = `review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const { rows } = await pool.query(
      `INSERT INTO reviews (id, booking_id, customer_id, venue_id, court_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id, data.bookingId, data.customerId, data.venueId, data.courtId || null, data.rating, data.comment]
    );

    // Insert photos if provided
    if (data.photos && data.photos.length > 0) {
      for (const photoUrl of data.photos) {
        const photoId = `rphoto-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        await pool.query(
          `INSERT INTO review_photos (id, review_id, photo_url) VALUES ($1, $2, $3)`,
          [photoId, id, photoUrl]
        );
      }
    }

    // Update venue aggregate rating
    await this.updateVenueRating(data.venueId);

    return this.mapReview(rows[0]);
  }

  async getReviewsByVenue(venueId: string): Promise<ReviewWithDetails[]> {
    const { rows } = await pool.query(
      `SELECT r.*, c.name as customer_name, c.avatar as customer_avatar
       FROM reviews r
       LEFT JOIN customers c ON r.customer_id = c.id
       WHERE r.venue_id = $1 AND r.is_visible = true
       ORDER BY r.created_at DESC`,
      [venueId]
    );

    const reviews: ReviewWithDetails[] = [];
    for (const row of rows) {
      const review = this.mapReview(row) as ReviewWithDetails;
      review.customerName = row.customer_name;
      review.customerAvatar = row.customer_avatar;
      // Fetch photos
      const { rows: photoRows } = await pool.query(
        `SELECT * FROM review_photos WHERE review_id = $1 ORDER BY created_at`,
        [review.id]
      );
      review.photos = photoRows.map((p) => ({
        id: p.id,
        reviewId: p.review_id,
        photoUrl: p.photo_url,
        createdAt: p.created_at,
      }));
      reviews.push(review);
    }
    return reviews;
  }

  async getReviewsByCourt(courtId: string): Promise<ReviewWithDetails[]> {
    const { rows } = await pool.query(
      `SELECT r.*, c.name as customer_name, c.avatar as customer_avatar
       FROM reviews r
       LEFT JOIN customers c ON r.customer_id = c.id
       WHERE r.court_id = $1 AND r.is_visible = true
       ORDER BY r.created_at DESC`,
      [courtId]
    );

    const reviews: ReviewWithDetails[] = [];
    for (const row of rows) {
      const review = this.mapReview(row) as ReviewWithDetails;
      review.customerName = row.customer_name;
      review.customerAvatar = row.customer_avatar;
      const { rows: photoRows } = await pool.query(
        `SELECT * FROM review_photos WHERE review_id = $1 ORDER BY created_at`,
        [review.id]
      );
      review.photos = photoRows.map((p) => ({
        id: p.id,
        reviewId: p.review_id,
        photoUrl: p.photo_url,
        createdAt: p.created_at,
      }));
      reviews.push(review);
    }
    return reviews;
  }

  async getReviewByBooking(bookingId: string): Promise<Review | null> {
    const { rows } = await pool.query(
      `SELECT * FROM reviews WHERE booking_id = $1`,
      [bookingId]
    );
    return rows[0] ? this.mapReview(rows[0]) : null;
  }

  async getVenueRating(venueId: string): Promise<{ avgRating: number; reviewCount: number }> {
    const { rows } = await pool.query(
      `SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as review_count
       FROM reviews WHERE venue_id = $1 AND is_visible = true`,
      [venueId]
    );
    return {
      avgRating: parseFloat(rows[0].avg_rating) || 0,
      reviewCount: parseInt(rows[0].review_count) || 0,
    };
  }

  async updateVenueRating(venueId: string): Promise<void> {
    const { avgRating, reviewCount } = await this.getVenueRating(venueId);
    await pool.query(
      `UPDATE venues SET avg_rating = $1, review_count = $2, updated_at = NOW() WHERE id = $3`,
      [avgRating, reviewCount, venueId]
    );
  }

  async updateVenueConfig(venueId: string, config: Record<string, unknown>): Promise<void> {
    const entries = Object.entries(config);
    if (entries.length === 0) return;
    // Merge with existing config
    const { rows } = await pool.query(`SELECT rain_discount_config FROM venues WHERE id = $1`, [venueId]);
    const existing = rows[0]?.rain_discount_config || {};
    const merged = { ...existing, ...config };
    await pool.query(
      `UPDATE venues SET rain_discount_config = $1, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(merged), venueId]
    );
  }

  private mapReview(row: Record<string, unknown>): Review {
    return {
      id: row.id as string,
      bookingId: row.booking_id as string,
      customerId: row.customer_id as string,
      venueId: row.venue_id as string,
      courtId: row.court_id as string | undefined,
      rating: row.rating as number,
      comment: row.comment as string,
      isVisible: row.is_visible as boolean,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }
}