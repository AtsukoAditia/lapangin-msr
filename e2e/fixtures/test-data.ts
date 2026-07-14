import { type Page } from "@playwright/test";

// ── Shared Test Data ──

export const TEST_USERS = {
  admin: { email: "admin@lapangin.id", password: "Admin123!@#" },
  owner: { email: "owner@lapangin.id", password: "Owner123!@#" },
  customer: {
    email: `e2e-customer-${Date.now()}@test.com`,
    password: "Test12345!",
    name: "E2E Customer",
    phone: "08123456789",
  },
};

export const ADMIN_SECRET = "5b08d37a8d376d3f97ec3972";

export const TEST_VENUES = {
  slug: "test-venue",
  name: "Test Venue",
  sportSlug: "badminton",
  courtSlug: "court-1",
} as const;

// ── Auth Helpers ──

export async function loginCustomer(page: Page, email = TEST_USERS.customer.email, password = TEST_USERS.customer.password) {
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 15_000 });
  await page.waitForTimeout(1_000);
}

export async function loginAdmin(page: Page, email = TEST_USERS.admin.email, password = TEST_USERS.admin.password) {
  await page.goto("/admin/login", { waitUntil: "networkidle" });
  await page.locator('input[name="admin-email"]').fill(email);
  await page.locator('input[name="admin-password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(`**/${ADMIN_SECRET}**`, { timeout: 15_000 });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2_000);
}

export async function loginOwner(page: Page, email = TEST_USERS.owner.email, password = TEST_USERS.owner.password) {
  await page.goto("/dashboard/login", { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL("**/dashboard", { timeout: 15_000 });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1_000);
}

export async function adminNav(page: Page, path: string) {
  const link = page.locator(`a[href="/admin/${path}"]`).first();
  if (await link.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await link.click();
    await page.waitForLoadState("networkidle");
  } else {
    await page.goto(`/admin/${path}`, { waitUntil: "networkidle" });
  }
  await page.waitForTimeout(2_000);
}

export async function ownerNav(page: Page, path: string) {
  const link = page.locator(`a[href="/dashboard/${path}"]`).first();
  if (await link.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await link.click();
    await page.waitForLoadState("networkidle");
  } else {
    await page.goto(`/dashboard/${path}`, { waitUntil: "networkidle" });
  }
  await page.waitForTimeout(1_500);
}

// ── Generic Helpers ──

export async function shot(page: Page, name: string) {
  await page.screenshot({ path: `e2e/screenshots/${name}.png`, fullPage: true });
}

export function createUniqueEmail() {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.com`;
}
