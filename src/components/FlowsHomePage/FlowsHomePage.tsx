/**
 * FlowsHomePage — duplicated from BroadcastHomePage (same layout, tokens, and
 * interaction patterns) for Marketing → Automation flows.
 *
 * The landing view: search + Report/New flow actions, status tabs
 * (Active / Inactive / Draft), a filter row, and a table of flow performance
 * stats with pagination.
 *
 *   <FlowsHomePage
 *     flows={rows}
 *     activeTab={tab}
 *     onTabChange={setTab}
 *     onNewFlow={() => setOpen(true)}
 *   />
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Button } from '../Button';
import { NativeSelect } from '../Select';
import { Tooltip } from '../Tooltip';
import { FlowIcon, type FlowIconName } from './icons';
import './FlowsHomePage.css';

export type FlowTab = 'active' | 'inactive' | 'draft';
export type FlowStatus = 'active' | 'inactive' | 'draft';

export interface FlowStat {
  primary: string;
  secondary?: string;
}

export interface FlowRowData {
  id: string;
  /** 5-digit flow ID shown as a copyable chip before the name. Omit for drafts. */
  displayId?: string;
  name: string;
  updatedOn: string;
  status: FlowStatus;
  sent: string;
  delivery: FlowStat;
  engagement: string;
  dropoff: string;
  revenue: FlowStat;
}

const TABS: { id: FlowTab; label: string }[] = [
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
  { id: 'draft', label: 'Draft' },
];

type SortKey = 'name' | 'sent' | 'delivery' | 'engagement' | 'dropoff' | 'revenue';

const COLUMNS: { label: string; key: SortKey }[] = [
  { label: 'Triggered', key: 'sent' },
  { label: 'Delivery', key: 'delivery' },
  { label: 'Engagement', key: 'engagement' },
  { label: 'Dropoff', key: 'dropoff' },
  { label: 'Revenue', key: 'revenue' },
];

/** Pulls a comparable number out of formatted strings like "$38,940" or "97.1%". */
function sortValue(row: FlowRowData, key: SortKey): number | string {
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
    <label className="lc-fh__switch" data-checked={checked || undefined}>
      <input
        type="checkbox"
        className="lc-fh__switch-input"
        checked={checked}
        onChange={(e) => onChange(e.currentTarget.checked)}
      />
      <span className="lc-fh__switch-box" aria-hidden="true">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8.5l3 3l7-7" />
        </svg>
      </span>
      <span className="lc-fh__switch-label">{label}</span>
    </label>
  );
}

