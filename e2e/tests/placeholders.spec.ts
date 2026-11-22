import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Placeholder screens (SCR-2 through SCR-6)", () => {
  test("each placeholder heading and message at 768px", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 768, height: 900 },
    });
    const page = await context.newPage();

    const placeholders = [
      { path: "/today", heading: "Daily Overview" },
      { path: "/train", heading: "Workouts" },
      { path: "/fuel", heading: "Nutrition" },
      { path: "/coach", heading: "AI Coach" },
      { path: "/grow", heading: "Seasons & Quests" },
    ];

    for (const { path, heading } of placeholders) {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
      await expect(page.getByText("This part of your journal is on its way")).toBeVisible();
    }

    await context.close();
  });

  test("route reload: navigate to /fuel, reload, assert Nutrition placeholder reappears", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 768, height: 900 },
    });
    const page = await context.newPage();

    await page.goto("/fuel");
    await expect(page.getByRole("heading", { name: "Nutrition" })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("heading", { name: "Nutrition" })).toBeVisible();

    await context.close();
  });

  test("axe accessibility at multiple widths", async ({ browser }) => {
    const paths = ["/today", "/train", "/fuel", "/coach", "/grow"];

    for (const width of [360, 768, 1440] as const) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
      });
      const page = await context.newPage();

      for (const path of paths) {
        await page.goto(path);
        const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
        expect(accessibilityScanResults.violations).toEqual([]);
      }

      await context.close();
    }
  });
});