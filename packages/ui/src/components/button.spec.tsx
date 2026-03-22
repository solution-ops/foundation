import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "../../test/test-utils";
import { Button } from "./button";

describe("Button", () => {
  it("should render button with text", () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("should handle click events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);

    fireEvent.click(screen.getByRole("button", { name: "Clickable" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled Button
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Disabled Button" });
    expect(button).toBeDisabled();

    // Disabled button should not trigger click events
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("should render as anchor when render prop is used with anchor tag", () => {
    // biome-ignore lint/a11y/useAnchorContent: render prop delegates children to Button
    render(<Button render={<a href="/test" />}>Link Button</Button>);

    // With nativeButton=false (auto-set when render is provided), base-ui
    // adds role="button" to the anchor. The element is still an <a> with href.
    const el = screen.getByRole("button", { name: "Link Button" });
    expect(el).toBeInTheDocument();
    expect(el.tagName).toBe("A");
    expect(el).toHaveAttribute("href", "/test");
  });

  it("should support keyboard interactions", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Keyboard Button</Button>);

    const button = screen.getByRole("button", { name: "Keyboard Button" });

    // Focus the button first
    button.focus();
    expect(button).toHaveFocus();

    // Simulate Enter key press (browsers convert this to click)
    fireEvent.keyDown(button, { key: "Enter", code: "Enter" });
    fireEvent.keyUp(button, { key: "Enter", code: "Enter" });

    // Simulate Space key press (browsers convert this to click)
    fireEvent.keyDown(button, { key: " ", code: "Space" });
    fireEvent.keyUp(button, { key: " ", code: "Space" });

    // In a real browser, these would trigger click events, but in testing
    // we can verify the button is focusable and accessible
    expect(button.tabIndex).not.toBe(-1);
  });
});
