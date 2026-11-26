import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteHistory } from './DeleteHistory';
import type { DeletedItem } from './deletedItems';

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (days: number) => new Date(Date.now() - days * DAY).toISOString();

const item = (over: Partial<DeletedItem> & Pick<DeletedItem, 'id' | 'name'>): DeletedItem => ({
  type: 'flow',
  status: 'active',
  deletedBy: { kind: 'person', name: 'Jappan' },
  deletedAt: daysAgo(10),
  ...over,
});

// Newest first: the order the page opens in.
const items: DeletedItem[] = [
  item({ id: '1', name: 'Track order status', status: 'unpublished', deletedAt: daysAgo(9) }),
  item({ id: '2', name: 'Returns & Refunds', type: 'agent', deletedAt: daysAgo(10) }),
  item({
    id: '3',
    name: 'help.brandname.com/returns',
    type: 'kbm-url',
    deletedBy: { kind: 'api', name: 'API', caption: 'API request' },
    deletedAt: daysAgo(11),
  }),
  item({
    id: '4',
    name: 'Check refund status',
    type: 'task',
    status: 'draft',
    deletedBy: { kind: 'person', name: 'Atharv' },
    deletedAt: daysAgo(12),
    snapshotUnavailable: 'never-published',
  }),
  // More than 30 days old.
  item({
    id: '5',
    name: 'Diwali offer broadcast',
    status: 'inactive',
    deletedBy: { kind: 'integration', name: 'Shopify Sync', caption: 'Integration' },
    deletedAt: daysAgo(40),
    snapshotUnavailable: 'not-captured',
  }),
];

const LAST_30_DAYS = ['Track order status', 'Returns & Refunds', 'help.brandname.com/returns', 'Check refund status'];
const ALL = [...LAST_30_DAYS, 'Diwali offer broadcast'];

/** The names in the table, top to bottom. */
const rowNames = () =>
  screen
    .getAllByRole('row')
    .slice(1) // the header row
    .map((row) => row.querySelector('.lc-dh__name')?.textContent);

const rowOf = (name: string) => screen.getByText(name).closest<HTMLElement>('[role="row"]')!;

/** Opens a filter and returns its menu. */
async function openFilter(user: ReturnType<typeof userEvent.setup>, button: string | RegExp, menu: string) {
  await user.click(screen.getByRole('button', { name: button }));
  return within(screen.getByRole('menu', { name: menu }));
}

