/**
 * CartPanel — agent-facing shopping cart rendered inside the TicketDetailsPanel
 * "Cart" tab. Self-contained: owns its own mock line items and mirrors the
 * add/remove/quantity-stepper + totals conventions established by
 * OrdersPanel's line-item editor and ProductsPanel's formatINR/empty-state.
 *
 *   <CartPanel />
 */
import { useMemo, useState } from 'react';
import { MOCK_PRODUCTS, type Product } from '../../data/mockProducts';
import { Menu, type MenuItemData } from '../Menu';
import { Button } from '../Button';
import './CartPanel.css';
import { iconProps } from '../iconProps';
import { formatINR } from '../formatINR';

interface CartLineItem {
  productId: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
}

const TAX_RATE = 12;

const PlusIcon = () => (
  <svg {...iconProps()}>
    <path d="M12 5l0 14" />
    <path d="M5 12l14 0" />
  </svg>
);
const TrashIcon = () => (
  <svg {...iconProps()}>
    <path d="M4 7l16 0" />
    <path d="M10 11l0 6" />
    <path d="M14 11l0 6" />
    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
  </svg>
);
const EmptyCartIcon = () => (
  <svg {...iconProps()} width="40" height="40">
    <circle cx="6" cy="19" r="2" />
    <circle cx="17" cy="19" r="2" />
    <path d="M17 17h-11v-14h-2" />
    <path d="M6 5l14 1l-1 7h-13" />
  </svg>
);

const THUMB_PALETTE = ['#6bac1b', '#097ba3', '#b5762b', '#6949c9', '#c92a2a', '#2b9c8f'];
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash;
}
function thumbColor(sku: string): string {
  return THUMB_PALETTE[hashString(sku) % THUMB_PALETTE.length];
}

const PRODUCT_IMAGE_BY_SKU: Record<string, string> = Object.fromEntries(
  MOCK_PRODUCTS.filter((p) => p.imageUrl).map((p) => [p.sku, p.imageUrl!]),
);

function productToLineItem(product: Product): CartLineItem {
  return { productId: product.id, name: product.name, sku: product.sku, unitPrice: product.discountedPrice, quantity: 1 };
}

const INITIAL_CART: CartLineItem[] = [];

function Stepper({ value, onChange }: { value: number; onChange: (next: number) => void }) {
  return (
    <span className="lc-cp__stepper">
      <button type="button" aria-label="Decrease quantity" onClick={() => onChange(Math.max(1, value - 1))}>
        −
      </button>
      <span className="lc-cp__stepper-value">{value}</span>
      <button type="button" aria-label="Increase quantity" onClick={() => onChange(value + 1)}>
        +
      </button>
    </span>
  );
}

function AddProductMenu({ onAdd, excludeSkus }: { onAdd: (product: Product) => void; excludeSkus: string[] }) {
  const available = MOCK_PRODUCTS.filter((p) => !excludeSkus.includes(p.sku));
  const items: MenuItemData[] = available.length
    ? available.map((p) => ({
        key: p.id,
        label: `${p.name} · ${formatINR(p.discountedPrice)}`,
        onClick: () => onAdd(p),
      }))
    : [{ key: 'none', label: 'All products already added', disabled: true }];

  return (
    <Menu
      items={items}
      ariaLabel="Add product to cart"
      width={240}
      trigger={({ ref, onClick }) => (
        <button ref={ref} type="button" className="lc-cp__add-item-btn" onClick={onClick}>
          <PlusIcon />
          Add product
        </button>
      )}
    />
  );
}

export function CartPanel() {
  const [items, setItems] = useState<CartLineItem[]>(INITIAL_CART);

  const addProduct = (product: Product) => setItems((prev) => [...prev, productToLineItem(product)]);
  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));
  const setQty = (index: number, quantity: number) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, quantity } : item)));
  const clearCart = () => setItems([]);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), [items]);
  const taxAmount = Math.round((subtotal * TAX_RATE) / 100);
  const total = subtotal + taxAmount;

  return (
    <div className="lc-cp">
      <div className="lc-cp__header">
        <div className="lc-cp__header-title">
          <span>Cart</span>
          {items.length > 0 && <span className="lc-cp__badge">{items.length}</span>}
        </div>
        {items.length > 0 && (
          <button type="button" className="lc-cp__clear-btn" onClick={clearCart}>
            Clear cart
          </button>
        )}
      </div>

      <div className="lc-cp__body">
        {items.length === 0 ? (
          <div className="lc-cp__empty">
            <EmptyCartIcon />
            <p className="lc-cp__empty-title">Cart is empty</p>
            <p className="lc-cp__empty-text">Add products from the catalog to build a cart for this customer.</p>
          </div>
        ) : (
          <div className="lc-cp__items">
            {items.map((item, i) => (
              <div key={`${item.sku}-${i}`} className="lc-cp__item-row">
                <span
                  className="lc-cp__item-thumb"
                  style={PRODUCT_IMAGE_BY_SKU[item.sku] ? undefined : { background: thumbColor(item.sku) }}
                  aria-hidden="true"
                >
                  {PRODUCT_IMAGE_BY_SKU[item.sku] ? (
                    <img className="lc-cp__item-thumb-img" src={PRODUCT_IMAGE_BY_SKU[item.sku]} alt="" />
                  ) : (
                    item.name.charAt(0).toUpperCase()
                  )}
                </span>
                <div className="lc-cp__item-main">
                  <div className="lc-cp__item-top">
                    <span className="lc-cp__item-name">{item.name}</span>
                    <span className="lc-cp__item-price">{formatINR(item.unitPrice * item.quantity)}</span>
                  </div>
                  <div className="lc-cp__item-bottom">
                    <span className="lc-cp__item-sku">{item.sku}</span>
                    <div className="lc-cp__item-actions">
                      <Stepper value={item.quantity} onChange={(q) => setQty(i, q)} />
                      <button
                        type="button"
                        className="lc-cp__item-remove"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => removeItem(i)}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <AddProductMenu onAdd={addProduct} excludeSkus={items.map((i) => i.sku)} />
      </div>

      {items.length > 0 && (
        <div className="lc-cp__summary">
          <div className="lc-cp__summary-row">
            <span>Subtotal</span>
            <span>{formatINR(subtotal)}</span>
          </div>
          <div className="lc-cp__summary-row">
            <span>Tax ({TAX_RATE}%)</span>
            <span>{formatINR(taxAmount)}</span>
          </div>
          <div className="lc-cp__summary-total">
            <span>Total</span>
            <span>{formatINR(total)}</span>
          </div>
          <Button variant="filled" color="primary" size="sm" fullWidth>
            Checkout
          </Button>
        </div>
      )}
    </div>
  );
}

export default CartPanel;
