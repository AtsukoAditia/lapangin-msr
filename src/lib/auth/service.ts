/**
 * Standalone Auth Service
 *
 * Works independently of the database adapter.
 * Uses in-memory stores for demo/development.
 * In production, this would be replaced by PostgreSQL/Supabase auth.
 *
 * Admin accounts (synced with PostgreSQL/Supabase/Spreadsheet):
 *   - admin@lapangin.id / Admin123!@# (Super Admin)
 *   - owner@lapangin.id / Owner123!@# (Owner/Venue Admin)
 */

import type { AdminUser, Customer, CustomerPublic } from "@/lib/types/domain";

// ─── In-Memory Stores ────────────────────────────────────────────────────────

interface StoredAdmin {
  id: string;
  username: string;
  name: string;
  email: string;
  password: string;
  role: "super_admin" | "admin" | "staff";
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface StoredCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  loyaltyPoints: number;
  totalSpent: number;
  memberSince: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

const adminStore: Map<string, StoredAdmin> = new Map();
const customerStore: Map<string, StoredCustomer> = new Map();

// ─── Seed Admin Accounts ─────────────────────────────────────────────────────

function seedAdmins() {
  if (adminStore.size > 0) return;

  const defaultAdmins: StoredAdmin[] = [
    {
      id: "admin-1",
      username: "superadmin",
      name: "Super Admin",
      email: "admin@lapangin.id",
      password: "Admin123!@#",
      role: "super_admin",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "owner-1",
      username: "venueowner",
      name: "Venue Owner",
      email: "owner@lapangin.id",
      password: "Owner123!@#",
      role: "admin",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];

  for (const admin of defaultAdmins) {
    adminStore.set(admin.email, admin);
  }
}

seedAdmins();

// ─── Admin Auth ──────────────────────────────────────────────────────────────

export async function authenticateAdmin(
  email: string,
  password: string
): Promise<AdminUser | null> {
  const admin = adminStore.get(email);
  if (!admin || !admin.isActive) return null;
  if (admin.password !== password) return null;

  admin.lastLoginAt = new Date().toISOString();

  return {
    id: admin.id,
    username: admin.username,
    name: admin.name,
    email: admin.email,
    passwordHash: "", // Not exposed
    role: admin.role,
    isActive: admin.isActive,
    createdAt: admin.createdAt,
    lastLoginAt: admin.lastLoginAt,
  };
}

export async function getAdminById(id: string): Promise<AdminUser | null> {
  for (const admin of adminStore.values()) {
    if (admin.id === id) {
      return {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        passwordHash: "",
        role: admin.role,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
        lastLoginAt: admin.lastLoginAt,
      };
    }
  }
  return null;
}

export async function getAllAdmins(): Promise<AdminUser[]> {
  return Array.from(adminStore.values()).map((admin) => ({
    id: admin.id,
    username: admin.username,
    name: admin.name,
    email: admin.email,
    passwordHash: "",
    role: admin.role,
    isActive: admin.isActive,
    createdAt: admin.createdAt,
    lastLoginAt: admin.lastLoginAt,
  }));
}

// ─── Customer Auth ───────────────────────────────────────────────────────────

export async function registerCustomer(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<CustomerPublic> {
  if (customerStore.has(data.email)) {
    throw new Error("Email sudah terdaftar");
  }

  const id = `cust-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();

  const customer: StoredCustomer = {
    id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    password: data.password,
    isVerified: false,
    isActive: true,
    loyaltyPoints: 0,
    totalSpent: 0,
    memberSince: now,
    createdAt: now,
    updatedAt: now,
  };

  customerStore.set(data.email, customer);

  return toCustomerPublic(customer);
}

export async function authenticateCustomer(
  email: string,
  password: string
): Promise<CustomerPublic | null> {
  const customer = customerStore.get(email);
  if (!customer || !customer.isActive) return null;
  if (customer.password !== password) return null;

  customer.lastLoginAt = new Date().toISOString();

  return toCustomerPublic(customer);
}

export async function getCustomerById(id: string): Promise<CustomerPublic | null> {
  for (const customer of customerStore.values()) {
    if (customer.id === id) {
      return toCustomerPublic(customer);
    }
  }
  return null;
}

export async function getCustomerByEmail(email: string): Promise<Customer | null> {
  const customer = customerStore.get(email);
  if (!customer) return null;
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    passwordHash: customer.password,
    avatar: customer.avatar,
    isVerified: customer.isVerified,
    isActive: customer.isActive,
    loyaltyPoints: customer.loyaltyPoints,
    totalSpent: customer.totalSpent,
    memberSince: customer.memberSince,
    lastLoginAt: customer.lastLoginAt,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  };
}

function toCustomerPublic(c: StoredCustomer): CustomerPublic {
  const tier = getLoyaltyTier(c.loyaltyPoints);
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    avatar: c.avatar,
    loyaltyPoints: c.loyaltyPoints,
    loyaltyTier: tier,
    totalSpent: c.totalSpent,
    memberSince: c.memberSince,
  };
}

function getLoyaltyTier(points: number): string {
  if (points >= 10000) return "platinum";
  if (points >= 5000) return "gold";
  if (points >= 2000) return "silver";
  return "bronze";
}

// ─── Loyalty Points ──────────────────────────────────────────────────────────

export async function addLoyaltyPoints(
  customerId: string,
  points: number,
  bookingId: string | undefined,
  description: string
): Promise<{ id: string; newBalance: number }> {
  for (const customer of customerStore.values()) {
    if (customer.id === customerId) {
      customer.loyaltyPoints += points;
      customer.updatedAt = new Date().toISOString();
      return {
        id: `loyalty-${Date.now()}`,
        newBalance: customer.loyaltyPoints,
      };
    }
  }
  throw new Error("Customer not found");
}

export async function getCustomerLoyaltyBalance(customerId: string): Promise<number> {
  for (const customer of customerStore.values()) {
    if (customer.id === customerId) {
      return customer.loyaltyPoints;
    }
  }
  return 0;
}

export async function deductLoyaltyPoints(
  customerId: string,
  points: number,
  description: string
): Promise<{ id: string; newBalance: number }> {
  for (const customer of customerStore.values()) {
    if (customer.id === customerId) {
      if (customer.loyaltyPoints < points) {
        throw new Error("Poin tidak mencukupi");
      }
      customer.loyaltyPoints -= points;
      customer.updatedAt = new Date().toISOString();
      return {
        id: `loyalty-${Date.now()}`,
        newBalance: customer.loyaltyPoints,
      };
    }
  }
  throw new Error("Customer not found");
}

// ─── Customer Management ─────────────────────────────────────────────────────

export async function getAllCustomers(): Promise<CustomerPublic[]> {
  return Array.from(customerStore.values()).map(toCustomerPublic);
}

export async function getCustomerStats(): Promise<{
  totalCustomers: number;
  totalLoyaltyPointsIssued: number;
  tierBreakdown: Record<string, number>;
}> {
  const customers = Array.from(customerStore.values());
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