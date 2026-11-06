/**
 * ProductCardPreview — the four Widget 2.0 product card layouts the bot sends
 * into a conversation (Figma "Agentic Bot Builder", nodes 5205:13681 /
 * 5205:13799 / 5205:13917 / 5199:14230).
 *
 *   compact-tile      200px  square image on top, everything stacked under it
 *   wide-row          343px  136px image rail on the left, content on the right
 *   immersive-poster  296px  308px image with a gradient scrim carrying the
 *                            title, rating and price; description below
 *   editorial         343px  four thumbnails with a +N overlay, no hero image
 *
 * `elements` and `buttons` come straight from the Bot settings form, so the
 * preview is the live read-out of that configuration.
 */
import adidasUltraboost22 from '../../assets/products/adidas-ultraboost-22.webp';
import newBalance990v6 from '../../assets/products/new-balance-990v6.webp';
import nikeAirZoomPegasus41 from '../../assets/products/nike-air-zoom-pegasus-41.webp';
import pumaRsxEfekt from '../../assets/products/puma-rsx-efekt.webp';
import reebokClassicLeather from '../../assets/products/reebok-classic-leather.webp';
import cartPlusIcon from '../../assets/product-card/cart-plus.svg';
import chevronLeftIcon from '../../assets/product-card/chevron-left.svg';
import chevronRightIcon from '../../assets/product-card/chevron-right.svg';
import starIcon from '../../assets/product-card/star.svg';
import starWhiteIcon from '../../assets/product-card/star-white.svg';
import './ProductCardPreview.css';

export type ProductCardLayout = 'compact-tile' | 'wide-row' | 'immersive-poster' | 'editorial';

export const PRODUCT_CARD_LAYOUTS: { id: ProductCardLayout; label: string }[] = [
  { id: 'compact-tile', label: 'Compact tile' },
  { id: 'wide-row', label: 'Wide row' },
  { id: 'immersive-poster', label: 'Immersive poster' },
  { id: 'editorial', label: 'Editorial' },
];

/** Card elements the merchant can switch on and off. Title and selling price are always shown. */
export interface ProductCardElements {
  description: boolean;
  mrp: boolean;
  discount: boolean;
  rating: boolean;
  reviewCount: boolean;
  tags: boolean;
  ribbon: boolean;
}

export type ButtonStyle = 'primary-outline' | 'all-filled';
export type ButtonLayout = 'stacked' | 'side-by-side';

export interface ProductCardButtons {
  count: number;
  labels: string[];
  style: ButtonStyle;
  layout: ButtonLayout;
}

/**
 * Stand-in photography. The prototype only ships the sneaker catalogue, so
 * every layout rotates the same five shots — enough to show how a real photo
 * sits in each frame, without pretending to match the sample copy.
 */
const PHOTOS = [
  nikeAirZoomPegasus41,
  adidasUltraboost22,
  pumaRsxEfekt,
  reebokClassicLeather,
  newBalance990v6,
];

/** The five shots, rotated so each layout opens on a different one. */
const photosFrom = (start: number) => PHOTOS.map((_, i) => PHOTOS[(start + i) % PHOTOS.length]);

export interface ProductCardSample {
  title: string;
  description: string;
  rating: string;
  reviews: string;
  price: string;
  mrp: string;
  discount: string;
  tags: string[];
  ribbon: string;
  /** Carousel images; Editorial shows the first four as thumbnails. */
  images: string[];
}

/**
 * One sample product per layout, drawn from the prototype's own catalogue
 * (`src/data/mockProducts.ts`) so names, prices and ratings line up with the
 * photo each layout opens on — and with the Products tab elsewhere in the app.
 *
 * Ultraboost is deliberately full price: it shows the card dropping the MRP
 * and discount pills when there is no markdown to report.
 */
