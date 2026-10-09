/**
 * DataTable — the shared list/table shell used by every product's home pages
 * (Templates, Flows, Broadcasts, Segments, Bot Flows, Inboxes, Bot Templates).
 *
 * It owns only the frame: the scroll container (scrollbar fades in while
 * scrolling), the sticky 44px header row and the 60px body rows (hover,
 * divider, entry stagger). Cells and column widths stay with each product.
 *
 *   <DataTable aria-label="Templates">
 *     <DataTableHead>…cells with role="columnheader"</DataTableHead>
 *     {rows.length === 0 ? (
 *       <DataTableEmpty>No templates found</DataTableEmpty>
 *     ) : (
 *       rows.map((r) => <DataTableRow key={r.id}>…cells with role="cell"</DataTableRow>)
 *     )}
 *   </DataTable>
 *
 * It exposes ARIA table semantics (table / row); the product's cells carry
 * role="columnheader" / role="cell" so screen readers can navigate by column.
 * `variant="cards"` (opt-in) swaps the filled header and row dividers for a quiet label row over
 * soft card rows; see the comment on `TableProps`. Every part forwards extra div props
 * (className, data-*), so a product can keep its own class for cell-level styling and status variants.
 *
 * Sorting: `useTableSort` holds the sort state and returns sorted rows;
 * `DataTableSortHeader` is the clickable column header that drives it.
 *
 *   const { sorted, sort, toggle } = useTableSort(rows, (row, key) => row[key]);
 *   <DataTableSortHeader label="Name" sortKey="name" sort={sort} onSort={toggle} className="…" />
 */
import {
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { useScrollFade } from '../../hooks/useScrollFade';
import { Button } from '../Button';
import { Icon } from '../icons';
import { nextSort, sortRows, type SortDir, type SortValue } from './sort';
import './DataTable.css';

type DivProps = ComponentPropsWithoutRef<'div'>;

const cx = (base: string, extra?: string) => (extra ? `${base} ${extra}` : base);

type TableProps = Omit<DivProps, 'onScroll'> & {
  /**
   * `cards` (opt-in; the default is the classic look): the settings-list style.
   *  - header: plain muted labels on the page surface, no fill, no lines; still sticky, and aligned
   *    with the cards because it shares their row padding. Use DataTableSortHeader for sortable labels.
   *  - rows: 64px soft rounded cards with a gap between them instead of dividers; hover and
   *    `data-selected` darken the surface (selected adds a hairline ring); keyboard focus gets the ring.
   *  - skeleton rows take the same card shape, so loading does not shift the layout.
   *  - `lc-dt__actions` on the last cell makes a right-aligned 32px kebab cell that rests quiet and
   *    comes up with the row. Cells expose the card colour as `--lc-dt-surface` (for rings around
   *    avatars or dots that must blend into the card).
   *  - the table is a size container: consumers hide secondary columns with `@container (max-width: …)`.
   *  Columns (widths, alignment) stay with the consumer, the same classes on header and row cells.
   */
  variant?: 'cards';
};

/** `onScroll` is owned by the scrollbar fade, so it isn't accepted here. */
export function DataTable({ className, variant, ...rest }: TableProps) {
  const scrollFade = useScrollFade();
  return <div role="table" data-variant={variant} {...rest} {...scrollFade} className={cx('lc-dt', className)} />;
}

export function DataTableHead({ className, ...rest }: DivProps) {
  return <div role="row" {...rest} className={cx('lc-dt__row lc-dt__row--head', className)} />;
}

type RowProps = DivProps & {
  /**
   * Makes the whole row an action: focusable, opens on click or Enter/Space, with a focus ring.
   * Clicks that land on a button, link or field inside the row (a kebab, a copy chip) are ignored,
   * and so are clicks from menus the row opens in a portal.
   */
  onRowClick?: () => void;
};

/** Click came from something interactive inside the row, or from outside the row's DOM (a portal). */
const isNestedClick = (e: MouseEvent<HTMLElement>) =>
  !e.currentTarget.contains(e.target as Node) || (e.target as Element).closest('button, a, input, select, textarea') !== null;

/** Passing `onClick` makes the whole row clickable (pointer cursor). For keyboard access use `onRowClick`. */
export function DataTableRow({ className, onRowClick, ...rest }: RowProps) {
  const rowAction = onRowClick && {
    tabIndex: 0,
    onClick: (e: MouseEvent<HTMLDivElement>) => {
      rest.onClick?.(e);
      if (!isNestedClick(e)) onRowClick();
    },
    onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
      rest.onKeyDown?.(e);
      if (e.target !== e.currentTarget || (e.key !== 'Enter' && e.key !== ' ')) return;
      e.preventDefault(); // Space would otherwise scroll the table.
      onRowClick();
    },
  };
  return (
    <div
      role="row"
      data-clickable={rest.onClick || onRowClick ? true : undefined}
      {...rest}
      {...rowAction}
      className={cx('lc-dt__row lc-dt__row--body', className)}
    />
  );
}

