import { test, expect, type Page } from "@playwright/test";

// ── Helpers ──────────────────────────────────────────────────────────────────

const SCREENSHOTS = "e2e/screenshots";
const SECRET = "5b08d37a8d376d3f97ec3972";

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `${SCREENSHOTS}/${name}.png`, fullPage: true });
}

async function loginCustomer(page: Page, email: string, password: string) {
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 15_000 });
  await page.waitForTimeout(1_000);
}

async function loginAdmin(page: Page, email: string, password: string) {
  await page.goto("/admin/login", { waitUntil: "networkidle" });
  await page.locator('input[name="admin-email"]').fill(email);
  await page.locator('input[name="admin-password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  // Admin login API returns dashboardUrl = /<SECRET>
  // Browser navigates to /<SECRET> → middleware rewrites to /admin
  await page.waitForURL(`**/${SECRET}**`, { timeout: 15_000 });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2_000);
}

async function loginOwner(page: Page, email: string, password: string) {
  await page.goto("/dashboard/login", { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL("**/dashboard", { timeout: 15_000 });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1_000);
}

// Navigate admin pages via sidebar links
async function adminNav(page: Page, path: string) {
  const link = page.locator(`a[href="/admin/${path}"]`).first();
  if (await link.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await link.click();
    await page.waitForLoadState("networkidle");
  } else {
    await page.goto(`/admin/${path}`, { waitUntil: "networkidle" });
  }
  await page.waitForTimeout(2_000);
}

// Navigate owner dashboard via sidebar links
async function ownerNav(page: Page, path: string) {
  const link = page.locator(`a[href="/dashboard/${path}"]`).first();
  if (await link.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await link.click();
    await page.waitForLoadState("networkidle");
  } else {
    await page.goto(`/dashboard/${path}`, { waitUntil: "networkidle" });
  }
  await page.waitForTimeout(1_500);
}

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC PAGES
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Public Pages", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
    await shot(page, "01-homepage");
  });

  test("booking page loads", async ({ page }) => {
    await page.goto("/booking");
    await expect(page.locator("body")).toBeVisible();
    await shot(page, "02-booking");
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await shot(page, "03-login");
  });

  test("register page loads", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await shot(page, "04-register");
  });

  test("venue search loads", async ({ page }) => {
    await page.goto("/cari");
    await expect(page.locator("body")).toBeVisible();
    await shot(page, "05-search");
  });

  test("/admin redirects to homepage", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL((url) => url.pathname === "/" || url.pathname.includes("/login"), { timeout: 10_000 });
    await shot(page, "05b-admin-redirect-blocked");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOMER FLOW
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Customer Flow", () => {
  const email = `e2e-${Date.now()}@test.com`;
  const password = "Test12345!";

  test("register new customer", async ({ page }) => {
    await page.goto("/register", { waitUntil: "networkidle" });
    await page.locator('input[type="text"]').first().fill("E2E Customer");
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="tel"]').fill("08123456789");
    const pwFields = page.locator('input[type="password"]');
    await pwFields.nth(0).fill(password);
    if ((await pwFields.count()) > 1) await pwFields.nth(1).fill(password);
    await shot(page, "06-register-filled");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL("**/login**", { timeout: 15_000 });
    await shot(page, "07-register-done");
  });

  test("login", async ({ page }) => {
    await loginCustomer(page, email, password);
    await shot(page, "08-customer-logged-in");
    expect(page.url()).toContain("/");
  });

  test("profile page", async ({ page }) => {
    await loginCustomer(page, email, password);
    await page.goto("/profile", { waitUntil: "networkidle" });
    await page.waitForTimeout(1_000);
    await shot(page, "09-customer-profile");
  });

  test("gamification page", async ({ page }) => {
    await loginCustomer(page, email, password);
    await page.goto("/profile/gamification", { waitUntil: "networkidle" });
    await page.waitForTimeout(1_000);
    await shot(page, "10-gamification");
  });

  test("referral page", async ({ page }) => {
    await loginCustomer(page, email, password);
    await page.goto("/profile/referral", { waitUntil: "networkidle" });
    await page.waitForTimeout(1_000);
    await shot(page, "11-referral");
  });

  test("booking form", async ({ page }) => {
    await loginCustomer(page, email, password);
    await page.goto("/booking/form", { waitUntil: "networkidle" });
    await page.waitForTimeout(1_000);
    await shot(page, "12-booking-form");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SUPER ADMIN FLOW (via secret path)
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Super Admin Flow", () => {
  test("login via admin/login", async ({ page }) => {
    await loginAdmin(page, "admin@lapangin.id", "Admin123!@#");
    await shot(page, "13-admin-logged-in");
    // Should be on /<SECRET> which middleware rewrites to /admin
    expect(page.url()).toContain(SECRET);
  });

  test("dashboard", async ({ page }) => {
    await loginAdmin(page, "admin@lapangin.id", "Admin123!@#");
    await shot(page, "14-admin-dashboard");
  });

  test("bookings management", async ({ page }) => {
    await loginAdmin(page, "admin@lapangin.id", "Admin123!@#");
    await adminNav(page, "bookings");
    await shot(page, "15-admin-bookings");
  });

  test("courts management", async ({ page }) => {
    await loginAdmin(page, "admin@lapangin.id", "Admin123!@#");
    await adminNav(page, "courts");
    await shot(page, "16-admin-courts");
  });

  test("pricing management", async ({ page }) => {
    await loginAdmin(page, "admin@lapangin.id", "Admin123!@#");
    await adminNav(page, "pricing");
    await shot(page, "17-admin-pricing");
  });

  test("SEO management", async ({ page }) => {
    await loginAdmin(page, "admin@lapangin.id", "Admin123!@#");
    await adminNav(page, "seo");
    await shot(page, "17b-admin-seo");
  });

  test("analytics", async ({ page }) => {
    await loginAdmin(page, "admin@lapangin.id", "Admin123!@#");
    await adminNav(page, "analytics");
    await shot(page, "18-admin-analytics");
  });

  test("customers", async ({ page }) => {
    await loginAdmin(page, "admin@lapangin.id", "Admin123!@#");
    await adminNav(page, "customers");
    await shot(page, "19-admin-customers");
  });

  test("owners management", async ({ page }) => {
    await loginAdmin(page, "admin@lapangin.id", "Admin123!@#");
    await adminNav(page, "owners");
    await shot(page, "19b-admin-owners");
  });

  test("settings", async ({ page }) => {
    await loginAdmin(page, "admin@lapangin.id", "Admin123!@#");
    await adminNav(page, "settings");
    await shot(page, "20-admin-settings");
  });

  test("notification bell", async ({ page }) => {
    await loginAdmin(page, "admin@lapangin.id", "Admin123!@#");
    const buttons = page.locator("header button, [data-testid='notification-bell']");
    const count = await buttons.count();
    if (count > 0) {
      await buttons.last().click();
      await page.waitForTimeout(1_500);
    }
    await shot(page, "21-admin-notification-bell");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// OWNER FLOW (via /dashboard)
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Owner Flow", () => {
  test("login via /dashboard/login", async ({ page }) => {
    await loginOwner(page, "owner@lapangin.id", "Owner123!@#");
    await shot(page, "22-owner-dashboard");
    expect(page.url()).toContain("/dashboard");
  });

  test("owner dashboard stats", async ({ page }) => {
    await loginOwner(page, "owner@lapangin.id", "Owner123!@#");
    await page.waitForTimeout(1_000);
    await shot(page, "22b-owner-stats");
  });

  test("owner bookings page", async ({ page }) => {
    await loginOwner(page, "owner@lapangin.id", "Owner123!@#");
    await page.goto("/dashboard/bookings", { waitUntil: "networkidle" });
    await page.waitForTimeout(1_000);
    await shot(page, "23-owner-bookings");
  });

  test("owner courts page", async ({ page }) => {
    await loginOwner(page, "owner@lapangin.id", "Owner123!@#");
    await page.goto("/dashboard/courts", { waitUntil: "networkidle" });
    await page.waitForTimeout(1_000);
    await shot(page, "24-owner-courts");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RESPONSIVE (mobile viewport)
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Mobile Responsive", () => {
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone 13

  test("homepage mobile", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
    await shot(page, "25-mobile-homepage");
  });

  test("login mobile", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await shot(page, "26-mobile-login");
  });

  test("admin dashboard mobile", async ({ page }) => {
    await loginAdmin(page, "admin@lapangin.id", "Admin123!@#");
    await shot(page, "27-mobile-admin-dashboard");
  });

  test("owner dashboard mobile", async ({ page }) => {
    await loginOwner(page, "owner@lapangin.id", "Owner123!@#");
    await shot(page, "27b-mobile-owner-dashboard");
  });
});
