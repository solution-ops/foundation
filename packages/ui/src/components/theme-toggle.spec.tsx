import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "../../test/test-utils";
import { ThemeProvider } from "./theme-provider";
import { ThemeToggle } from "./theme-toggle";

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock the theme context
const mockSetTheme = vi.fn();
const mockUseTheme = {
  theme: "light" as const,
  setTheme: mockSetTheme,
};

vi.mock("../hooks/use-theme", () => ({
  useTheme: () => mockUseTheme,
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow user to toggle theme", () => {
    mockUseTheme.theme = "light";

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const button = screen.getByRole("button", { name: /toggle theme/i });
    fireEvent.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("should toggle from dark to light when user clicks", () => {
    mockUseTheme.theme = "dark";

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const button = screen.getByRole("button", { name: /toggle theme/i });
    fireEvent.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("should be accessible via keyboard", () => {
    mockUseTheme.theme = "light";

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const button = screen.getByRole("button", { name: /toggle theme/i });

    // Should be focusable for keyboard navigation
    button.focus();
    expect(button).toHaveFocus();

    // Verify button is accessible via keyboard (has proper tabIndex)
    expect(button.tabIndex).not.toBe(-1);

    // Verify it has accessible text (screen reader only)
    expect(screen.getByText("Toggle theme")).toBeInTheDocument();
  });

  it("should provide appropriate accessibility label", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });
});
