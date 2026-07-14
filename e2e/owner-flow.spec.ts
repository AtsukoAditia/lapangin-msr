import { test, expect } from "@playwright/test";
import {
  loginOwner,
  ownerNav,
  shot,
} from "./fixtures/test-data";

test.describe("Owner Flow", () => {
  test("owner can login", async ({ page }) => {
    await loginOwner(page);
    await shot(page, "owner-logged-in");
    expect(page.url()).toContain("/dashboard");
  });

  test("owner can view venues", async ({ page }) => {
    await loginOwner(page);
    await page.goto("/dashboard/venues", { waitUntil: "networkidle" });
    await page.waitForTimeout(1_000);
    await expect(page.locator("body")).toBeVisible();
    await shot(page, "owner-venues");
  });

  test("owner can view analytics", async ({ page }) => {
    await loginOwner(page);
    await ownerNav(page, "analytics");
    await expect(page.locator("body")).toBeVisible();
    await shot(page, "owner-analytics");
  });

  test("owner can manage pricing", async ({ page }) => {
    await loginOwner(page);
    await ownerNav(page, "pricing");
    await expect(page.locator("body")).toBeVisible();
    await shot(page, "owner-pricing");
  });
});
