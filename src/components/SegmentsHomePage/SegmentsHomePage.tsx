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
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../Button';
import { Tooltip } from '../Tooltip';
import { SegmentIcon } from './icons';
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
  onClone,
  onDownload,
  onDelete,
}: {
  row: SegmentRowData;
  onClone?: (row: SegmentRowData) => void;
  onDownload?: (row: SegmentRowData) => void;
  onDelete?: (row: SegmentRowData) => void;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Rows animate in with a `transform`, which — even at rest — establishes a
  // stacking context per row. A menu positioned inside its own row can end up
  // painted behind a later row's stacking context despite z-index. Portalling
  // to <body> (like Tooltip already does) sidesteps that entirely.
  useLayoutEffect(() => {
    if (!open) return;
    const reposition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setCoords({ top: rect.bottom + 6, left: rect.right - 168 });
    };
    reposition();
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  return (
    <div className="lc-sg__menu-wrap">
      <Tooltip label="More actions" disabled={open}>
        <button
          ref={triggerRef}
          type="button"
          className="lc-sg__action-btn"
          aria-label="More actions"
          onClick={() => setOpen((o) => !o)}
        >
          <SegmentIcon name="dots-vertical" />
        </button>
      </Tooltip>
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            className="lc-sg__menu"
            role="menu"
            aria-label="Segment actions"
            style={coords ? { top: coords.top, left: coords.left } : { visibility: 'hidden' }}
          >
            <button
              type="button"
              role="menuitem"
              className="lc-sg__menu-item"
              onClick={() => {
                setOpen(false);
                onClone?.(row);
              }}
            >
              <SegmentIcon name="copy" className="lc-sg__menu-icon" />
              Clone
            </button>
            <button
              type="button"
              role="menuitem"
              className="lc-sg__menu-item"
              onClick={() => {
                setOpen(false);
                onDownload?.(row);
              }}
            >
              <SegmentIcon name="download" className="lc-sg__menu-icon" />
              Download
            </button>
            <button
              type="button"
              role="menuitem"
              className="lc-sg__menu-item lc-sg__menu-item--danger"
              onClick={() => {
                setOpen(false);
                onDelete?.(row);
              }}
            >
              <SegmentIcon name="trash" className="lc-sg__menu-icon" />
              Delete
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}

export interface SegmentsHomePageProps {
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
}: SegmentsHomePageProps) {
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);
  const toggleSort = () => setSortDir((d) => (d === null ? 'asc' : d === 'asc' ? 'desc' : null));

  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<number>();
  const handleTableScroll = () => {
    setIsScrolling(true);
    window.clearTimeout(scrollTimeout.current);
    scrollTimeout.current = window.setTimeout(() => setIsScrolling(false), 600);
  };

  const sortedSegments = (() => {
    if (!sortDir) return segments;
    const sorted = [...segments].sort((a, b) => a.name.localeCompare(b.name));
    return sortDir === 'asc' ? sorted : sorted.reverse();
  })();

  const pageNumbers = new Set<number>(
    [1, 2, 3, 4, 5, totalPages].filter((n) => n <= totalPages),
  );

  return (
    <div className="lc-sg">
      <div className="lc-sg__toolbar">
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

      <div className="lc-sg__nav-row">
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

      <div className="lc-sg__table" data-scrolling={isScrolling || undefined} onScroll={handleTableScroll}>
        <div className="lc-sg__row lc-sg__row--head">
          <div className="lc-sg__cell--name lc-sg__cell">
            <button
              type="button"
              className="lc-sg__sort-btn"
              data-sort={sortDir ?? undefined}
              onClick={toggleSort}
            >
              <span className="lc-sg__head-label">Segment</span>
              <SegmentIcon name="chevron-down" className="lc-sg__sort-icon" />
            </button>
          </div>
          <div className="lc-sg__cell--description lc-sg__cell">
            <span className="lc-sg__head-label">Description</span>
          </div>
          <div className="lc-sg__cell--size lc-sg__cell">
            <span className="lc-sg__head-label">Size</span>
          </div>
          <div className="lc-sg__cell--actions lc-sg__cell" aria-hidden="true" />
        </div>

        {sortedSegments.map((row) => (
          <div key={row.id} className="lc-sg__row lc-sg__row--body">
            <div className="lc-sg__cell--name lc-sg__cell">
              <div className="lc-sg__name-block">
                <span className="lc-sg__name">{row.name}</span>
                <span className="lc-sg__meta-line">Last edited: {row.lastEditedOn}</span>
              </div>
            </div>
            <div className="lc-sg__cell--description lc-sg__cell">
              {row.description ? (
                <span className="lc-sg__description">{row.description}</span>
              ) : (
                <span className="lc-sg__description lc-sg__description--empty">No description</span>
              )}
            </div>
            <div className="lc-sg__cell--size lc-sg__cell">
              <div className="lc-sg__size-block">
                <span className="lc-sg__size-line">
                  <span className="lc-sg__size-value">{formatSize(row.size)}</span>
                </span>
                <span className="lc-sg__meta-line">{row.sizeUpdatedOn}</span>
              </div>
            </div>
            <div className="lc-sg__cell--actions lc-sg__cell">
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
              <Tooltip label="Edit segment">
                <button
                  type="button"
                  className="lc-sg__action-btn"
                  aria-label="Edit segment"
                  onClick={() => onRowEdit?.(row)}
                >
                  <SegmentIcon name="edit" />
                </button>
              </Tooltip>
              <RowActions row={row} onClone={onRowClone} onDownload={onRowDownload} onDelete={onRowDelete} />
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="lc-sg__pagination">
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
