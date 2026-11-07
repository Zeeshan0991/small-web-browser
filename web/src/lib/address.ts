/** Same rule as the server: trim and lowercase. The server stays the authority. */
export function normalizeAddress(input: string): string {
  return input.trim().toLowerCase();
}