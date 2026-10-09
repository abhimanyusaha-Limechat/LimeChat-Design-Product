/**
 * InboxesTable — Settings → Inboxes list: search, a channel filter and Sync Inboxes above a list
 * of inboxes (name + channel identifier, channel, members). Status is shown on the channel icon (a dot) and, when the
 * inbox needs attention, as short text next to the identifier.
 *
 * Each inbox is a soft card row (DataTable `variant="cards"`) under a quiet header whose labels
 * sort the list. A row opens the inbox's right-hand panel (collaborators + basic actions); the ⋯
 * menu has Open, Reauthorize (only when the connection lapsed) and Delete (after a confirm).
 *
 *   <InboxesTable
 *     inboxes={rows}
 *     agents={allAgents}
 *     openId={panelInboxId}
 *     searchValue={q}
 *     onSearchChange={setQ}
 *     onOpen={(row) => openPanel(row.id)}
 *     onClose={closePanel}
 *     onOpenSettings={(row) => openSettings(row.id)}
 *     onAddMember={(row, agent) => …}
 *     onRemoveMember={(row, agent) => …}
 *     onDelete={(row) => removeInbox(row.id)}
 *   />
 *
 * Search text and the open panel are owned by the parent (the panel lives in the URL); the channel
 * filter and the delete confirm are local. Frame, sorting and states come from DataTable.
 */
import { useEffect, useRef, useState } from 'react';
import { Button } from '../Button';
import { Modal } from '../Modal';
import { InboxPanel } from './InboxPanel';
import { InboxRow } from './InboxRow';
import { InboxIcon } from './icons';
import {
  DataTable,
  DataTableEmpty,
  DataTableError,
  DataTableHead,
  DataTableSkeleton,
  DataTableSortHeader,
  DataTableStatus,
  Skeleton,
  useTableSort,
} from '../DataTable';
import {
  TYPE_LABEL,
  filterInboxes,
  sortValue,
  typeCounts,
  type InboxAgent,
  type InboxRowData,
  type InboxSortKey,
  type InboxType,
} from './inboxes';
import './InboxesTable.css';

export interface InboxesTableProps {
  /** Shows skeleton rows in place of the list while its data loads. */
  loading?: boolean;
  /** Shows a retry state in place of the list; `onRetry` adds the button. */
  error?: boolean;
  onRetry?: () => void;
  inboxes: InboxRowData[];
  /** Every agent that can be added as a collaborator in the panel. */
  agents?: InboxAgent[];
  /** Id of the inbox whose panel is open (from the URL); ignored if no such inbox is listed. */
  openId?: string | null;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  /** Shows the "Sync Inboxes" button; omit to hide it. */
  onSync?: () => void;
  syncing?: boolean;
  /** Offered in the first-run empty state; omit where inboxes can't be created here. */
  onCreate?: () => void;
  /** Row click, Enter on a focused row, or "Open" in the row menu: open the panel. */
  onOpen?: (row: InboxRowData) => void;
  onClose?: () => void;
  /** "Open settings" in the panel: go to the inbox's settings page. */
  onOpenSettings?: (row: InboxRowData) => void;
  onAddMember?: (row: InboxRowData, agent: InboxAgent) => void;
  onRemoveMember?: (row: InboxRowData, agent: InboxAgent) => void;
  onReauthorize?: (row: InboxRowData) => void;
  /** Called after the user confirms the delete dialog. */
  onDelete?: (row: InboxRowData) => void;
}

