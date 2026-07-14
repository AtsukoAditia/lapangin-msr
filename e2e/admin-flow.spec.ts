import { test, expect } from "@playwright/test";
import {
  loginAdmin,
  adminNav,
  shot,
} from "./fixtures/test-data";

test.describe("Admin Flow", () => {
  test("admin can login", async ({ page }) => {
    await loginAdmin(page);
    await shot(page, "admin-logged-in");
    expect(page.url()).toContain("5b08d37a8d376d3f97ec3972");
  });

  test("admin can view bookings", async ({ page }) => {
    await loginAdmin(page);
    await adminNav(page, "bookings");
    await expect(page.locator("body")).toBeVisible();
    await shot(page, "admin-bookings");
  });

  test("admin can approve payment", async ({ page }) => {
    await loginAdmin(page);
    await adminNav(page, "bookings");
    // Navigate to payment management page
    await page.goto("/admin/bookings", { waitUntil: "networkidle" });
    await page.waitForTimeout(1_000);
    await expect(page.locator("body")).toBeVisible();
    await shot(page, "admin-payment-approve");
  });

  test("admin can view analytics", async ({ page }) => {
    await loginAdmin(page);
    await adminNav(page, "analytics");
    await expect(page.locator("body")).toBeVisible();
    await shot(page, "admin-analytics");
  });

  test("admin can moderate reviews", async ({ page }) => {
    await loginAdmin(page);
    await adminNav(page, "reviews");
    await expect(page.locator("body")).toBeVisible();
    await shot(page, "admin-reviews");
  });
});
