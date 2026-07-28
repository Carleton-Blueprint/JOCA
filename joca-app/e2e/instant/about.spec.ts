import { test, expect } from "@playwright/test";
import { instant } from "@next/playwright";

const ABOUT_SHELL = '[data-testid="about-shell-heading"]';

test.describe("instant nav: home -> about", () => {
  test("about shell commits on client navigation", async ({ page }) => {
    await page.goto("/");
    const trigger = page
      .getByRole("banner")
      .getByRole("link", { name: "About", exact: true });
    await expect(trigger).toBeVisible();

    await instant(page, async () => {
      await trigger.click();
      await expect(page.locator(ABOUT_SHELL)).toBeVisible();
    });
  });
});

test.describe("instant initial load: about", () => {
  test("about shell is served on hard navigation", async ({ page }) => {
    await instant(
      page,
      async () => {
        await page.goto("/about");
        await expect(page.locator(ABOUT_SHELL)).toBeVisible();
      },
      { baseURL: "http://127.0.0.1:3000" },
    );
  });
});
