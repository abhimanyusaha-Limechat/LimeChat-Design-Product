/**
 * ProductsPanel — agent-facing product catalog browser rendered inside the
 * TicketDetailsPanel "Products" tab. Self-contained: owns its own mock data,
 * search/filter/sort state, and list <-> detail sub-view switching (no
 * overlay/modal/drawer — the detail view replaces the list in place).
 *
 *   <ProductsPanel />
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { MOCK_PRODUCTS, type Availability, type Product } from '../../data/mockProducts';
import { Menu, type MenuItemData } from '../Menu';
import { Button } from '../Button';
import './ProductsPanel.css';

type SortKey = 'relevance' | 'price_low_high' | 'price_high_low' | 'rating' | 'recently_added';

const SORT_LABEL: Record<SortKey, string> = {
  relevance: 'Relevance',
  price_low_high: 'Price: Low to High',
  price_high_low: 'Price: High to Low',
  rating: 'Rating',
  recently_added: 'Recently added',
};

const STATUS_LABEL: Record<Availability, string> = {
  in_stock: 'In stock',
  low_stock: 'Low stock',
  out_of_stock: 'Out of stock',
  discontinued: 'Discontinued',
};

const THUMB_PALETTE = [
  { bg: '#f1f7e9', fg: '#6bac1b' },
  { bg: '#e7f3f8', fg: '#097ba3' },
  { bg: '#fdf3e0', fg: '#b5762b' },
  { bg: '#fdecec', fg: '#c92a2a' },
  { bg: '#f0eefc', fg: '#6949c9' },
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function iconProps() {
  return {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
}

const SearchIcon = () => (
  <svg {...iconProps()}>
    <circle cx="10" cy="10" r="7" />
    <path d="M21 21l-6 -6" />
  </svg>
);
const ClearIcon = () => (
  <svg {...iconProps()}>
    <path d="M18 6l-12 12" />
    <path d="M6 6l12 12" />
  </svg>
);
const FilterIcon = () => (
  <svg {...iconProps()}>
    <path d="M4 6h16" />
    <path d="M8 12h8" />
    <path d="M11 18h2" />
  </svg>
);
const SortIcon = () => (
  <svg {...iconProps()}>
    <path d="M4 8l4 -4l4 4" />
    <path d="M8 4l0 16" />
    <path d="M20 16l-4 4l-4 -4" />
    <path d="M16 20l0 -16" />
  </svg>
);
const BackIcon = () => (
  <svg {...iconProps()}>
    <path d="M15 6l-6 6l6 6" />
  </svg>
);
const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
    <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
  </svg>
);
const ShareIcon = () => (
  <svg {...iconProps()}>
    <circle cx="6" cy="12" r="2" />
    <circle cx="18" cy="6" r="2" />
    <circle cx="18" cy="18" r="2" />
    <path d="M8 10.5l8 -4" />
    <path d="M8 13.5l8 4" />
  </svg>
);
const CheckIcon = () => (
  <svg {...iconProps()}>
    <path d="M5 12l5 5l10 -10" />
  </svg>
);
const CartIcon = () => (
  <svg {...iconProps()}>
    <circle cx="6" cy="19" r="2" />
    <circle cx="17" cy="19" r="2" />
    <path d="M17 17h-11v-14h-2" />
    <path d="M6 5l14 1l-1 7h-13" />
  </svg>
);

/**
 * ProductThumbnail — colored-initial tile. When `shareable`, hovering the
 * enclosing `.lc-pp__row` morphs the tile into a "Share product" CTA
 * (copies a shareable link, briefly confirms with a checkmark).
 */
