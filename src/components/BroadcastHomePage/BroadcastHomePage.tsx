/**
 * BroadcastHomePage — LimeChat design system (Figma node 7810:114718).
 *
 * The Campaigns → Broadcast landing view: search + Report/New broadcast
 * actions, status tabs (Triggered / Scheduled / Draft), a filter row, and a
 * table of broadcast performance stats with pagination.
 *
 *   <BroadcastHomePage
 *     broadcasts={rows}
 *     activeTab={tab}
 *     onTabChange={setTab}
 *     onNewBroadcast={() => setOpen(true)}
 *   />
 */
import { useState, type ReactNode } from 'react';
import { Button } from '../Button';
import { CheckboxPill } from '../CheckboxPill';
import { NativeSelect } from '../Select';
import { Tooltip } from '../Tooltip';
import { ActionMenu } from '../Menu';
import { BroadcastIcon, type BroadcastIconName } from './icons';
import {
  DataTable,
  DataTableEmpty,
  DataTableHead,
  DataTableRow,
  DataTableSkeleton,
  DataTableSortHeader,
  Skeleton,
  type SortValue,
  toNumber,
  useTableSort,
} from '../DataTable';
import './BroadcastHomePage.css';

export type BroadcastTab = 'triggered' | 'scheduled' | 'draft';
export type BroadcastStatus = 'sending' | 'completed' | 'scheduled' | 'draft';

export interface BroadcastStat {
  primary: string;
  secondary?: string;
}

export interface BroadcastRowData {
  id: string;
  /** 5-digit broadcast ID shown as a copyable chip before the name. Omit for rows with no ID yet (scheduled/draft). */
  displayId?: string;
  name: string;
  sentOn: string;
  status: BroadcastStatus;
  sent: string;
  delivery: BroadcastStat;
  engagement: string;
  dropoff: string;
  revenue: BroadcastStat;
  /** Retry attempt, shown as a "n/total RETRY" badge next to the name when set. */
  retry?: { attempt: number; total: number };
}

const TABS: { id: BroadcastTab; label: string }[] = [
  { id: 'triggered', label: 'Triggered' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'draft', label: 'Draft' },
];

type SortKey = 'name' | 'sent' | 'delivery' | 'engagement' | 'dropoff' | 'revenue';

const COLUMNS: { label: string; key: SortKey }[] = [
  { label: 'Sent', key: 'sent' },
  { label: 'Delivery', key: 'delivery' },
  { label: 'Engagement', key: 'engagement' },
  { label: 'Dropoff', key: 'dropoff' },
  { label: 'Revenue', key: 'revenue' },
];

/** Pulls a comparable number out of formatted strings like "$38,940" or "97.1%". */
function sortValue(row: BroadcastRowData, key: SortKey): SortValue {
  const raw = {
    name: row.name,
    sent: row.sent,
    delivery: row.delivery.primary,
    engagement: row.engagement,
    dropoff: row.dropoff,
    revenue: row.revenue.primary,
  }[key];
  return key === 'name' ? raw : toNumber(raw);
}

const STATUS_ICON: Record<BroadcastStatus, BroadcastIconName> = {
  sending: 'loader',
  completed: 'circle-check',
  scheduled: 'clock',
  draft: 'save',
};

