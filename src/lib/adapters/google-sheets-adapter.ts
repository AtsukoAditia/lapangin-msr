import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
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
  AuditLogAction,
  PaymentMethod,
  NotificationLog,
  NotificationPayload,
} from "@/lib/types/domain";

function getJwtClient(): JWT {
  const email = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const key = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !key) {
    throw new Error("Missing GOOGLE_SHEETS_CLIENT_EMAIL or GOOGLE_SHEETS_PRIVATE_KEY env vars");
  }

  return new JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

async function getSpreadsheet(): Promise<GoogleSpreadsheet> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID env var");
  }

  const jwtClient = getJwtClient();
  const doc = new GoogleSpreadsheet(spreadsheetId, jwtClient);
  await doc.loadInfo();
  return doc;
}

// Helper to convert snake_case row to camelCase object
function rowToSport(row: Record<string, unknown>): Sport {
  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    slug: String(row.slug ?? ""),
    isActive: String(row.is_active).toLowerCase() === "true",
  };
}

function rowToVenue(row: Record<string, unknown>): Venue {
  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    slug: String(row.slug ?? ""),
    address: String(row.address ?? ""),
    mapsUrl: String(row.maps_url ?? ""),
    phone: String(row.phone ?? ""),
    openTime: String(row.open_time ?? ""),
    closeTime: String(row.close_time ?? ""),
    isActive: String(row.is_active).toLowerCase() === "true",
  };
}

function rowToCourt(row: Record<string, unknown>): Court {
  return {
    id: String(row.id ?? ""),
    venueId: String(row.venue_id ?? ""),
    sportId: String(row.sport_id ?? ""),
    name: String(row.name ?? ""),
    slug: String(row.slug ?? ""),
    surfaceType: String(row.surface_type ?? ""),
    indoorType: String(row.indoor_type ?? "") as Court["indoorType"],
    capacity: Number(row.capacity ?? 0),
    basePrice: Number(row.base_price ?? 0),
    isActive: String(row.is_active).toLowerCase() === "true",
  };
}

