/**
 * Sleep utility - Promise-based timeout
 * @param ms Milliseconds to sleep (default: 2000)
 */
export function sleep(ms: number = 2000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
