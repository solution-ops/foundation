import { resolve } from "node:path";
import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";

config({ path: resolve(".env") });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const baseURL = process.env.BASE_URL || "http://localhost:8787";
const isDeployedEnvironment = process.env.BASE_URL && !process.env.BASE_URL.includes("localhost");

/** Browsers to run in CI — controlled by PLAYWRIGHT_BROWSERS env var (space-separated). */
const ciBrowsers = process.env.PLAYWRIGHT_BROWSERS?.split(/\s+/).filter(Boolean) ?? ["chromium", "firefox"];

export default defineConfig({
  testDir: "./src",
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Global teardown for cleanup */
  globalTeardown: "./src/global-teardown.ts",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    /* Take screenshots on failure for debugging */
    screenshot: "only-on-failure",
    /* Record video on retry for debugging */
    video: "retain-on-failure",
  },

  /* Configure projects for major browsers */
  projects: process.env.CI
    ? [
        // CI: run browsers specified by PLAYWRIGHT_BROWSERS (defaults to chromium + firefox)
        ...(ciBrowsers.includes("chromium")
          ? [
              {
                name: "chromium" as const,
                use: { ...devices["Desktop Chrome"] },
                testIgnore: /.*-mobile\.spec\.ts/,
              },
              {
                name: "mobile-chromium" as const,
                use: { ...devices["Pixel 7"] },
                testMatch: /.*-mobile\.spec\.ts/,
              },
            ]
          : []),
        ...(ciBrowsers.includes("firefox")
          ? [
              {
                name: "firefox" as const,
                use: { ...devices["Desktop Firefox"] },
                testIgnore: /.*-mobile\.spec\.ts/,
              },
            ]
          : []),
      ]
    : [
        // Desktop browsers
        {
          name: "chromium",
          use: { ...devices["Desktop Chrome"] },
          testIgnore: /.*-mobile\.spec\.ts/,
        },
        {
          name: "firefox",
          use: { ...devices["Desktop Firefox"] },
          testIgnore: /.*-mobile\.spec\.ts/,
        },
        {
          name: "webkit",
          use: { ...devices["Desktop Safari"] },
          testIgnore: /.*-mobile\.spec\.ts/,
        },
        // Mobile browsers
        {
          name: "mobile-chromium",
          use: { ...devices["Pixel 7"] },
          testMatch: /.*-mobile\.spec\.ts/,
        },
      ],

  /* Run your local dev server before starting the tests (only for local development) */
  ...(isDeployedEnvironment
    ? {}
    : {
        webServer: {
          command: "pnpm dev:workers",
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 120000, // 2 minutes
          cwd: "../../", // Run from the root of the monorepo
        },
      }),
});
