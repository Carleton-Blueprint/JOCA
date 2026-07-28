import { test, expect } from "@playwright/test";
import { instant } from "@next/playwright";

const EVENTS_SHELL = '[data-testid="events-shell-heading"]';
const EVENTS_CONTENT = '[data-testid="events-content"]';

test.describe("instant nav: home -> events", () => {
  test("events shell commits on client navigation", async ({ page }) => {
    await page.goto("/");
    const trigger = page
      .getByRole("banner")
      .getByRole("link", { name: "Events", exact: true });
    await expect(trigger).toBeVisible();

    await instant(page, async () => {
      await trigger.click();
      await expect(page.locator(EVENTS_SHELL)).toBeVisible();
    });

    await expect(page.locator(EVENTS_CONTENT)).toBeVisible();
  });
});

test.describe("instant initial load: events", () => {
  test("events shell is served on hard navigation", async ({ page }) => {
    await instant(
      page,
      async () => {
        await page.goto("/events");
        await expect(page.locator(EVENTS_SHELL)).toBeVisible();
      },
      { baseURL: "http://127.0.0.1:3000" },
    );
  });
});