function ProductThumbnail({
  product,
  size = 'sm',
  shareable = false,
}: {
  product: Product;
  size?: 'sm' | 'lg';
  shareable?: boolean;
}) {
  const palette = THUMB_PALETTE[hashString(product.id) % THUMB_PALETTE.length];
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleShare = async (e: MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/products/${product.id}`);
    } catch {
      // Clipboard access denied/unavailable — the link simply won't confirm.
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1000);
  };

  return (
    <span
      className={`lc-pp__thumb${size === 'lg' ? ' lc-pp__thumb--lg' : ''}`}
      style={{ background: palette.bg, color: palette.fg }}
    >
      <span className="lc-pp__thumb-initial" aria-hidden="true">
        {product.name.charAt(0)}
      </span>
      {shareable && (
        <button type="button" className="lc-pp__thumb-share" aria-label="Share product" onClick={handleShare}>
          {copied ? <CheckIcon /> : <ShareIcon />}
        </button>
      )}
    </span>
  );
}

function RatingStars({ rating, count, showCount = true }: { rating: number; count: number; showCount?: boolean }) {
  return (
    <span className="lc-pp__rating">
      <StarIcon />
      {rating.toFixed(1)}
      {showCount && ` · ${count} ratings`}
    </span>
  );
}

function StatusPill({ availability, stockCount }: { availability: Availability; stockCount?: number }) {
  return (
    <span className="lc-pp__status" data-status={availability}>
      {availability === 'low_stock' && stockCount != null ? `${stockCount} left` : STATUS_LABEL[availability]}
    </span>
  );
}

function PriceBlock({ product }: { product: Product }) {
  return (
    <span className="lc-pp__price">
      <span className="lc-pp__price-current">{formatINR(product.discountedPrice)}</span>
      {product.discountPercentage > 0 && (
        <>
          <span className="lc-pp__price-original">{formatINR(product.originalPrice)}</span>
          <span className="lc-pp__price-discount">{product.discountPercentage}% off</span>
        </>
      )}
    </span>
  );
}

/** Copy-to-clipboard value, mirroring TicketDetailsPanel's CopyableDetailValue pattern. */
function CopyableValue({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard access denied/unavailable — the value simply won't confirm.
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1000);
  };

  return (
    <button
      type="button"
      className={`lc-pp__detail-value--copyable${copied ? ' lc-pp__detail-value--copied' : ''}`}
      onClick={handleClick}
    >
      {copied ? 'Copied' : value}
    </button>
  );
}

/** Wraps the first case-insensitive match of `query` inside `text` in a highlight mark. */
function HighlightMatch({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="lc-pp__highlight">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

function ProductRow({
  product,
  search,
  onClick,
}: {
  product: Product;
  search: string;
  onClick: () => void;
}) {
  return (
    <div
      className="lc-pp__row"
      data-availability={product.availability}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <ProductThumbnail product={product} shareable />
      <span className="lc-pp__row-body">
        <span className="lc-pp__row-heading">
          <span className="lc-pp__row-name">
            <HighlightMatch text={product.name} query={search} />
          </span>
          <RatingStars rating={product.rating} count={product.ratingCount} showCount={false} />
        </span>
        <span className="lc-pp__row-footer">
          <PriceBlock product={product} />
          <StatusPill availability={product.availability} stockCount={product.stockCount} />
        </span>
      </span>
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i} className="lc-pp__row--skeleton">
          <span className="lc-pp__skel lc-pp__skel-thumb" />
          <span className="lc-pp__skel-body">
            <span className="lc-pp__skel lc-pp__skel-line lc-pp__skel-line--lg" />
            <span className="lc-pp__skel lc-pp__skel-line lc-pp__skel-line--sm" />
            <span className="lc-pp__skel lc-pp__skel-line" />
          </span>
        </div>
      ))}
    </>
  );
}

function EmptyState({ searching }: { searching: boolean }) {
  return (
    <div className="lc-pp__empty">
      <span className="lc-pp__empty-title">{searching ? 'No products found' : 'No products available'}</span>
      <span className="lc-pp__empty-subtext">
        {searching
          ? 'Try searching with a different product name, SKU, or keyword.'
          : 'Products added to your company catalog will appear here.'}
      </span>
    </div>
  );
}

/** Share + Add to cart CTAs shown in the product detail view. */
function DetailCtas({ product }: { product: Product }) {
  const [shared, setShared] = useState(false);
  const [added, setAdded] = useState(false);
  const shareTimer = useRef<number | undefined>(undefined);
  const addTimer = useRef<number | undefined>(undefined);
  useEffect(
    () => () => {
      window.clearTimeout(shareTimer.current);
      window.clearTimeout(addTimer.current);
    },
    [],
  );

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/products/${product.id}`);
    } catch {
      // Clipboard access denied/unavailable — the link simply won't confirm.
    }
    setShared(true);
    window.clearTimeout(shareTimer.current);
    shareTimer.current = window.setTimeout(() => setShared(false), 1000);
  };

  const handleAddToCart = () => {
    setAdded(true);
    window.clearTimeout(addTimer.current);
    addTimer.current = window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="lc-pp__detail-ctas">
      <Button
        variant="outline"
        color="primary"
        size="sm"
        style={{ flex: 1 }}
        leftSection={shared ? <CheckIcon /> : <ShareIcon />}
        onClick={handleShare}
      >
        {shared ? 'Copied' : 'Share'}
      </Button>
      <Button
        variant="filled"
        color="primary"
        size="sm"
        style={{ flex: 1 }}
        leftSection={added ? <CheckIcon /> : <CartIcon />}
        onClick={handleAddToCart}
      >
        {added ? 'Added' : 'Add to cart'}
      </Button>
    </div>
  );
}

