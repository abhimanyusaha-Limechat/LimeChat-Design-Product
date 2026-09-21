/**
 * TicketsSection — LimeChat design system (Figma node 8977:4521's
 * `tickets_section` list wrapper), the left-hand column of the Helpdesk
 * Tickets page: title + status dropdown, search + filters, Mine/Queued/All
 * tabs, and a sort row. Renders `<TicketListItem />` rows as `children`.
 *
 *   <TicketsSection
 *     status="Open" onStatusClick={() => {}}
 *     searchValue={q} onSearchChange={setQ}
 *     tabs={[{ id: 'mine', label: 'Mine' }, { id: 'queued', label: 'Queued' }, { id: 'all', label: 'All' }]}
 *     activeTab={tab} onTabChange={setTab}
 *   >
 *     {tickets.map((t) => <TicketListItem key={t.id} {...t} />)}
 *   </TicketsSection>
 */
import { forwardRef, useCallback, useEffect, useId, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { Button } from '../Button';
import { Menu } from '../Menu';
import './TicketsSection.css';

/**
 * Tracks `listRef`'s scroll position into a thumb top/height (in px) and drives a
 * lightweight, fully custom scrollbar — a stand-in for the native one that:
 *  - never reserves layout width (so rows stay full-bleed to the edge)
 *  - stays visible for as long as the pointer rests over the list, not just a
 *    fixed timeout (scrolling and hovering are tracked independently)
 *  - is itself draggable, like a real scrollbar thumb, not purely decorative
 */
function useScrollThumb() {
  const listRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ top: number; height: number } | null>(null);
  const [visible, setVisible] = useState(false);
  const [dragging, setDragging] = useState(false);
  const hovering = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const dragState = useRef<{ startY: number; startScrollTop: number } | null>(null);

  const update = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight) {
      setThumb(null);
      return;
    }
    const height = Math.max(28, (clientHeight / scrollHeight) * clientHeight);
    const top = (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - height);
    setThumb({ top, height });
  }, []);

  const scheduleHide = useCallback(() => {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!hovering.current && !dragState.current) setVisible(false);
    }, 600);
  }, []);

  const onScroll = useCallback(() => {
    update();
    setVisible(true);
    scheduleHide();
  }, [update, scheduleHide]);

  const onMouseEnter = useCallback(() => {
    hovering.current = true;
    clearTimeout(hideTimer.current);
    setVisible(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    hovering.current = false;
    scheduleHide();
  }, [scheduleHide]);

  const onThumbPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = listRef.current;
    if (!el) return;
    e.preventDefault();
    (e.target as HTMLDivElement).setPointerCapture(e.pointerId);
    dragState.current = { startY: e.clientY, startScrollTop: el.scrollTop };
    setDragging(true);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => {
      const el = listRef.current;
      const drag = dragState.current;
      if (!el || !drag) return;
      const { scrollHeight, clientHeight } = el;
      const trackable = clientHeight - Math.max(28, (clientHeight / scrollHeight) * clientHeight);
      if (trackable <= 0) return;
      const deltaY = e.clientY - drag.startY;
      const deltaScroll = (deltaY / trackable) * (scrollHeight - clientHeight);
      el.scrollTop = drag.startScrollTop + deltaScroll;
    };
    const onUp = () => {
      dragState.current = null;
      setDragging(false);
      if (!hovering.current) scheduleHide();
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragging, scheduleHide]);

  useEffect(() => {
    update();
    const el = listRef.current;
    if (!el) return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [update]);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  return { listRef, thumb, visible: visible || dragging, dragging, onScroll, onMouseEnter, onMouseLeave, onThumbPointerDown };
}

function iconProps() {
  return {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
}

const ChevronDownIcon = () => (
  <svg {...iconProps()}>
    <path d="M6 9l6 6l6 -6" />
  </svg>
);
const SearchIcon = () => (
  <svg {...iconProps()}>
    <circle cx="10" cy="10" r="7" />
    <path d="M21 21l-6 -6" />
  </svg>
);
const FilterIcon = () => (
  <svg {...iconProps()}>
    <path d="M4 6h16" />
    <path d="M7 12h10" />
    <path d="M10 18h4" />
  </svg>
);
const TagIcon = () => (
  <svg {...iconProps()}>
    <path d="M7.859 6h-2.834a2.025 2.025 0 0 0 -2.025 2.025v2.834c0 .537 .213 1.052 .593 1.432l8.293 8.293a2.025 2.025 0 0 0 2.864 0l4.575 -4.575a2.025 2.025 0 0 0 0 -2.864l-8.293 -8.293a2.025 2.025 0 0 0 -1.432 -.593z" />
    <path d="M11 10h.01" />
  </svg>
);
const SortIcon = () => (
  <svg {...iconProps()}>
    <path d="M3 9l4 -4l4 4" />
    <path d="M7 5l0 14" />
    <path d="M21 15l-4 4l-4 -4" />
    <path d="M17 19l0 -14" />
  </svg>
);
const CheckIcon = () => (
  <svg {...iconProps()}>
    <path d="M5 12l5 5l10 -10" />
  </svg>
);

export const TICKETS_SORT_OPTIONS = [
  'Newly created',
  'Oldest created',
  'Newest activity',
  'Oldest activity',
] as const;

export type TicketsSortOption = (typeof TICKETS_SORT_OPTIONS)[number];

export interface TicketsSectionTab {
  id: string;
  label: string;
}

export interface TicketsSectionProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  status?: string;
  onStatusClick?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onFilterClick?: () => void;
  onTagsClick?: () => void;
  dateRangeLabel?: string;
  onDateRangeClick?: () => void;
  inboxLabel?: string;
  onInboxClick?: () => void;
  tabs?: TicketsSectionTab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  sortLabel?: string;
  onSortClick?: () => void;
  sortOptions?: readonly string[];
  onSortChange?: (option: string) => void;
  children?: ReactNode;
  /** Renders a secondary "Load more" CTA below the last row when set. */
  onLoadMore?: () => void;
  loadMoreLabel?: string;
  loadMoreLoading?: boolean;
}

