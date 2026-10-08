/** Pure helpers behind `useTableSort` — kept apart so they can be unit-tested. */

export type SortDir = 'asc' | 'desc';
export type SortValue = string | number | undefined;

/** Header click cycles: off → asc → desc → off. */
export function nextSort<K extends string>(
  current: { key: K; dir: SortDir } | null,
  key: K,
): { key: K; dir: SortDir } | null {
  if (current?.key !== key) return { key, dir: 'asc' };
  return current.dir === 'asc' ? { key, dir: 'desc' } : null;
}

/** Numbers compare numerically; text compares case-insensitively with digit runs as numbers ("Bot 2" < "Bot 10"). Empty values sort last in both directions. */
export function sortRows<T>(rows: T[], getValue: (row: T) => SortValue, dir: SortDir): T[] {
  const sign = dir === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = getValue(a);
    const bv = getValue(b);
    const aEmpty = av === undefined || av === '';
    const bEmpty = bv === undefined || bv === '';
    if (aEmpty || bEmpty) return aEmpty === bEmpty ? 0 : aEmpty ? 1 : -1;
    if (typeof av === 'number' && typeof bv === 'number') return sign * (av - bv);
    return sign * String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: 'base' });
  });
}

/** Just the digits, e.g. "+91-98201 44312" → "919820144312". */
export const digitsOf = (raw: string) => raw.replace(/\D/g, '');

/** Number out of a formatted string like "$38,940", "97.1%" or "1,284"; undefined when there is none. */
export function toNumber(raw: string): number | undefined {
  const cleaned = raw.replace(/[^0-9.-]/g, '');
  if (cleaned === '') return undefined;
  const num = Number(cleaned);
  return Number.isNaN(num) ? undefined : num;
}

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

/** Timestamp for the product's display dates — "05:18 AM, 06 April 2026" or "03 August 2026". */
export function toTimestamp(raw: string): number | undefined {
  const m = /^(?:(\d{1,2}):(\d{2}) (AM|PM), )?(\d{1,2}) ([A-Za-z]+) (\d{4})$/.exec(raw.trim());
  if (!m) return undefined;
  const [, hh, mm, ampm, day, monthName, year] = m;
  const month = MONTHS.indexOf(monthName.toLowerCase());
  if (month === -1) return undefined;
  const hours = hh ? (Number(hh) % 12) + (ampm === 'PM' ? 12 : 0) : 0;
  return new Date(Number(year), month, Number(day), hours, Number(mm ?? 0)).getTime();
}
