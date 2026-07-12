/**
 * WhatsApp client — wraps wwebjs service API.
 *
 * Requires a running wwebjs service (see https://wwebjs.dev).
 * Set WWEBJS_API_URL and WWEBJS_API_KEY in .env.local.
 *
 * Falls back to wa.me URL generation when the service is unavailable.
 */

const API_URL = process.env.WWEBJS_API_URL || "";
const API_KEY = process.env.WWEBJS_API_KEY || "";

export interface WhatsAppResult {
  success: boolean;
  /** wa.me fallback URL when service is unavailable */
  fallbackUrl?: string;
  messageId?: string;
  error?: string;
}

interface WwebjsApiResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Check if the wwebjs service is configured and reachable.
 */
export async function isWhatsAppReady(): Promise<boolean> {
  if (!API_URL) return false;
  try {
    const res = await fetch(`${API_URL}/status`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    return data.ready === true;
  } catch {
    return false;
  }
}

/**
 * Send a WhatsApp message via the wwebjs service.
 *
 * @param phone - E.164 format (e.g. "6281234567890")
 * @param message - Plain text message body
 */
export async function sendMessage(
  phone: string,
  message: string,
): Promise<WhatsAppResult> {
  if (!API_URL) {
    return {
      success: false,
      fallbackUrl: buildFallbackUrl(phone, message),
      error: "WWEBJS_API_URL not configured",
    };
  }

  try {
    const res = await fetch(`${API_URL}/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ phone, message }),
      signal: AbortSignal.timeout(30000),
    });

    const data: WwebjsApiResponse = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        fallbackUrl: buildFallbackUrl(phone, message),
        error: data.error || `HTTP ${res.status}`,
      };
    }

    return { success: true, messageId: data.messageId };
  } catch (err) {
    return {
      success: false,
      fallbackUrl: buildFallbackUrl(phone, message),
      error: err instanceof Error ? err.message : "Connection failed",
    };
  }
}

/**
 * Format Indonesian phone number to E.164 (62xxx).
 */
export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/[^0-9+]/g, "");
  if (digits.startsWith("+62")) return digits.slice(1);
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  return digits;
}

/**
 * Build a wa.me fallback URL (opens WhatsApp app manually).
 */
function buildFallbackUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
