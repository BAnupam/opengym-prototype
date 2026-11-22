import { test, expect } from "@playwright/test";

test.describe("Layout", () => {
  test("no horizontal scroll at 360, 768, and 1440px across all routes", async ({ browser }) => {
    const paths = ["/", "/today", "/train", "/fuel", "/coach", "/grow", "/unknown-route"];

    for (const width of [360, 768, 1440] as const) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
      });
      const page = await context.newPage();

      for (const path of paths) {
        await page.goto(path);

        // Wait for page to load
        await page.waitForLoadState("networkidle");

        // Check for horizontal scroll
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // Allow 1px tolerance for rounding
      }

      await context.close();
    }
  });
});