/**
 * Single full-width row shown in place of body rows when there's nothing to list. `title` and
 * `action` are optional: a first-run empty state passes a create button, a "no results for these
 * filters" one passes a clear-filters button.
 */
export function DataTableEmpty({ children, title, action }: { children: ReactNode; title?: ReactNode; action?: ReactNode }) {
  return (
    <div role="row" className="lc-dt__empty">
      <div role="cell">
        {title && <p className="lc-dt__empty-title">{title}</p>}
        <p className="lc-dt__empty-text">{children}</p>
        {action && <div className="lc-dt__empty-action">{action}</div>}
      </div>
    </div>
  );
}

/** Full-width row shown when the list failed to load; the retry button is hidden when `onRetry` is omitted. */
export function DataTableError({ children = 'Something went wrong while loading.', onRetry }: { children?: ReactNode; onRetry?: () => void }) {
  return (
    <div role="row" className="lc-dt__empty">
      <div role="cell">
        <p className="lc-dt__empty-title" role="alert">
          {children}
        </p>
        {onRetry && (
          <div className="lc-dt__empty-action">
            <Button variant="default" size="sm" leftSection={<Icon name="refresh" />} onClick={onRetry}>
              Try again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Screen-reader-only live message, e.g. "12 of 25 inboxes, sorted by Name". Render it next to the table, not inside. */
export function DataTableStatus({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="lc-dt__sr-only">
      {children}
    </p>
  );
}

const SKELETON_ROWS = 6;

/**
 * Loading placeholder shown in place of body rows. `children` is one row's cells, laid out with the
 * table's own cell classes (so placeholders line up under the real headers); it is repeated per row.
 * Rows ease in one after another after a short beat (so quick loads never flash) and fade toward
 * the bottom, reading as "more below" rather than a hard-edged block.
 *
 *   <DataTableSkeleton>
 *     <div className="lc-xx__cell--name"><Skeleton lines={2} /></div>
 *     <div className="lc-xx__cell--size"><Skeleton /></div>
 *   </DataTableSkeleton>
 */
export function DataTableSkeleton({ children }: { children: ReactNode }) {
  return (
    <>
      <div role="row" className="lc-dt__sr-only">
        <div role="cell">Loading…</div>
      </div>
      {Array.from({ length: SKELETON_ROWS }, (_, i) => (
        <div
          key={i}
          className="lc-dt__row lc-dt__row--skeleton"
          data-width={i % 3}
          style={{ '--lc-dt-skeleton-i': i } as CSSProperties}
          aria-hidden="true"
        >
          {children}
        </div>
      ))}
    </>
  );
}

type SkeletonProps =
  /** Text: one line, or a title + shorter meta line. */
  | { shape?: 'text'; lines?: 1 | 2 }
  /** Avatar placeholder (36px, the table avatar size). */
  | { shape: 'circle' }
  /** On/off switch placeholder. */
  | { shape: 'switch' };

/** Placeholder shapes for a skeleton cell, shaped like the content they stand in for. */
export function Skeleton(props: SkeletonProps) {
  if (props.shape === 'circle') return <span className="lc-dt__skeleton-bar lc-dt__skeleton-circle" />;
  if (props.shape === 'switch') return <span className="lc-dt__skeleton-bar lc-dt__skeleton-switch" />;
  return (
    <span className="lc-dt__skeleton">
      <span className="lc-dt__skeleton-bar" />
      {props.lines === 2 && <span className="lc-dt__skeleton-bar" />}
    </span>
  );
}

export type TableSort<K extends string> = { key: K; dir: SortDir } | null;

/** Sort state for one table. `getValue` maps a row + column key to what that column sorts by. */
export function useTableSort<T, K extends string>(rows: T[], getValue: (row: T, key: K) => SortValue) {
  const [sort, setSort] = useState<TableSort<K>>(null);
  const sorted = sort ? sortRows(rows, (row) => getValue(row, sort.key), sort.dir) : rows;
  return { sorted, sort, toggle: (key: K) => setSort((s) => nextSort(s, key)) };
}

type SortHeaderProps<K extends string> = Omit<DivProps, 'children'> & {
  label: string;
  sortKey: K;
  sort: TableSort<K>;
  onSort: (key: K) => void;
};

/** Column header whose label toggles sorting (asc → desc → off) on click. */
export function DataTableSortHeader<K extends string>({ label, sortKey, sort, onSort, ...rest }: SortHeaderProps<K>) {
  const dir = sort?.key === sortKey ? sort.dir : undefined;
  return (
    <div
      role="columnheader"
      aria-sort={dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : undefined}
      {...rest}
    >
      <button type="button" className="lc-dt__sort-btn" data-sort={dir} onClick={() => onSort(sortKey)}>
        <span className="lc-dt__sort-label" data-text={label}>
          {label}
        </span>
        {/* Unsorted shows ↕; sorted shows a chevron that rotates between asc/desc.
            The key remounts the svg on that swap so the chevron doesn't spin in. */}
        <Icon key={dir ? 'sorted' : 'unsorted'} name={dir ? 'chevron-down' : 'arrows-sort'} className="lc-dt__sort-icon" />
      </button>
    </div>
  );
}
