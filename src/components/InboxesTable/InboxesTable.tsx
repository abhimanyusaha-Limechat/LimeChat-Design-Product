/**
 * InboxesTable — Settings → Inboxes list: search + Sync Inboxes action and a
 * table of connected inboxes (Name, Type) — same anatomy as
 * BroadcastHomePage/BotFlowsHomePage (name-block, sortable name column, row
 * rhythm), scoped to "lc-ib"
 * and simplified to a list with a ⋯ row-actions menu (no tabs).
 *
 *   <InboxesTable
 *     inboxes={rows}
 *     searchValue={q}
 *     onSearchChange={setQ}
 *     onSync={() => refetchInboxes()}
 *   />
 */
import { Button } from '../Button';
import { ActionMenu } from '../Menu';
import { InboxIcon, type InboxIconName } from './icons';
import {
  DataTable,
  DataTableEmpty,
  DataTableHead,
  DataTableRow,
  DataTableSkeleton,
  DataTableSortHeader,
  selectRow,
  Skeleton,
  useTableSort,
} from '../DataTable';
import './InboxesTable.css';

export type InboxType = 'whatsapp' | 'email' | 'instagram' | 'sms' | 'facebook';

export interface InboxRowData {
  id: string;
  name: string;
  type: InboxType;
  /** Channel-specific identifier, e.g. a phone number, email address or handle. */
  detail: string;
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
  /** Makes rows clickable (opens a details panel). */
  onRowSelect?: (row: InboxRowData) => void;
  selectedId?: string;
}

export function InboxesTable({
  inboxes,
  searchValue,
  onSearchChange,
  onSync,
  syncing = false,
  onRowEdit,
  onRowDelete,
  onRowSelect,
  selectedId,
  loading = false,
}: InboxesTableProps) {

  const { sorted: sortedInboxes, sort, toggle: toggleSort } = useTableSort(
    inboxes,
    (row, key: 'name' | 'type') => (key === 'type' ? TYPE_LABEL[row.type] : row[key]),
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
            <div className="lc-ib__cell--actions lc-ib__cell" />
          </DataTableSkeleton>
        ) : inboxes.length === 0 ? (
          <DataTableEmpty>No inboxes found</DataTableEmpty>
        ) : (
          sortedInboxes.map((row) => (
            <DataTableRow
              key={row.id}
              data-anchor="inbox-row"
              data-anchor-key={row.id}
              data-selected={row.id === selectedId || undefined}
              onClick={onRowSelect ? (e) => selectRow(e, () => onRowSelect(row)) : undefined}
            >
              <div role="cell" className="lc-ib__cell--name lc-ib__cell">
                <InboxIcon
                  name={TYPE_ICON[row.type]}
                  className="lc-ib__row-icon"
                  data-type={row.type}
                />
                <div className="lc-ib__name-block">
                  <div className="lc-ib__name-line">
                    <span className="lc-ib__name">{row.name}</span>
                  </div>
                  <span className="lc-ib__meta-line">{row.detail}</span>
                </div>
              </div>
              <div role="cell" className="lc-ib__cell--type lc-ib__cell">
                <div className="lc-ib__type-block">
                  <span className="lc-ib__type-label">{TYPE_LABEL[row.type]}</span>
                  <span className="lc-ib__type-caption">Channel name</span>
                </div>
              </div>
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
