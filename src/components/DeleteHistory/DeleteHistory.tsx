/**
 * DeleteHistory: Automation > Settings > Delete history (Figma "Agentic Bot Builder",
 * section 5566:8370). A read-only record of every Agent, Task, Flow and Knowledge Base item
 * deleted in Agentic Studio, with who deleted it and when.
 *
 * A controls row (Type, Deleted by, Date and Status filters, plus search) sits under the page
 * header, then a pill per active filter, a 24px-inset rule and the table. Each row offers its
 * snapshot as a download; where none exists the icon is dimmed and a tooltip says why.
 *
 *   <DeleteHistory items={rows} onDownload={(item) => downloadSnapshot(item.id)} />
 *
 * Like BotSettings, the page owns its own state, so it drops into the settings shell with
 * `contentPadding={0}` and resets whenever the Settings tab is left. `initialFilters` is the
 * search and filters it opens with, for showing a state that only they produce.
 */
import { useState, type ReactNode } from 'react';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import {
  DataTable,
  DataTableHead,
  DataTableRow,
  DataTableSkeleton,
  DataTableSortHeader,
  Skeleton,
  useTableSort,
} from '../DataTable';
import { Menu, type MenuItemData } from '../Menu';
import { Tooltip } from '../Tooltip';
import { CheckIcon, ChevronDownIcon, CloseIcon, Icon } from '../icons';
import type { IconName } from '../iconPaths';
import {
  DELETED_ITEM_STATUSES,
  DELETED_ITEM_TYPES,
  actorNames,
  deletedWithin,
  filterDeletedItems,
  formatDeletedDate,
  formatDeletedTime,
  initialsOf,
  toggleValue,
  type DeletedBy,
  type DeletedByKind,
  type DeletedItem,
  type DeletedItemFilters,
  type DeletedItemStatus,
  type DeletedItemType,
} from './deletedItems';
import './DeleteHistory.css';

const TYPE_META: Record<DeletedItemType, { label: string; icon: IconName }> = {
  agent: { label: 'Agent', icon: 'headset-pill' },
  task: { label: 'Task', icon: 'list' },
  flow: { label: 'Flow', icon: 'brand-stackshare' },
  'kbm-document': { label: 'KBM document', icon: 'file-text' },
  'kbm-url': { label: 'KBM URL', icon: 'link' },
};

const STATUS_LABEL: Record<DeletedItemStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  draft: 'Draft',
  unpublished: 'Unpublished changes',
};

/** A non-human actor shows an icon where a person shows initials, so it never reads as a person. */
const ACTOR_ICON: Record<Exclude<DeletedByKind, 'person'>, IconName> = {
  system: 'settings-automation',
  api: 'api',
  integration: 'plug',
  'not-recorded': 'help-circle',
};

/** `days` is how far back a range reaches. All time has no limit, so it has none. */
const DATE_RANGES: { label: string; days?: number }[] = [
  { label: 'All time' },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];
const DEFAULT_RANGE = DATE_RANGES[0];

/** Why this row has no snapshot to download, or undefined when it has one. */
function unavailableReason(item: DeletedItem): string | undefined {
  switch (item.snapshotUnavailable) {
    case 'not-captured':
      return 'No snapshot was captured when this item was deleted.';
    case 'never-published':
      return `This ${TYPE_META[item.type].label} was never published, so no snapshot exists. The deletion is still recorded.`;
    case 'file-missing':
      return 'The original file is no longer in storage.';
    default:
      return undefined;
  }
}

/** One filter in the controls row: an outline button that opens its options in a menu. */
function FilterMenu({
  label,
  ariaLabel,
  items,
  multiple = true,
  emptyText,
}: {
  label: string;
  ariaLabel: string;
  items: MenuItemData[];
  /** Checkbox lists stay open while options are ticked; a single-choice list closes on pick. */
  multiple?: boolean;
  /** Shown in the menu when there are no options to list. */
  emptyText?: string;
}) {
  return (
    <Menu
      ariaLabel={ariaLabel}
      align="start"
      width={220}
      className="lc-dh__menu"
      closeOnItemClick={!multiple}
      items={items}
      emptyState={emptyText && <p className="lc-dh__menu-empty">{emptyText}</p>}
      trigger={({ ref, onClick, open }) => (
        <Button
          ref={ref}
          variant="outline"
          color="gray"
          size="sm"
          rightSection={<ChevronDownIcon />}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={onClick}
        >
          {label}
        </Button>
      )}
    />
  );
}

