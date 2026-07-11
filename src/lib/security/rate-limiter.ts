import { RateLimiterMemory } from "rate-limiter-flexible";

// Login rate limiter — 5 attempts per 15 min per IP
export const loginLimiter = new RateLimiterMemory({
  points: 5,
  duration: 900, // 15 minutes
  keyPrefix: "login",
});

// API rate limiter — 100 requests per minute per IP
export const apiLimiter = new RateLimiterMemory({
  points: 100,
  duration: 60,
  keyPrefix: "api",
});

// Booking rate limiter — 10 per hour per IP
export const bookingLimiter = new RateLimiterMemory({
  points: 10,
  duration: 3600,
  keyPrefix: "booking",
});

export function getClientIP(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// Helper: check rate limit, returns null if OK, 429 response if exceeded
export async function checkRateLimit(
  limiter: RateLimiterMemory,
  key: string
): Promise<{ limited: true; retryAfter: number } | null> {
  try {
    const result = await limiter.consume(key);
    return null; // allowed
  } catch (rateLimiterRes) {
    const retryAfter = Math.ceil(
      (rateLimiterRes as { msBeforeNext: number }).msBeforeNext / 1000
    );
    return { limited: true, retryAfter };
  }
}
