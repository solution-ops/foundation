/**
 * Type-safe cookie name constants
 *
 * This file provides a centralized location for all cookie names used in the application.
 * Using a const object with 'as const' assertion provides type safety and autocompletion
 * while avoiding the limitations of TypeScript enums.
 */

/**
 * Cookie names used throughout the application
 */
export const COOKIE_NAMES = {
  SESSION: "session",
  EMAIL_VERIFICATION: "email_verification",
  AUTH: "auth",
} as const;

/**
 * Type representing all possible cookie names
 */
export type CookieName = (typeof COOKIE_NAMES)[keyof typeof COOKIE_NAMES];

/**
 * Type guard to check if a string is a valid cookie name
 *
 * @param name - String to check
 * @returns True if the string is a valid cookie name
 */
export function isValidCookieName(name: string): name is CookieName {
  return Object.values(COOKIE_NAMES).includes(name as CookieName);
}

/**
 * Default cookie options for consistent cookie behavior.
 * Accepts an `isProduction` flag to set the `secure` attribute
 * without reading `process.env` directly.
 */
export function getDefaultCookieOptions(isProduction: boolean) {
  return {
    httpOnly: true,
    path: "/",
    secure: isProduction,
    sameSite: "lax" as const,
  } as const;
}
