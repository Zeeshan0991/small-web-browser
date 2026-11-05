// An address looks like "tidepool.zz": one label of letters, digits or
// hyphens, then ".zz". Nothing else is a valid address.
const ADDRESS_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.zz$/;

/** Make "  Tidepool.ZZ " and "tidepool.zz" the same thing. */
export function normalizeAddress(input: string): string {
  return (input ?? '').trim().toLowerCase();
}

export function isValidAddress(address: string): boolean {
  return ADDRESS_RE.test(address);
}