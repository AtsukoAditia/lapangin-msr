import { SignJWT, jwtVerify } from "jose";
import type { AuthSession } from "@/lib/types/domain";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "lapangin-secret-key-change-in-production"
);

const ADMIN_TOKEN_NAME = "admin_token";
const CUSTOMER_TOKEN_NAME = "customer_token";
const TOKEN_EXPIRY = "24h";

export async function createToken(payload: Omit<AuthSession, "expiresAt">): Promise<string> {
  const session: AuthSession = {
    ...payload,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  return new SignJWT(session as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AuthSession;
  } catch {
    return null;
  }
}

export function getAdminTokenName(): string {
  return ADMIN_TOKEN_NAME;
}

export function getCustomerTokenName(): string {
  return CUSTOMER_TOKEN_NAME;
}

// Simple password hashing for demo (use bcrypt in production)
export function hashPassword(password: string): string {
  // Simple base64 encoding for demo - in production use bcrypt
  return Buffer.from(password).toString("base64");
}

export function verifyPassword(password: string, hash: string): boolean {
  return Buffer.from(password).toString("base64") === hash;
}

export { ADMIN_TOKEN_NAME, CUSTOMER_TOKEN_NAME };
