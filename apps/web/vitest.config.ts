import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["**/*.{test,spec}.{ts,tsx,js,jsx}"],
    setupFiles: ["./test/setup.ts"],
  },
  resolve: {
    alias: {
      "@/*": resolve(__dirname, "./src/*"),
    },
  },
});
