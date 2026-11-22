import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Welcome screen (SCR-1)", () => {
  test("welcome content and persona names at multiple widths", async ({ browser }) => {
    for (const width of [360, 768, 1440] as const) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
      });
      const page = await context.newPage();

      await page.goto("/");

      await expect(page.getByRole("heading", { name: "OpenGym" })).toBeVisible();
      await expect(page.getByText("Your training journal")).toBeVisible();

      // Check all six personas
      await expect(page.getByText("Sage")).toBeVisible();
      await expect(page.getByText("Atlas")).toBeVisible();
      await expect(page.getByText("Nova")).toBeVisible();
      await expect(page.getByText("Dash")).toBeVisible();
      await expect(page.getByText("Cleo")).toBeVisible();
      await expect(page.getByText("Luna")).toBeVisible();

      // Inactive actions are present but not clickable
      await expect(page.getByText("Sign in with Google")).toBeVisible();
      await expect(page.getByText("Try the demo")).toBeVisible();

      await context.close();
    }
  });

  test("axe accessibility at multiple widths", async ({ browser }) => {
    for (const width of [360, 768, 1440] as const) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
      });
      const page = await context.newPage();

      await page.goto("/");

      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

      expect(accessibilityScanResults.violations).toEqual([]);

      await context.close();
    }
  });
});