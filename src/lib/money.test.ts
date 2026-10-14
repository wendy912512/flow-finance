import { describe, expect, it } from 'vitest';
import { MINUS, formatAmount, formatPercent, parseAmount } from './money';

describe('formatAmount', () => {
  it('groups thousands and drops decimals', () => {
    expect(formatAmount(150000)).toBe('150,000');
    expect(formatAmount(0)).toBe('0');
  });
  it('uses a real minus sign for negatives', () => {
    expect(formatAmount(-135)).toBe(`${MINUS}135`);
  });
  it('adds NT$ only when asked', () => {
    expect(formatAmount(92450, { currency: true })).toBe('NT$92,450');
  });
  it('signs income and expense in lists', () => {
    expect(formatAmount(32000, { sign: 'always' })).toBe('+32,000');
    expect(formatAmount(-200, { sign: 'always' })).toBe(`${MINUS}200`);
  });
  it('shows transfers without a sign', () => {
    expect(formatAmount(-5000, { sign: 'none' })).toBe('5,000');
  });
  it('rejects non-integer amounts', () => {
    expect(() => formatAmount(10.5)).toThrow(RangeError);
  });
});

describe('parseAmount', () => {
  it('reads formatted input', () => {
    expect(parseAmount('5,000')).toBe(5000);
    expect(parseAmount('NT$ 1 200')).toBe(1200);
  });
  it('returns null for empty or invalid input', () => {
    expect(parseAmount('')).toBeNull();
    expect(parseAmount('12.5')).toBeNull();
    expect(parseAmount('-3')).toBeNull();
  });
});

describe('formatPercent', () => {
  it('keeps whole numbers whole', () => {
    expect(formatPercent(45000, 150000)).toBe('30%');
  });
  it('floors to one decimal', () => {
    expect(formatPercent(50000, 150000)).toBe('33.3%');
  });
  it('handles a zero target', () => {
    expect(formatPercent(100, 0)).toBe('0%');
  });
});
