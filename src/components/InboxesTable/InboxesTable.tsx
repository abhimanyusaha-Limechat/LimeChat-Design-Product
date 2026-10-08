/**
 * InboxesTable — Settings → Inboxes list: search + Sync Inboxes action and a
 * table of connected inboxes (Name, Type, Meta ID) with a copyable ID chip
 * inline before each name — same anatomy as BroadcastHomePage/BotFlowsHomePage
 * (id chip + name-block, sortable name column, row rhythm), scoped to "lc-ib"
 * and simplified to a list with a ⋯ row-actions menu (no tabs).
 *
 *   <InboxesTable
 *     inboxes={rows}
 *     searchValue={q}
 *     onSearchChange={setQ}
 *     onSync={() => refetchInboxes()}
 *   />
 */
import { useState } from 'react';
import { Button } from '../Button';
import { ActionMenu } from '../Menu';
import { Tooltip } from '../Tooltip';
import { InboxIcon, type InboxIconName } from './icons';
import {
  DataTable,
  DataTableEmpty,
  DataTableHead,
  DataTableRow,
  DataTableSkeleton,
  DataTableSortHeader,
  Skeleton,
  useTableSort,
} from '../DataTable';
import './InboxesTable.css';

export type InboxType = 'whatsapp' | 'email' | 'instagram' | 'sms' | 'facebook';

export interface InboxRowData {
  id: string;
  name: string;
  type: InboxType;
  /** Shown as-is, e.g. "N/A" or an actual meta/WABA id. */
  metaId: string;
  /** Pre-formatted, e.g. "05:18 AM, 06 April 2026". */
  createdOn: string;
}

const TYPE_ICON: Record<InboxType, InboxIconName> = {
  whatsapp: 'whatsapp',
  email: 'email',
  instagram: 'instagram',
  sms: 'sms',
  facebook: 'facebook',
};

const TYPE_LABEL: Record<InboxType, string> = {
  whatsapp: 'Whatsapp',
  email: 'Email',
  instagram: 'Instagram',
  sms: 'Sms',
  facebook: 'Facebook',
};

/** Copy-to-clipboard ID chip — same interaction as BroadcastHomePage's IdChip. */
function IdChip({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Tooltip label={copied ? 'Copied!' : `Copy ID ${id}`}>
      <button
        type="button"
        className="lc-ib__id-chip"
        data-copied={copied || undefined}
        aria-label={`Copy ID ${id}`}
        onClick={(e) => {
          e.stopPropagation();
          navigator.clipboard?.writeText(id);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        }}
      >
        {id}
      </button>
    </Tooltip>
  );
}

export interface InboxesTableProps {
  /** Shows skeleton rows in place of the list while its data loads. */
  loading?: boolean;
  inboxes: InboxRowData[];
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  /** Shows the "Sync Inboxes" button; omit to hide it. */
  onSync?: () => void;
  syncing?: boolean;
  onRowEdit?: (row: InboxRowData) => void;
  onRowDelete?: (row: InboxRowData) => void;
}

export function InboxesTable({
  inboxes,
  searchValue,
  onSearchChange,
  onSync,
  syncing = false,
  onRowEdit,
  onRowDelete,
  loading = false,
}: InboxesTableProps) {

  const { sorted: sortedInboxes, sort, toggle: toggleSort } = useTableSort(
    inboxes,
    (row, key: 'name' | 'type' | 'metaId') => (key === 'type' ? TYPE_LABEL[row.type] : row[key]),
  );

  return (
    <div className="lc-ib">
      <div className="lc-ib__toolbar" data-anchor="inbox-toolbar">
        <div className="lc-ib__search">
          <InboxIcon name="search" className="lc-ib__search-icon" />
          <input
            className="lc-ib__search-input"
            type="text"
            placeholder="Search inboxes by ID or name"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.currentTarget.value)}
          />
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

      <DataTable aria-busy={loading || undefined} aria-label="Inboxes" data-anchor="inbox-table">
        <DataTableHead>
          <DataTableSortHeader className="lc-ib__cell--name lc-ib__cell" label="Name" sortKey="name" sort={sort} onSort={toggleSort} />
          <DataTableSortHeader className="lc-ib__cell--type lc-ib__cell" label="Type" sortKey="type" sort={sort} onSort={toggleSort} />
          <DataTableSortHeader className="lc-ib__cell--meta lc-ib__cell" label="Meta ID" sortKey="metaId" sort={sort} onSort={toggleSort} />
          <div role="columnheader" className="lc-ib__cell--actions lc-ib__cell" aria-label="Actions" />
        </DataTableHead>

        {loading ? (
          <DataTableSkeleton>
            <div className="lc-ib__cell--name lc-ib__cell">
              <Skeleton lines={2} />
            </div>
            <div className="lc-ib__cell--type lc-ib__cell">
              <Skeleton lines={2} />
            </div>
            <div className="lc-ib__cell--meta lc-ib__cell">
              <Skeleton />
            </div>
            <div className="lc-ib__cell--actions lc-ib__cell" />
          </DataTableSkeleton>
        ) : inboxes.length === 0 ? (
          <DataTableEmpty>No inboxes found</DataTableEmpty>
        ) : (
          sortedInboxes.map((row) => (
            <DataTableRow key={row.id} data-anchor="inbox-row" data-anchor-key={row.id}>
              <div role="cell" className="lc-ib__cell--name lc-ib__cell">
                <InboxIcon
                  name={TYPE_ICON[row.type]}
                  className="lc-ib__row-icon"
                  data-type={row.type}
                />
                <div className="lc-ib__name-block">
                  <div className="lc-ib__name-line">
                    <IdChip id={row.id} />
                    <span className="lc-ib__name">{row.name}</span>
                  </div>
                  <span className="lc-ib__meta-line">Created: {row.createdOn}</span>
                </div>
              </div>
              <div role="cell" className="lc-ib__cell--type lc-ib__cell">
                <div className="lc-ib__type-block">
                  <span className="lc-ib__type-label">{TYPE_LABEL[row.type]}</span>
                  <span className="lc-ib__type-caption">Channel name</span>
                </div>
              </div>
              <div role="cell" className="lc-ib__cell--meta lc-ib__cell">{row.metaId}</div>
              <div role="cell" className="lc-ib__cell--actions lc-ib__cell">
                <ActionMenu
                  ariaLabel={`Actions for ${row.name}`}
                  icon={<InboxIcon name="dots-vertical" />}
                  items={[
                    { label: 'Edit', onClick: () => onRowEdit?.(row) },
                    { label: 'Delete', danger: true, onClick: () => onRowDelete?.(row) },
                  ]}
                />
              </div>
            </DataTableRow>
          ))
        )}
      </DataTable>
    </div>
  );
}

export default InboxesTable;