describe('DeleteHistory', () => {
  it('lists everything deleted, however long ago, newest first', () => {
    render(<DeleteHistory items={items} />);
    expect(rowNames()).toEqual(ALL);
    expect(screen.getByRole('button', { name: 'Date: All time' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Deleted on' })).toHaveAttribute('aria-sort', 'descending');

    const row = within(rowOf('help.brandname.com/returns'));
    expect(row.getByText('KBM URL')).toBeInTheDocument();
    expect(row.getByText('Active')).toBeInTheDocument();
    // A non-human actor carries a caption saying what it is.
    expect(row.getByText('API request')).toBeInTheDocument();
    expect(within(rowOf('Diwali offer broadcast')).getByText('Integration')).toBeInTheDocument();
  });

  it('has a column for the item, its status, who deleted it and when, and none for a location', () => {
    render(<DeleteHistory items={items} />);
    expect(screen.getAllByRole('columnheader').map((header) => header.textContent || header.getAttribute('aria-label'))).toEqual([
      'Item',
      'Status',
      'Deleted by',
      'Deleted on',
      'Download',
    ]);
  });

  it('sorts by item name from the column header', async () => {
    const user = userEvent.setup();
    render(<DeleteHistory items={items} />);
    await user.click(screen.getByRole('button', { name: 'Item' }));
    expect(rowNames()).toEqual([
      'Check refund status',
      'Diwali offer broadcast',
      'help.brandname.com/returns',
      'Returns & Refunds',
      'Track order status',
    ]);
  });

  it('filters by type from a checkbox menu, and shows the filter as a pill that removes it', async () => {
    const user = userEvent.setup();
    render(<DeleteHistory items={items} />);

    // Every type starts ticked; unticking "All types" clears them, which matches nothing.
    const menu = await openFilter(user, 'Type: All', 'Filter by type');
    expect(menu.getByRole('menuitemcheckbox', { name: 'All types' })).toHaveAttribute('aria-checked', 'true');
    await user.click(menu.getByRole('menuitemcheckbox', { name: 'All types' }));
    expect(screen.getByRole('heading', { name: 'No deletions match these filters' })).toBeInTheDocument();

    // The menu stays open while types are ticked.
    await user.click(menu.getByRole('menuitemcheckbox', { name: 'KBM URL' }));
    await user.click(menu.getByRole('menuitemcheckbox', { name: 'Task' }));
    expect(menu.getByRole('menuitemcheckbox', { name: 'All types' })).toHaveAttribute('aria-checked', 'mixed');
    expect(rowNames()).toEqual(['help.brandname.com/returns', 'Check refund status']);
    expect(screen.getByRole('button', { name: 'Type: 2' })).toBeInTheDocument();

    const pills = within(screen.getByRole('group', { name: 'Active filters' }));
    expect(pills.getByText('Type: Task, KBM URL')).toBeInTheDocument();
    await user.click(pills.getByRole('button', { name: 'Remove filter Type: Task, KBM URL' }));
    expect(rowNames()).toEqual(ALL);
    expect(screen.getByRole('button', { name: 'Type: All' })).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Active filters' })).not.toBeInTheDocument();
  });

  it('filters by type with the keyboard alone', async () => {
    const user = userEvent.setup();
    render(<DeleteHistory items={items} />);

    // The Type filter is the first stop on the page. Enter opens it with focus on "All types".
    await user.tab();
    expect(screen.getByRole('button', { name: 'Type: All' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('menuitemcheckbox', { name: 'All types' })).toHaveFocus();

    // Space unticks every type; End jumps to the last one; Space ticks it.
    await user.keyboard(' {End} ');
    expect(screen.getByRole('menuitemcheckbox', { name: 'KBM URL' })).toHaveAttribute('aria-checked', 'true');
    expect(rowNames()).toEqual(['help.brandname.com/returns']);

    // Escape closes the menu and puts focus back on the filter, which now shows the count.
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Type: 1' })).toHaveFocus();

    // Tab moves on to the next filters. The Date menu opens on the range in use; picking another
    // closes it and returns focus too.
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Date: All time' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('menuitem', { name: 'All time' })).toHaveFocus();
    await user.keyboard('{End}{Enter}');
    expect(screen.getByRole('button', { name: 'Date: Last 90 days' })).toHaveFocus();
  });

  it('filters by who deleted and by status together, and Clear all resets both', async () => {
    const user = userEvent.setup();
    render(<DeleteHistory items={items} />);

    const who = await openFilter(user, 'Deleted by', 'Filter by who deleted');
    // People first, then non-human actors.
    expect(who.getAllByRole('menuitemcheckbox').map((el) => el.textContent)).toEqual(['Atharv', 'Jappan', 'API', 'Shopify Sync']);
    await user.click(who.getByRole('menuitemcheckbox', { name: 'Jappan' }));
    await user.click(who.getByRole('menuitemcheckbox', { name: 'Atharv' }));
    await user.keyboard('{Escape}');
    expect(rowNames()).toEqual(['Track order status', 'Returns & Refunds', 'Check refund status']);

    const status = await openFilter(user, 'Status', 'Filter by status');
    await user.click(status.getByRole('menuitemcheckbox', { name: 'Draft' }));
    await user.keyboard('{Escape}');
    expect(rowNames()).toEqual(['Check refund status']);
    expect(screen.getByRole('button', { name: 'Deleted by: 2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Status: 1' })).toBeInTheDocument();
    expect(screen.getByText('Deleted by: Atharv, Jappan')).toBeInTheDocument();
    expect(screen.getByText('Status: Draft')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(rowNames()).toEqual(ALL);
    expect(screen.getByRole('button', { name: 'Deleted by' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Status' })).toBeInTheDocument();
  });

  it('searches by name, and Clear filters empties the search too', async () => {
    const user = userEvent.setup();
    render(<DeleteHistory items={items} />);
    const search = screen.getByRole('searchbox', { name: 'Search by name' });

    await user.type(search, 'refund');
    expect(rowNames()).toEqual(['Returns & Refunds', 'Check refund status']);

    await user.clear(search);
    await user.type(search, 'pricing');
    expect(screen.getByRole('heading', { name: 'No deletions match these filters' })).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(search).toHaveValue('');
    expect(rowNames()).toEqual(ALL);
  });

  it('opens on the filters it is given, shown as applied, and Clear filters removes them', async () => {
    const user = userEvent.setup();
    render(<DeleteHistory items={items} initialFilters={{ types: ['kbm-url'], deletedBy: ['Atharv'] }} />);

    // Atharv deleted no KBM URL. Each filter shows what is picked, on its button and as a pill.
    expect(screen.getByRole('heading', { name: 'No deletions match these filters' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Type: 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Deleted by: 1' })).toBeInTheDocument();
    const pills = within(screen.getByRole('group', { name: 'Active filters' }));
    expect(pills.getByText('Type: KBM URL')).toBeInTheDocument();
    expect(pills.getByText('Deleted by: Atharv')).toBeInTheDocument();
    // What was left out starts cleared.
    expect(screen.getByRole('button', { name: 'Status' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search by name' })).toHaveValue('');

    const menu = await openFilter(user, 'Type: 1', 'Filter by type');
    expect(menu.getByRole('menuitemcheckbox', { name: 'KBM URL' })).toHaveAttribute('aria-checked', 'true');
    expect(menu.getByRole('menuitemcheckbox', { name: 'Task' })).toHaveAttribute('aria-checked', 'false');
    await user.keyboard('{Escape}');

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(rowNames()).toEqual(ALL);
    expect(screen.queryByRole('group', { name: 'Active filters' })).not.toBeInTheDocument();
  });

  it('opens on the search it is given, typed into the search box', () => {
    render(<DeleteHistory items={items} initialFilters={{ search: 'pricing' }} />);
    expect(screen.getByRole('searchbox', { name: 'Search by name' })).toHaveValue('pricing');
    expect(screen.getByRole('heading', { name: 'No deletions match these filters' })).toBeInTheDocument();
    // A search is not a filter pill.
    expect(screen.queryByRole('group', { name: 'Active filters' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Type: All' })).toBeInTheDocument();
  });

  it('narrows to a date range, and says nothing was deleted when the range holds no deletions', async () => {
    const user = userEvent.setup();
    render(<DeleteHistory items={items} />);

    let date = await openFilter(user, 'Date: All time', 'Filter by date');
    expect(date.getAllByRole('menuitem').map((el) => el.textContent)).toEqual(['All time', 'Last 7 days', 'Last 30 days', 'Last 90 days']);
    await user.click(date.getByRole('menuitem', { name: 'Last 30 days' }));
    // A single choice closes the menu.
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(rowNames()).toEqual(LAST_30_DAYS);

    date = await openFilter(user, 'Date: Last 30 days', 'Filter by date');
    await user.click(date.getByRole('menuitem', { name: 'Last 7 days' }));
    expect(screen.getByRole('button', { name: 'Date: Last 7 days' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Nothing deleted in this date range' })).toBeInTheDocument();
    // Nothing to clear: no filter is hiding anything.
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();

    date = await openFilter(user, 'Date: Last 7 days', 'Filter by date');
    await user.click(date.getByRole('menuitem', { name: 'All time' }));
    expect(rowNames()).toEqual(ALL);
  });

  it('downloads a snapshot from a row', async () => {
    const user = userEvent.setup();
    const onDownload = vi.fn();
    render(<DeleteHistory items={items} onDownload={onDownload} />);

    await user.click(screen.getByRole('button', { name: 'Download snapshot of Returns & Refunds' }));
    expect(onDownload).toHaveBeenCalledExactlyOnceWith(items[1]);
  });

  it('keeps the download in place but unavailable when there is no snapshot, and says why', async () => {
    const user = userEvent.setup();
    const onDownload = vi.fn();
    render(<DeleteHistory items={items} onDownload={onDownload} />);
    const reason = 'This Task was never published, so no snapshot exists. The deletion is still recorded.';

    const button = screen.getByRole('button', { name: `Download unavailable for Check refund status. ${reason}` });
    // Not `disabled`: it still takes focus, so the reason can be read from the keyboard.
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toBeEnabled();

    await user.click(button);
    expect(onDownload).not.toHaveBeenCalled();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(reason);
  });

  it('gives each reason a snapshot can be missing its own words', () => {
    render(
      <DeleteHistory
        items={[
          item({ id: 'a', name: 'Old flow', snapshotUnavailable: 'not-captured' }),
          item({ id: 'b', name: 'size-chart.xlsx', type: 'kbm-document', snapshotUnavailable: 'file-missing' }),
          item({ id: 'c', name: 'Draft flow', snapshotUnavailable: 'never-published' }),
        ]}
      />,
    );
    expect(
      screen.getByRole('button', { name: /^Download unavailable for Old flow\. No snapshot was captured when this item was deleted\.$/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^Download unavailable for size-chart\.xlsx\. The original file is no longer in storage\.$/ }),
    ).toBeInTheDocument();
    // The never-published reason names the item's own type.
    expect(screen.getByRole('button', { name: /^Download unavailable for Draft flow\. This Flow was never published/ })).toBeInTheDocument();
  });

  it('shows the system and an unrecorded source as actors, with an icon in place of initials', () => {
    render(
      <DeleteHistory
        items={[
          item({ id: 'a', name: 'Expired source', deletedBy: { kind: 'system', name: 'System', caption: 'Scheduled cleanup' } }),
          item({ id: 'b', name: 'Legacy flow', deletedBy: { kind: 'not-recorded', name: 'Not recorded' } }),
          item({ id: 'c', name: 'Welcome flow', deletedBy: { kind: 'person', name: 'Priya' } }),
        ]}
      />,
    );
    expect(within(rowOf('Expired source')).getByText('Scheduled cleanup')).toBeInTheDocument();
    expect(within(rowOf('Legacy flow')).getByText('Not recorded')).toBeInTheDocument();
    // Only the person gets initials.
    expect(within(rowOf('Welcome flow')).getByText('PR')).toBeInTheDocument();
    expect(within(rowOf('Expired source')).queryByText('SY')).not.toBeInTheDocument();
    // Person or not, the avatar is the same light circle: only what is inside it differs.
    for (const name of ['Expired source', 'Legacy flow', 'Welcome flow']) {
      const avatar = rowOf(name).querySelector('.lc-dh__actor .lc-avatar');
      expect(avatar).toHaveAttribute('data-variant', 'light');
      expect(avatar).toHaveAttribute('data-radius', 'xl');
    }
    expect(rowOf('Expired source').querySelector('.lc-dh__actor .lc-avatar')).toHaveAttribute('data-type', 'icon');
    expect(rowOf('Welcome flow').querySelector('.lc-dh__actor .lc-avatar')).toHaveAttribute('data-type', 'initials');
  });

  it('shows placeholder rows while loading', () => {
    render(<DeleteHistory items={items} loading />);
    expect(screen.getByRole('table', { name: 'Delete history' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('Track order status')).not.toBeInTheDocument();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('treats an empty record as nothing deleted yet, not as a date range or a filter with no results', () => {
    render(<DeleteHistory items={[]} initialFilters={{ types: ['kbm-url'] }} />);
    expect(screen.getByRole('heading', { name: 'Nothing deleted yet' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Deleted items cannot be restored.');
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();
  });
});
