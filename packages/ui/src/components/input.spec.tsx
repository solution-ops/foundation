import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "../../test/test-utils";
import { Input } from "./input";

describe("Input", () => {
  it("should allow user to enter text", () => {
    render(<Input placeholder="Enter text" />);

    const input = screen.getByPlaceholderText("Enter text");
    fireEvent.change(input, { target: { value: "Hello World" } });

    expect(input).toHaveValue("Hello World");
  });

  it("should call onChange when user types", () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} placeholder="Type here" />);

    const input = screen.getByPlaceholderText("Type here");
    fireEvent.change(input, { target: { value: "test value" } });

    expect(handleChange).toHaveBeenCalled();
  });

  it("should prevent user input when disabled", () => {
    const handleChange = vi.fn();
    render(<Input disabled onChange={handleChange} placeholder="Disabled input" />);

    const input = screen.getByPlaceholderText("Disabled input");
    expect(input).toBeDisabled();

    // Verify user cannot focus a disabled input
    fireEvent.focus(input);
    expect(input).not.toHaveFocus();

    // Verify the input has disabled styling/attributes
    expect(input).toHaveAttribute("disabled");
  });

  it("should support different input types for user interaction", () => {
    render(
      <div>
        <Input type="email" placeholder="Email" />
        <Input type="password" placeholder="Password" />
        <Input type="number" placeholder="Number" />
      </div>,
    );

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const numberInput = screen.getByPlaceholderText("Number");

    // User should be able to enter appropriate values
    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "secret123" } });
    fireEvent.change(numberInput, { target: { value: 42 } });

    expect(emailInput).toHaveValue("user@example.com");
    expect(passwordInput).toHaveValue("secret123");
    expect(numberInput).toHaveValue(42);
  });

  it("should respond to focus and blur interactions", () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    render(<Input onFocus={handleFocus} onBlur={handleBlur} placeholder="Focus test" />);

    const input = screen.getByPlaceholderText("Focus test");

    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalled();

    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalled();
  });
});
