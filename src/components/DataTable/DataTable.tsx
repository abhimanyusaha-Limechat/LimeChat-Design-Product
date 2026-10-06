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
 */
import { type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { useScrollFade } from '../../hooks/useScrollFade';
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

export function DataTableRow({ className, ...rest }: DivProps) {
  return <div role="row" {...rest} className={cx('lc-dt__row lc-dt__row--body', className)} />;
}

/** Single full-width row shown in place of body rows when there's nothing to list. */
export function DataTableEmpty({ children }: { children: ReactNode }) {
  return (
    <div role="row" className="lc-dt__empty">
      <div role="cell">{children}</div>
    </div>
  );
}