function IdChip({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Tooltip label={copied ? 'Copied!' : `Copy ID ${id}`}>
      <button
        type="button"
        className="lc-fh__id-chip"
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

export interface FlowsHomePageProps {
  flows: FlowRowData[];
  activeTab?: FlowTab;
  onTabChange?: (tab: FlowTab) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onReport?: (type: 'flow-report' | 'error-log') => void;
  onNewFlow?: () => void;
  onRowClick?: (row: FlowRowData) => void;
  onRowDownload?: (row: FlowRowData) => void;
  onRowCopy?: (row: FlowRowData) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function FlowsHomePage({
  flows,
  activeTab = 'active',
  onTabChange,
  searchValue,
  onSearchChange,
  onReport,
  onNewFlow,
  onRowClick,
  onRowDownload,
  onRowCopy,
  page = 1,
  totalPages = 10,
  onPageChange,
}: FlowsHomePageProps) {
  const [percentage, setPercentage] = useState('percentage');
  const [timeframe, setTimeframe] = useState('this-week');
  const [showRetry, setShowRetry] = useState(true);

  const [reportMenuOpen, setReportMenuOpen] = useState(false);
  const reportMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!reportMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!reportMenuRef.current?.contains(e.target as Node)) setReportMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [reportMenuOpen]);

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
  const sortedFlows = useMemo(() => {
    if (!sort) return flows;
    const { key, dir } = sort;
    return [...flows].sort((a, b) => {
      const av = sortValue(a, key);
      const bv = sortValue(b, key);
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return dir === 'asc' ? cmp : -cmp;
    });
  }, [flows, sort]);

  const pageNumbers = new Set<number>(
    [1, 2, 3, 4, 5, totalPages].filter((n) => n <= totalPages),
  );

  return (
    <div className="lc-fh">
      <div className="lc-fh__toolbar">
        <div className="lc-fh__search">
          <FlowIcon name="search" className="lc-fh__search-icon" />
          <input
            className="lc-fh__search-input"
            type="text"
            placeholder="Search for flow"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.currentTarget.value)}
          />
        </div>
        <div className="lc-fh__actions">
          <div className="lc-fh__report-wrap" ref={reportMenuRef}>
            <Button
              variant="default"
              color="gray"
              size="sm"
              leftSection={<FlowIcon name="download" />}
              onClick={() => setReportMenuOpen((o) => !o)}
            >
              Report
            </Button>
            {reportMenuOpen && (
              <div className="lc-fh__report-menu" role="menu" aria-label="Report options">
                <button
                  type="button"
                  role="menuitem"
                  className="lc-fh__report-menu-item"
                  onClick={() => {
                    setReportMenuOpen(false);
                    onReport?.('flow-report');
                  }}
                >
                  <FlowIcon name="download" className="lc-fh__report-menu-icon" />
                  Flow report
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="lc-fh__report-menu-item"
                  onClick={() => {
                    setReportMenuOpen(false);
                    onReport?.('error-log');
                  }}
                >
                  <FlowIcon name="alert-triangle" className="lc-fh__report-menu-icon" />
                  Error log
                </button>
              </div>
            )}
          </div>
          <Button
            variant="filled"
            color="primary"
            size="sm"
            leftSection={<FlowIcon name="plus" />}
            onClick={onNewFlow}
          >
            Flow
          </Button>
        </div>
      </div>

      <div className="lc-fh__nav-row">
        <div className="lc-fh__tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              className="lc-fh__tab"
              data-active={tab.id === activeTab || undefined}
              aria-selected={tab.id === activeTab}
              onClick={() => onTabChange?.(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="lc-fh__filters">
          <div className="lc-fh__filters-group">
            <span className="lc-fh__filters-label">Apply filters</span>
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

      <div className="lc-fh__table" data-scrolling={isScrolling || undefined} onScroll={handleTableScroll}>
        <div className="lc-fh__row lc-fh__row--head">
          <div className="lc-fh__cell--name lc-fh__cell">
            <button
              type="button"
              className="lc-fh__sort-btn"
              data-sort={sort?.key === 'name' ? sort.dir : undefined}
              onClick={() => toggleSort('name')}
            >
              <span className="lc-fh__head-label">Flow name</span>
              <FlowIcon name="chevron-down" className="lc-fh__sort-icon" />
            </button>
          </div>
          <div className="lc-fh__stats">
            {COLUMNS.map((col) => (
              <div className="lc-fh__cell--stat" key={col.key}>
                <button
                  type="button"
                  className="lc-fh__sort-btn"
                  data-sort={sort?.key === col.key ? sort.dir : undefined}
                  onClick={() => toggleSort(col.key)}
                >
                  <span className="lc-fh__head-label">{col.label}</span>
                  <FlowIcon name="chevron-down" className="lc-fh__sort-icon" />
                </button>
              </div>
            ))}
          </div>
          <div className="lc-fh__cell--actions" aria-hidden="true" />
        </div>

        {sortedFlows.map((row) => (
          <div key={row.id} className="lc-fh__row lc-fh__row--body">
            <div className="lc-fh__cell--name lc-fh__cell">
              <div className="lc-fh__name-block">
                <div className="lc-fh__name-line">
                  {row.displayId && <IdChip id={row.displayId} />}
                  <span className="lc-fh__name">{row.name}</span>
                </div>
                <span className="lc-fh__sent-on">Updated on : {row.updatedOn}</span>
              </div>
            </div>
            <div className="lc-fh__stats">
              <div className="lc-fh__cell--stat">
                <span className="lc-fh__stat-primary">{row.sent}</span>
              </div>
              <div className="lc-fh__cell--stat">
                <span className="lc-fh__stat-primary">{row.delivery.primary}</span>
                {showRetry && row.delivery.secondary && (
                  <div className="lc-fh__stat-secondary">{row.delivery.secondary}</div>
                )}
              </div>
              <div className="lc-fh__cell--stat">
                <span className="lc-fh__stat-primary">{row.engagement}</span>
              </div>
              <div className="lc-fh__cell--stat">
                <span className="lc-fh__stat-primary">{row.dropoff}</span>
              </div>
              <div className="lc-fh__cell--stat">
                <span className="lc-fh__stat-primary">{row.revenue.primary}</span>
                {showRetry && row.revenue.secondary && (
                  <div className="lc-fh__stat-secondary">{row.revenue.secondary}</div>
                )}
              </div>
            </div>
            <div className="lc-fh__cell--actions">
              <button
                type="button"
                className="lc-fh__action-btn"
                aria-label="Download report"
                onClick={() => onRowDownload?.(row)}
              >
                <FlowIcon name="download" />
              </button>
              <button
                type="button"
                className="lc-fh__action-btn"
                aria-label="Copy flow"
                onClick={() => onRowCopy?.(row)}
              >
                <FlowIcon name="copy" />
              </button>
              <button
                type="button"
                className="lc-fh__action-btn"
                aria-label="Edit flow"
                onClick={() => onRowClick?.(row)}
              >
                <FlowIcon name="edit" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="lc-fh__pagination">
        {Array.from(pageNumbers)
          .sort((a, b) => a - b)
          .flatMap((n, i, arr) => {
            const nodes: ReactNode[] = [];
            const prev = arr[i - 1];
            if (prev != null && n - prev > 1) {
              nodes.push(
                <span key={`ellipsis-${n}`} className="lc-fh__page-item" data-ellipsis="true">
                  <FlowIcon name="dots" style={{ width: 14, height: 14 }} />
                </span>,
              );
            }
            nodes.push(
              <button
                key={n}
                type="button"
                className="lc-fh__page-item"
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

export default FlowsHomePage;
