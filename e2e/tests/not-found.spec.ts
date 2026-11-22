import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Not-found screen (SCR-7)", () => {
  test("renders for unknown routes and start link navigates to /", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 768, height: 900 },
    });
    const page = await context.newPage();

    await page.goto("/unknown-route");

    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    await expect(page.getByText("The page you are looking for does not exist.")).toBeVisible();

    const startLink = page.getByRole("link", { name: "Go to the start page" });
    await expect(startLink).toBeVisible();
    await startLink.click();

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "OpenGym" })).toBeVisible();

    await context.close();
  });

  test("start link is keyboard operable", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 768, height: 900 },
    });
    const page = await context.newPage();

    await page.goto("/unknown-route");

    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();

    const startLink = page.getByRole("link", { name: "Go to the start page" });
    await startLink.focus();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL("/");

    await context.close();
  });

  test("axe accessibility at multiple widths", async ({ browser }) => {
    for (const width of [360, 768, 1440] as const) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
      });
      const page = await context.newPage();

      await page.goto("/unknown-route");

      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      expect(accessibilityScanResults.violations).toEqual([]);

      await context.close();
    }
  });
});