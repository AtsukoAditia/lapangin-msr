import { SignJWT, jwtVerify } from "jose";
import type { AuthSession } from "@/lib/types/domain";
import {
  hashPassword as bcryptHashPassword,
  verifyPassword as bcryptVerifyPassword,
} from "./password";

const ADMIN_TOKEN_NAME = "admin_auth_token";
const CUSTOMER_TOKEN_NAME = "customer_token";
const TOKEN_EXPIRY = "24h";

function getJwtKey(): Uint8Array {
  const value = process.env.JWT_SECRET || "lapangin-secret-key-change-in-production";
  return new TextEncoder().encode(value);
}

export async function createToken(
  payload: Omit<AuthSession, "expiresAt">,
): Promise<string> {
  const session: AuthSession = {
    ...payload,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  return new SignJWT(session as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getJwtKey());
}

export async function verifyToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtKey());
    const session = payload as unknown as AuthSession;

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      return null;
    }

    return session;
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

export function hashPassword(password: string): string {
  return bcryptHashPassword(password);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcryptVerifyPassword(password, hash);
}

export { ADMIN_TOKEN_NAME, CUSTOMER_TOKEN_NAME };
