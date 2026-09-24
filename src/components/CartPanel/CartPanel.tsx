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
import { Button } from '../Button';
import { AddProductMenu } from '../AddProductMenu';
import { NativeSelect } from '../Select';
import './CartPanel.css';
import { iconProps } from '../iconProps';
import { TrashIcon } from '../icons';
import { formatINR } from '../formatINR';

interface CartLineItem {
  productId: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  size?: string;
  color?: string;
}

const TAX_RATE = 12;

const PlusIcon = () => (
  <svg {...iconProps()}>
    <path d="M12 5l0 14" />
    <path d="M5 12l14 0" />
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
const PRODUCT_BY_ID: Record<string, Product> = Object.fromEntries(MOCK_PRODUCTS.map((p) => [p.id, p]));

/** Mirrors ProductsPanel's color picker — the catalog has no per-product color variant list. */
const COLOR_OPTIONS = ['Black', 'White', 'Grey', 'Navy', 'Red', 'Blue', 'Green', 'Chalk'];

/** SKUs encode a trailing color code (e.g. `NK-PG41-BLK` → Black) — decode it for display. */
const SKU_COLOR_SUFFIX: Record<string, string> = {
  BLK: 'Black',
  WHT: 'White',
  GRY: 'Grey',
  NVY: 'Navy',
  RED: 'Red',
  BLU: 'Blue',
  GRN: 'Green',
  CHK: 'Chalk',
};
function colorFromSku(sku: string): string | undefined {
  const suffix = sku.split('-').pop()?.toUpperCase();
  return suffix ? SKU_COLOR_SUFFIX[suffix] : undefined;
}

function productToLineItem(product: Product): CartLineItem {
  return {
    productId: product.id,
    name: product.name,
    sku: product.sku,
    unitPrice: product.discountedPrice,
    quantity: 1,
    size: product.variants?.[0],
    color: colorFromSku(product.sku),
  };
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

function CartAddProductMenu({ onAdd, excludeSkus }: { onAdd: (product: Product) => void; excludeSkus: string[] }) {
  return (
    <AddProductMenu
      onAdd={onAdd}
      excludeSkus={excludeSkus}
      trigger={({ ref, onClick }) => (
        <Button
          ref={ref}
          variant="outline"
          color="primary"
          size="xs"
          style={{ width: 120, alignSelf: 'center' }}
          leftSection={<PlusIcon />}
          onClick={onClick}
        >
          Add product
        </Button>
      )}
    />
  );
}

const REMOVE_ANIM_MS = 180;

export function CartPanel() {
  const [items, setItems] = useState<CartLineItem[]>(INITIAL_CART);
  const [removingKeys, setRemovingKeys] = useState<Set<string>>(new Set());

  const addProduct = (product: Product) => setItems((prev) => [...prev, productToLineItem(product)]);
  const removeItem = (index: number, key: string) => {
    setRemovingKeys((prev) => new Set(prev).add(key));
    window.setTimeout(() => {
      setItems((prev) => prev.filter((_, i) => i !== index));
      setRemovingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }, REMOVE_ANIM_MS);
  };
  const setQty = (index: number, quantity: number) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, quantity } : item)));
  const setSize = (index: number, size: string) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, size } : item)));
  const setColor = (index: number, color: string) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, color } : item)));

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), [items]);
  const taxAmount = Math.round((subtotal * TAX_RATE) / 100);
  const total = subtotal + taxAmount;

  return (
    <div className="lc-cp">
      <div className="lc-cp__body">
        {items.length === 0 ? (
          <div className="lc-cp__empty">
            <EmptyCartIcon />
            <p className="lc-cp__empty-title">Cart is empty</p>
            <p className="lc-cp__empty-text">Add products from the catalog to build a cart for this customer.</p>
          </div>
        ) : (
          <div className="lc-cp__items">
            {items.map((item, i) => {
              const key = `${item.sku}-${i}`;
              return (
                <div key={key} className="lc-cp__item-wrap" data-removing={removingKeys.has(key) || undefined}>
                  <div className="lc-cp__item-row">
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
                        <div className="lc-cp__item-actions">
                          <Stepper value={item.quantity} onChange={(q) => setQty(i, q)} />
                          <button
                            type="button"
                            className="lc-cp__item-remove"
                            aria-label={`Remove ${item.name}`}
                            onClick={() => removeItem(i, key)}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                      {(() => {
                        const variants = PRODUCT_BY_ID[item.productId]?.variants;
                        return (item.size || item.color) ? (
                          <div className="lc-cp__item-variants">
                            {item.size && (
                              <NativeSelect
                                size="xs"
                                fullWidth
                                aria-label={`Size for ${item.name}`}
                                data={variants && variants.length > 0 ? variants : [item.size]}
                                value={item.size}
                                onChange={(e) => setSize(i, e.currentTarget.value)}
                              />
                            )}
                            {item.color && (
                              <NativeSelect
                                size="xs"
                                fullWidth
                                aria-label={`Color for ${item.name}`}
                                data={COLOR_OPTIONS}
                                value={item.color}
                                onChange={(e) => setColor(i, e.currentTarget.value)}
                              />
                            )}
                          </div>
                        ) : null;
                      })()}
                      <div className="lc-cp__item-bottom">
                        <span className="lc-cp__item-sku">{item.sku}</span>
                        <span className="lc-cp__item-price">{formatINR(item.unitPrice * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <CartAddProductMenu onAdd={addProduct} excludeSkus={items.map((i) => i.sku)} />
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
            Create order
          </Button>
        </div>
      )}
    </div>
  );
}

export default CartPanel;
