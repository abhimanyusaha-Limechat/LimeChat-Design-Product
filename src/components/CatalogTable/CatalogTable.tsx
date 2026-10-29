/**
 * CatalogTable — Settings → Products: the products synced from the company's store (Shopify),
 * read-only, as a table or cards, with search, a status filter and pages. Shopify stays the source of truth, so the
 * only action is "Sync from Shopify". Shows an empty state instead when the store isn't connected.
 */
import { useState } from 'react';
import type { CatalogProduct, CatalogStatus } from '../../data/catalogDemo';
import { Button } from '../Button';
import {
  DataTable,
  DataTableEmpty,
  DataTableHead,
  DataTablePagination,
  DataTableRow,
  DataTableSkeleton,
  Skeleton,
} from '../DataTable';
import { formatINR } from '../formatINR';
import { Icon } from '../icons';
import { ProductThumb } from '../ProductThumb';
import { NativeSelect } from '../Select';
import { timeAgo } from '../timeAgo';
import './CatalogTable.css';

export const CATALOG_PAGE_SIZE = 10;

type View = 'table' | 'cards';
const VIEWS: { id: View; label: string; icon: 'list' | 'grid-dots' }[] = [
  { id: 'table', label: 'Table view', icon: 'list' },
  { id: 'cards', label: 'Card view', icon: 'grid-dots' },
];

const STATUS_LABEL: Record<CatalogStatus, string> = { active: 'Active', draft: 'Draft', archived: 'Archived' };
const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  ...(Object.keys(STATUS_LABEL) as CatalogStatus[]).map((value) => ({ value, label: STATUS_LABEL[value] })),
];

export interface CatalogTableProps {
  products: CatalogProduct[];
  /** The store's domain, e.g. "acme.myshopify.com". */
  store: string;
  /** ISO time of the last sync. */
  lastSyncedAt: string;
  /** False shows "connect Shopify" in place of the table. */
  connected: boolean;
  /** Shows skeleton rows in place of the list while its data loads. */
  loading?: boolean;
  syncing?: boolean;
  onSync: () => void;
  onConnect: () => void;
}

const Price = ({ product: p }: { product: CatalogProduct }) => (
  <>
    <span className="lc-ct__text">{formatINR(p.price)}</span>
    {p.compareAtPrice && <span className="lc-ct__compare">{formatINR(p.compareAtPrice)}</span>}
  </>
);

const Stock = ({ product: p, className }: { product: CatalogProduct; className: string }) =>
  p.inventory > 0 ? <span className={className}>{p.inventory} in stock</span> : <span className="lc-ct__out">Out of stock</span>;

/** Most products are active, so only Draft and Archived get a pill. */
const StatusPill = ({ status }: { status: CatalogStatus }) =>
  status === 'active' ? null : (
    <span className="lc-ct__pill" data-status={status}>
      {STATUS_LABEL[status]}
    </span>
  );