export const TicketsSection = forwardRef<HTMLDivElement, TicketsSectionProps>(function TicketsSection(
  {
    title = 'Tickets',
    status,
    onStatusClick,
    searchValue,
    onSearchChange,
    onFilterClick,
    onTagsClick,
    dateRangeLabel,
    onDateRangeClick,
    inboxLabel,
    onInboxClick,
    tabs,
    activeTab,
    onTabChange,
    sortLabel,
    onSortClick,
    sortOptions = TICKETS_SORT_OPTIONS,
    onSortChange,
    children,
    onLoadMore,
    loadMoreLabel = 'Load more tickets',
    loadMoreLoading = false,
    className,
    ...rest
  },
  ref,
) {
  const { listRef, thumb, visible, dragging, onScroll, onMouseEnter, onMouseLeave, onThumbPointerDown } =
    useScrollThumb();
  const listId = useId();

  return (
    <div {...rest} ref={ref} className={`lc-tickets-section${className ? ` ${className}` : ''}`}>
      <div className="lc-tickets-section__header-filters">
        <div className="lc-tickets-section__header">
          <span className="lc-tickets-section__title">{title}</span>
          {status && (
            <button type="button" className="lc-tickets-section__status" onClick={onStatusClick}>
              {status}
              <ChevronDownIcon />
            </button>
          )}
        </div>

        <div className="lc-tickets-section__search-row">
          <div className="lc-tickets-section__search">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search in Tickets"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.currentTarget.value)}
            />
          </div>
          <button type="button" className="lc-tickets-section__icon-btn" aria-label="Filter" onClick={onFilterClick}>
            <FilterIcon />
          </button>
          <button type="button" className="lc-tickets-section__icon-btn" aria-label="Tags" onClick={onTagsClick}>
            <TagIcon />
          </button>
        </div>

        {(dateRangeLabel || inboxLabel) && (
          <div className="lc-tickets-section__filters-row">
            {dateRangeLabel && (
              <button type="button" className="lc-tickets-section__filter-select" onClick={onDateRangeClick}>
                <span>{dateRangeLabel}</span>
                <ChevronDownIcon />
              </button>
            )}
            {inboxLabel && (
              <button type="button" className="lc-tickets-section__filter-select" onClick={onInboxClick}>
                <span>{inboxLabel}</span>
                <ChevronDownIcon />
              </button>
            )}
          </div>
        )}
      </div>

      {tabs && tabs.length > 0 && (
        <div className="lc-tickets-section__tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className="lc-tickets-section__tab"
              data-active={activeTab === tab.id || undefined}
              onClick={() => onTabChange?.(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {sortLabel && (
        <Menu
          ariaLabel="Sort tickets by"
          align="start"
          width={200}
          items={sortOptions.map((option) => ({
            key: option,
            label: option,
            selected: option === sortLabel,
            trailingIcon: option === sortLabel ? <CheckIcon /> : undefined,
            onClick: () => {
              onSortChange?.(option);
              onSortClick?.();
            },
          }))}
          trigger={({ ref, onClick }) => (
            <button ref={ref} type="button" className="lc-tickets-section__sort" onClick={onClick}>
              <span className="lc-tickets-section__sort-label">
                Sorted by: <span className="lc-tickets-section__sort-value">{sortLabel}</span>
              </span>
              <SortIcon />
            </button>
          )}
        />
      )}

      <div className="lc-tickets-section__list-wrap" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <div id={listId} className="lc-tickets-section__list" ref={listRef} onScroll={onScroll}>
          {children}
          {onLoadMore && (
            <div className="lc-tickets-section__load-more">
              <Button variant="outline" color="primary" size="sm" onClick={onLoadMore} disabled={loadMoreLoading}>
                {loadMoreLoading ? 'Loading…' : loadMoreLabel}
              </Button>
            </div>
          )}
        </div>
        {thumb && (
          <div
            className="lc-tickets-section__scroll-thumb"
            data-visible={visible || undefined}
            data-dragging={dragging || undefined}
            style={{ top: thumb.top, height: thumb.height }}
            onPointerDown={onThumbPointerDown}
            role="scrollbar"
            aria-orientation="vertical"
            aria-controls={listId}
          />
        )}
      </div>
    </div>
  );
});

export default TicketsSection;
