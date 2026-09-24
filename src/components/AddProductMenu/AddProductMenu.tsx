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
      width={240}
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
