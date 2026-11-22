import { test, expect } from "@playwright/test";

test.describe("Responsive navigation", () => {
  test("top navigation labels at 1440px", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();

    await page.goto("/");

    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();

    await expect(page.getByRole("link", { name: "Daily Overview" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Workouts" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Nutrition" })).toBeVisible();
    await expect(page.getByRole("link", { name: "AI Coach" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Seasons & Quests" })).toBeVisible();

    await context.close();
  });

  test("bottom navigation labels at 360px", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 360, height: 640 },
    });
    const page = await context.newPage();

    await page.goto("/");

    await expect(page.getByRole("navigation", { name: "Bottom navigation" })).toBeVisible();

    await expect(page.getByRole("link", { name: "Today" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Train" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Fuel" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Coach" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Grow" })).toBeVisible();

    await context.close();
  });
});