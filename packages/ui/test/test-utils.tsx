import type { RenderOptions } from "@testing-library/react";
import { cleanup, fireEvent, render as rtlRender, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import React from "react";
import { afterEach, vi } from "vitest";

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
});

/**
 * Custom render method that includes common wrappers and utilities
 * @param ui - The React component to render
 * @param options - Additional render options
 * @returns The rendered component with additional test utilities
 *
 * @example
 * const { user, ...result } = testRender(<Button>Click me</Button>);
 */
function render(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">): ReturnType<typeof rtlRender> {
  return {
    ...rtlRender(ui, {
      ...options,
    }),
  };
}

// Re-export everything focused on user interactions and behavior testing
export * from "@testing-library/react";
export { render, fireEvent, waitFor, React, vi, afterEach };
