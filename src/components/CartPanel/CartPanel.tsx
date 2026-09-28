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
import { useCart, type CartLineItem } from '../../context/CartContext';
import { Button } from '../Button';
import { Modal } from '../Modal';
import { NativeSelect } from '../Select';
import './CartPanel.css';
import { iconProps } from '../iconProps';
import { CloseIcon as ClearIcon } from '../icons';
import { formatINR } from '../formatINR';

const TAX_RATE = 12;

const EmptyCartIcon = () => (
  <svg {...iconProps()} width="40" height="40">
    <circle cx="6" cy="19" r="2" />
    <circle cx="17" cy="19" r="2" />
    <path d="M17 17h-11v-14h-2" />
    <path d="M6 5l14 1l-1 7h-13" />
  </svg>
);

/** Mirrors ProductsPanel/OrdersPanel's no-image thumbnail fallback. */
const PhotoIcon = () => (
  <svg {...iconProps()}>
    <rect x="4" y="5" width="16" height="14" rx="2" />
    <circle cx="9" cy="10" r="1.5" />
    <path d="M4 15l4.5 -4.5c0.8 -0.8 2 -0.8 2.8 0l5.7 5.5" />
    <path d="M14.5 13.5l1.5 -1.5c0.8 -0.8 2 -0.8 2.8 0l1.2 1.2" />
  </svg>
);
/** Mirrors TicketComposer's attachment-preview affordance. */
const ZoomIcon = () => (
  <svg {...iconProps()}>
    <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
    <path d="M21 21l-6 -6" />
    <path d="M7 10l6 0" />
    <path d="M10 7l0 6" />
  </svg>
);

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
function thumbPalette(sku: string) {
  return THUMB_PALETTE[hashString(sku) % THUMB_PALETTE.length];
}

const PRODUCT_IMAGE_BY_SKU: Record<string, string> = Object.fromEntries(
  MOCK_PRODUCTS.filter((p) => p.imageUrl).map((p) => [p.sku, p.imageUrl!]),
);
const PRODUCT_BY_ID: Record<string, Product> = Object.fromEntries(MOCK_PRODUCTS.map((p) => [p.id, p]));

/** Mirrors ProductsPanel's color picker — the catalog has no per-product color variant list. */
const COLOR_OPTIONS = ['Black', 'White', 'Grey', 'Navy', 'Red', 'Blue', 'Green', 'Chalk'];

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

/**
 * CartItemThumb — mirrors ProductsPanel's ProductThumbnail. With an image,
 * hovering reveals a zoom affordance that opens the photo full-size in a
 * dismissible modal; the no-image fallback stays static.
 */
function CartItemThumb({ sku, name }: { sku: string; name: string }) {
  const imageUrl = PRODUCT_IMAGE_BY_SKU[sku];
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <span
        className="lc-cp__item-thumb"
        style={imageUrl ? undefined : { background: thumbPalette(sku).bg, color: thumbPalette(sku).fg }}
        data-clickable={imageUrl ? true : undefined}
        role={imageUrl ? 'button' : undefined}
        tabIndex={imageUrl ? 0 : undefined}
        aria-label={imageUrl ? `View ${name} image` : undefined}
        onClick={
          imageUrl
            ? (e) => {
                e.stopPropagation();
                setPreviewOpen(true);
              }
            : undefined
        }
        onKeyDown={
          imageUrl
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  setPreviewOpen(true);
                }
              }
            : undefined
        }
      >
        {imageUrl ? (
          <>
            <img className="lc-cp__item-thumb-img" src={imageUrl} alt="" aria-hidden="true" />
            <span className="lc-cp__item-thumb-zoom" aria-hidden="true">
              <ZoomIcon />
            </span>
          </>
        ) : (
          <PhotoIcon />
        )}
      </span>

      {imageUrl && previewOpen && (
        <Modal open onClose={() => setPreviewOpen(false)} title="" width={600} className="lc-cp__preview-modal">
          <div className="lc-cp__preview-frame">
            <img src={imageUrl} alt={name} className="lc-cp__preview-image" />
            <button
              type="button"
              className="lc-cp__preview-close"
              aria-label="Close"
              onClick={() => setPreviewOpen(false)}
            >
              <ClearIcon size={14} />
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

export function CartPanel({ onCreateOrder }: { onCreateOrder?: (items: CartLineItem[]) => void } = {}) {
  const { items, clearCart, setQuantity, setSize: setItemSize, setColor: setItemColor } = useCart();
  const setQty = setQuantity;
  const setSize = setItemSize;
  const setColor = setItemColor;

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
          <>
            <p className="lc-cp__count-line">
              {items.length} {items.length === 1 ? 'product' : 'products'} in cart
            </p>
            <div className="lc-cp__items">
              {items.map((item, i) => {
              const key = `${item.sku}-${i}`;
              return (
                <div key={key} className="lc-cp__item-wrap">
                  <div className="lc-cp__item-row">
                    <CartItemThumb sku={item.sku} name={item.name} />
                    <div className="lc-cp__item-main">
                      <div className="lc-cp__item-top">
                        <span className="lc-cp__item-name">{item.name}</span>
                        <span className="lc-cp__item-unit-price">{formatINR(item.unitPrice)}</span>
                      </div>
                      {(() => {
                        const variants = PRODUCT_BY_ID[item.productId]?.variants;
                        return (
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
                            <Stepper value={item.quantity} onChange={(q) => setQty(i, q)} />
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          </>
        )}
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
          <div className="lc-cp__summary-ctas">
            <Button variant="default" size="sm" onClick={clearCart}>
              Clear cart
            </Button>
            <Button
              variant="filled"
              color="primary"
              size="sm"
              style={{ flex: 1 }}
              onClick={() => onCreateOrder?.(items)}
            >
              Create order
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPanel;
