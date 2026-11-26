import { describe, expect, it } from 'vitest';
import {
  DELETED_ITEM_TYPES,
  actorNames,
  deletedWithin,
  filterDeletedItems,
  formatDeletedDate,
  formatDeletedTime,
  initialsOf,
  toggleValue,
  type DeletedItem,
  type DeletedItemFilters,
} from './deletedItems';

const NOW = new Date(2026, 10, 25, 12, 0).getTime();
const DAY = 24 * 60 * 60 * 1000;

const item = (over: Partial<DeletedItem> & Pick<DeletedItem, 'id'>): DeletedItem => ({
  name: `Item ${over.id}`,
  type: 'flow',
  status: 'active',
  deletedBy: { kind: 'person', name: 'Jappan' },
  deletedAt: new Date(NOW - DAY).toISOString(),
  ...over,
});

const everything: DeletedItemFilters = { types: DELETED_ITEM_TYPES, deletedBy: [], statuses: [], search: '' };
const ids = (items: DeletedItem[]) => items.map((i) => i.id);

describe('deletedWithin', () => {
  const items = [
    item({ id: 'today', deletedAt: new Date(NOW - 60_000).toISOString() }),
    item({ id: 'week', deletedAt: new Date(NOW - 7 * DAY).toISOString() }),
    item({ id: 'older', deletedAt: new Date(NOW - 7 * DAY - 1).toISOString() }),
  ];

  it('keeps what was deleted in the range, up to and including its first moment', () => {
    expect(ids(deletedWithin(items, 7, NOW))).toEqual(['today', 'week']);
    expect(ids(deletedWithin(items, 30, NOW))).toEqual(['today', 'week', 'older']);
  });
});

describe('filterDeletedItems', () => {
  const items = [
    item({ id: 'flow', name: 'Track order status' }),
    item({ id: 'agent', name: 'Returns & Refunds', type: 'agent', status: 'inactive' }),
    item({ id: 'url', name: 'help.brandname.com/returns', type: 'kbm-url', deletedBy: { kind: 'api', name: 'API' } }),
    item({ id: 'draft', name: 'Diwali offer broadcast', status: 'draft' }),
  ];

  it('keeps every item when nothing is narrowed', () => {
    expect(ids(filterDeletedItems(items, everything))).toEqual(['flow', 'agent', 'url', 'draft']);
  });

  it('keeps only the ticked types, and nothing when no type is ticked', () => {
    expect(ids(filterDeletedItems(items, { ...everything, types: ['agent', 'kbm-url'] }))).toEqual(['agent', 'url']);
    expect(filterDeletedItems(items, { ...everything, types: [] })).toEqual([]);
  });

  it('narrows by who deleted and by status, together', () => {
    expect(ids(filterDeletedItems(items, { ...everything, deletedBy: ['API'] }))).toEqual(['url']);
    expect(ids(filterDeletedItems(items, { ...everything, statuses: ['inactive', 'draft'] }))).toEqual(['agent', 'draft']);
    expect(filterDeletedItems(items, { ...everything, deletedBy: ['API'], statuses: ['draft'] })).toEqual([]);
  });

  it('searches any part of the name, ignoring case and outer spaces', () => {
    expect(ids(filterDeletedItems(items, { ...everything, search: '  RETURNS ' }))).toEqual(['agent', 'url']);
    expect(ids(filterDeletedItems(items, { ...everything, search: 'offer' }))).toEqual(['draft']);
  });

  it('searches the name only, not who deleted the item or what type it is', () => {
    expect(filterDeletedItems(items, { ...everything, search: 'jappan' })).toEqual([]);
    expect(filterDeletedItems(items, { ...everything, search: 'agent' })).toEqual([]);
  });
});

describe('toggleValue', () => {
  it('adds and removes a value, keeping the order of the full list', () => {
    expect(toggleValue(['a', 'b', 'c'], ['c'], 'a')).toEqual(['a', 'c']);
    expect(toggleValue(['a', 'b', 'c'], ['a', 'c'], 'a')).toEqual(['c']);
  });
});

describe('actorNames', () => {
  it('lists each actor once: people first, then non-human actors, each alphabetically', () => {
    const items = [
      item({ id: '1', deletedBy: { kind: 'integration', name: 'Shopify Sync' } }),
      item({ id: '2', deletedBy: { kind: 'person', name: 'Priya' } }),
      item({ id: '3', deletedBy: { kind: 'api', name: 'API' } }),
      item({ id: '4', deletedBy: { kind: 'person', name: 'Atharv' } }),
      item({ id: '5', deletedBy: { kind: 'person', name: 'Priya' } }),
    ];
    expect(actorNames(items)).toEqual(['Atharv', 'Priya', 'API', 'Shopify Sync']);
  });
});

describe('formatting', () => {
  it('writes the date as day, short month and year', () => {
    expect(formatDeletedDate(new Date(2026, 10, 5, 9, 0).toISOString())).toBe('5 Nov 2026');
  });

  it('writes the time on a 12-hour clock', () => {
    expect(formatDeletedTime(new Date(2026, 10, 25, 15, 4).toISOString())).toBe('3:04 PM');
    expect(formatDeletedTime(new Date(2026, 10, 25, 0, 30).toISOString())).toBe('12:30 AM');
    expect(formatDeletedTime(new Date(2026, 10, 25, 12, 0).toISOString())).toBe('12:00 PM');
  });

  it('takes two letters for an avatar', () => {
    expect(initialsOf('Jappan')).toBe('JA');
    expect(initialsOf('Aarav  Mehta')).toBe('AM');
    expect(initialsOf('Mary Jane Watson')).toBe('MW');
    expect(initialsOf('  ')).toBe('');
  });
});
