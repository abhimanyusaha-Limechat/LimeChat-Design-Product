/**
 * AddProductMenu — shared "add a product" dropdown used by both OrdersPanel
 * (editing an order's line items) and CartPanel. A search field plus a
 * 6-row-tall scrollable list, each row showing the product name (truncated)
 * with its price pinned to the right.
 */
import { useState, type ReactNode } from 'react';
import { Button } from '../Button';
import { Menu, type MenuItemData, type MenuTriggerRenderProps } from '../Menu';
import { MOCK_PRODUCTS, type Product } from '../../data/mockProducts';
import { formatINR } from '../formatINR';
import { iconProps } from '../iconProps';
import './AddProductMenu.css';

const PlusIcon = () => (
  <svg {...iconProps()}>
    <path d="M12 5l0 14" />
    <path d="M5 12l14 0" />
  </svg>
);
const PhotoIcon = () => (
  <svg {...iconProps()}>
    <rect x="4" y="5" width="16" height="14" rx="2" />
    <circle cx="9" cy="10" r="1.5" />
    <path d="M4 15l4.5 -4.5c0.8 -0.8 2 -0.8 2.8 0l5.7 5.5" />
    <path d="M14.5 13.5l1.5 -1.5c0.8 -0.8 2 -0.8 2.8 0l1.2 1.2" />
  </svg>
);

/** Mirrors ProductsPanel's ProductThumbnail. */
const THUMB_PALETTE = [
  { bg: '#FAFDF6', fg: '#6BAC1B' },
  { bg: '#EDF7FF', fg: '#097BA3' },
  { bg: '#FAEFDB', fg: '#C68610' },
  { bg: '#FCF3F3', fg: '#DA1B21' },
  { bg: '#FCF2FF', fg: '#A045EC' },
];
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash;
}
function ItemThumb({ product }: { product: Product }) {
  const palette = THUMB_PALETTE[hashString(product.id) % THUMB_PALETTE.length];
  return (
    <span
      className="lc-add-product__item-thumb"
      style={product.imageUrl ? undefined : { background: palette.bg, color: palette.fg }}
      aria-hidden="true"
    >
      {product.imageUrl ? (
        <img className="lc-add-product__item-thumb-img" src={product.imageUrl} alt="" />
      ) : (
        <PhotoIcon />
      )}
    </span>
  );
}

const defaultTrigger = ({ ref, onClick }: MenuTriggerRenderProps) => (
  <Button ref={ref} variant="default" size="xs" leftSection={<PlusIcon />} onClick={onClick}>
    Add product
  </Button>
);

export function AddProductMenu({
  onAdd,
  excludeSkus,
  trigger = defaultTrigger,
}: {
  onAdd: (product: Product) => void;
  excludeSkus: string[];
  trigger?: (props: MenuTriggerRenderProps) => ReactNode;
}) {
  const [search, setSearch] = useState('');
  const available = MOCK_PRODUCTS.filter((p) => !excludeSkus.includes(p.sku));
  const filtered =
    search.trim() === '' ? available : available.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()));
  const items: MenuItemData[] = filtered.length
    ? filtered.map((p) => ({
        key: p.id,
        label: (
          <span className="lc-add-product__item">
            <ItemThumb product={p} />
            <span className="lc-add-product__item-name">{p.name}</span>
            <span className="lc-add-product__item-price">{formatINR(p.discountedPrice)}</span>
          </span>
        ),
        onClick: () => onAdd(p),
      }))
    : [{ key: 'none', label: available.length ? 'No matching products' : 'All products already added', disabled: true }];

  return (
    <Menu
      items={items}
      ariaLabel="Add product"
      width={300}
      className="lc-add-product"
      header={
        <div className="lc-add-product__search">
          <input
            type="text"
            className="lc-add-product__search-input"
            placeholder="Search products"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
        </div>
      }
      trigger={trigger}
    />
  );
}
