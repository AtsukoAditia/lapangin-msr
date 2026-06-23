import { z } from "zod";

// ── Zod schema for booking creation ──
export const createBookingSchema = z.object({
  customerName: z.string().min(2, "Nama minimal 2 karakter").max(100),
  customerPhone: z.string().min(8, "Nomor HP minimal 8 digit").max(20),
  customerEmail: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  venueId: z.string().min(1, "Venue wajib dipilih"),
  courtId: z.string().min(1, "Lapangan wajib dipilih"),
  sportId: z.string().min(1, "Olahraga wajib dipilih"),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal: YYYY-MM-DD"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format jam: HH:MM"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format jam: HH:MM"),
  durationMinutes: z.number().min(30, "Durasi minimal 30 menit").max(480),
  notes: z.string().max(500).optional(),
});

export type CreateBookingSchema = z.infer<typeof createBookingSchema>;

// ── Lightweight validation helper (no zod dependency for API routes) ──
// Provides readable error messages without needing to catch zod parse errors.

export interface ValidationResult {
  success: boolean;
  errors?: string[];
}

/**
 * Validate booking input with clear error messages.
 * Used in API routes for server-side validation before calling service layer.
 */
export function validateBookingInput(input: {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  courtId: string;
  venueId: string;
  sportId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  notes?: string;
}): ValidationResult {
  const errors: string[] = [];

  // Customer info
  if (!input.customerName || input.customerName.trim().length < 2) {
    errors.push("Nama wajib diisi (minimal 2 karakter).");
  }
  if (!input.customerPhone || input.customerPhone.trim().length < 8) {
    errors.push("Nomor HP wajib diisi (minimal 8 digit).");
  }
  if (input.customerEmail && input.customerEmail.length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.customerEmail)) {
      errors.push("Format email tidak valid.");
    }
  }

  // Identifiers
  if (!input.courtId) {
    errors.push("Lapangan wajib dipilih.");
  }
  if (!input.venueId) {
    errors.push("Venue wajib dipilih.");
  }
  if (!input.sportId) {
    errors.push("Olahraga wajib dipilih.");
  }

  // Date & time
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!input.bookingDate || !dateRegex.test(input.bookingDate)) {
    errors.push("Format tanggal tidak valid (YYYY-MM-DD).");
  } else {
    // Check if date is not in the past
    const bookingDateObj = new Date(input.bookingDate + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bookingDateObj < today) {
      errors.push("Tanggal booking tidak boleh di masa lalu.");
    }
  }

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!input.startTime || !timeRegex.test(input.startTime)) {
    errors.push("Format jam mulai tidak valid (HH:MM).");
  }
  if (!input.endTime || !timeRegex.test(input.endTime)) {
    errors.push("Format jam selesai tidak valid (HH:MM).");
  }

  // Start < End check
  if (timeRegex.test(input.startTime) && timeRegex.test(input.endTime)) {
    const [sh, sm] = input.startTime.split(":").map(Number);
    const [eh, em] = input.endTime.split(":").map(Number);
    if (eh * 60 + em <= sh * 60 + sm) {
      errors.push("Jam selesai harus lebih besar dari jam mulai.");
    }
  }

  // Duration
  if (!input.durationMinutes || input.durationMinutes < 30) {
    errors.push("Durasi booking minimal 30 menit.");
  }
  if (input.durationMinutes % 30 !== 0) {
    errors.push("Durasi booking harus kelipatan 30 menit.");
  }

  // Notes length
  if (input.notes && input.notes.length > 500) {
    errors.push("Catatan maksimal 500 karakter.");
  }

  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}