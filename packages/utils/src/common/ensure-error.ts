export function ensureError(value: unknown): Error {
  if (value instanceof Error) return value;

  // Check if it's an H3Error and handle accordingly
  if (isH3Error(value)) {
    // You can optionally enhance the error message with H3-specific details
    console.error("H3Error was thrown: ", value);
    const message = `[${value.statusMessage}] ${value.message || value.statusMessage}`;
    return Object.assign(new Error(message), { cause: value });
  }

  console.info("Value was thrown as is, not through an Error: ", value);

  let stringified = "[Unable to stringify the thrown value]";
  try {
    stringified = JSON.stringify(value);
  } catch {
    /* intentionally left empty */
  }

  const error = new Error(`This value was thrown as is, not through an Error: ${stringified}`);
  return error;
}
// Error handling
type H3Error<T = unknown> = Error & {
  statusCode: number;
  statusMessage?: string;
  data?: T;
  fatal?: boolean;
  unhandled?: boolean;
  cause?: unknown;
};

function isH3Error(error: unknown): error is H3Error {
  return typeof (error as H3Error).statusCode === "number";
}