function rowToBooking(row: Record<string, unknown>): Booking {
  return {
    id: String(row.id ?? ""),
    bookingCode: String(row.booking_code ?? ""),
    customerName: String(row.customer_name ?? ""),
    customerPhone: String(row.customer_phone ?? ""),
    customerEmail: row.customer_email ? String(row.customer_email) : undefined,
    venueId: String(row.venue_id ?? ""),
    courtId: String(row.court_id ?? ""),
    sportId: String(row.sport_id ?? ""),
    bookingDate: String(row.booking_date ?? ""),
    startTime: String(row.start_time ?? ""),
    endTime: String(row.end_time ?? ""),
    durationMinutes: Number(row.duration_minutes ?? 0),
    totalPrice: Number(row.total_price ?? 0),
    bookingStatus: String(row.booking_status ?? "pending") as Booking["bookingStatus"],
    paymentStatus: String(row.payment_status ?? "unpaid") as Booking["paymentStatus"],
    paymentProofUrl: row.payment_proof_url ? String(row.payment_proof_url) : undefined,
    notes: row.notes ? String(row.notes) : undefined,
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

function rowToPricingRule(row: Record<string, unknown>): PricingRule {
  return {
    id: String(row.id ?? ""),
    courtId: String(row.court_id ?? ""),
    dayType: String(row.day_type ?? "all") as PricingRule["dayType"],
    startTime: String(row.start_time ?? ""),
    endTime: String(row.end_time ?? ""),
    pricePerHour: Number(row.price_per_hour ?? 0),
    priority: Number(row.priority ?? 0),
    isActive: String(row.is_active).toLowerCase() === "true",
  };
}

function rowToAuditLog(row: Record<string, unknown>): AuditLogEntry {
  return {
    id: String(row.id ?? ""),
    timestamp: String(row.timestamp ?? ""),
    action: String(row.action ?? "") as AuditLogAction,
    targetType: String(row.target_type ?? "booking") as AuditLogEntry["targetType"],
    targetId: String(row.target_id ?? ""),
    actorType: String(row.actor_type ?? "system") as AuditLogEntry["actorType"],
    actorId: row.actor_id ? String(row.actor_id) : undefined,
    details: String(row.details ?? ""),
    previousValue: row.previous_value ? String(row.previous_value) : undefined,
    newValue: row.new_value ? String(row.new_value) : undefined,
  };
}

function rowToBlockedSlot(row: Record<string, unknown>): BlockedSlot {
  return {
    id: String(row.id ?? ""),
    courtId: String(row.court_id ?? ""),
    date: String(row.date ?? ""),
    startTime: String(row.start_time ?? ""),
    endTime: String(row.end_time ?? ""),
    reason: row.reason ? String(row.reason) : undefined,
  };
}

export class GoogleSheetsAdapter implements DatabaseAdapter {
  async getSports(): Promise<Sport[]> {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle["sports"];
    if (!sheet) return [];

    const rows = await sheet.getRows();
    return rows.map((row) => rowToSport(row.toObject())).filter((s) => s.isActive);
  }

  async getVenues(): Promise<Venue[]> {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle["venues"];
    if (!sheet) return [];

    const rows = await sheet.getRows();
    return rows.map((row) => rowToVenue(row.toObject())).filter((v) => v.isActive);
  }

  async getCourts(): Promise<Court[]> {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle["courts"];
    if (!sheet) return [];

    const rows = await sheet.getRows();
    return rows.map((row) => rowToCourt(row.toObject())).filter((c) => c.isActive);
  }

  async getBookings(): Promise<Booking[]> {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle["bookings"];
    if (!sheet) return [];

    const rows = await sheet.getRows();
    return rows.map((row) => rowToBooking(row.toObject()));
  }

  async getBookingsByCourtAndDate(courtId: string, date: string): Promise<Booking[]> {
    const bookings = await this.getBookings();
    const activeStatuses = ["pending", "waiting_payment", "paid", "confirmed"];

    return bookings.filter(
      (booking) =>
        booking.courtId === courtId &&
        booking.bookingDate === date &&
        activeStatuses.includes(booking.bookingStatus),
    );
  }

  async createBooking(input: CreateBookingInput): Promise<Booking> {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle["bookings"];
    if (!sheet) throw new Error("Bookings sheet not found");

    const now = new Date().toISOString();
    const bookingId = crypto.randomUUID();
    const bookingCode = `AB-${Date.now().toString(36).toUpperCase()}`;

    const booking: Booking = {
      id: bookingId,
      bookingCode,
      ...input,
      bookingStatus: "pending",
      paymentStatus: "unpaid",
      createdAt: now,
      updatedAt: now,
    };

    await sheet.addRow({
      id: booking.id,
      booking_code: booking.bookingCode,
      customer_name: booking.customerName,
      customer_phone: booking.customerPhone,
      customer_email: booking.customerEmail ?? "",
      venue_id: booking.venueId,
      court_id: booking.courtId,
      sport_id: booking.sportId,
      booking_date: booking.bookingDate,
      start_time: booking.startTime,
      end_time: booking.endTime,
      duration_minutes: booking.durationMinutes,
      total_price: booking.totalPrice,
      booking_status: booking.bookingStatus,
      payment_status: booking.paymentStatus,
      payment_proof_url: booking.paymentProofUrl ?? "",
      notes: booking.notes ?? "",
      created_at: booking.createdAt,
      updated_at: booking.updatedAt,
    });

    return booking;
  }

  async updateBookingStatus(id: string, status: Booking["bookingStatus"]): Promise<Booking> {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle["bookings"];
    if (!sheet) throw new Error("Bookings sheet not found");

    const rows = await sheet.getRows();
    const targetRow = rows.find((row) => row.get("id") === id);

    if (!targetRow) {
      throw new Error(`Booking with id ${id} not found`);
    }

    const now = new Date().toISOString();
    targetRow.set("booking_status", status);
    targetRow.set("updated_at", now);
    await targetRow.save();

    return rowToBooking(targetRow.toObject());
  }

  async getAllCourts(): Promise<Court[]> {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle["courts"];
    if (!sheet) return [];

    const rows = await sheet.getRows();
    return rows.map((row) => rowToCourt(row.toObject()));
  }

  async getCourtById(id: string): Promise<Court | null> {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle["courts"];
    if (!sheet) return null;

    const rows = await sheet.getRows();
    const row = rows.find((r) => r.get("id") === id);
    return row ? rowToCourt(row.toObject()) : null;
  }

  async updateCourt(id: string, input: UpdateCourtInput): Promise<Court> {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle["courts"];
    if (!sheet) throw new Error("Courts sheet not found");

    const rows = await sheet.getRows();
    const targetRow = rows.find((r) => r.get("id") === id);
    if (!targetRow) throw new Error(`Court with id ${id} not found`);

    if (input.name !== undefined) targetRow.set("name", input.name);
    if (input.slug !== undefined) targetRow.set("slug", input.slug);
    if (input.surfaceType !== undefined) targetRow.set("surface_type", input.surfaceType);
    if (input.indoorType !== undefined) targetRow.set("indoor_type", input.indoorType);
    if (input.capacity !== undefined) targetRow.set("capacity", input.capacity);
    if (input.basePrice !== undefined) targetRow.set("base_price", input.basePrice);
    if (input.isActive !== undefined) targetRow.set("is_active", String(input.isActive));

    await targetRow.save();
    return rowToCourt(targetRow.toObject());
  }

  async getBookingById(id: string): Promise<Booking | null> {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle["bookings"];
    if (!sheet) return null;

    const rows = await sheet.getRows();
    const row = rows.find((r) => r.get("id") === id);
    return row ? rowToBooking(row.toObject()) : null;
  }

  async getPricingRules(courtId: string): Promise<PricingRule[]> {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle["pricing_rules"];
    if (!sheet) return [];

    const rows = await sheet.getRows();
    return rows
      .map((row) => rowToPricingRule(row.toObject()))
      .filter((rule) => rule.courtId === courtId && rule.isActive);
  }

  async getAllPricingRules(): Promise<PricingRule[]> {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle["pricing_rules"];
    if (!sheet) return [];

    const rows = await sheet.getRows();
    return rows.map((row) => rowToPricingRule(row.toObject()));
  }

  async createPricingRule(input: CreatePricingRuleInput): Promise<PricingRule> {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle["pricing_rules"];
    if (!sheet) throw new Error("Pricing rules sheet not found");

    const rule: PricingRule = {
      id: `pr-${crypto.randomUUID().slice(0, 8)}`,
      ...input,
      isActive: input.isActive ?? true,
    };

    await sheet.addRow({
      id: rule.id,
      court_id: rule.courtId,
      day_type: rule.dayType,
      start_time: rule.startTime,
      end_time: rule.endTime,
      price_per_hour: rule.pricePerHour,
      priority: rule.priority,
      is_active: String(rule.isActive),
    });

    return rule;
  }

  async updatePricingRule(id: string, input: UpdatePricingRuleInput): Promise<PricingRule> {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle["pricing_rules"];
    if (!sheet) throw new Error("Pricing rules sheet not found");

    const rows = await sheet.getRows();
    const targetRow = rows.find((r) => r.get("id") === id);
    if (!targetRow) throw new Error(`Pricing rule with id ${id} not found`);

    if (input.dayType !== undefined) targetRow.set("day_type", input.dayType);
    if (input.startTime !== undefined) targetRow.set("start_time", input.startTime);
    if (input.endTime !== undefined) targetRow.set("end_time", input.endTime);
    if (input.pricePerHour !== undefined) targetRow.set("price_per_hour", input.pricePerHour);
    if (input.priority !== undefined) targetRow.set("priority", input.priority);
    if (input.isActive !== undefined) targetRow.set("is_active", String(input.isActive));

    await targetRow.save();
    return rowToPricingRule(targetRow.toObject());
  }

  async deletePricingRule(id: string): Promise<void> {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle["pricing_rules"];
    if (!sheet) throw new Error("Pricing rules sheet not found");

    const rows = await sheet.getRows();
    const targetRow = rows.find((r) => r.get("id") === id);
    if (!targetRow) throw new Error(`Pricing rule with id ${id} not found`);

    await targetRow.delete();
  }

  async getBlockedSlots(courtId: string, date: string): Promise<BlockedSlot[]> {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle["blocked_slots"];
    if (!sheet) return [];

    const rows = await sheet.getRows();
    return rows
      .map((row) => rowToBlockedSlot(row.toObject()))
      .filter((slot) => slot.courtId === courtId && slot.date === date);
  }

  async getAllBlockedSlots(): Promise<BlockedSlot[]> {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle["blocked_slots"];
    if (!sheet) return [];

    const rows = await sheet.getRows();
    return rows.map((row) => rowToBlockedSlot(row.toObject()));
  }

  async createBlockedSlot(input: CreateBlockedSlotInput): Promise<BlockedSlot> {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle["blocked_slots"];
    if (!sheet) throw new Error("Blocked slots sheet not found");

    const slot: BlockedSlot = {
      id: `bs-${crypto.randomUUID().slice(0, 8)}`,
      ...input,
    };

    await sheet.addRow({
      id: slot.id,
      court_id: slot.courtId,
      date: slot.date,
      start_time: slot.startTime,
      end_time: slot.endTime,
      reason: slot.reason ?? "",
    });

    return slot;
  }

  async deleteBlockedSlot(id: string): Promise<void> {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle["blocked_slots"];
    if (!sheet) throw new Error("Blocked slots sheet not found");

    const rows = await sheet.getRows();
    const targetRow = rows.find((r) => r.get("id") === id);
    if (!targetRow) throw new Error(`Blocked slot with id ${id} not found`);

    await targetRow.delete();
  }

  // ── Audit Log ──
  async getAuditLogs(targetId?: string): Promise<AuditLogEntry[]> {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle["audit_log"];
    if (!sheet) return [];

    const rows = await sheet.getRows();
    let entries = rows.map((row) => rowToAuditLog(row.toObject()));
    if (targetId) {
      entries = entries.filter((e) => e.targetId === targetId);
    }
    return entries;
  }

  async createAuditLog(
    entry: Omit<AuditLogEntry, "id" | "timestamp">,
  ): Promise<AuditLogEntry> {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle["audit_log"];
    if (!sheet) throw new Error("Audit log sheet not found");

    const now = new Date().toISOString();
    const logEntry: AuditLogEntry = {
      id: `al-${crypto.randomUUID().slice(0, 8)}`,
      timestamp: now,
      ...entry,
    };

    await sheet.addRow({
      id: logEntry.id,
      timestamp: logEntry.timestamp,
      action: logEntry.action,
      target_type: logEntry.targetType,
      target_id: logEntry.targetId,
      actor_type: logEntry.actorType,
      actor_id: logEntry.actorId ?? "",
      details: logEntry.details,
      previous_value: logEntry.previousValue ?? "",
      new_value: logEntry.newValue ?? "",
    });

    return logEntry;
  }

  // ── Payment Methods ──
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle["payment_methods"];
    if (!sheet) return [];

    const rows = await sheet.getRows();
    return rows.map((row) => {
      const obj = row.toObject();
      return {
        id: String(obj.id ?? ""),
        name: String(obj.name ?? ""),
        label: String(obj.label ?? obj.name ?? ""),
        type: String(obj.type ?? "bank_transfer") as PaymentMethod["type"],
        accountName: String(obj.account_name ?? ""),
        accountNumber: obj.account_number ? String(obj.account_number) : undefined,
        provider: String(obj.provider ?? ""),
        details: String(obj.details ?? ""),
        instructions: String(obj.instructions ?? ""),
        isActive: String(obj.is_active).toLowerCase() === "true",
      };
    });
  }

  async getActivePaymentMethods(): Promise<PaymentMethod[]> {
    const methods = await this.getPaymentMethods();
    return methods.filter((m) => m.isActive);
  }

  // ── Payment Proof ──
  async submitPaymentProof(bookingId: string, proofUrl: string): Promise<Booking> {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle["bookings"];
    if (!sheet) throw new Error("Bookings sheet not found");

    const rows = await sheet.getRows();
    const targetRow = rows.find((r) => r.get("id") === bookingId);
    if (!targetRow) throw new Error(`Booking with id ${bookingId} not found`);

    const now = new Date().toISOString();
    targetRow.set("payment_proof_url", proofUrl);
    targetRow.set("payment_status", "waiting_confirmation");
    targetRow.set("booking_status", "waiting_payment");
    targetRow.set("updated_at", now);
    await targetRow.save();

    return rowToBooking(targetRow.toObject());
  }

  async confirmPayment(bookingId: string, actorId?: string): Promise<Booking> {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle["bookings"];
    if (!sheet) throw new Error("Bookings sheet not found");

    const rows = await sheet.getRows();
    const targetRow = rows.find((r) => r.get("id") === bookingId);
    if (!targetRow) throw new Error(`Booking with id ${bookingId} not found`);

    const now = new Date().toISOString();
    targetRow.set("payment_status", "paid");
    targetRow.set("booking_status", "confirmed");
    targetRow.set("updated_at", now);
    await targetRow.save();

    return rowToBooking(targetRow.toObject());
  }

  async rejectPayment(bookingId: string, actorId?: string): Promise<Booking> {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle["bookings"];
    if (!sheet) throw new Error("Bookings sheet not found");

    const rows = await sheet.getRows();
    const targetRow = rows.find((r) => r.get("id") === bookingId);
    if (!targetRow) throw new Error(`Booking with id ${bookingId} not found`);

    const now = new Date().toISOString();
    targetRow.set("payment_status", "unpaid");
    targetRow.set("booking_status", "pending");
    targetRow.set("payment_proof_url", "");
    targetRow.set("updated_at", now);
    await targetRow.save();

    return rowToBooking(targetRow.toObject());
  }

  // ── Notifications ──
  async getNotificationLogs(bookingId?: string): Promise<NotificationLog[]> {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle["notification_logs"];
    if (!sheet) return [];

    const rows = await sheet.getRows();
    let logs = rows.map((row) => {
      const obj = row.toObject();
      return {
        id: String(obj.id ?? ""),
        type: String(obj.type ?? "") as NotificationLog["type"],
        channel: String(obj.channel ?? "email") as NotificationLog["channel"],
        recipient: String(obj.recipient ?? ""),
        subject: obj.subject ? String(obj.subject) : undefined,
        message: String(obj.message ?? ""),
        status: String(obj.status ?? "pending") as NotificationLog["status"],
        bookingId: obj.booking_id ? String(obj.booking_id) : undefined,
        bookingCode: obj.booking_code ? String(obj.booking_code) : undefined,
        errorMessage: obj.error_message ? String(obj.error_message) : undefined,
        sentAt: obj.sent_at ? String(obj.sent_at) : undefined,
        createdAt: String(obj.created_at ?? ""),
        readAt: obj.read_at ? String(obj.read_at) : undefined,
      } satisfies NotificationLog;
    });

    if (bookingId) {
      logs = logs.filter((l) => l.bookingId === bookingId);
    }
    return logs;
  }

  async createNotificationLog(
    payload: NotificationPayload,
    status: NotificationLog["status"],
    errorMessage?: string,
  ): Promise<NotificationLog> {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle["notification_logs"];
    if (!sheet) throw new Error("Notification logs sheet not found");

    const now = new Date().toISOString();
    const log: NotificationLog = {
      id: `notif-${crypto.randomUUID().slice(0, 8)}`,
      type: payload.type,
      channel: payload.channel,
      recipient: payload.recipient,
      subject: payload.subject,
      message: payload.message,
      status,
      bookingId: payload.bookingId,
      bookingCode: payload.bookingCode,
      errorMessage,
      sentAt: status === "sent" ? now : undefined,
      createdAt: now,
    };

    await sheet.addRow({
      id: log.id,
      type: log.type,
      channel: log.channel,
      recipient: log.recipient,
      subject: log.subject ?? "",
      message: log.message,
      status: log.status,
      booking_id: log.bookingId ?? "",
      booking_code: log.bookingCode ?? "",
      error_message: log.errorMessage ?? "",
      sent_at: log.sentAt ?? "",
      created_at: log.createdAt,
      read_at: log.readAt ?? "",
    });

    return log;
  }

  async markNotificationRead(id: string): Promise<NotificationLog> {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle["notification_logs"];
    if (!sheet) throw new Error("Notification logs sheet not found");

    const rows = await sheet.getRows();
    const targetRow = rows.find((r) => r.get("id") === id);
    if (!targetRow) throw new Error(`Notification with id ${id} not found`);

    const now = new Date().toISOString();
    targetRow.set("status", "read");
    targetRow.set("read_at", now);
    await targetRow.save();

    const obj = targetRow.toObject();
    return {
      id: String(obj.id ?? ""),
      type: String(obj.type ?? "") as NotificationLog["type"],
      channel: String(obj.channel ?? "email") as NotificationLog["channel"],
      recipient: String(obj.recipient ?? ""),
      subject: obj.subject ? String(obj.subject) : undefined,
      message: String(obj.message ?? ""),
      status: "read",
      bookingId: obj.booking_id ? String(obj.booking_id) : undefined,
      bookingCode: obj.booking_code ? String(obj.booking_code) : undefined,
      errorMessage: obj.error_message ? String(obj.error_message) : undefined,
      sentAt: obj.sent_at ? String(obj.sent_at) : undefined,
      createdAt: String(obj.created_at ?? ""),
      readAt: now,
    };
  }
}
