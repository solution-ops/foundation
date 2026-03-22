import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode, type Ref } from "react";

import { cn } from "./cn";

interface SlotProps {
  children?: ReactNode;
  [key: string]: unknown;
}

/**
 * Minimal Slot component that merges parent props onto a single child element.
 * Replaces Radix UI's Slot for the `asChild` pattern.
 */
function Slot({ children, ...props }: SlotProps) {
  const child = Children.only(children);

  if (!isValidElement(child)) {
    return null;
  }

  const childProps = child.props as Record<string, unknown>;

  const composed: Record<string, unknown> = {};
  for (const key of new Set([...Object.keys(props), ...Object.keys(childProps)])) {
    if (key.startsWith("on") && (typeof props[key] === "function" || typeof childProps[key] === "function")) {
      composed[key] = composeHandlers(props[key], childProps[key]);
    }
  }

  const mergedRef = composeRefs(props.ref as Ref<unknown> | undefined, childProps.ref as Ref<unknown> | undefined);

  return cloneElement(child as ReactElement<Record<string, unknown>>, {
    ...props,
    ...childProps,
    ...composed,
    ref: mergedRef,
    className: cn(props.className as string, childProps.className as string),
    style: { ...(props.style ?? {}), ...((childProps.style as object) ?? {}) },
  });
}

function composeHandlers(parent: unknown, child: unknown): ((...args: Array<unknown>) => void) | undefined {
  if (!parent && !child) return undefined;
  return (...args: Array<unknown>) => {
    if (typeof child === "function") child(...args);
    if (typeof parent === "function") parent(...args);
  };
}

function composeRefs(...refs: Array<Ref<unknown> | undefined>): Ref<unknown> | undefined {
  const filtered = refs.filter(Boolean) as Array<Ref<unknown>>;
  if (filtered.length === 0) return undefined;
  if (filtered.length === 1) return filtered[0];
  return (node: unknown) => {
    for (const ref of filtered) {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref && typeof ref === "object") {
        (ref as { current: unknown }).current = node;
      }
    }
  };
}

export { Slot };
