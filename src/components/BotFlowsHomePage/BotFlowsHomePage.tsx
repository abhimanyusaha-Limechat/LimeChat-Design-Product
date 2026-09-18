/**
 * BotFlowsHomePage — Automation → Flows landing view: search + New flow
 * action, status tabs (Active / Inactive), and a table of bot flows with
 * node count + last-edited metadata.
 *
 * Copied from SegmentsHomePage (same layout, tokens, and interaction
 * patterns) for Automation's "Flows" nav item — rows open the flow-builder
 * canvas instead of a segment editor.
 *
 *   <BotFlowsHomePage
 *     flows={rows}
 *     activeTab={tab}
 *     onTabChange={setTab}
 *     onNewFlow={() => setOpen(true)}
 *     onRowClick={openFlowInEditor}
 *   />
 */
import { useRef, useState, type ReactNode } from 'react';
import { Button } from '../Button';
import { Tooltip } from '../Tooltip';
import { ActionMenu } from '../Menu';
import { BotFlowIcon } from './icons';
import './BotFlowsHomePage.css';

export type BotFlowTab = 'active' | 'inactive';
export type BotFlowStatus = 'active' | 'inactive';

export interface BotFlowRowData {
  id: string;
  name: string;
  /** e.g. "04:37 PM, 19 April 2025" — shown as "Last edited: …". */
  updatedOn: string;
  /** Omit (or leave empty) to show the "No description" placeholder. */
  description?: string;
  status: BotFlowStatus;
  /** Node count shown under the flow name, e.g. 12. */
  nodeCount: number;
}

const TABS: { id: BotFlowTab; label: string }[] = [
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
];

function RowActions({
  row,
  onClone,
  onDownload,
  onDelete,
}: {
  row: BotFlowRowData;
  onClone?: (row: BotFlowRowData) => void;
  onDownload?: (row: BotFlowRowData) => void;
  onDelete?: (row: BotFlowRowData) => void;
}) {
  return (
    <ActionMenu
      ariaLabel="Flow actions"
      icon={<BotFlowIcon name="dots-vertical" />}
      items={[
        { label: 'Clone', icon: <BotFlowIcon name="copy" />, onClick: () => onClone?.(row) },
        { label: 'Download', icon: <BotFlowIcon name="download" />, onClick: () => onDownload?.(row) },
        { label: 'Delete', icon: <BotFlowIcon name="trash" />, danger: true, onClick: () => onDelete?.(row) },
      ]}
    />
  );
}

export interface BotFlowsHomePageProps {
  flows: BotFlowRowData[];
  activeTab?: BotFlowTab;
  onTabChange?: (tab: BotFlowTab) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onNewFlow?: () => void;
  /** Fired by the row's toggle switch — flips the flow between active/inactive. */
  onRowToggleActive?: (row: BotFlowRowData) => void;
  /** Fired by the row's edit icon — opens the flow in the canvas editor. */
  onRowClick?: (row: BotFlowRowData) => void;
  onRowClone?: (row: BotFlowRowData) => void;
  onRowDownload?: (row: BotFlowRowData) => void;
  onRowDelete?: (row: BotFlowRowData) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function BotFlowsHomePage({
  flows,
  activeTab = 'active',
  onTabChange,
  searchValue,
  onSearchChange,
  onNewFlow,
  onRowToggleActive,
  onRowClick,
  onRowClone,
  onRowDownload,
  onRowDelete,
  page = 1,
  totalPages = 1,
  onPageChange,
}: BotFlowsHomePageProps) {
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);
  const toggleSort = () => setSortDir((d) => (d === null ? 'asc' : d === 'asc' ? 'desc' : null));

  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<number>();
  const handleTableScroll = () => {
    setIsScrolling(true);
    window.clearTimeout(scrollTimeout.current);
    scrollTimeout.current = window.setTimeout(() => setIsScrolling(false), 600);
  };

  const sortedFlows = (() => {
    if (!sortDir) return flows;
    const sorted = [...flows].sort((a, b) => a.name.localeCompare(b.name));
    return sortDir === 'asc' ? sorted : sorted.reverse();
  })();

