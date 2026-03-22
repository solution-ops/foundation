/**
 * Custom error class that extracts the user-friendly message from
 * the API's structured JSON error response.
 *
 * API errors follow the shape:
 * ```json
 * { "status": 503, "message": "Service temporarily unavailable", "type": "DATABASE_ERROR", "timestamp": "..." }
 * ```
 *
 * When this class is thrown, `error.message` carries the server's
 * human-readable message instead of a hardcoded client string,
 * so the global MutationCache toast shows useful context.
 */
export class ApiError extends Error {
  status: number;
  type: string;

  constructor(status: number, message: string, type: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.type = type;
  }
}

/**
 * Throws an `ApiError` if the response is not OK.
 *
 * Attempts to parse the JSON error body for the server's message;
 * falls back to a generic message derived from the status code.
 */
export async function throwIfNotOk(res: Response, fallbackMessage: string): Promise<void> {
  if (res.ok) return;

  let message = fallbackMessage;
  let type = "UNKNOWN_ERROR";

  try {
    const body = await res.json();
    if (body.message) message = body.message;
    if (body.type) type = body.type;
  } catch {
    // Response body wasn't JSON — use fallback
  }

  throw new ApiError(res.status, message, type);
}
