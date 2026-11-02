/**
 * Money utilities adhering to PRD Section 7.2
 * All currency amounts are stored as integers in minor units (paise/cents).
 */

export function toMinorUnit(major: number | string): number {
  const val = typeof major === 'string' ? parseFloat(major) : major;
  if (isNaN(val) || val <= 0) return 0;
  return Math.round(val * 100);
}

export function toMajorUnit(minor: number): number {
  if (!minor || minor <= 0) return 0;
  return minor / 100;
}

export function formatMoney(minor: number | null | undefined, currency = 'INR'): string {
  if (minor === null || minor === undefined || isNaN(minor)) return '';
  const major = minor / 100;

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(major);
  } catch {
    return `${currency} ${major.toLocaleString()}`;
  }
}
