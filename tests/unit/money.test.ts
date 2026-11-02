import { describe, it, expect } from 'vitest';
import { toMinorUnit, toMajorUnit, formatMoney } from '@/lib/money';

describe('Money Utilities', () => {
  it('converts major units to minor units (integers)', () => {
    expect(toMinorUnit(100)).toBe(10000);
    expect(toMinorUnit('250.50')).toBe(25050);
    expect(toMinorUnit(0)).toBe(0);
    expect(toMinorUnit(-10)).toBe(0);
  });

  it('converts minor units back to major units', () => {
    expect(toMajorUnit(10000)).toBe(100);
    expect(toMajorUnit(25050)).toBe(250.5);
    expect(toMajorUnit(0)).toBe(0);
  });

  it('formats minor units gracefully with currency codes', () => {
    const formattedInr = formatMoney(500000, 'INR');
    expect(formattedInr).toContain('5,000');

    const formattedUsd = formatMoney(120000, 'USD');
    expect(formattedUsd).toContain('1,200');
  });
});
