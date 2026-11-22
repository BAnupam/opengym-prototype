import { test, expect } from "@playwright/test";

test.describe("Keyboard navigation", () => {
  test("Tab/Shift+Tab/Enter through navigation and routes", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 768, height: 900 },
    });
    const page = await context.newPage();

    await page.goto("/");

    // Tab through navigation links
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveText(/Daily Overview/);

    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveText(/Workouts/);

    // Navigate to /train via keyboard
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/today");
    await expect(page.getByRole("heading", { name: "Daily Overview" })).toBeVisible();

    // Tab back to navigation
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Shift+Tab to go back
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Shift+Tab");

    await context.close();
  });
});