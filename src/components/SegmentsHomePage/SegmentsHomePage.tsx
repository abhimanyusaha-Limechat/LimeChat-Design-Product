/**
 * SegmentsHomePage — Campaigns → Segments landing view: search + Playbook /
 * Create Segment actions, source tabs (LC Segments / Imported), and a table
 * of segments with live size + last-edited metadata.
 *
 *   <SegmentsHomePage
 *     segments={rows}
 *     activeTab={tab}
 *     onTabChange={setTab}
 *     onCreateSegment={() => setOpen(true)}
 *   />
 */
import { type ReactNode } from 'react';
import { Button } from '../Button';
import { Tooltip } from '../Tooltip';
import { ActionMenu } from '../Menu';
import { SegmentIcon } from './icons';
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
import './SegmentsHomePage.css';

export type SegmentSourceTab = 'lc-segments' | 'imported';

export interface SegmentRowData {
  id: string;
  name: string;
  /** e.g. "04:37 PM, 19 April 2025" — shown as "Last edited: …". */
  lastEditedOn: string;
  /** Omit (or leave empty) to show the "No description" placeholder. */
  description?: string;
  size: number;
  /** e.g. "03 August 2026" — when the size was last recomputed. */
  sizeUpdatedOn: string;
}

const TABS: { id: SegmentSourceTab; label: string }[] = [
  { id: 'lc-segments', label: 'LC Segments' },
  { id: 'imported', label: 'Imported' },
];

function formatSize(size: number) {
  return size.toLocaleString('en-US');
}

function RowActions({
  row,
  onEdit,
  onClone,
  onDownload,
  onDelete,
}: {
  row: SegmentRowData;
  onEdit?: (row: SegmentRowData) => void;
  onClone?: (row: SegmentRowData) => void;
  onDownload?: (row: SegmentRowData) => void;
  onDelete?: (row: SegmentRowData) => void;
}) {
  return (
    <ActionMenu
      ariaLabel="Segment actions"
      icon={<SegmentIcon name="dots-vertical" />}
      items={[
        { label: 'Edit', icon: <SegmentIcon name="edit" />, onClick: () => onEdit?.(row) },
        { label: 'Clone', icon: <SegmentIcon name="copy" />, onClick: () => onClone?.(row) },
        { label: 'Download', icon: <SegmentIcon name="download" />, onClick: () => onDownload?.(row) },
        { label: 'Delete', icon: <SegmentIcon name="trash" />, danger: true, onClick: () => onDelete?.(row) },
      ]}
    />
  );
}

export interface SegmentsHomePageProps {
  /** Shows skeleton rows in place of the list while its data loads. */
  loading?: boolean;
  segments: SegmentRowData[];
  activeTab?: SegmentSourceTab;
  onTabChange?: (tab: SegmentSourceTab) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onCreateSegment?: () => void;
  onRowEdit?: (row: SegmentRowData) => void;
  onRowClone?: (row: SegmentRowData) => void;
  onRowDownload?: (row: SegmentRowData) => void;
  onRowDelete?: (row: SegmentRowData) => void;
  onRowRefresh?: (row: SegmentRowData) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function SegmentsHomePage({
  segments,
  activeTab = 'lc-segments',
  onTabChange,
  searchValue,
  onSearchChange,
  onCreateSegment,
  onRowEdit,
  onRowClone,
  onRowDownload,
  onRowDelete,
  onRowRefresh,
  page = 1,
  totalPages = 1,
  onPageChange,
  loading = false,
}: SegmentsHomePageProps) {
  const { sorted: sortedSegments, sort, toggle: toggleSort } = useTableSort(
    segments,
    (row, key: 'name' | 'description' | 'size') => row[key],
  );

  const pageNumbers = new Set<number>(
    [1, 2, 3, 4, 5, totalPages].filter((n) => n <= totalPages),
  );

  return (
    <div className="lc-sg">
      <div className="lc-sg__toolbar" data-anchor="segment-toolbar">
        <div className="lc-sg__search">
          <SegmentIcon name="search" className="lc-sg__search-icon" />
          <input
            className="lc-sg__search-input"
            type="text"
            placeholder="Search by segment ID or name"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.currentTarget.value)}
          />
        </div>
        <div className="lc-sg__actions">
          <Button
            variant="filled"
            color="primary"
            size="sm"
            leftSection={<SegmentIcon name="plus" />}
            onClick={onCreateSegment}
          >
            Segments
          </Button>
        </div>
      </div>

