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
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { Button } from '../Button';
import { NativeSelect } from '../Select';
import { Tooltip } from '../Tooltip';
import { BroadcastIcon, type BroadcastIconName } from './icons';
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
function sortValue(row: BroadcastRowData, key: SortKey): number | string {
  const raw =
    key === 'name'
      ? row.name
      : key === 'sent'
        ? row.sent
        : key === 'delivery'
          ? row.delivery.primary
          : key === 'engagement'
            ? row.engagement
            : key === 'dropoff'
              ? row.dropoff
              : row.revenue.primary;
  if (key === 'name') return raw.toLowerCase();
  const num = Number(raw.replace(/[^0-9.-]/g, ''));
  return Number.isNaN(num) ? raw : num;
}

const STATUS_ICON: Record<BroadcastStatus, BroadcastIconName> = {
  sending: 'loader',
  completed: 'circle-check',
  scheduled: 'clock',
  draft: 'save',
};

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
}) {
  return (
    <label className="lc-bh__switch" data-checked={checked || undefined}>
      <input
        type="checkbox"
        className="lc-bh__switch-input"
        checked={checked}
        onChange={(e) => onChange(e.currentTarget.checked)}
      />
      <span className="lc-bh__switch-box" aria-hidden="true">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8.5l3 3l7-7" />
        </svg>
      </span>
      <span className="lc-bh__switch-label">{label}</span>
    </label>
  );
}

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
}: BroadcastHomePageProps) {
  const [percentage, setPercentage] = useState('percentage');
  const [timeframe, setTimeframe] = useState('this-week');
  const [showRetry, setShowRetry] = useState(true);

  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<number>();
  const handleTableScroll = () => {
    setIsScrolling(true);
    window.clearTimeout(scrollTimeout.current);
    scrollTimeout.current = window.setTimeout(() => setIsScrolling(false), 600);
  };

  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' } | null>(null);
  const toggleSort = (key: SortKey) =>
    setSort((s) =>
      s?.key === key ? (s.dir === 'asc' ? { key, dir: 'desc' } : null) : { key, dir: 'asc' },
    );
  const sortedBroadcasts = useMemo(() => {
    if (!sort) return broadcasts;
    const { key, dir } = sort;
    return [...broadcasts].sort((a, b) => {
      const av = sortValue(a, key);
      const bv = sortValue(b, key);
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return dir === 'asc' ? cmp : -cmp;
    });
  }, [broadcasts, sort]);

  const pageNumbers = new Set<number>(
    [1, 2, 3, 4, 5, totalPages].filter((n) => n <= totalPages),
  );

  return (
    <div className="lc-bh">
      <div className="lc-bh__toolbar">
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

      <div className="lc-bh__nav-row">
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
          <Switch checked={showRetry} onChange={setShowRetry} label="Show retry results" />
        </div>
      </div>

      <div className="lc-bh__table" data-scrolling={isScrolling || undefined} onScroll={handleTableScroll}>
        <div className="lc-bh__row lc-bh__row--head">
          <div className="lc-bh__cell--name lc-bh__cell">
            <button
              type="button"
              className="lc-bh__sort-btn"
              data-sort={sort?.key === 'name' ? sort.dir : undefined}
              onClick={() => toggleSort('name')}
            >
              <span className="lc-bh__head-label">Broadcast name</span>
              <BroadcastIcon name="chevron-down" className="lc-bh__sort-icon" />
            </button>
          </div>
          <div className="lc-bh__stats">
            {COLUMNS.map((col) => (
              <div className="lc-bh__cell--stat" key={col.key}>
                <button
                  type="button"
                  className="lc-bh__sort-btn"
                  data-sort={sort?.key === col.key ? sort.dir : undefined}
                  onClick={() => toggleSort(col.key)}
                >
                  <span className="lc-bh__head-label">{col.label}</span>
                  <BroadcastIcon name="chevron-down" className="lc-bh__sort-icon" />
                </button>
              </div>
            ))}
          </div>
          <div className="lc-bh__cell--actions" aria-hidden="true" />
        </div>

        {sortedBroadcasts.map((row) => (
          <div key={row.id} className="lc-bh__row lc-bh__row--body">
            <div className="lc-bh__cell--name lc-bh__cell">
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
              <div className="lc-bh__cell--stat">
                <span className="lc-bh__stat-primary">{row.sent}</span>
              </div>
              <div className="lc-bh__cell--stat">
                <span className="lc-bh__stat-primary">{row.delivery.primary}</span>
                {showRetry && row.delivery.secondary && (
                  <div className="lc-bh__stat-secondary">{row.delivery.secondary}</div>
                )}
              </div>
              <div className="lc-bh__cell--stat">
                <span className="lc-bh__stat-primary">{row.engagement}</span>
              </div>
              <div className="lc-bh__cell--stat">
                <span className="lc-bh__stat-primary">{row.dropoff}</span>
              </div>
              <div className="lc-bh__cell--stat">
                <span className="lc-bh__stat-primary">{row.revenue.primary}</span>
                {showRetry && row.revenue.secondary && (
                  <div className="lc-bh__stat-secondary">{row.revenue.secondary}</div>
                )}
              </div>
            </div>
            <div className="lc-bh__cell--actions">
              <Tooltip label="Download report">
                <button
                  type="button"
                  className="lc-bh__action-btn"
                  aria-label="Download report"
                  onClick={() => onRowDownload?.(row)}
                >
                  <BroadcastIcon name="download" />
                </button>
              </Tooltip>
              <Tooltip label="Copy broadcast">
                <button
                  type="button"
                  className="lc-bh__action-btn"
                  aria-label="Copy broadcast"
                  onClick={() => onRowCopy?.(row)}
                >
                  <BroadcastIcon name="copy" />
                </button>
              </Tooltip>
              <Tooltip label="Edit broadcast">
                <button
                  type="button"
                  className="lc-bh__action-btn"
                  aria-label="Edit broadcast"
                  onClick={() => onRowClick?.(row)}
                >
                  <BroadcastIcon name="edit" />
                </button>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>

      <div className="lc-bh__pagination">
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
