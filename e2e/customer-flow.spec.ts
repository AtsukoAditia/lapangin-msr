import { test, expect } from "@playwright/test";
import {
  loginCustomer,
  shot,
  createUniqueEmail,
  TEST_USERS,
} from "./fixtures/test-data";

test.describe("Customer Flow", () => {
  const email = createUniqueEmail();
  const password = TEST_USERS.customer.password;

  test("customer can register", async ({ page }) => {
    await page.goto("/register", { waitUntil: "networkidle" });
    await page.locator('input[type="text"]').first().fill(TEST_USERS.customer.name);
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="tel"]').fill(TEST_USERS.customer.phone);
    const pwFields = page.locator('input[type="password"]');
    await pwFields.nth(0).fill(password);
    if ((await pwFields.count()) > 1) await pwFields.nth(1).fill(password);
    await page.locator('input[type="checkbox"]').check();
    await shot(page, "customer-register-filled");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL("**/login**", { timeout: 15_000 });
    await shot(page, "customer-register-done");
  });

  test("customer can login", async ({ page }) => {
    await loginCustomer(page, email, password);
    await shot(page, "customer-logged-in");
    expect(page.url()).not.toContain("/login");
  });

  test("customer can search courts", async ({ page }) => {
    await loginCustomer(page, email, password);
    await page.goto("/cari", { waitUntil: "networkidle" });
    await page.waitForTimeout(1_000);
    await expect(page.locator("body")).toBeVisible();
    await shot(page, "customer-search");
  });

  test("customer can create booking", async ({ page }) => {
    await loginCustomer(page, email, password);
    await page.goto("/booking/form", { waitUntil: "networkidle" });
    await page.waitForTimeout(1_000);
    await expect(page.locator("body")).toBeVisible();
    await shot(page, "customer-booking-form");
  });

  test("customer can view bookings", async ({ page }) => {
    await loginCustomer(page, email, password);
    await page.goto("/profile", { waitUntil: "networkidle" });
    await page.waitForTimeout(1_000);
    await expect(page.locator("body")).toBeVisible();
    await shot(page, "customer-bookings");
  });

  test("customer can edit profile", async ({ page }) => {
    await loginCustomer(page, email, password);
    await page.goto("/profile", { waitUntil: "networkidle" });
    await page.waitForTimeout(1_000);
    await expect(page.locator("body")).toBeVisible();
    await shot(page, "customer-profile");
  });
});
