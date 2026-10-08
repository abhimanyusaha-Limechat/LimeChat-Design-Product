import { describe, expect, it } from 'vitest';
import { nextSort, sortRows, toNumber, toTimestamp } from './sort';

describe('table sort helpers', () => {
  it('cycles off → asc → desc → off, and restarts on a new column', () => {
    const asc = nextSort(null, 'name');
    expect(asc).toEqual({ key: 'name', dir: 'asc' });
    const desc = nextSort(asc, 'name');
    expect(desc).toEqual({ key: 'name', dir: 'desc' });
    expect(nextSort(desc, 'name')).toBeNull();
    expect(nextSort(desc, 'size')).toEqual({ key: 'size', dir: 'asc' });
  });

  it('sorts text naturally and keeps empty values last', () => {
    const rows = ['bot 10', '', 'Bot 2', 'alpha'];
    expect(sortRows(rows, (r) => r, 'asc')).toEqual(['alpha', 'Bot 2', 'bot 10', '']);
    expect(sortRows(rows, (r) => r, 'desc')).toEqual(['bot 10', 'Bot 2', 'alpha', '']);
  });

  it('sorts numbers numerically without mutating the input', () => {
    const rows = [100, 9, 25];
    expect(sortRows(rows, (r) => r, 'asc')).toEqual([9, 25, 100]);
    expect(rows).toEqual([100, 9, 25]);
  });

  it('parses formatted numbers and display dates', () => {
    expect(toNumber('$38,940')).toBe(38940);
    expect(toNumber('97.1%')).toBe(97.1);
    expect(toNumber('N/A')).toBeUndefined();
    expect(toTimestamp('01:45 AM, 07 October 2026')).toBe(new Date(2026, 9, 7, 1, 45).getTime());
    expect(toTimestamp('12:05 PM, 07 October 2026')).toBe(new Date(2026, 9, 7, 12, 5).getTime());
    expect(toTimestamp('03 August 2026')).toBe(new Date(2026, 7, 3).getTime());
    expect(toTimestamp('soon')).toBeUndefined();
  });
});