export function InboxesTable({
  inboxes,
  agents = [],
  openId = null,
  searchValue = '',
  onSearchChange,
  onSync,
  syncing = false,
  onCreate,
  onOpen,
  onClose,
  onOpenSettings,
  onAddMember,
  onRemoveMember,
  onReauthorize,
  onDelete,
  loading = false,
  error = false,
  onRetry,
}: InboxesTableProps) {
  const [typeFilter, setTypeFilter] = useState<InboxType | 'all'>('all');
  // The confirm is closed with `confirmOpen` while `toDelete` stays, so the dialog keeps its text as it fades out.
  const [toDelete, setToDelete] = useState<InboxRowData | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // "/" jumps to the search box, unless the user is already typing somewhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.closest('input, textarea, select, [contenteditable="true"]') !== null;
      if (e.key !== '/' || typing || e.metaKey || e.ctrlKey || e.altKey) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const channels = typeCounts(inboxes);
  // A filter for a channel that no longer has inboxes (after a delete) falls back to showing all.
  const activeType = channels.some((c) => c.type === typeFilter) ? typeFilter : 'all';
  const filtered = filterInboxes(inboxes, searchValue, activeType);
  const { sorted, sort, toggle: toggleSort } = useTableSort<InboxRowData, InboxSortKey>(filtered, sortValue);
  const openInbox = loading || error ? undefined : inboxes.find((row) => row.id === openId);
  const isFiltered = searchValue.trim() !== '' || activeType !== 'all';

  const clearFilters = () => {
    onSearchChange?.('');
    setTypeFilter('all');
  };

  const sortLabel = sort ? `, sorted by ${sort.key} ${sort.dir === 'asc' ? 'ascending' : 'descending'}` : '';

  const askDelete = (row: InboxRowData) => {
    setToDelete(row);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (toDelete) onDelete?.(toDelete);
    setConfirmOpen(false);
  };

  const renderRow = (row: InboxRowData) => (
    <InboxRow
      key={row.id}
      row={row}
      selected={row.id === openInbox?.id}
      onOpen={() => onOpen?.(row)}
      onReauthorize={() => onReauthorize?.(row)}
      onDelete={() => askDelete(row)}
    />
  );

  return (
    <div className="lc-ib">
      <div className="lc-ib__toolbar" data-anchor="inbox-toolbar">
        <div className="lc-ib__filters">
          <div className="lc-ib__search">
            <InboxIcon name="search" className="lc-ib__search-icon" />
            <input
              ref={searchRef}
              className="lc-ib__search-input"
              type="text"
              aria-label="Search inboxes"
              placeholder="Search inboxes"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.currentTarget.value)}
            />
          </div>
          {channels.length > 1 && (
            <div className="lc-ib__chips" role="group" aria-label="Filter by channel">
              {[{ type: 'all' as const, count: inboxes.length }, ...channels].map(({ type, count }) => (
                <button
                  key={type}
                  type="button"
                  className="lc-ib__chip"
                  aria-pressed={activeType === type}
                  onClick={() => setTypeFilter(type)}
                >
                  {type === 'all' ? 'All' : TYPE_LABEL[type]}
                  <span className="lc-ib__chip-count">{count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {onSync && (
          <Button
            variant="filled"
            color="primary"
            size="sm"
            leftSection={<InboxIcon name="sync" />}
            onClick={onSync}
            loading={syncing}
          >
            Sync Inboxes
          </Button>
        )}
      </div>

      {!loading && !error && (
        <DataTableStatus>
          {filtered.length} of {inboxes.length} inboxes{sortLabel}
        </DataTableStatus>
      )}

      <div className="lc-ib__body">
        <DataTable variant="cards" aria-busy={loading || undefined} aria-label="Inboxes" data-anchor="inbox-table">
          <DataTableHead>
            <DataTableSortHeader className="lc-ib__cell--name lc-ib__cell" label="Name" sortKey="name" sort={sort} onSort={toggleSort} />
            <DataTableSortHeader className="lc-ib__cell--type lc-ib__cell" label="Channel" sortKey="type" sort={sort} onSort={toggleSort} />
            <DataTableSortHeader className="lc-ib__cell--members lc-ib__cell" label="Members" sortKey="members" sort={sort} onSort={toggleSort} />
            <div role="columnheader" className="lc-dt__actions lc-ib__cell" aria-label="Actions" />
          </DataTableHead>

          {loading ? (
            <DataTableSkeleton>
              <div className="lc-ib__cell--name lc-ib__cell">
                <Skeleton shape="circle" />
                <Skeleton lines={2} />
              </div>
              <div className="lc-ib__cell--type lc-ib__cell">
                <Skeleton />
              </div>
              <div className="lc-ib__cell--members lc-ib__cell">
                <Skeleton />
              </div>
              <div className="lc-dt__actions lc-ib__cell" />
            </DataTableSkeleton>
          ) : error ? (
            <DataTableError onRetry={onRetry}>Couldn't load inboxes.</DataTableError>
          ) : inboxes.length === 0 ? (
            <DataTableEmpty
              title="No inboxes yet"
              action={
                onCreate ? (
                  <Button variant="filled" color="primary" size="sm" leftSection={<InboxIcon name="plus" />} onClick={onCreate}>
                    New inbox
                  </Button>
                ) : undefined
              }
            >
              {onCreate ? 'Create an inbox to start receiving conversations.' : onSync ? 'Sync inboxes to pull in your connected channels.' : 'Connected channels will show up here.'}
            </DataTableEmpty>
          ) : filtered.length === 0 ? (
            <DataTableEmpty
              title="No inboxes match your filters"
              action={
                isFiltered ? (
                  <Button variant="default" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : undefined
              }
            >
              Try a different name, or another channel.
            </DataTableEmpty>
          ) : (
            sorted.map(renderRow)
          )}
        </DataTable>

        {openInbox && (
          <InboxPanel
            inbox={openInbox}
            agents={agents}
            onClose={() => onClose?.()}
            onOpenSettings={() => onOpenSettings?.(openInbox)}
            onReauthorize={() => onReauthorize?.(openInbox)}
            onDelete={() => askDelete(openInbox)}
            onAddMember={(agent) => onAddMember?.(openInbox, agent)}
            onRemoveMember={(agent) => onRemoveMember?.(openInbox, agent)}
          />
        )}
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete this inbox?"
        description={toDelete ? `${toDelete.name} will be removed from your inboxes.` : undefined}
        width={420}
        footer={
          <>
            <Button variant="default" size="sm" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="filled" color="red" size="sm" onClick={confirmDelete}>
              Delete inbox
            </Button>
          </>
        }
      />
    </div>
  );
}

export default InboxesTable;
