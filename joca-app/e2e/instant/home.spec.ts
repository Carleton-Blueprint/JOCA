import { test, expect } from "@playwright/test";
import { instant } from "@next/playwright";

const HOME_SHELL = '[data-testid="home-shell-heading"]';

test.describe("instant initial load: home", () => {
  test("home shell is served on hard navigation", async ({ page }) => {
    await instant(
      page,
      async () => {
        await page.goto("/");
        await expect(page.locator(HOME_SHELL)).toBeVisible();
      },
      { baseURL: "http://127.0.0.1:3000" },
    );
  });
});
