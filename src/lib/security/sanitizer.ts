/**
 * Security utilities for input sanitization
 */

// Strip HTML tags to prevent XSS
export function sanitizeHTML(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

// Sanitize string for SQL (extra layer, adapter should use parameterized queries)
export function sanitizeString(input: string): string {
  return input
    .replace(/['";\\]/g, "")
    .replace(/--/g, "")
    .replace(/\/\*/g, "")
    .replace(/\*\//g, "")
    .trim();
}

// Validate email format
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate phone format (Indonesian)
export function isValidPhone(phone: string): boolean {
  return /^(\+62|62|0)[0-9]{9,13}$/.test(phone.replace(/[\s-]/g, ""));
}

// Sanitize booking input
export function sanitizeBookingInput(body: Record<string, unknown>) {
  return {
    customerName: sanitizeHTML(String(body.customerName || "").trim()).slice(0, 100),
    customerPhone: String(body.customerPhone || "").replace(/[^0-9+\s-]/g, "").slice(0, 20),
    customerEmail: sanitizeHTML(String(body.customerEmail || "").trim().toLowerCase()).slice(0, 200),
    courtId: sanitizeString(String(body.courtId || "")).slice(0, 50),
    venueId: sanitizeString(String(body.venueId || "")).slice(0, 50),
    sportId: sanitizeString(String(body.sportId || "")).slice(0, 50),
    bookingDate: String(body.bookingDate || "").replace(/[^0-9-]/g, "").slice(0, 10),
    startTime: String(body.startTime || "").replace(/[^0-9:]/g, "").slice(0, 5),
    endTime: String(body.endTime || "").replace(/[^0-9:]/g, "").slice(0, 5),
    durationMinutes: Math.min(Math.max(Number(body.durationMinutes) || 60, 30), 480),
    notes: sanitizeHTML(String(body.notes || "").trim()).slice(0, 500),
  };
}