/** Clamps `text` to 3 lines with a "Read more" / "Show less" toggle. */
function TruncatedDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <p className={`lc-pp__detail-desc${expanded ? '' : ' lc-pp__detail-desc--clamped'}`}>{text}</p>
      <button type="button" className="lc-pp__detail-desc-toggle" onClick={() => setExpanded((v) => !v)}>
        {expanded ? 'Show less' : 'Read more'}
      </button>
    </>
  );
}

function ProductDetailView({ product, onBack }: { product: Product; onBack: () => void }) {
  return (
    <div className="lc-pp__detail">
      <button type="button" className="lc-pp__detail-back" onClick={onBack}>
        <BackIcon />
        <span>Back to products</span>
      </button>

      <div className="lc-pp__detail-content">
        <div className="lc-pp__detail-banner">
          <ProductThumbnail product={product} size="lg" />
        </div>
        <div className="lc-pp__detail-header">
          <div className="lc-pp__detail-name-row">
            <span className="lc-pp__detail-name">{product.name}</span>
            <StatusPill availability={product.availability} />
          </div>
          <CopyableValue value={product.sku} />
        </div>

        <div className="lc-pp__detail-section">
          <p className="lc-pp__detail-section-title">Pricing</p>
          <PriceBlock product={product} />
        </div>

        <div className="lc-pp__detail-section">
          <p className="lc-pp__detail-section-title">Description</p>
          <TruncatedDescription text={product.description} />
        </div>

        <DetailCtas product={product} />

      <div className="lc-pp__detail-section">
        <p className="lc-pp__detail-section-title">Rating</p>
        <RatingStars rating={product.rating} count={product.ratingCount} />
      </div>

      <div className="lc-pp__detail-section">
        <p className="lc-pp__detail-section-title">Product information</p>
        <div className="lc-pp__detail-row">
          <span className="lc-pp__detail-row-label">Category</span>
          <span className="lc-pp__detail-row-value">{product.category}</span>
        </div>
        <div className="lc-pp__detail-row">
          <span className="lc-pp__detail-row-label">Brand</span>
          <span className="lc-pp__detail-row-value">{product.brand}</span>
        </div>
        <div className="lc-pp__detail-row">
          <span className="lc-pp__detail-row-label">Product ID</span>
          <span className="lc-pp__detail-row-value">{product.id}</span>
        </div>
        <div className="lc-pp__detail-row">
          <span className="lc-pp__detail-row-label">Stock</span>
          <span className="lc-pp__detail-row-value">{product.stockCount} units</span>
        </div>
        {product.variants && product.variants.length > 0 && (
          <div className="lc-pp__detail-row">
            <span className="lc-pp__detail-row-label">Variants</span>
            <span className="lc-pp__detail-row-value">{product.variants.join(', ')}</span>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

interface FilterState {
  category: string[];
  brand: string[];
  availability: Availability[];
  priceMin: string;
  priceMax: string;
}

const EMPTY_FILTERS: FilterState = { category: [], brand: [], availability: [], priceMin: '', priceMax: '' };

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/**
 * FilterPopover — intentionally near-duplicates Menu's trigger/portal/
 * outside-click/Escape/reposition mechanics (Menu.tsx), because Menu's
 * `items` API only supports single-action rows and has no escape hatch for
 * arbitrary content like a checkbox list + price-range inputs.
 */
function FilterPopover({
  categories,
  brands,
  filters,
  onChange,
  active,
}: {
  categories: string[];
  brands: string[];
  filters: FilterState;
  onChange: (next: FilterState) => void;
  active: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const width = 240;

  useLayoutEffect(() => {
    if (!open) return;
    const reposition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const popoverHeight = popoverRef.current?.offsetHeight ?? 0;
      const maxTop = window.innerHeight - popoverHeight - 8;
      const top = Math.min(rect.bottom + 6, Math.max(8, maxTop));
      setCoords({ top, left: rect.right - width });
    };
    reposition();
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!triggerRef.current?.contains(target) && !popoverRef.current?.contains(target)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="lc-pp__toolbar-btn"
        aria-label="Filter products"
        data-active={active || undefined}
        onClick={() => setOpen((o) => !o)}
      >
        <FilterIcon />
      </button>
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={popoverRef}
            className="lc-pp-filter"
            role="dialog"
            aria-label="Filter products"
            style={{ width, ...(coords ? { top: coords.top, left: coords.left } : { visibility: 'hidden' as const }) }}
          >
            <div className="lc-pp-filter__header">
              <span>Filters</span>
              <button type="button" className="lc-pp-filter__close" aria-label="Close" onClick={() => setOpen(false)}>
                <ClearIcon />
              </button>
            </div>

            <div className="lc-pp-filter__body">
              <div className="lc-pp-filter__group">
                <p className="lc-pp-filter__group-title">Category</p>
                {categories.map((c) => (
                  <label key={c} className="lc-pp-filter__option">
                    <input
                      type="checkbox"
                      className="lc-pp-filter__checkbox"
                      checked={filters.category.includes(c)}
                      onChange={() => onChange({ ...filters, category: toggleValue(filters.category, c) })}
                    />
                    {c}
                  </label>
                ))}
              </div>
              <div className="lc-pp-filter__group">
                <p className="lc-pp-filter__group-title">Brand</p>
                {brands.map((b) => (
                  <label key={b} className="lc-pp-filter__option">
                    <input
                      type="checkbox"
                      className="lc-pp-filter__checkbox"
                      checked={filters.brand.includes(b)}
                      onChange={() => onChange({ ...filters, brand: toggleValue(filters.brand, b) })}
                    />
                    {b}
                  </label>
                ))}
              </div>
              <div className="lc-pp-filter__group">
                <p className="lc-pp-filter__group-title">Availability</p>
                {(Object.keys(STATUS_LABEL) as Availability[]).map((a) => (
                  <label key={a} className="lc-pp-filter__option">
                    <input
                      type="checkbox"
                      className="lc-pp-filter__checkbox"
                      checked={filters.availability.includes(a)}
                      onChange={() => onChange({ ...filters, availability: toggleValue(filters.availability, a) })}
                    />
                    {STATUS_LABEL[a]}
                  </label>
                ))}
              </div>
              <div className="lc-pp-filter__group">
                <p className="lc-pp-filter__group-title">Price range</p>
                <div className="lc-pp-filter__price-row">
                  <span className="lc-pp-filter__price-field">
                    <span className="lc-pp-filter__price-prefix">₹</span>
                    <input
                      type="number"
                      className="lc-pp-filter__price-input"
                      placeholder="Min"
                      value={filters.priceMin}
                      onChange={(e) => onChange({ ...filters, priceMin: e.currentTarget.value })}
                    />
                  </span>
                  <span className="lc-pp-filter__price-sep">–</span>
                  <span className="lc-pp-filter__price-field">
                    <span className="lc-pp-filter__price-prefix">₹</span>
                    <input
                      type="number"
                      className="lc-pp-filter__price-input"
                      placeholder="Max"
                      value={filters.priceMax}
                      onChange={(e) => onChange({ ...filters, priceMax: e.currentTarget.value })}
                    />
                  </span>
                </div>
              </div>
            </div>

            <div className="lc-pp-filter__footer">
              <button
                type="button"
                className="lc-pp-filter__clear"
                disabled={!active}
                onClick={() => onChange(EMPTY_FILTERS)}
              >
                Clear filters
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

export function ProductsPanel() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [sortKey, setSortKey] = useState<SortKey>('relevance');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [navDirection, setNavDirection] = useState<'forward' | 'back'>('forward');

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 500);
    return () => window.clearTimeout(t);
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(MOCK_PRODUCTS.map((p) => p.category))).sort(),
    [],
  );
  const brands = useMemo(() => Array.from(new Set(MOCK_PRODUCTS.map((p) => p.brand))).sort(), []);

  const filtersActive =
    filters.category.length > 0 ||
    filters.brand.length > 0 ||
    filters.availability.length > 0 ||
    filters.priceMin !== '' ||
    filters.priceMax !== '';

  const filteredSorted = useMemo(() => {
    const query = search.trim().toLowerCase();
    const min = filters.priceMin !== '' ? Number(filters.priceMin) : null;
    const max = filters.priceMax !== '' ? Number(filters.priceMax) : null;

    let list = MOCK_PRODUCTS.filter((p) => {
      if (query) {
        const haystack = `${p.name} ${p.sku} ${p.brand} ${p.description} ${p.category}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (filters.category.length > 0 && !filters.category.includes(p.category)) return false;
      if (filters.brand.length > 0 && !filters.brand.includes(p.brand)) return false;
      if (filters.availability.length > 0 && !filters.availability.includes(p.availability)) return false;
      if (min != null && p.discountedPrice < min) return false;
      if (max != null && p.discountedPrice > max) return false;
      return true;
    });

    list = [...list];
    switch (sortKey) {
      case 'price_low_high':
        list.sort((a, b) => a.discountedPrice - b.discountedPrice);
        break;
      case 'price_high_low':
        list.sort((a, b) => b.discountedPrice - a.discountedPrice);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'recently_added':
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        break;
    }
    return list;
  }, [search, filters, sortKey]);

  const selectedProduct = selectedProductId ? MOCK_PRODUCTS.find((p) => p.id === selectedProductId) ?? null : null;

  if (selectedProduct) {
    return (
      <div className="lc-pp">
        <div className="lc-pp__view" data-direction={navDirection} key="detail">
          <ProductDetailView
            product={selectedProduct}
            onBack={() => {
              setNavDirection('back');
              setSelectedProductId(null);
            }}
          />
        </div>
      </div>
    );
  }

  const sortItems: MenuItemData[] = (Object.keys(SORT_LABEL) as SortKey[]).map((key) => ({
    key,
    label: SORT_LABEL[key],
    selected: sortKey === key,
    onClick: () => setSortKey(key),
  }));

  return (
    <div className="lc-pp">
      <div className="lc-pp__view" data-direction={navDirection} key="list">
      <div className="lc-pp__search-row">
        <span className="lc-pp__search">
          <SearchIcon />
          <input
            className="lc-pp__search-input"
            type="text"
            placeholder="Search products by name, SKU, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
          {search && (
            <button type="button" className="lc-pp__search-clear" aria-label="Clear search" onClick={() => setSearch('')}>
              <ClearIcon />
            </button>
          )}
        </span>
        <FilterPopover
          categories={categories}
          brands={brands}
          filters={filters}
          onChange={setFilters}
          active={filtersActive}
        />
        <Menu
          items={sortItems}
          ariaLabel="Sort products"
          align="end"
          width={190}
          trigger={({ ref, onClick }) => (
            <button
              ref={ref}
              type="button"
              className="lc-pp__toolbar-btn"
              aria-label="Sort products"
              data-active={sortKey !== 'relevance' || undefined}
              onClick={onClick}
            >
              <SortIcon />
            </button>
          )}
        />
      </div>

      <div className="lc-pp__results-line">
        All products · {loading ? '...' : filteredSorted.length}
      </div>

      <div className="lc-pp__list">
        {loading ? (
          <SkeletonRows />
        ) : filteredSorted.length === 0 ? (
          <EmptyState searching={search.trim() !== '' || filtersActive} />
        ) : (
          filteredSorted.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              search={search}
              onClick={() => {
                setNavDirection('forward');
                setSelectedProductId(product.id);
              }}
            />
          ))
        )}
      </div>
      </div>
    </div>
  );
}

export default ProductsPanel;
