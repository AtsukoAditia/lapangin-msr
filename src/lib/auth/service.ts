/**
 * Auth Service — backed by DatabaseAdapter (PostgreSQL or Mock)
 *
 * Admin accounts are seeded in the database.
 * Customer accounts persist in the database.
 *
 * Demo admin accounts:
 *   - admin@lapangin.id / Admin123!@# (Super Admin)
 *   - owner@lapangin.id / Owner123!@# (Owner/Venue Admin)
 */

import type { AdminUser, Customer, CustomerPublic } from "@/lib/types/domain";
import { hashPassword, verifyPassword } from "@/lib/auth/jwt";
import { getDatabaseAdapter } from "@/lib/adapters";

// ─── Admin Auth ──────────────────────────────────────────────────────────────

export async function authenticateAdmin(
  email: string,
  password: string
): Promise<AdminUser | null> {
  const adapter = getDatabaseAdapter();
  const admin = await adapter.authenticateAdmin(email, password);
  if (!admin) return null;
  if (!verifyPassword(password, admin.passwordHash)) return null;
  return admin;
}

export async function getAdminById(id: string): Promise<AdminUser | null> {
  const adapter = getDatabaseAdapter();
  return adapter.getAdminById(id);
}

export async function getAllAdmins(): Promise<AdminUser[]> {
  const adapter = getDatabaseAdapter();
  // If adapter has getAllAdmins, use it; otherwise fall back to getAdminById for known IDs
  if ("getAllAdmins" in adapter && typeof adapter.getAllAdmins === "function") {
    return (adapter as { getAllAdmins: () => Promise<AdminUser[]> }).getAllAdmins();
  }
  // Fallback: return seeded admins
  const knownIds = ["admin-1", "owner-1"];
  const admins: AdminUser[] = [];
  for (const id of knownIds) {
    const admin = await adapter.getAdminById(id);
    if (admin) admins.push(admin);
  }
  return admins;
}

// ─── Customer Auth ───────────────────────────────────────────────────────────

export async function registerCustomer(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<CustomerPublic> {
  const adapter = getDatabaseAdapter();
  // Check if email already exists
  const existing = await adapter.getCustomerByEmail(data.email);
  if (existing) throw new Error("Email sudah terdaftar");

  const passwordHash = hashPassword(data.password);
  return adapter.registerCustomer({
    name: data.name,
    email: data.email,
    phone: data.phone,
    passwordHash,
  });
}

export async function authenticateCustomer(
  email: string,
  password: string
): Promise<CustomerPublic | null> {
  const adapter = getDatabaseAdapter();
  // Get full customer with passwordHash for verification
  const customer = await adapter.getCustomerByEmail(email);
  if (!customer || !customer.isActive) return null;
  if (!verifyPassword(password, customer.passwordHash)) return null;

  // Update last login
  if ("updateCustomerLastLogin" in adapter && typeof adapter.updateCustomerLastLogin === "function") {
    await (adapter as { updateCustomerLastLogin: (id: string) => Promise<void> }).updateCustomerLastLogin(customer.id);
  }

  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    avatar: customer.avatar,
    loyaltyPoints: customer.loyaltyPoints,
    loyaltyTier: getLoyaltyTier(customer.loyaltyPoints),
    totalSpent: customer.totalSpent,
    memberSince: customer.memberSince,
  };
}

export async function getCustomerById(id: string): Promise<CustomerPublic | null> {
  const adapter = getDatabaseAdapter();
  return adapter.getCustomerById(id);
}

export async function getCustomerByEmail(email: string): Promise<Customer | null> {
  const adapter = getDatabaseAdapter();
  return adapter.getCustomerByEmail(email);
}

// ─── Loyalty Points ──────────────────────────────────────────────────────────

export async function addLoyaltyPoints(
  customerId: string,
  points: number,
  bookingId: string | undefined,
  description: string
): Promise<{ id: string; newBalance: number }> {
  const adapter = getDatabaseAdapter();
  const tx = await adapter.addLoyaltyPoints(customerId, points, bookingId, description, "earned");
  const customer = await adapter.getCustomerById(customerId);
  return { id: tx.id, newBalance: customer?.loyaltyPoints ?? 0 };
}

export async function getCustomerLoyaltyBalance(customerId: string): Promise<number> {
  const adapter = getDatabaseAdapter();
  const customer = await adapter.getCustomerById(customerId);
  return customer?.loyaltyPoints ?? 0;
}

export async function deductLoyaltyPoints(
  customerId: string,
  points: number,
  description: string
): Promise<{ id: string; newBalance: number }> {
  const adapter = getDatabaseAdapter();
  const customer = await adapter.getCustomerById(customerId);
  if (!customer) throw new Error("Customer not found");
  if (customer.loyaltyPoints < points) throw new Error("Poin tidak mencukupi");

  const tx = await adapter.addLoyaltyPoints(customerId, -points, undefined, description, "redeemed");
  const updated = await adapter.getCustomerById(customerId);
  return { id: tx.id, newBalance: updated?.loyaltyPoints ?? 0 };
}

// ─── Customer Management ─────────────────────────────────────────────────────

export async function getAllCustomers(): Promise<CustomerPublic[]> {
  const adapter = getDatabaseAdapter();
  if ("getAllCustomers" in adapter && typeof adapter.getAllCustomers === "function") {
    return (adapter as { getAllCustomers: () => Promise<CustomerPublic[]> }).getAllCustomers();
  }
  return [];
}

export async function getCustomerStats(): Promise<{
  totalCustomers: number;
  totalLoyaltyPointsIssued: number;
  tierBreakdown: Record<string, number>;
}> {
  const customers = await getAllCustomers();
  const tierBreakdown: Record<string, number> = { bronze: 0, silver: 0, gold: 0, platinum: 0 };

  for (const c of customers) {
    const tier = getLoyaltyTier(c.loyaltyPoints);
    tierBreakdown[tier] = (tierBreakdown[tier] || 0) + 1;
  }

  return {
    totalCustomers: customers.length,
    totalLoyaltyPointsIssued: customers.reduce((sum, c) => sum + c.loyaltyPoints, 0),
    tierBreakdown,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getLoyaltyTier(points: number): string {
  if (points >= 10000) return "platinum";
  if (points >= 5000) return "gold";
  if (points >= 2000) return "silver";
  return "bronze";
}