export function CatalogTable({
  products,
  store,
  lastSyncedAt,
  connected,
  loading = false,
  syncing = false,
  onSync,
  onConnect,
}: CatalogTableProps) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [view, setView] = useState<View>('table');

  if (!connected) {
    return (
      <div className="lc-ct lc-ct--empty">
        <h2 className="lc-ct__empty-title">Shopify isn’t connected</h2>
        <p className="lc-ct__empty-text">Connect your store to sync its products here.</p>
        <Button variant="filled" color="primary" size="sm" onClick={onConnect}>
          Connect Shopify
        </Button>
      </div>
    );
  }

  const needle = search.trim().toLowerCase();
  const matches = products.filter(
    (p) =>
      (status === 'all' || p.status === status) &&
      (p.title.toLowerCase().includes(needle) || p.sku.toLowerCase().includes(needle)),
  );
  const totalPages = Math.max(1, Math.ceil(matches.length / CATALOG_PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const shown = matches.slice((current - 1) * CATALOG_PAGE_SIZE, current * CATALOG_PAGE_SIZE);

  const emptyText = products.length === 0 ? 'No products synced yet. Use Sync from Shopify.' : 'No products match your search';

  return (
    <div className="lc-ct">
      <div className="lc-ct__toolbar">
        <div className="lc-ct__filters">
          <div className="lc-ct__search">
            <Icon name="search" size={16} className="lc-ct__search-icon" aria-hidden="true" />
            <input
              className="lc-ct__search-input"
              type="search"
              placeholder="Search by title or SKU"
              aria-label="Search products"
              autoComplete="off"
              value={search}
              onChange={(e) => {
                setSearch(e.currentTarget.value);
                setPage(1);
              }}
            />
          </div>
          <NativeSelect
            size="sm"
            aria-label="Filter by status"
            data={STATUS_OPTIONS}
            value={status}
            onChange={(e) => {
              setStatus(e.currentTarget.value);
              setPage(1);
            }}
          />
        </div>
        <div className="lc-ct__actions">
          <div className="lc-ct__views" role="group" aria-label="View">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                className="lc-ct__view-btn"
                aria-pressed={view === v.id}
                aria-label={v.label}
                onClick={() => setView(v.id)}
              >
                <Icon name={v.icon} size={16} />
              </button>
            ))}
          </div>
          <Button variant="filled" color="primary" size="sm" leftSection={<Icon name="sync" />} loading={syncing} onClick={onSync}>
            Sync from Shopify
          </Button>
        </div>
      </div>
      <p className="lc-ct__summary" role="status">
        {matches.length} {matches.length === 1 ? 'product' : 'products'} · Last synced {timeAgo(lastSyncedAt)} · {store}
      </p>

      {view === 'cards' ? (
        <ul className="lc-ct__cards" aria-label="Products" aria-busy={loading || undefined}>
          {loading ? (
            Array.from({ length: 6 }, (_, i) => (
              <li key={i} className="lc-ct__card lc-ct__card--skeleton" aria-hidden="true">
                <div className="lc-ct__card-photo" />
                <Skeleton lines={2} />
              </li>
            ))
          ) : shown.length === 0 ? (
            <li className="lc-ct__cards-empty">{emptyText}</li>
          ) : (
            shown.map((p) => (
              <li key={p.id} className="lc-ct__card">
                <ProductThumb colorKey={p.id} imageUrl={p.imageUrl} name={p.title} size="lg" />
                <div className="lc-ct__card-body">
                  <StatusPill status={p.status} />
                  <span className="lc-ct__title">{p.title}</span>
                  <span className="lc-ct__sub">
                    {p.vendor} · {p.sku}
                  </span>
                  <span className="lc-ct__card-price">
                    <Price product={p} />
                  </span>
                  <Stock product={p} className="lc-ct__sub" />
                </div>
              </li>
            ))
          )}
        </ul>
      ) : (
      <DataTable aria-busy={loading || undefined} aria-label="Products">
        <DataTableHead>
          <div role="columnheader" className="lc-ct__cell lc-ct__cell--name">Product</div>
          <div role="columnheader" className="lc-ct__cell lc-ct__cell--vendor">Vendor</div>
          <div role="columnheader" className="lc-ct__cell lc-ct__cell--price">Price</div>
          <div role="columnheader" className="lc-ct__cell lc-ct__cell--stock">Inventory</div>
          <div role="columnheader" className="lc-ct__cell lc-ct__cell--status">Status</div>
        </DataTableHead>

        {loading ? (
          <DataTableSkeleton>
            <div className="lc-ct__cell lc-ct__cell--name">
              <Skeleton lines={2} />
            </div>
            <div className="lc-ct__cell lc-ct__cell--vendor">
              <Skeleton lines={2} />
            </div>
            <div className="lc-ct__cell lc-ct__cell--price">
              <Skeleton />
            </div>
            <div className="lc-ct__cell lc-ct__cell--stock">
              <Skeleton />
            </div>
            <div className="lc-ct__cell lc-ct__cell--status">
              <Skeleton />
            </div>
          </DataTableSkeleton>
        ) : shown.length === 0 ? (
          <DataTableEmpty>{emptyText}</DataTableEmpty>
        ) : (
          shown.map((p) => (
            <DataTableRow key={p.id}>
              <div role="cell" className="lc-ct__cell lc-ct__cell--name">
                <ProductThumb colorKey={p.id} imageUrl={p.imageUrl} name={p.title} size={36} />
                <div className="lc-ct__stack">
                  <span className="lc-ct__title">{p.title}</span>
                  <span className="lc-ct__sub">{p.sku}</span>
                </div>
              </div>
              <div role="cell" className="lc-ct__cell lc-ct__cell--vendor">
                <div className="lc-ct__stack">
                  <span className="lc-ct__text">{p.vendor}</span>
                  <span className="lc-ct__sub">{p.type}</span>
                </div>
              </div>
              <div role="cell" className="lc-ct__cell lc-ct__cell--price">
                <Price product={p} />
              </div>
              <div role="cell" className="lc-ct__cell lc-ct__cell--stock">
                <Stock product={p} className="lc-ct__text" />
              </div>
              <div role="cell" className="lc-ct__cell lc-ct__cell--status">
                <StatusPill status={p.status} />
              </div>
            </DataTableRow>
          ))
        )}
      </DataTable>
      )}

      <DataTablePagination page={current} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

export default CatalogTable;
