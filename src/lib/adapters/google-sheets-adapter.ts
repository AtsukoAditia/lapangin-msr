import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import type { DatabaseAdapter, CreateBookingInput } from "./database-adapter";
import type { Booking, BlockedSlot, Court, PricingRule, Sport, Venue } from "@/lib/types/domain";

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

  async getPricingRules(courtId: string): Promise<PricingRule[]> {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle["pricing_rules"];
    if (!sheet) return [];

    const rows = await sheet.getRows();
    return rows
      .map((row) => rowToPricingRule(row.toObject()))
      .filter((rule) => rule.courtId === courtId && rule.isActive);
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
}