function DeletedByCell({ actor }: { actor: DeletedBy }) {
  return (
    <span className="lc-dh__actor">
      {/* Decorative: the name beside it says who this is. Every actor gets the same light circle. */}
      <Avatar size="sm" radius="xl" aria-hidden="true">
        {actor.kind === 'person' ? initialsOf(actor.name) : <Icon name={ACTOR_ICON[actor.kind]} />}
      </Avatar>
      <span className="lc-dh__actor-text">
        <span className="lc-dh__value">{actor.name}</span>
        {actor.kind !== 'person' && actor.caption && <span className="lc-dh__caption">{actor.caption}</span>}
      </span>
    </span>
  );
}

function DownloadCell({ item, onDownload }: { item: DeletedItem; onDownload?: (item: DeletedItem) => void }) {
  const reason = unavailableReason(item);
  // A missing snapshot is a limit of the record, not an error: the button stays in place, dimmed,
  // and still takes focus so the reason can be read. It is `aria-disabled`, not `disabled`, for that.
  if (reason) {
    return (
      <Tooltip
        label={<span className="lc-dh__reason">{reason}</span>}
        position="top-end"
        arrowPosition="side"
        multiline
      >
        <button
          type="button"
          className="lc-dh__download"
          aria-disabled="true"
          aria-label={`Download unavailable for ${item.name}. ${reason}`}
        >
          <Icon name="download-tray" />
        </button>
      </Tooltip>
    );
  }
  return (
    <Tooltip label="Download snapshot" position="top-end" arrowPosition="side">
      <button
        type="button"
        className="lc-dh__download"
        aria-label={`Download snapshot of ${item.name}`}
        onClick={() => onDownload?.(item)}
      >
        <Icon name="download-tray" />
      </button>
    </Tooltip>
  );
}

function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon: IconName;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    // A status region, so the change is announced when a filter or search empties the list.
    <div className="lc-dh__empty" role="status">
      <span className="lc-dh__empty-icon" aria-hidden="true">
        <Icon name={icon} />
      </span>
      <div className="lc-dh__empty-text">
        <h2 className="lc-dh__empty-title">{title}</h2>
        <p className="lc-dh__empty-body">{children}</p>
      </div>
      {action}
    </div>
  );
}

export interface DeleteHistoryProps {
  items: DeletedItem[];
  /**
   * The search and filters the page opens with; whatever is left out starts cleared. Read once,
   * when the page mounts: give the page a new `key` to open it on another set.
   */
  initialFilters?: Partial<DeletedItemFilters>;
  /** Shows skeleton rows in place of the list while its data loads. */
  loading?: boolean;
  /** Called by a row's download button. Rows without a snapshot never call it. */
  onDownload?: (item: DeletedItem) => void;
}

