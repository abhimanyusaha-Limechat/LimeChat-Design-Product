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
import { useState, type ReactNode } from 'react';
import { Button } from '../Button';
import { CheckboxPill } from '../CheckboxPill';
import { NativeSelect } from '../Select';
import { Tooltip } from '../Tooltip';
import { ActionMenu, Menu } from '../Menu';
import { FlowIcon } from './icons';
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
function sortValue(row: FlowRowData, key: SortKey): SortValue {
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
  /** Shows skeleton rows in place of the list while its data loads. */
  loading?: boolean;
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
  loading = false,
}: FlowsHomePageProps) {
  const [percentage, setPercentage] = useState('percentage');
  const [timeframe, setTimeframe] = useState('this-week');
  const [showRetry, setShowRetry] = useState(true);

  const { sorted: sortedFlows, sort, toggle: toggleSort } = useTableSort(flows, sortValue);

  const pageNumbers = new Set<number>(
    [1, 2, 3, 4, 5, totalPages].filter((n) => n <= totalPages),
  );

  return (
    <div className="lc-fh">
      <div className="lc-fh__toolbar" data-anchor="flow-toolbar">
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
          <Menu
            ariaLabel="Report options"
            align="start"
            items={[
              { label: 'Flow report', icon: <FlowIcon name="download" />, onClick: () => onReport?.('flow-report') },
              { label: 'Error log', icon: <FlowIcon name="alert-triangle" />, onClick: () => onReport?.('error-log') },
            ]}
            trigger={({ ref, onClick }) => (
              <Button
                ref={ref}
                variant="default"
                color="gray"
                size="sm"
                leftSection={<FlowIcon name="download" />}
                onClick={onClick}
              >
                Report
              </Button>
            )}
          />
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

      <div className="lc-fh__nav-row" data-anchor="flow-tab-bar">
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
          <CheckboxPill checked={showRetry} onChange={setShowRetry} label="Show retry results" />
        </div>
      </div>

      <DataTable aria-busy={loading || undefined} aria-label="Flows" data-anchor="flow-table">
        <DataTableHead>
          <DataTableSortHeader
            className="lc-fh__cell--name lc-fh__cell"
            label="Flow name"
            sortKey="name"
            sort={sort}
            onSort={toggleSort}
          />
          <div className="lc-fh__stats">
            {COLUMNS.map((col) => (
              <DataTableSortHeader
                key={col.key}
                className="lc-fh__cell--stat"
                label={col.label}
                sortKey={col.key}
                sort={sort}
                onSort={toggleSort}
              />
            ))}
          </div>
          <div role="columnheader" className="lc-fh__cell--actions" aria-label="Actions" />
        </DataTableHead>

        {loading ? (
          <DataTableSkeleton>
            <div className="lc-fh__cell--name lc-fh__cell">
              <Skeleton lines={2} />
            </div>
            <div className="lc-fh__stats">
              {COLUMNS.map((col) => (
                <div key={col.key} className="lc-fh__cell--stat">
                  <Skeleton />
                </div>
              ))}
            </div>
            <div className="lc-fh__cell--actions" />
          </DataTableSkeleton>
        ) : sortedFlows.length === 0 ? (
          <DataTableEmpty>No flows found</DataTableEmpty>
        ) : (
          sortedFlows.map((row) => (
            <DataTableRow
              key={row.id}
              data-anchor="flow-row"
              data-anchor-key={row.id}
              onClick={onRowClick && (() => onRowClick(row))}
            >
              <div role="cell" className="lc-fh__cell--name lc-fh__cell">
                <div className="lc-fh__name-block">
                  <div className="lc-fh__name-line">
                    {row.displayId && <IdChip id={row.displayId} />}
                    <span className="lc-fh__name">{row.name}</span>
                  </div>
                  <span className="lc-fh__sent-on">Updated on : {row.updatedOn}</span>
                </div>
              </div>
              <div className="lc-fh__stats">
                <div role="cell" className="lc-fh__cell--stat">
                  <span className="lc-fh__stat-primary">{row.sent}</span>
                </div>
                <div role="cell" className="lc-fh__cell--stat">
                  <span className="lc-fh__stat-primary">{row.delivery.primary}</span>
                  {showRetry && row.delivery.secondary && (
                    <div className="lc-fh__stat-secondary">{row.delivery.secondary}</div>
                  )}
                </div>
                <div role="cell" className="lc-fh__cell--stat">
                  <span className="lc-fh__stat-primary">{row.engagement}</span>
                </div>
                <div role="cell" className="lc-fh__cell--stat">
                  <span className="lc-fh__stat-primary">{row.dropoff}</span>
                </div>
                <div role="cell" className="lc-fh__cell--stat">
                  <span className="lc-fh__stat-primary">{row.revenue.primary}</span>
                  {showRetry && row.revenue.secondary && (
                    <div className="lc-fh__stat-secondary">{row.revenue.secondary}</div>
                  )}
                </div>
              </div>
              {/* Menu clicks (portaled, but React-bubbled) must not also open the row. */}
              <div role="cell" className="lc-fh__cell--actions" onClick={(e) => e.stopPropagation()}>
                <ActionMenu
                  ariaLabel={`Actions for ${row.name}`}
                  icon={<FlowIcon name="dots-vertical" />}
                  items={[
                    { label: 'Edit', icon: <FlowIcon name="edit" />, onClick: () => onRowClick?.(row) },
                    { label: 'Copy flow', icon: <FlowIcon name="copy" />, onClick: () => onRowCopy?.(row) },
                    { label: 'Download report', icon: <FlowIcon name="download" />, onClick: () => onRowDownload?.(row) },
                  ]}
                />
              </div>
            </DataTableRow>
          ))
        )}
      </DataTable>

      <div className="lc-fh__pagination" data-anchor="flow-pagination">
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