      <div className="lc-sg__nav-row" data-anchor="segment-tab-bar">
        <div className="lc-sg__tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              className="lc-sg__tab"
              data-active={tab.id === activeTab || undefined}
              aria-selected={tab.id === activeTab}
              onClick={() => onTabChange?.(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <DataTable aria-busy={loading || undefined} aria-label="Segments" data-anchor="segment-table">
        <DataTableHead className="lc-sg__row--head">
          <DataTableSortHeader className="lc-sg__cell--name lc-sg__cell" label="Segment" sortKey="name" sort={sort} onSort={toggleSort} />
          <DataTableSortHeader className="lc-sg__cell--description lc-sg__cell" label="Description" sortKey="description" sort={sort} onSort={toggleSort} />
          <DataTableSortHeader className="lc-sg__cell--size lc-sg__cell" label="Size" sortKey="size" sort={sort} onSort={toggleSort} />
          <div role="columnheader" className="lc-sg__cell--actions lc-sg__cell" aria-label="Actions" />
        </DataTableHead>

        {loading ? (
          <DataTableSkeleton>
            <div className="lc-sg__cell--name lc-sg__cell">
              <Skeleton lines={2} />
            </div>
            <div className="lc-sg__cell--description lc-sg__cell">
              <Skeleton />
            </div>
            <div className="lc-sg__cell--size lc-sg__cell">
              <Skeleton lines={2} />
            </div>
            <div className="lc-sg__cell--actions lc-sg__cell" />
          </DataTableSkeleton>
        ) : sortedSegments.length === 0 ? (
          <DataTableEmpty>No segments found</DataTableEmpty>
        ) : (
          sortedSegments.map((row) => (
            <DataTableRow key={row.id} data-anchor="segment-row" data-anchor-key={row.id}>
              <div role="cell" className="lc-sg__cell--name lc-sg__cell">
                <div className="lc-sg__name-block">
                  <span className="lc-sg__name">{row.name}</span>
                  <span className="lc-sg__meta-line">Last edited: {row.lastEditedOn}</span>
                </div>
              </div>
              <div role="cell" className="lc-sg__cell--description lc-sg__cell">
                {row.description ? (
                  <span className="lc-sg__description">{row.description}</span>
                ) : (
                  <span className="lc-sg__description lc-sg__description--empty">No description</span>
                )}
              </div>
              <div role="cell" className="lc-sg__cell--size lc-sg__cell">
                <div className="lc-sg__size-block">
                  <span className="lc-sg__size-line">
                    <span className="lc-sg__size-value">{formatSize(row.size)}</span>
                  </span>
                  <span className="lc-sg__meta-line">{row.sizeUpdatedOn}</span>
                </div>
              </div>
              <div role="cell" className="lc-sg__cell--actions lc-sg__cell">
                <Tooltip label="Refresh segment">
                  <button
                    type="button"
                    className="lc-sg__action-btn"
                    aria-label="Refresh segment"
                    onClick={() => onRowRefresh?.(row)}
                  >
                    <SegmentIcon name="refresh" />
                  </button>
                </Tooltip>
                <RowActions row={row} onEdit={onRowEdit} onClone={onRowClone} onDownload={onRowDownload} onDelete={onRowDelete} />
              </div>
            </DataTableRow>
          ))
        )}
      </DataTable>

      {totalPages > 1 && (
        <div className="lc-sg__pagination" data-anchor="segment-pagination">
          {Array.from(pageNumbers)
            .sort((a, b) => a - b)
            .flatMap((n, i, arr) => {
              const nodes: ReactNode[] = [];
              const prev = arr[i - 1];
              if (prev != null && n - prev > 1) {
                nodes.push(
                  <span key={`ellipsis-${n}`} className="lc-sg__page-item" data-ellipsis="true">
                    <SegmentIcon name="dots" style={{ width: 14, height: 14 }} />
                  </span>,
                );
              }
              nodes.push(
                <button
                  key={n}
                  type="button"
                  className="lc-sg__page-item"
                  data-active={n === page || undefined}
                  onClick={() => onPageChange?.(n)}
                >
                  {n}
                </button>,
              );
              return nodes;
            })}
        </div>
      )}
    </div>
  );
}

export default SegmentsHomePage;
