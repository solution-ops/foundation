import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    passWithNoTests: true,
    environment: "jsdom",
    include: ["**/*.{test,spec}.{ts,tsx,js,jsx}"],
    setupFiles: ["./test/setup.ts"],
  },
});
