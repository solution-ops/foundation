/**
 *
 * @param hours
 * @returns the greeting
 * @example
 * ```typescript
 * getGreetingTime(new Date().getHours()) // 'morning' | 'afternoon' | 'evening'
 * ```
 */
export function getGreetingTime(hours: number = new Date().getHours()) {
  if (hours < 12) return "morning";
  if (hours < 18) return "afternoon";
  return "evening";
}
