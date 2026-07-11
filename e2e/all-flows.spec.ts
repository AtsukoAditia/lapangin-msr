import { test, expect, type Page } from "@playwright/test";

// ── Helpers ──────────────────────────────────────────────────────────────────

const SCREENSHOTS = "e2e/screenshots";

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `${SCREENSHOTS}/${name}.png`, fullPage: true });
}

async function loginCustomer(page: Page, email: string, password: string) {
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  // Customer login redirects to "/" via router.push
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 15_000 });
  await page.waitForTimeout(1_000);
}

async function loginAdmin(page: Page, email: string, password: string) {
  await page.goto("/admin/login", { waitUntil: "networkidle" });
  await page.locator('input[name="admin-email"]').fill(email);
  await page.locator('input[name="admin-password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  // Admin login uses window.location.href = "/admin" → full reload
  // Wait for navigation to complete
  await page.waitForURL("**/admin", { timeout: 15_000 });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2_000);
}

// Navigate admin pages via sidebar links (avoids extra page.goto issues)
async function adminNav(page: Page, label: string, path: string) {
  const link = page.locator(`a[href="/admin/${path}"]`).first();
  if (await link.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await link.click();
    await page.waitForLoadState("networkidle");
  } else {
    await page.goto(`/admin/${path}`, { waitUntil: "networkidle" });
  }
  await page.waitForTimeout(2_000);
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
});

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOMER FLOW
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Customer Flow", () => {
  const email = `e2e-${Date.now()}@test.com`;
  const password = "Test12345!";

  test("register new customer", async ({ page }) => {
    await page.goto("/register", { waitUntil: "networkidle" });

    // Fill name (first text input)
    await page.locator('input[type="text"]').first().fill("E2E Customer");
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="tel"]').fill("08123456789");

    // Both password fields
    const pwFields = page.locator('input[type="password"]');
    await pwFields.nth(0).fill(password);
    if ((await pwFields.count()) > 1) {
      await pwFields.nth(1).fill(password);
    }

    await shot(page, "06-register-filled");
    await page.locator('button[type="submit"]').click();

    // Register redirects to /login
    await page.waitForURL("**/login**", { timeout: 15_000 });
    await shot(page, "07-register-done");
  });

  test("login", async ({ page }) => {
    await loginCustomer(page, email, password);
    await shot(page, "08-customer-logged-in");
    // Customer login redirects to "/"
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
// SUPER ADMIN FLOW
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Super Admin Flow", () => {
  test("login", async ({ page }) => {
    await loginAdmin(page, "admin@lapangin.id", "Admin123!@#");
    await shot(page, "13-admin-logged-in");
    expect(page.url()).toContain("/admin");
  });

  test("dashboard", async ({ page }) => {
    await loginAdmin(page, "admin@lapangin.id", "Admin123!@#");
    // Already on /admin after login
    await shot(page, "14-admin-dashboard");
  });

  test("bookings management", async ({ page }) => {
    await loginAdmin(page, "admin@lapangin.id", "Admin123!@#");
    await adminNav(page, "Bookings", "bookings");
    await shot(page, "15-admin-bookings");
  });

  test("courts management", async ({ page }) => {
    await loginAdmin(page, "admin@lapangin.id", "Admin123!@#");
    await adminNav(page, "Courts", "courts");
    await shot(page, "16-admin-courts");
  });

  test("pricing management", async ({ page }) => {
    await loginAdmin(page, "admin@lapangin.id", "Admin123!@#");
    await adminNav(page, "Pricing", "pricing");
    await shot(page, "17-admin-pricing");
  });

  test("analytics", async ({ page }) => {
    await loginAdmin(page, "admin@lapangin.id", "Admin123!@#");
    await adminNav(page, "Analytics", "analytics");
    await shot(page, "18-admin-analytics");
  });

  test("customers", async ({ page }) => {
    await loginAdmin(page, "admin@lapangin.id", "Admin123!@#");
    await adminNav(page, "Customers", "customers");
    await shot(page, "19-admin-customers");
  });

  test("settings", async ({ page }) => {
    await loginAdmin(page, "admin@lapangin.id", "Admin123!@#");
    await adminNav(page, "Settings", "settings");
    await shot(page, "20-admin-settings");
  });

  test("notification bell", async ({ page }) => {
    await loginAdmin(page, "admin@lapangin.id", "Admin123!@#");
    // Click the last button with SVG (notification bell is in header)
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
// OWNER FLOW
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Owner Flow", () => {
  test("login + dashboard", async ({ page }) => {
    await loginAdmin(page, "owner@lapangin.id", "Owner123!@#");
    await shot(page, "22-owner-dashboard");
    expect(page.url()).toContain("/admin");
  });

  test("owner bookings", async ({ page }) => {
    await loginAdmin(page, "owner@lapangin.id", "Owner123!@#");
    await adminNav(page, "Bookings", "bookings");
    await shot(page, "23-owner-bookings");
  });

  test("owner courts", async ({ page }) => {
    await loginAdmin(page, "owner@lapangin.id", "Owner123!@#");
    await adminNav(page, "Courts", "courts");
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
});
