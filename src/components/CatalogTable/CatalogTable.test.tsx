import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { CatalogProduct } from '../../data/catalogDemo';
import { CatalogTable, CATALOG_PAGE_SIZE, type CatalogTableProps } from './CatalogTable';

const product = (n: number, extra: Partial<CatalogProduct> = {}): CatalogProduct => ({
  id: `p${n}`,
  title: `Shoe ${n}`,
  sku: `SKU-${n}`,
  vendor: 'Acme',
  type: 'Running',
  price: 1000 + n,
  inventory: 5,
  status: 'active',
  ...extra,
});
const products = [
  ...Array.from({ length: CATALOG_PAGE_SIZE + 2 }, (_, i) => product(i + 1)),
  product(99, { title: 'Winter Boot', sku: 'BOOT-1', status: 'draft', inventory: 0, compareAtPrice: 2000 }),
];

function setup(props: Partial<CatalogTableProps> = {}) {
  const onSync = vi.fn();
  const onConnect = vi.fn();
  render(
    <CatalogTable
      products={products}
      store="acme.myshopify.com"
      lastSyncedAt={new Date().toISOString()}
      connected
      onSync={onSync}
      onConnect={onConnect}
      {...props}
    />,
  );
  return { onSync, onConnect, user: userEvent.setup() };
}

const rows = () => within(screen.getByRole('table', { name: 'Products' })).getAllByRole('row').slice(1);

describe('CatalogTable', () => {
  it('shows one page of products with the count, store and last sync', () => {
    setup();
    expect(rows()).toHaveLength(CATALOG_PAGE_SIZE);
    expect(screen.getByRole('status')).toHaveTextContent(`${products.length} products · Last synced just now · acme.myshopify.com`);
  });

  it('pages through the rest', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: '2' }));
    expect(rows()).toHaveLength(products.length - CATALOG_PAGE_SIZE);
  });

  it('searches by title or SKU and goes back to page 1', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: '2' }));
    await user.type(screen.getByRole('searchbox', { name: 'Search products' }), 'boot-1');
    expect(rows()).toHaveLength(1);
    expect(rows()[0]).toHaveTextContent('Winter Boot');
    await user.clear(screen.getByRole('searchbox'));
    await user.type(screen.getByRole('searchbox'), 'zzz');
    expect(screen.getByText('No products match your search')).toBeInTheDocument();
  });

  it('filters by status', async () => {
    const { user } = setup();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Filter by status' }), 'draft');
    expect(rows()).toHaveLength(1);
    expect(rows()[0]).toHaveTextContent('Draft');
    expect(rows()[0]).toHaveTextContent('Out of stock');
    expect(rows()[0]).toHaveTextContent('₹2,000');
  });

  it('switches between a table and cards, keeping the search and page', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: '2' }));
    await user.click(screen.getByRole('button', { name: 'Card view' }));
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: 'Products' })).getAllByRole('listitem')).toHaveLength(
      products.length - CATALOG_PAGE_SIZE,
    );
    expect(screen.getByRole('button', { name: 'Card view' })).toHaveAttribute('aria-pressed', 'true');

    await user.type(screen.getByRole('searchbox', { name: 'Search products' }), 'zzz');
    expect(screen.getByText('No products match your search')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Table view' }));
    expect(screen.getByRole('table', { name: 'Products' })).toBeInTheDocument();
  });

  it('syncs on request', async () => {
    const { user, onSync } = setup();
    await user.click(screen.getByRole('button', { name: 'Sync from Shopify' }));
    expect(onSync).toHaveBeenCalledOnce();
  });

  it('says so when the store has no products yet', () => {
    setup({ products: [] });
    expect(screen.getByText('No products synced yet. Use Sync from Shopify.')).toBeInTheDocument();
  });

  it('asks to connect Shopify instead of listing when it is not connected', async () => {
    const { user, onConnect } = setup({ connected: false });
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Connect Shopify' }));
    expect(onConnect).toHaveBeenCalledOnce();
  });
});
