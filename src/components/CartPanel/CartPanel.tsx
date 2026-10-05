/**
 * CartPanel — agent-facing shopping cart rendered inside the TicketDetailsPanel
 * "Cart" tab. Self-contained: owns its own mock line items and mirrors the
 * add/remove/quantity-stepper + totals conventions established by
 * OrdersPanel's line-item editor and ProductsPanel's formatINR/empty-state.
 *
 *   <CartPanel />
 */
import { useMemo } from 'react';
import { MOCK_PRODUCTS, type Product } from '../../data/mockProducts';
import { useCart, type CartLineItem } from '../../context/CartContext';
import { Button } from '../Button';
import { NativeSelect } from '../Select';
import './CartPanel.css';
import { iconProps } from '../iconProps';
import { formatINR } from '../formatINR';
import { DEFAULT_TAX_RATE, orderTotals } from '../../data/orderDraft';
import { ProductThumb } from '../ProductThumb';
import { QtyStepper } from '../QtyStepper';

const EmptyCartIcon = () => (
  <svg {...iconProps()} width="40" height="40">
    <circle cx="6" cy="19" r="2" />
    <circle cx="17" cy="19" r="2" />
    <path d="M17 17h-11v-14h-2" />
    <path d="M6 5l14 1l-1 7h-13" />
  </svg>
);

const PRODUCT_IMAGE_BY_SKU: Record<string, string> = Object.fromEntries(
  MOCK_PRODUCTS.filter((p) => p.imageUrl).map((p) => [p.sku, p.imageUrl!]),
);
const PRODUCT_BY_ID: Record<string, Product> = Object.fromEntries(MOCK_PRODUCTS.map((p) => [p.id, p]));

/** Mirrors ProductsPanel's color picker — the catalog has no per-product color variant list. */
const COLOR_OPTIONS = ['Black', 'White', 'Grey', 'Navy', 'Red', 'Blue', 'Green', 'Chalk'];

export function CartPanel({ onCreateOrder }: { onCreateOrder?: (items: CartLineItem[]) => void } = {}) {
  const { items, clearCart, setQuantity, setSize: setItemSize, setColor: setItemColor } = useCart();
  const setQty = setQuantity;
  const setSize = setItemSize;
  const setColor = setItemColor;

  const { subtotal, taxAmount, total } = useMemo(() => orderTotals(items, { taxRate: DEFAULT_TAX_RATE }), [items]);

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
                    <ProductThumb colorKey={item.sku} imageUrl={PRODUCT_IMAGE_BY_SKU[item.sku]} name={item.name} size={36} />
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
                            <QtyStepper value={item.quantity} onChange={(q) => setQty(i, q)} />
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
            <span>Tax ({DEFAULT_TAX_RATE}%)</span>
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
