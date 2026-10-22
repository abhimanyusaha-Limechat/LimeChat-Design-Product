import { describe, expect, it } from 'vitest';
import { daysLeftLabel, daysUntil } from './BillingSettings';

describe('renewal countdown', () => {
  const today = new Date(2026, 9, 22, 18, 30);

  it('counts calendar days, ignoring time of day', () => {
    expect(daysUntil(new Date(2026, 10, 8), today)).toBe(17);
    expect(daysUntil(new Date(2026, 9, 23, 0, 1), today)).toBe(1);
  });

  it('never goes negative for a past date', () => {
    expect(daysUntil(new Date(1970, 0, 1), today)).toBe(0);
  });

  it('pluralises and says "Renews today" at zero', () => {
    expect(daysLeftLabel(new Date(2026, 9, 23), today)).toBe('1 day left');
    expect(daysLeftLabel(new Date(2026, 9, 25), today)).toBe('3 days left');
    expect(daysLeftLabel(new Date(2026, 9, 22), today)).toBe('Renews today');
  });
});