  const pageNumbers = new Set<number>(
    [1, 2, 3, 4, 5, totalPages].filter((n) => n <= totalPages),
  );

  return (
    <div className="lc-bf">
      <div className="lc-bf__toolbar">
        <div className="lc-bf__search">
          <BotFlowIcon name="search" className="lc-bf__search-icon" />
          <input
            className="lc-bf__search-input"
            type="text"
            placeholder="Search for flow"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.currentTarget.value)}
          />
        </div>
        <div className="lc-bf__actions">
          <Button
            variant="filled"
            color="primary"
            size="sm"
            leftSection={<BotFlowIcon name="plus" />}
            onClick={onNewFlow}
          >
            Flow
          </Button>
        </div>
      </div>

      <div className="lc-bf__nav-row">
        <div className="lc-bf__tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              className="lc-bf__tab"
              data-active={tab.id === activeTab || undefined}
              aria-selected={tab.id === activeTab}
              onClick={() => onTabChange?.(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="lc-bf__table" data-scrolling={isScrolling || undefined} onScroll={handleTableScroll}>
        <div className="lc-bf__row lc-bf__row--head">
          <div className="lc-bf__cell--name lc-bf__cell">
            <button
              type="button"
              className="lc-bf__sort-btn"
              data-sort={sortDir ?? undefined}
              onClick={toggleSort}
            >
              <span className="lc-bf__head-label">Flow</span>
              <BotFlowIcon name="chevron-down" className="lc-bf__sort-icon" />
            </button>
          </div>
          <div className="lc-bf__cell--description lc-bf__cell">
            <span className="lc-bf__head-label">Description</span>
          </div>
          <div className="lc-bf__cell--actions lc-bf__cell" aria-hidden="true" />
        </div>

        {sortedFlows.map((row) => (
          <div key={row.id} className="lc-bf__row lc-bf__row--body">
            <div className="lc-bf__cell--name lc-bf__cell">
              <div className="lc-bf__name-block">
                <span className="lc-bf__name">{row.name}</span>
                <span className="lc-bf__meta-line">
                  Last edited: {row.updatedOn} · {row.nodeCount} nodes
                </span>
              </div>
            </div>
            <div className="lc-bf__cell--description lc-bf__cell">
              {row.description ? (
                <span className="lc-bf__description">{row.description}</span>
              ) : (
                <span className="lc-bf__description lc-bf__description--empty">No description</span>
              )}
            </div>
            <div className="lc-bf__cell--actions lc-bf__cell">
              <Tooltip label={row.status === 'active' ? 'Deactivate flow' : 'Activate flow'}>
                <button
                  type="button"
                  role="switch"
                  aria-checked={row.status === 'active'}
                  aria-label={row.status === 'active' ? 'Deactivate flow' : 'Activate flow'}
                  className="lc-bf__toggle"
                  data-checked={row.status === 'active' || undefined}
                  onClick={() => onRowToggleActive?.(row)}
                >
                  <span className="lc-bf__toggle-thumb" aria-hidden="true" />
                </button>
              </Tooltip>
              <Tooltip label="Edit flow">
                <button
                  type="button"
                  className="lc-bf__action-btn"
                  aria-label="Edit flow"
                  onClick={() => onRowClick?.(row)}
                >
                  <BotFlowIcon name="edit" />
                </button>
              </Tooltip>
              <RowActions row={row} onClone={onRowClone} onDownload={onRowDownload} onDelete={onRowDelete} />
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="lc-bf__pagination">
          {Array.from(pageNumbers)
            .sort((a, b) => a - b)
            .flatMap((n, i, arr) => {
              const nodes: ReactNode[] = [];
              const prev = arr[i - 1];
              if (prev != null && n - prev > 1) {
                nodes.push(
                  <span key={`ellipsis-${n}`} className="lc-bf__page-item" data-ellipsis="true">
                    <BotFlowIcon name="dots" style={{ width: 14, height: 14 }} />
                  </span>,
                );
              }
              nodes.push(
                <button
                  key={n}
                  type="button"
                  className="lc-bf__page-item"
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

export default BotFlowsHomePage;
