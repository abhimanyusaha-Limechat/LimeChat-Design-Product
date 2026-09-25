/**
 * ProductSwitcher — LimeChat design system (Figma node 9753:518).
 *
 * A popover of product tiles (icon + label) with a top caret and an optional
 * "Products by LimeChat" attribution footer. Presentation-only — position it
 * yourself relative to the trigger.
 *
 *   <ProductSwitcher
 *     products={[
 *       { id: 'automation', label: 'Automation', icon: <AutomationIcon /> },
 *       { id: 'marketing',  label: 'Marketing',  icon: <MarketingIcon /> },
 *     ]}
 *     selectedId={product}
 *     onSelect={setProduct}
 *   />
 */
import type { CSSProperties, ReactNode } from 'react';
import './ProductSwitcher.css';

export interface ProductSwitcherItem {
  id: string;
  label: string;
  icon?: ReactNode;
}

export interface ProductSwitcherProps {
  products: ProductSwitcherItem[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  /** Show the "Products by LimeChat" footer. Default `true`. */
  showAttribution?: boolean;
  /** Show the top caret. Default `true`. */
  withArrow?: boolean;
  /** Horizontal position of the caret (any CSS length). Default `50%`. */
  arrowOffset?: string;
  className?: string;
  style?: CSSProperties;
}

const LimeChatMark = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" style={{ color: '#6BAC1B' }}>
    <path d="M28.571 3.333v13.002c0 1.618-.318 3.22-.937 4.715a12.32 12.32 0 0 1-2.662 4.032 12.32 12.32 0 0 1-4.032 2.662 12.3 12.3 0 0 1-4.557.906v.016h-2.738v-7.015h2.581v-.019c.696 0 1.385-.137 2.028-.403a5.3 5.3 0 0 0 1.72-1.148 5.3 5.3 0 0 0 1.148-1.72c.25-.603.385-1.246.401-1.898V10.18h-1.022c-1.349 0-2.684.266-3.93.782a10.3 10.3 0 0 0-3.33 2.223 10.3 10.3 0 0 0-2.225 3.33 10.3 10.3 0 0 0-.782 3.929v8.206H3.42v-8.383h.002a17.7 17.7 0 0 1 1.3-6.372 17.8 17.8 0 0 1 3.71-5.545 17.8 17.8 0 0 1 5.545-3.708 17.7 17.7 0 0 1 6.375-1.301v-.002h8.213Z" />
  </svg>
);

export function ProductSwitcher({
  products,
  selectedId,
  onSelect,
  showAttribution = true,
  withArrow = true,
  arrowOffset = '50%',
  className,
  style,
}: ProductSwitcherProps) {
  return (
    <div
      className={`lc-product-switcher${className ? ` ${className}` : ''}`}
      style={{ ['--lc-ps-arrow-left' as string]: arrowOffset, ...style }}
      role="menu"
      aria-label="Switch product"
    >
      {withArrow && <span className="lc-product-switcher__arrow" aria-hidden="true" />}

      <div className="lc-product-switcher__row">
        {products.map((p) => (
          <button
            key={p.id}
            type="button"
            role="menuitemradio"
            aria-checked={p.id === selectedId}
            aria-current={p.id === selectedId}
            className="lc-product-switcher__tile"
            onClick={() => onSelect?.(p.id)}
          >
            <span className="lc-product-switcher__icon">{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      {showAttribution && (
        <div className="lc-product-switcher__footer">
          Products by
          <span className="lc-product-switcher__brand">
            <LimeChatMark />
            LimeChat
          </span>
        </div>
      )}
    </div>
  );
}

export default ProductSwitcher;