export const PRODUCT_CARD_SAMPLES: Record<ProductCardLayout, ProductCardSample> = {
  'compact-tile': {
    title: "Nike Men's Air Zoom Pegasus 41 Road Running Shoes, Black/Anthracite, UK 9",
    description: 'Responsive Air Zoom cushioning for daily road miles.',
    rating: '4.6',
    reviews: '(328)',
    price: '4,799',
    mrp: '5,999',
    discount: '-20%',
    tags: ['Road', 'Mesh', '+8'],
    ribbon: 'Bestseller',
    images: photosFrom(0),
  },
  'wide-row': {
    title: "Adidas Men's Ultraboost 22 Running Shoes with Boost Midsole, Cloud White, UK 8",
    description: 'Energy-returning Boost midsole with an adaptive Primeknit upper.',
    rating: '4.4',
    reviews: '(214)',
    price: '16,999',
    mrp: '16,999',
    discount: '',
    tags: ['Boost', 'Primeknit', '+9'],
    ribbon: 'New',
    images: photosFrom(1),
  },
  'immersive-poster': {
    title: 'Puma Unisex RS-X Efekt Chunky Retro Sneakers, Grey Violet/Vapor Grey, UK 8',
    description: 'Chunky retro silhouette with layered mesh and a bold two-tone sole.',
    rating: '4.1',
    reviews: '(96)',
    price: '6,299',
    mrp: '8,999',
    discount: '-30%',
    tags: ['Retro', 'Chunky sole', '+6'],
    ribbon: 'Bestseller',
    images: photosFrom(2),
  },
  editorial: {
    title: 'Reebok Unisex Classic Leather Retro Sneakers, Chalk/Paperwhite, UK 7',
    description: 'Soft leather upper with a die-cut EVA midsole for everyday comfort.',
    rating: '4.2',
    reviews: '(187)',
    price: '4,549',
    mrp: '6,499',
    discount: '-30%',
    tags: ['Leather', 'Everyday', '+11'],
    ribbon: 'Editor’s pick',
    images: photosFrom(3),
  },
};

export interface ProductCardPreviewProps {
  layout: ProductCardLayout;
  elements: ProductCardElements;
  buttons: ProductCardButtons;
  /** Currency symbol shown before every price. */
  currency?: string;
  product?: ProductCardSample;
}

const RoundButton = ({ icon, alt, className }: { icon: string; alt: string; className: string }) => (
  <span className={`lc-pcard__round ${className}`} aria-hidden="true">
    <img src={icon} alt={alt} width={16} height={16} />
  </span>
);

const Photo = ({ src, alt }: { src: string; alt: string }) => (
  <img className="lc-pcard__photo" src={src} alt={alt} loading="lazy" />
);

const Dots = ({ style }: { style: 'pill' | 'bare' }) => (
  <span className="lc-pcard__dots" data-style={style} aria-hidden="true">
    {style === 'pill' && <span className="lc-pcard__dots-backdrop" />}
    <span className="lc-pcard__dot lc-pcard__dot--active" />
    <span className="lc-pcard__dot" />
    <span className="lc-pcard__dot" />
    <span className="lc-pcard__dot" />
    <span className="lc-pcard__dot" />
  </span>
);

function Rating({ product, elements, onImage }: { product: ProductCardSample; elements: ProductCardElements; onImage?: boolean }) {
  if (!elements.rating) return null;
  return (
    <div className="lc-pcard__rating">
      <img src={onImage ? starWhiteIcon : starIcon} alt="" width={16} height={16} />
      <span className="lc-pcard__rating-value">{product.rating}</span>
      {elements.reviewCount && <span className="lc-pcard__rating-count">{product.reviews}</span>}
    </div>
  );
}

function PriceRow({
  product,
  elements,
  currency,
  onImage,
}: {
  product: ProductCardSample;
  elements: ProductCardElements;
  currency: string;
  onImage?: boolean;
}) {
  return (
    <div className="lc-pcard__price-row">
      <span className="lc-pcard__price">{currency}{product.price}</span>
      {elements.mrp && product.mrp !== product.price && (
        <span className="lc-pcard__mrp">{currency}{product.mrp}</span>
      )}
      {elements.discount && product.discount !== '' && (
        <span className="lc-pcard__tag" data-on-image={onImage || undefined}>{product.discount}</span>
      )}
    </div>
  );
}

