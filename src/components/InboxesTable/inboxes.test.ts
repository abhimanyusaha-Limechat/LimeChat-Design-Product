import { describe, expect, it } from 'vitest';
import {
  attentionText,
  availableAgents,
  canReauthorize,
  filterAgents,
  filterInboxes,
  initialsOf,
  sortValue,
  typeCounts,
  type InboxAgent,
  type InboxRowData,
} from './inboxes';

const agent = (id: string, name: string, email = `${id}@limechat.ai`): InboxAgent => ({ id, name, email, role: 'Editor' });

const row = (patch: Partial<InboxRowData>): InboxRowData => ({
  id: '36000',
  name: 'Nimbus Coffee Orders',
  type: 'whatsapp',
  identifier: '+91 98000 10000',
  metaId: 'N/A',
  createdOn: '05:18 AM, 06 April 2026',
  status: 'connected',
  members: [],
  ...patch,
});

const rows = [
  row({ id: '36000', name: 'Nimbus Coffee Orders', type: 'whatsapp' }),
  row({ id: '36421', name: 'Lantern Books', type: 'email' }),
  row({ id: '36842', name: 'Saffron House Bookings', type: 'whatsapp', status: 'needs-reauth' }),
];

describe('filterInboxes', () => {
  it('matches the channel identifier', () => {
    const withIds = [row({ id: '1', identifier: '+91 99999 12345' }), row({ id: '2', identifier: 'support@lantern.com' })];
    expect(filterInboxes(withIds, 'LANTERN.com', 'all').map((r) => r.id)).toEqual(['2']);
    expect(filterInboxes(withIds, '99999', 'all').map((r) => r.id)).toEqual(['1']);
  });

  it('matches by name, case-insensitively, or by id', () => {
    expect(filterInboxes(rows, 'LANTERN', 'all').map((r) => r.id)).toEqual(['36421']);
    expect(filterInboxes(rows, ' 3684 ', 'all').map((r) => r.id)).toEqual(['36842']);
  });

  it('combines search with the channel filter', () => {
    expect(filterInboxes(rows, '', 'whatsapp')).toHaveLength(2);
    expect(filterInboxes(rows, 'saffron', 'whatsapp')).toHaveLength(1);
    expect(filterInboxes(rows, 'saffron', 'email')).toHaveLength(0);
  });

  it('keeps everything with no search and all channels', () => {
    expect(filterInboxes(rows, '  ', 'all')).toEqual(rows);
  });
});

describe('typeCounts', () => {
  it('lists only the channels present, with counts', () => {
    expect(typeCounts(rows)).toEqual([
      { type: 'whatsapp', count: 2 },
      { type: 'email', count: 1 },
    ]);
  });
});

describe('status and row helpers', () => {
  it('offers reauthorize only when the connection has lapsed', () => {
    expect(rows.map(canReauthorize)).toEqual([false, false, true]);
    expect(canReauthorize(row({ status: 'incomplete' }))).toBe(false);
  });

  it('shows attention text only for inboxes that need it', () => {
    expect(attentionText(row({ status: 'connected' }))).toBeNull();
    expect(attentionText(row({ status: 'needs-reauth' }))).toBe('Needs reauthorization');
    expect(attentionText(row({ status: 'incomplete' }))).toBe('Setup incomplete');
  });

  it('sorts by name, type and member count', () => {
    expect(sortValue(row({}), 'name')).toBe('Nimbus Coffee Orders');
    expect(sortValue(row({ type: 'email' }), 'type')).toBe('Email');
    expect(sortValue(row({ members: [agent('a', 'A'), agent('b', 'B')] }), 'members')).toBe(2);
  });

  it('formats initials', () => {
    expect(initialsOf('aarav mehta kumar')).toBe('AM');
  });
});

describe('collaborator helpers', () => {
  const aarav = agent('c1', 'Aarav Mehta');
  const isha = agent('c2', 'Isha Kapoor', 'isha@example.com');
  const all = [aarav, isha];

  it('filters agents by name or email, ignoring case and spaces', () => {
    expect(filterAgents(all, ' AARAV ')).toEqual([aarav]);
    expect(filterAgents(all, 'example.com')).toEqual([isha]);
    expect(filterAgents(all, '')).toEqual(all);
    expect(filterAgents(all, 'zzz')).toEqual([]);
  });

  it('lists only agents not already on the inbox', () => {
    expect(availableAgents(all, row({ members: [aarav] }))).toEqual([isha]);
    expect(availableAgents(all, row({ members: all }))).toEqual([]);
  });
});