export function DeleteHistory({ items, initialFilters, loading = false, onDownload }: DeleteHistoryProps) {
  // Unless told otherwise, Type starts with every type ticked ("Type: All"); Deleted by and Status
  // start with none, which keeps everything.
  const [types, setTypes] = useState(initialFilters?.types ?? DELETED_ITEM_TYPES);
  const [deletedBy, setDeletedBy] = useState<string[]>(initialFilters?.deletedBy ?? []);
  const [statuses, setStatuses] = useState<DeletedItemStatus[]>(initialFilters?.statuses ?? []);
  const [range, setRange] = useState(DEFAULT_RANGE);
  const [search, setSearch] = useState(initialFilters?.search ?? '');
  // A date range counts back from when the page opened, so a row never drops out mid-read.
  const [now] = useState(() => Date.now());

  const actors = actorNames(items);
  const inRange = range.days === undefined ? items : deletedWithin(items, range.days, now);
  const visible = filterDeletedItems(inRange, { types, deletedBy, statuses, search });
  const { sorted, sort, toggle } = useTableSort(
    visible,
    (row, key: 'name' | 'deletedAt') => (key === 'name' ? row.name : Date.parse(row.deletedAt)),
    { key: 'deletedAt', dir: 'desc' },
  );

  const allTypes = types.length === DELETED_ITEM_TYPES.length;
  const clearFilters = () => {
    setTypes(DELETED_ITEM_TYPES);
    setDeletedBy([]);
    setStatuses([]);
  };

  // One pill per narrowed filter. The Date filter always shows its choice on its button, so it has no pill.
  const pills = [
    !allTypes && {
      id: 'type',
      label: `Type: ${types.map((t) => TYPE_META[t].label).join(', ') || 'None'}`,
      clear: () => setTypes(DELETED_ITEM_TYPES),
    },
    deletedBy.length > 0 && {
      id: 'deleted-by',
      label: `Deleted by: ${deletedBy.join(', ')}`,
      clear: () => setDeletedBy([]),
    },
    statuses.length > 0 && {
      id: 'status',
      label: `Status: ${statuses.map((s) => STATUS_LABEL[s]).join(', ')}`,
      clear: () => setStatuses([]),
    },
  ].filter((pill) => !!pill);

  return (
    <div className="lc-dh">
      <div className="lc-dh__controls">
        <div className="lc-dh__filters" role="group" aria-label="Filters">
          <FilterMenu
            label={allTypes ? 'Type: All' : types.length === 0 ? 'Type: None' : `Type: ${types.length}`}
            ariaLabel="Filter by type"
            items={[
              {
                key: 'all',
                label: 'All types',
                checked: allTypes || (types.length > 0 && 'mixed'),
                dividerAfter: true,
                onClick: () => setTypes(allTypes ? [] : DELETED_ITEM_TYPES),
              },
              ...DELETED_ITEM_TYPES.map((type) => ({
                key: type,
                label: TYPE_META[type].label,
                icon: <Icon name={TYPE_META[type].icon} />,
                checked: types.includes(type),
                onClick: () => setTypes(toggleValue(DELETED_ITEM_TYPES, types, type)),
              })),
            ]}
          />
          <FilterMenu
            label={deletedBy.length > 0 ? `Deleted by: ${deletedBy.length}` : 'Deleted by'}
            ariaLabel="Filter by who deleted"
            // Nobody to list until something has been deleted (the zero state). Kept to one line at 220px.
            emptyText="No deletions yet"
            items={actors.map((name) => ({
              key: name,
              label: name,
              checked: deletedBy.includes(name),
              onClick: () => setDeletedBy(toggleValue(actors, deletedBy, name)),
            }))}
          />
          <FilterMenu
            label={`Date: ${range.label}`}
            ariaLabel="Filter by date"
            multiple={false}
            items={DATE_RANGES.map((option) => ({
              key: option.label,
              label: option.label,
              selected: option === range,
              trailingIcon: option === range ? <CheckIcon /> : undefined,
              onClick: () => setRange(option),
            }))}
          />
          <FilterMenu
            label={statuses.length > 0 ? `Status: ${statuses.length}` : 'Status'}
            ariaLabel="Filter by status"
            items={DELETED_ITEM_STATUSES.map((status) => ({
              key: status,
              label: STATUS_LABEL[status],
              checked: statuses.includes(status),
              onClick: () => setStatuses(toggleValue(DELETED_ITEM_STATUSES, statuses, status)),
            }))}
          />
        </div>
        <label className="lc-dh__search">
          <Icon name="input-search" />
          <input
            type="search"
            placeholder="Search by name"
            aria-label="Search by name"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
        </label>
      </div>

      {pills.length > 0 && (
        <div className="lc-dh__pills" role="group" aria-label="Active filters">
          {pills.map((pill) => (
            <span key={pill.id} className="lc-dh__pill">
              <span className="lc-dh__pill-label">{pill.label}</span>
              <button
                type="button"
                className="lc-dh__pill-remove"
                aria-label={`Remove filter ${pill.label}`}
                onClick={pill.clear}
              >
                <CloseIcon />
              </button>
            </span>
          ))}
          <Button variant="subtle" color="gray" size="xs" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}

      <div className="lc-dh__rule" />

      <div className="lc-dh__body">
        {loading || visible.length > 0 ? (
          <DataTable aria-busy={loading || undefined} aria-label="Delete history" data-anchor="delete-history-table">
            <DataTableHead>
              <DataTableSortHeader
                className="lc-dh__cell lc-dh__cell--item lc-dh__head-item"
                label="Item"
                sortKey="name"
                sort={sort}
                onSort={toggle}
              />
              <div role="columnheader" className="lc-dh__cell lc-dh__cell--status">
                Status
              </div>
              <div role="columnheader" className="lc-dh__cell lc-dh__cell--actor">
                Deleted by
              </div>
              <DataTableSortHeader
                className="lc-dh__cell lc-dh__cell--date"
                label="Deleted on"
                sortKey="deletedAt"
                sort={sort}
                onSort={toggle}
              />
              <div role="columnheader" className="lc-dh__cell lc-dh__cell--action" aria-label="Download" />
            </DataTableHead>

            {loading ? (
              <DataTableSkeleton>
                <div className="lc-dh__cell lc-dh__cell--item">
                  <Skeleton shape="circle" />
                  <Skeleton lines={2} />
                </div>
                <div className="lc-dh__cell lc-dh__cell--status">
                  <Skeleton />
                </div>
                <div className="lc-dh__cell lc-dh__cell--actor">
                  <Skeleton />
                </div>
                <div className="lc-dh__cell lc-dh__cell--date">
                  <Skeleton lines={2} />
                </div>
                <div className="lc-dh__cell lc-dh__cell--action" />
              </DataTableSkeleton>
            ) : (
              sorted.map((item) => (
                <DataTableRow key={item.id} data-anchor="delete-history-row" data-anchor-key={item.id}>
                  <div role="cell" className="lc-dh__cell lc-dh__cell--item">
                    {/* Decorative: the type is written out under the name. */}
                    <Avatar size="md" radius={8} className="lc-dh__type-icon" aria-hidden="true">
                      <Icon name={TYPE_META[item.type].icon} />
                    </Avatar>
                    <span className="lc-dh__name-block">
                      <span className="lc-dh__name" title={item.name}>
                        {item.name}
                      </span>
                      <span className="lc-dh__caption">{TYPE_META[item.type].label}</span>
                    </span>
                  </div>
                  <div role="cell" className="lc-dh__cell lc-dh__cell--status">
                    <span className="lc-dh__status" data-status={item.status}>
                      {STATUS_LABEL[item.status]}
                    </span>
                  </div>
                  <div role="cell" className="lc-dh__cell lc-dh__cell--actor">
                    <DeletedByCell actor={item.deletedBy} />
                  </div>
                  <div role="cell" className="lc-dh__cell lc-dh__cell--date">
                    <time dateTime={item.deletedAt} className="lc-dh__date">
                      <span className="lc-dh__value">{formatDeletedDate(item.deletedAt)}</span>
                      <span className="lc-dh__caption">{formatDeletedTime(item.deletedAt)}</span>
                    </time>
                  </div>
                  <div role="cell" className="lc-dh__cell lc-dh__cell--action">
                    <DownloadCell item={item} onDownload={onDownload} />
                  </div>
                </DataTableRow>
              ))
            )}
          </DataTable>
        ) : inRange.length === 0 ? (
          // All time is everything, so with it nothing has been deleted at all, not just in a range.
          <EmptyState
            icon="history"
            title={range.days === undefined ? 'Nothing deleted yet' : 'Nothing deleted in this date range'}
          >
            This page records every Agent, Task, Flow and Knowledge Base item deleted in Agentic Studio, with who
            deleted it and when. Deleted items cannot be restored. Each record keeps a snapshot you can download.
          </EmptyState>
        ) : (
          <EmptyState
            icon="filter-off"
            title="No deletions match these filters"
            action={
              // Clears the search too: with only a search narrowing the list, the button would do nothing otherwise.
              <Button
                variant="outline"
                color="gray"
                size="sm"
                onClick={() => {
                  clearFilters();
                  setSearch('');
                }}
              >
                Clear filters
              </Button>
            }
          >
            Try removing a filter or changing your search.
          </EmptyState>
        )}
      </div>
    </div>
  );
}

export default DeleteHistory;