function IdChip({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Tooltip label={copied ? 'Copied!' : `Copy ID ${id}`}>
      <button
        type="button"
        className="lc-bh__id-chip"
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

export interface BroadcastHomePageProps {
  /** Shows skeleton rows in place of the list while its data loads. */
  loading?: boolean;
  broadcasts: BroadcastRowData[];
  activeTab?: BroadcastTab;
  onTabChange?: (tab: BroadcastTab) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onReport?: () => void;
  onNewBroadcast?: () => void;
  onRowClick?: (row: BroadcastRowData) => void;
  onRowDownload?: (row: BroadcastRowData) => void;
  onRowCopy?: (row: BroadcastRowData) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function BroadcastHomePage({
  broadcasts,
  activeTab = 'triggered',
  onTabChange,
  searchValue,
  onSearchChange,
  onReport,
  onNewBroadcast,
  onRowClick,
  onRowDownload,
  onRowCopy,
  page = 1,
  totalPages = 10,
  onPageChange,
  loading = false,
}: BroadcastHomePageProps) {
  const [percentage, setPercentage] = useState('percentage');
  const [timeframe, setTimeframe] = useState('this-week');
  const [showRetry, setShowRetry] = useState(true);

  const { sorted: sortedBroadcasts, sort, toggle: toggleSort } = useTableSort(broadcasts, sortValue);

  const pageNumbers = new Set<number>(
    [1, 2, 3, 4, 5, totalPages].filter((n) => n <= totalPages),
  );

  return (
    <div className="lc-bh">
      <div className="lc-bh__toolbar" data-anchor="broadcast-toolbar">
        <div className="lc-bh__search">
          <BroadcastIcon name="search" className="lc-bh__search-icon" />
          <input
            className="lc-bh__search-input"
            type="text"
            placeholder="Search for broadcast"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.currentTarget.value)}
          />
        </div>
        <div className="lc-bh__actions">
          <Button
            variant="default"
            color="gray"
            size="sm"
            leftSection={<BroadcastIcon name="download" />}
            onClick={onReport}
          >
            Report
          </Button>
          <Button
            variant="filled"
            color="primary"
            size="sm"
            leftSection={<BroadcastIcon name="plus" />}
            onClick={onNewBroadcast}
          >
            Broadcast
          </Button>
        </div>
      </div>

      <div className="lc-bh__nav-row" data-anchor="broadcast-tab-bar">
        <div className="lc-bh__tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              className="lc-bh__tab"
              data-active={tab.id === activeTab || undefined}
              aria-selected={tab.id === activeTab}
              onClick={() => onTabChange?.(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="lc-bh__filters">
          <div className="lc-bh__filters-group">
            <span className="lc-bh__filters-label">Apply filters</span>
            <NativeSelect
              size="sm"
              value={percentage}
              onChange={(e) => setPercentage(e.currentTarget.value)}
              data={[
                { value: 'percentage', label: 'Precentage' },
                { value: 'count', label: 'Count' },
              ]}
            />
            <NativeSelect
              size="sm"
              value={timeframe}
              onChange={(e) => setTimeframe(e.currentTarget.value)}
              data={[
                { value: 'this-week', label: 'This week' },
                { value: 'this-month', label: 'This month' },
                { value: 'last-30-days', label: 'Last 30 days' },
              ]}
            />
          </div>
          <CheckboxPill checked={showRetry} onChange={setShowRetry} label="Show retry results" />
        </div>
      </div>

      <DataTable aria-busy={loading || undefined} aria-label="Broadcasts" data-anchor="broadcast-table">
        <DataTableHead>
          <DataTableSortHeader
            className="lc-bh__cell--name lc-bh__cell"
            label="Broadcast name"
            sortKey="name"
            sort={sort}
            onSort={toggleSort}
          />
          <div className="lc-bh__stats">
            {COLUMNS.map((col) => (
              <DataTableSortHeader
                key={col.key}
                className="lc-bh__cell--stat"
                label={col.label}
                sortKey={col.key}
                sort={sort}
                onSort={toggleSort}
              />
            ))}
          </div>
          <div role="columnheader" className="lc-bh__cell--actions" aria-label="Actions" />
        </DataTableHead>

        {loading ? (
          <DataTableSkeleton>
            <div className="lc-bh__cell--name lc-bh__cell">
              <Skeleton lines={2} />
            </div>
            <div className="lc-bh__stats">
              {COLUMNS.map((col) => (
                <div key={col.key} className="lc-bh__cell--stat">
                  <Skeleton />
                </div>
              ))}
            </div>
            <div className="lc-bh__cell--actions" />
          </DataTableSkeleton>
        ) : sortedBroadcasts.length === 0 ? (
          <DataTableEmpty>No broadcasts found</DataTableEmpty>
        ) : (
          sortedBroadcasts.map((row) => (
            <DataTableRow
              key={row.id}
              data-anchor="broadcast-row"
              data-anchor-key={row.id}
              onClick={onRowClick && (() => onRowClick(row))}
            >
              <div role="cell" className="lc-bh__cell--name lc-bh__cell">
                <BroadcastIcon
                  name={STATUS_ICON[row.status]}
                  className="lc-bh__status-icon"
                  data-status={row.status}
                />
                <div className="lc-bh__name-block">
                  <div className="lc-bh__name-line">
                    {row.displayId && <IdChip id={row.displayId} />}
                    <span className="lc-bh__name">{row.name}</span>
                    {row.retry && (
                      <span className="lc-bh__retry-badge">
                        {row.retry.attempt}/{row.retry.total} retry
                      </span>
                    )}
                  </div>
                  <span className="lc-bh__sent-on">
                    {row.status === 'scheduled' || row.status === 'draft' ? 'Scheduled on' : 'Triggered on'} :{' '}
                    {row.sentOn}
                  </span>
                </div>
              </div>
              <div className="lc-bh__stats">
                <div role="cell" className="lc-bh__cell--stat">
                  <span className="lc-bh__stat-primary">{row.sent}</span>
                </div>
                <div role="cell" className="lc-bh__cell--stat">
                  <span className="lc-bh__stat-primary">{row.delivery.primary}</span>
                  {showRetry && row.delivery.secondary && (
                    <div className="lc-bh__stat-secondary">{row.delivery.secondary}</div>
                  )}
                </div>
                <div role="cell" className="lc-bh__cell--stat">
                  <span className="lc-bh__stat-primary">{row.engagement}</span>
                </div>
                <div role="cell" className="lc-bh__cell--stat">
                  <span className="lc-bh__stat-primary">{row.dropoff}</span>
                </div>
                <div role="cell" className="lc-bh__cell--stat">
                  <span className="lc-bh__stat-primary">{row.revenue.primary}</span>
                  {showRetry && row.revenue.secondary && (
                    <div className="lc-bh__stat-secondary">{row.revenue.secondary}</div>
                  )}
                </div>
              </div>
              {/* Menu clicks (portaled, but React-bubbled) must not also open the row. */}
              <div role="cell" className="lc-bh__cell--actions" onClick={(e) => e.stopPropagation()}>
                <ActionMenu
                  ariaLabel={`Actions for ${row.name}`}
                  icon={<BroadcastIcon name="dots-vertical" />}
                  items={[
                    { label: 'Edit', icon: <BroadcastIcon name="edit" />, onClick: () => onRowClick?.(row) },
                    { label: 'Copy broadcast', icon: <BroadcastIcon name="copy" />, onClick: () => onRowCopy?.(row) },
                    { label: 'Download report', icon: <BroadcastIcon name="download" />, onClick: () => onRowDownload?.(row) },
                  ]}
                />
              </div>
            </DataTableRow>
          ))
        )}
      </DataTable>

      <div className="lc-bh__pagination" data-anchor="broadcast-pagination">
        {Array.from(pageNumbers)
          .sort((a, b) => a - b)
          .flatMap((n, i, arr) => {
            const nodes: ReactNode[] = [];
            const prev = arr[i - 1];
            if (prev != null && n - prev > 1) {
              nodes.push(
                <span key={`ellipsis-${n}`} className="lc-bh__page-item" data-ellipsis="true">
                  <BroadcastIcon name="dots" style={{ width: 14, height: 14 }} />
                </span>,
              );
            }
            nodes.push(
              <button
                key={n}
                type="button"
                className="lc-bh__page-item"
                data-active={n === page || undefined}
                onClick={() => onPageChange?.(n)}
              >
                {n}
              </button>,
            );
            return nodes;
          })}
      </div>
    </div>
  );
}

export default BroadcastHomePage;
