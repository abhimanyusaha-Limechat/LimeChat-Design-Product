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
 * Every part forwards extra div props (className, data-*), so a product can
 * keep its own class for cell-level styling and status variants.
 *
 * Sorting: `useTableSort` holds the sort state and returns sorted rows;
 * `DataTableSortHeader` is the clickable column header that drives it.
 *
 *   const { sorted, sort, toggle } = useTableSort(rows, (row, key) => row[key]);
 *   <DataTableSortHeader label="Name" sortKey="name" sort={sort} onSort={toggle} className="…" />
 */
import { useState, type ComponentPropsWithoutRef, type CSSProperties, type ReactNode } from 'react';
import { useScrollFade } from '../../hooks/useScrollFade';
import { Icon } from '../icons';
import { nextSort, sortRows, type SortDir, type SortValue } from './sort';
import './DataTable.css';

type DivProps = ComponentPropsWithoutRef<'div'>;

const cx = (base: string, extra?: string) => (extra ? `${base} ${extra}` : base);

/** `onScroll` is owned by the scrollbar fade, so it isn't accepted here. */
export function DataTable({ className, ...rest }: Omit<DivProps, 'onScroll'>) {
  const scrollFade = useScrollFade();
  return <div role="table" {...rest} {...scrollFade} className={cx('lc-dt', className)} />;
}

export function DataTableHead({ className, ...rest }: DivProps) {
  return <div role="row" {...rest} className={cx('lc-dt__row lc-dt__row--head', className)} />;
}

/** Passing `onClick` makes the whole row clickable (pointer cursor). */
export function DataTableRow({ className, ...rest }: DivProps) {
  return (
    <div
      role="row"
      data-clickable={rest.onClick ? true : undefined}
      {...rest}
      className={cx('lc-dt__row lc-dt__row--body', className)}
    />
  );
}

/** Single full-width row shown in place of body rows when there's nothing to list. */
export function DataTableEmpty({ children }: { children: ReactNode }) {
  return (
    <div role="row" className="lc-dt__empty">
      <div role="cell">{children}</div>
    </div>
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
