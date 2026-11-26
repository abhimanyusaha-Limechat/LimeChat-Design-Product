import type { DeletedItem, DeletedItemFilters } from '../components/DeleteHistory';
import { NO_FILTER_RESULTS, NO_SEARCH_RESULTS } from '../hooks/screenStates';

/**
 * Demo records for Settings > Delete history, taken from the Figma frames (section 5566:8370).
 *
 * Timestamps are counted back from today rather than fixed, so the dates always read as recent.
 * Every record is more than a week old on purpose: switching the Date filter from "All time" to
 * "Last 7 days" then shows the "Nothing deleted in this date range" state.
 *
 * ponytail: replace with the deletion log once Agentic Studio records one.
 */
function daysAgo(days: number, hours: number, minutes: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

export const DEMO_DELETED_ITEMS: DeletedItem[] = [
  {
    id: 'del-1',
    name: 'Track order status',
    type: 'flow',
    status: 'unpublished',
    deletedBy: { kind: 'person', name: 'Jappan' },
    deletedAt: daysAgo(8, 15, 4),
  },
  {
    id: 'del-2',
    name: 'Returns & Refunds',
    type: 'agent',
    status: 'active',
    deletedBy: { kind: 'person', name: 'Jappan' },
    deletedAt: daysAgo(8, 15, 2),
  },
  {
    id: 'del-3',
    name: 'returns-policy-v4.pdf',
    type: 'kbm-document',
    status: 'active',
    deletedBy: { kind: 'person', name: 'Priya' },
    deletedAt: daysAgo(9, 11, 20),
  },
  {
    id: 'del-4',
    name: 'help.brandname.com/returns',
    type: 'kbm-url',
    status: 'active',
    deletedBy: { kind: 'api', name: 'API', caption: 'API request' },
    deletedAt: daysAgo(9, 6, 0),
  },
  {
    id: 'del-5',
    name: 'Check refund status',
    type: 'task',
    status: 'draft',
    deletedBy: { kind: 'person', name: 'Atharv' },
    deletedAt: daysAgo(11, 17, 41),
    snapshotUnavailable: 'never-published',
  },
  {
    id: 'del-6',
    name: 'Diwali offer broadcast',
    type: 'flow',
    status: 'inactive',
    deletedBy: { kind: 'integration', name: 'Shopify Sync', caption: 'Integration' },
    deletedAt: daysAgo(12, 9, 15),
    snapshotUnavailable: 'not-captured',
  },
  {
    id: 'del-7',
    name: 'size-chart.xlsx',
    type: 'kbm-document',
    status: 'inactive',
    deletedBy: { kind: 'person', name: 'Priya' },
    deletedAt: daysAgo(13, 14, 30),
    snapshotUnavailable: 'file-missing',
  },
];

/**
 * The search and filters each no-results state opens Delete history with, keyed by state id.
 * They are Figma's own example (frame "2b Empty, no results") and match none of the records
 * above: nothing is named "pricing", and the one KBM URL was not deleted by Atharv.
 */
export const DEMO_DELETE_HISTORY_FILTERS: Readonly<Record<string, Partial<DeletedItemFilters> | undefined>> = {
  [NO_SEARCH_RESULTS.id]: { search: 'pricing' },
  [NO_FILTER_RESULTS.id]: { types: ['kbm-url'], deletedBy: ['Atharv'] },
};
