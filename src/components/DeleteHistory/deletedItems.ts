/**
 * The records behind Settings > Delete history, and the pure rules that narrow them.
 * Kept apart from the table so the filtering can be unit-tested without rendering it.
 */

export type DeletedItemType = 'agent' | 'task' | 'flow' | 'kbm-document' | 'kbm-url';

/** The item's status at the moment it was deleted. `unpublished` means it had unpublished edits. */
export type DeletedItemStatus = 'active' | 'inactive' | 'draft' | 'unpublished';

/** Who deleted it. Everything except `person` is a non-human actor. */
export type DeletedByKind = 'person' | 'system' | 'api' | 'integration' | 'not-recorded';

export interface DeletedBy {
  kind: DeletedByKind;
  /** A person's name, or what the actor is called, e.g. "API", "Shopify Sync". */
  name: string;
  /** Non-human actors only: what kind of actor it is, e.g. "API request", "Integration". */
  caption?: string;
}

/**
 * Why a record has no snapshot to download. A limit of the record, never an error:
 * `not-captured` (none was taken at deletion), `never-published` (there was no published
 * version to snapshot) or `file-missing` (a Knowledge Base file no longer in storage).
 */
export type SnapshotUnavailable = 'not-captured' | 'never-published' | 'file-missing';

export interface DeletedItem {
  id: string;
  name: string;
  type: DeletedItemType;
  status: DeletedItemStatus;
  deletedBy: DeletedBy;
  /** ISO timestamp of the deletion. */
  deletedAt: string;
  /** Set when the snapshot cannot be downloaded. */
  snapshotUnavailable?: SnapshotUnavailable;
}

/** Every type, in the order the Type filter lists them. */
export const DELETED_ITEM_TYPES: DeletedItemType[] = ['agent', 'task', 'flow', 'kbm-document', 'kbm-url'];

/** Every status, in the order the Status filter lists them. */
export const DELETED_ITEM_STATUSES: DeletedItemStatus[] = ['active', 'inactive', 'draft', 'unpublished'];

const DAY_MS = 24 * 60 * 60 * 1000;

/** The items deleted in the `days` leading up to `now` (a timestamp in ms). */
export function deletedWithin(items: DeletedItem[], days: number, now: number): DeletedItem[] {
  const earliest = now - days * DAY_MS;
  return items.filter((item) => Date.parse(item.deletedAt) >= earliest);
}

export interface DeletedItemFilters {
  /** The types to keep. Every type is the same as no type filter; none keeps nothing. */
  types: DeletedItemType[];
  /** Names of the actors to keep. Empty keeps everyone. */
  deletedBy: string[];
  /** The statuses to keep. Empty keeps every status. */
  statuses: DeletedItemStatus[];
  /** Matches any part of the name, ignoring case. */
  search: string;
}

export function filterDeletedItems(items: DeletedItem[], filters: DeletedItemFilters): DeletedItem[] {
  const query = filters.search.trim().toLowerCase();
  return items.filter(
    (item) =>
      filters.types.includes(item.type) &&
      (filters.deletedBy.length === 0 || filters.deletedBy.includes(item.deletedBy.name)) &&
      (filters.statuses.length === 0 || filters.statuses.includes(item.status)) &&
      item.name.toLowerCase().includes(query),
  );
}

/**
 * The names of everyone and everything that deleted an item, for the Deleted by filter:
 * people first, then non-human actors, each group in alphabetical order.
 */
export function actorNames(items: DeletedItem[]): string[] {
  const actors = new Map(items.map((item) => [item.deletedBy.name, item.deletedBy]));
  return [...actors.values()]
    .sort(
      (a, b) =>
        Number(a.kind !== 'person') - Number(b.kind !== 'person') ||
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
    )
    .map((actor) => actor.name);
}

/** `selected` with `value` added or removed, kept in the order of `all`. */
export function toggleValue<T>(all: readonly T[], selected: readonly T[], value: T): T[] {
  return all.filter((v) => (v === value ? !selected.includes(v) : selected.includes(v)));
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "25 Nov 2026", in the viewer's time zone. */
export function formatDeletedDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "3:04 PM", in the viewer's time zone. */
export function formatDeletedTime(iso: string): string {
  const d = new Date(iso);
  const hours = d.getHours();
  return `${hours % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`;
}

/** Two letters for a person's avatar: first and last initial, or the first two letters of a single name. */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[words.length - 1][0] : (words[0] ?? '').slice(0, 2);
  return letters.toUpperCase();
}