function TagRow({ product, elements }: { product: ProductCardSample; elements: ProductCardElements }) {
  if (!elements.tags) return null;
  return (
    <div className="lc-pcard__tags">
      {product.tags.map((tag, i) => (
        <span
          key={tag}
          className="lc-pcard__tag"
          data-count={i === product.tags.length - 1 && tag.startsWith('+') || undefined}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function Buttons({ buttons }: { buttons: ProductCardButtons }) {
  const labels = buttons.labels.slice(0, buttons.count).filter((label) => label.trim() !== '');
  if (labels.length === 0) return null;
  return (
    <div className="lc-pcard__buttons" data-layout={buttons.layout}>
      {labels.map((label, i) => (
        <span
          key={`${label}-${i}`}
          className="lc-pcard__button"
          data-variant={buttons.style === 'all-filled' || i === 0 ? 'filled' : 'outline'}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

export function ProductCardPreview({
  layout,
  elements,
  buttons,
  currency = '₹',
  product = PRODUCT_CARD_SAMPLES[layout],
}: ProductCardPreviewProps) {
  const ribbon = elements.ribbon ? <span className="lc-pcard__ribbon">{product.ribbon}</span> : null;

  if (layout === 'wide-row') {
    return (
      <article className="lc-pcard" data-layout="wide-row">
        <div className="lc-pcard__rail">
          <Photo src={product.images[0]} alt={product.title} />
          {ribbon}
          <RoundButton icon={chevronLeftIcon} alt="Previous image" className="lc-pcard__round--prev" />
          <RoundButton icon={chevronRightIcon} alt="Next image" className="lc-pcard__round--next" />
          <Dots style="pill" />
        </div>
        <div className="lc-pcard__content">
          <div className="lc-pcard__header">
            <h3 className="lc-pcard__title">{product.title}</h3>
            <RoundButton icon={cartPlusIcon} alt="Add to cart" className="lc-pcard__round--cart-inline" />
          </div>
          <Rating product={product} elements={elements} />
          {elements.description && <p className="lc-pcard__desc">{product.description}</p>}
          <TagRow product={product} elements={elements} />
          <PriceRow product={product} elements={elements} currency={currency} />
          <Buttons buttons={buttons} />
        </div>
      </article>
    );
  }

  if (layout === 'immersive-poster') {
    return (
      <article className="lc-pcard" data-layout="immersive-poster">
        <div className="lc-pcard__image">
          <Photo src={product.images[0]} alt={product.title} />
          {ribbon}
          <RoundButton icon={cartPlusIcon} alt="Add to cart" className="lc-pcard__round--cart" />
          <Dots style="bare" />
          <RoundButton icon={chevronLeftIcon} alt="Previous image" className="lc-pcard__round--prev" />
          <RoundButton icon={chevronRightIcon} alt="Next image" className="lc-pcard__round--next" />
          <div className="lc-pcard__scrim">
            <h3 className="lc-pcard__title lc-pcard__title--on-image">{product.title}</h3>
            <div className="lc-pcard__meta">
              <Rating product={product} elements={elements} onImage />
              <PriceRow product={product} elements={elements} currency={currency} onImage />
            </div>
          </div>
        </div>
        <div className="lc-pcard__content">
          {elements.description && <p className="lc-pcard__desc">{product.description}</p>}
          <TagRow product={product} elements={elements} />
          <Buttons buttons={buttons} />
        </div>
      </article>
    );
  }

  if (layout === 'editorial') {
    return (
      <article className="lc-pcard" data-layout="editorial">
        <div className="lc-pcard__thumbs" aria-hidden="true">
          {product.images.slice(0, 4).map((src, i) => {
            const isLast = i === 3 && product.images.length > 4;
            return (
              <span key={i} className="lc-pcard__thumb" data-more={isLast || undefined}>
                <Photo src={src} alt="" />
                {isLast && <span className="lc-pcard__thumb-more">+{product.images.length - 4}</span>}
              </span>
            );
          })}
        </div>
        <div className="lc-pcard__header">
          {elements.ribbon && <span className="lc-pcard__ribbon lc-pcard__ribbon--inline">{product.ribbon}</span>}
          <RoundButton icon={cartPlusIcon} alt="Add to cart" className="lc-pcard__round--cart-inline" />
        </div>
        <h3 className="lc-pcard__title lc-pcard__title--lg">{product.title}</h3>
        <Rating product={product} elements={elements} />
        {elements.description && <p className="lc-pcard__desc">{product.description}</p>}
        <TagRow product={product} elements={elements} />
        <span className="lc-pcard__divider" />
        <PriceRow product={product} elements={elements} currency={currency} />
        <Buttons buttons={buttons} />
      </article>
    );
  }

  return (
    <article className="lc-pcard" data-layout="compact-tile">
      <div className="lc-pcard__image">
        <Photo src={product.images[0]} alt={product.title} />
        {ribbon}
        <RoundButton icon={cartPlusIcon} alt="Add to cart" className="lc-pcard__round--cart" />
        <RoundButton icon={chevronLeftIcon} alt="Previous image" className="lc-pcard__round--prev" />
        <RoundButton icon={chevronRightIcon} alt="Next image" className="lc-pcard__round--next" />
        <Dots style="pill" />
      </div>
      <div className="lc-pcard__content">
        <h3 className="lc-pcard__title">{product.title}</h3>
        <Rating product={product} elements={elements} />
        <PriceRow product={product} elements={elements} currency={currency} />
        {elements.description && <p className="lc-pcard__desc">{product.description}</p>}
        <TagRow product={product} elements={elements} />
        <Buttons buttons={buttons} />
      </div>
    </article>
  );
}

export default ProductCardPreview;
