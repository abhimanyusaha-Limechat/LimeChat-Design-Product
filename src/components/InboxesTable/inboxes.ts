/** Inbox row model and the pure helpers behind InboxesTable — kept apart so they can be unit-tested. */
import type { SortValue } from '../DataTable';

export type InboxType = 'whatsapp' | 'email' | 'instagram' | 'sms' | 'facebook';

/** Demo only: there is no backend, so the status is part of the demo data. */
export type InboxStatus = 'connected' | 'needs-reauth' | 'incomplete';

/** An agent who can be a collaborator on inboxes (demo data). */
export interface InboxAgent {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface InboxRowData {
  id: string;
  name: string;
  type: InboxType;
  /** What an admin recognises the channel by: phone number, email address, @handle or page name (demo data). */
  identifier: string;
  /** Kept in the data but not shown in the list. "N/A" means the inbox has none. */
  metaId: string;
  /** Pre-formatted, e.g. "05:18 AM, 06 April 2026". Kept in the data but not shown in the list. */
  createdOn: string;
  status: InboxStatus;
  /** The agents who can use this inbox (demo). */
  members: InboxAgent[];
}

export const TYPE_LABEL: Record<InboxType, string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
  instagram: 'Instagram',
  sms: 'SMS',
  facebook: 'Facebook',
};

export const STATUS_LABEL: Record<InboxStatus, string> = {
  connected: 'Connected',
  'needs-reauth': 'Needs reauthorization',
  incomplete: 'Setup incomplete',
};

/** Only a connection that has lapsed can be reauthorized. */
export const canReauthorize = (row: InboxRowData) => row.status === 'needs-reauth';

/** Short text shown under the name when the inbox needs attention; connected inboxes have none. */
export const attentionText = (row: InboxRowData) => (row.status === 'connected' ? null : STATUS_LABEL[row.status]);

/** Rows that match the search text (by ID, name or channel identifier) and the channel filter ('all' keeps every channel). */
export function filterInboxes(rows: InboxRowData[], search: string, type: InboxType | 'all'): InboxRowData[] {
  const text = search.trim();
  const lower = text.toLowerCase();
  return rows.filter(
    (row) => (type === 'all' || row.type === type) && (text === '' || row.id.includes(text) || row.name.toLowerCase().includes(lower) || row.identifier.toLowerCase().includes(lower)),
  );
}

/** The channels present in `rows`, in a stable order, with how many inboxes each has. */
export function typeCounts(rows: InboxRowData[]): { type: InboxType; count: number }[] {
  return (Object.keys(TYPE_LABEL) as InboxType[])
    .map((type) => ({ type, count: rows.filter((row) => row.type === type).length }))
    .filter(({ count }) => count > 0);
}

export type InboxSortKey = 'name' | 'type' | 'members';

export function sortValue(row: InboxRowData, key: InboxSortKey): SortValue {
  switch (key) {
    case 'name':
      return row.name;
    case 'type':
      return TYPE_LABEL[row.type];
    case 'members':
      return row.members.length;
  }
}

/** Members whose name or email matches the search text. */
export function filterAgents(agents: InboxAgent[], search: string): InboxAgent[] {
  const text = search.trim().toLowerCase();
  return text === '' ? agents : agents.filter((a) => a.name.toLowerCase().includes(text) || a.email.toLowerCase().includes(text));
}

/** The agents not yet on `row`, for the "Add collaborators" picker. */
export const availableAgents = (agents: InboxAgent[], row: InboxRowData) =>
  agents.filter((agent) => !row.members.some((m) => m.id === agent.id));

/** Two-letter initials for an avatar, e.g. "Aarav Mehta" → "AM". */
export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
