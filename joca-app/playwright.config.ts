import { defineConfig, devices } from "@playwright/test";

const port = process.env.PORT ?? "3000";
const baseURL = process.env.BASE_URL ?? `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command:
          "bunx cross-env EXPOSE_TESTING_API=1 STRIPE_WEBHOOK_SECRET=whsec_e2e bun run build:e2e && bunx cross-env EXPOSE_TESTING_API=1 STRIPE_WEBHOOK_SECRET=whsec_e2e bun run start",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
