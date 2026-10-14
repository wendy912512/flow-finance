/**
 * Money helpers. All amounts are whole New Taiwan dollars stored as integers,
 * so there is never any floating-point arithmetic on money.
 */

export type Sign = 'none' | 'auto' | 'always';

export interface FormatOptions {
  /** Prefix "NT$". Use for headline amounts only; lists omit it. */
  currency?: boolean;
  /**
   * 'none'   → no sign, absolute value (transfers, balances shown as magnitude)
   * 'auto'   → "−" for negatives only (default)
   * 'always' → "+" for positives and "−" for negatives (income / expense lists)
   */
  sign?: Sign;
}

/** U+2212 MINUS SIGN — typographically correct, same width as "+" in tabular figures. */
export const MINUS = '−';

const grouping = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export function assertWholeDollars(value: number): void {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`Amounts must be whole dollars (safe integers); received ${value}`);
  }
}

export function formatAmount(value: number, { currency = false, sign = 'auto' }: FormatOptions = {}): string {
  assertWholeDollars(value);
  const digits = grouping.format(Math.abs(value));
  let prefix = '';
  if (sign === 'always' && value > 0) prefix = '+';
  if (sign !== 'none' && value < 0) prefix = MINUS;
  return `${prefix}${currency ? 'NT$' : ''}${digits}`;
}

/** Parses user input such as "5,000" or "NT$ 1 200" into whole dollars. Returns null when empty or invalid. */
export function parseAmount(input: string): number | null {
  const cleaned = input.replace(/NT\$|,|\s/gi, '');
  if (cleaned === '') return null;
  if (!/^\d{1,12}$/.test(cleaned)) return null;
  return Number(cleaned);
}

/** Percentage for display: integers stay whole ("30%"), others get one decimal ("33.3%"). Floors so it never overstates progress. */
export function formatPercent(part: number, whole: number): string {
  if (whole <= 0) return '0%';
  const tenths = Math.floor((part * 1000) / whole);
  return tenths % 10 === 0 ? `${tenths / 10}%` : `${(tenths / 10).toFixed(1)}%`;
}
