/**
 * BotSettings — Settings → Bot settings, Automation product
 * (Figma "Agentic Bot Builder", node 5205:13540).
 *
 * A section tab bar + settings search sit under the page header; below them the
 * page splits into a scrolling form column and a sticky preview column that
 * renders the product card exactly as the bot will send it.
 *
 * The page owns its own state — none of it exists in `SettingsScreen` — so it
 * drops into the settings shell with just `contentPadding={0}`.
 */
import { useMemo, useState } from 'react';
import { NativeSelect } from '../Select';
import { CheckIcon } from '../icons';
import {
  PRODUCT_CARD_LAYOUTS,
  ProductCardPreview,
  type ButtonLayout,
  type ButtonStyle,
  type ProductCardElements,
  type ProductCardLayout,
} from './ProductCardPreview';
import './BotSettings.css';

const SECTION_TABS = [
  { id: 'bot-behaviour', label: 'Bot behaviour' },
  { id: 'messaging', label: 'Messaging' },
  { id: 'channels', label: 'Channels & input' },
  { id: 'csat', label: 'CSAT' },
  { id: 'product-cards', label: 'Product cards' },
  { id: 'advanced', label: 'Advanced' },
];

type ElementKey = keyof ProductCardElements | 'title' | 'price';

const CARD_ELEMENT_ROWS: { key: ElementKey; label: string; description: string; required?: boolean }[] = [
  { key: 'title', label: 'Product title', description: 'Name of the product, up to 2 lines', required: true },
  { key: 'description', label: 'Description', description: 'Short product summary, up to 2 lines' },
  { key: 'price', label: 'Selling price', description: 'Number with currency symbol, e.g. ₹399', required: true },
  {
    key: 'mrp',
    label: 'MRP / original price',
    description: 'Struck through next to the selling price. Hidden automatically when it matches the selling price.',
  },
  { key: 'discount', label: 'Discount value', description: 'Percentage off, worked out from the MRP' },
  { key: 'rating', label: 'Rating', description: 'Average star rating out of 5' },
  { key: 'reviewCount', label: 'Review count', description: 'Number of reviews, shown next to the rating' },
  { key: 'tags', label: 'Tag pills', description: 'Up to three product attributes, then a +N pill' },
  { key: 'ribbon', label: 'Ribbon badge', description: 'Bestseller, New or Editor’s pick over the image' },
];

const CURRENCIES = [
  { value: '₹', label: '₹  Indian Rupee (INR)' },
  { value: '$', label: '$  US Dollar (USD)' },
  { value: '€', label: '€  Euro (EUR)' },
  { value: '£', label: '£  Pound Sterling (GBP)' },
  { value: 'AED ', label: 'AED  UAE Dirham (AED)' },
];

const BUTTON_STYLES: { id: ButtonStyle; label: string; description: string }[] = [
  { id: 'primary-outline', label: 'Primary + outline', description: 'First button filled, others outlined' },
  { id: 'all-filled', label: 'All filled', description: 'Every button filled in brand green' },
];

const BUTTON_LAYOUTS: { id: ButtonLayout; label: string }[] = [
  { id: 'stacked', label: 'Stacked' },
  { id: 'side-by-side', label: 'Side by side' },
];

const LABEL_LIMIT = 25;

const SearchIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="lc-bset__toggle-row">
      <span className="lc-bset__toggle-copy">
        <span className="lc-bset__toggle-label">{label}</span>
        <span className="lc-bset__toggle-desc">{description}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className="lc-bset__switch"
        onClick={() => onChange(!checked)}
      >
        <span className="lc-bset__switch-thumb" />
      </button>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="lc-bset__section">
      <header className="lc-bset__section-head">
        <h3 className="lc-bset__section-title">{title}</h3>
        {subtitle && <p className="lc-bset__section-sub">{subtitle}</p>}
      </header>
      <div className="lc-bset__section-body">{children}</div>
    </section>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="lc-bset__field-label">
      <span className="lc-bset__required" aria-hidden="true" />
      {children}
    </span>
  );
}

/** Everything on this page that is actually a saved setting. */
export interface BotSettingsValues {
  layout: ProductCardLayout;
  currency: string;
  elements: ProductCardElements;
  buttonCount: number;
  buttonLabels: string[];
  buttonStyle: ButtonStyle;
  buttonLayout: ButtonLayout;
  buyNowOpensPage: boolean;
  showVariants: boolean;
  cheapestVariant: boolean;
  showOutOfStock: boolean;
}

export const DEFAULT_BOT_SETTINGS: BotSettingsValues = {
  layout: 'compact-tile',
  currency: '₹',
  elements: {
    description: true,
    mrp: true,
    discount: true,
    rating: true,
    reviewCount: true,
    tags: true,
    ribbon: true,
  },
  buttonCount: 2,
  buttonLabels: ['Buy now', 'View details', 'Talk to us'],
  buttonStyle: 'primary-outline',
  buttonLayout: 'stacked',
  buyNowOpensPage: true,
  showVariants: true,
  cheapestVariant: false,
  showOutOfStock: false,
};

export interface BotSettingsProps {
  values: BotSettingsValues;
  onChange: (next: BotSettingsValues) => void;
  /** Section tab to open on mount. */
  initialSection?: string;
}

export function BotSettings({ values, onChange, initialSection = 'product-cards' }: BotSettingsProps) {
  const [section, setSection] = useState(initialSection);
  const [search, setSearch] = useState('');
  // Which card the stage shows. Not a setting — the tabs are there to compare
  // the four layouts without committing to one.
  const [previewLayout, setPreviewLayout] = useState<ProductCardLayout>(values.layout);

  const {
    layout,
    currency,
    elements,
    buttonCount,
    buttonLabels,
    buttonStyle,
    buttonLayout,
    buyNowOpensPage,
    showVariants,
    cheapestVariant,
    showOutOfStock,
  } = values;

  const patch = (next: Partial<BotSettingsValues>) => onChange({ ...values, ...next });

  const buttons = useMemo(
    () => ({ count: buttonCount, labels: buttonLabels, style: buttonStyle, layout: buttonLayout }),
    [buttonCount, buttonLabels, buttonStyle, buttonLayout],
  );

  // Picking a default layout moves the preview with it; the preview tabs can
  // then be used to check the other three without changing the setting.
  const chooseLayout = (next: ProductCardLayout) => {
    patch({ layout: next });
    setPreviewLayout(next);
  };

  const setLabel = (index: number, value: string) =>
    patch({
      buttonLabels: buttonLabels.map((label, i) => (i === index ? value.slice(0, LABEL_LIMIT) : label)),
    });

  const toggleElement = (key: ElementKey) => {
    if (key === 'title' || key === 'price') return;
    patch({ elements: { ...elements, [key]: !elements[key] } });
  };

  return (
    <div className="lc-bset">
      <div className="lc-bset__controls">
        <div className="lc-bset__tabs" role="tablist" aria-label="Bot settings sections">
          {SECTION_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={tab.id === section}
              className="lc-bset__tab"
              data-active={tab.id === section}
              onClick={() => setSection(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <label className="lc-bset__search">
          <SearchIcon />
          <input
            type="search"
            placeholder="Search all settings"
            aria-label="Search all settings"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
        </label>
      </div>

      <div className="lc-bset__rule" />

      {section !== 'product-cards' ? (
        <div className="lc-bset__empty">
          <p className="lc-bset__empty-title">{SECTION_TABS.find((t) => t.id === section)?.label}</p>
          <p className="lc-bset__empty-desc">This section hasn’t been designed yet. Product cards is the live one.</p>
        </div>
      ) : (
        <div className="lc-bset__columns">
          <div className="lc-bset__form-col">
            <header className="lc-bset__col-head">
              <h2 className="lc-bset__col-title">Product cards</h2>
              <p className="lc-bset__col-sub">Configure product card layout, content, buttons and which products are sent.</p>
            </header>

            <div className="lc-bset__scroll lc-scrollbar-thin">
              <Section title="Layout">
                <div className="lc-bset__field">
                  <FieldLabel>Default card layout</FieldLabel>
                  <NativeSelect
                    aria-label="Default card layout"
                    size="md"
                    data={PRODUCT_CARD_LAYOUTS.map((l) => ({ value: l.id, label: l.label }))}
                    value={layout}
                    onChange={(e) => chooseLayout(e.currentTarget.value as ProductCardLayout)}
                  />
                  <p className="lc-bset__helper">
                    Used whenever a product card is added to a flow. You can change it on any individual product card node.
                  </p>
                </div>
              </Section>

              <Section
                title="Card content"
                subtitle="Choose what shows on each card. Title and selling price are always shown."
              >
                <div className="lc-bset__field">
                  <FieldLabel>Card elements</FieldLabel>
                  <ul className="lc-bset__elements">
                    {CARD_ELEMENT_ROWS.map((row) => {
                      const checked = row.required || elements[row.key as keyof ProductCardElements];
                      return (
                        <li key={row.key} className="lc-bset__element">
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={checked}
                            aria-label={row.label}
                            disabled={row.required}
                            className="lc-bset__check"
                            data-checked={checked}
                            onClick={() => toggleElement(row.key)}
                          >
                            {checked && <CheckIcon width={12} height={12} />}
                          </button>
                          <span className="lc-bset__element-copy">
                            <span className="lc-bset__element-label">{row.label}</span>
                            <span className="lc-bset__element-desc">{row.description}</span>
                          </span>
                          {row.required && <span className="lc-bset__pill">Required</span>}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="lc-bset__field">
                  <FieldLabel>Currency symbol</FieldLabel>
                  <NativeSelect
                    aria-label="Currency symbol"
                    size="md"
                    data={CURRENCIES}
                    value={currency}
                    onChange={(e) => patch({ currency: e.currentTarget.value })}
                  />
                  <p className="lc-bset__helper">Applied to every price on the card.</p>
                </div>
              </Section>

              <Section title="Buttons" subtitle="Up to three actions under every product card.">
                <div className="lc-bset__field">
                  <FieldLabel>Number of buttons</FieldLabel>
                  <div className="lc-bset__segmented">
                    {[1, 2, 3].map((n) => (
                      <button
                        key={n}
                        type="button"
                        className="lc-bset__segment"
                        data-active={n === buttonCount}
                        aria-pressed={n === buttonCount}
                        onClick={() => patch({ buttonCount: n })}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lc-bset__field">
                  <FieldLabel>Button labels</FieldLabel>
                  {Array.from({ length: buttonCount }, (_, i) => (
                    <div key={i} className="lc-bset__label-row">
                      <span className="lc-bset__label-name">Button {i + 1}</span>
                      <input
                        className="lc-bset__input"
                        aria-label={`Button ${i + 1} label`}
                        value={buttonLabels[i] ?? ''}
                        maxLength={LABEL_LIMIT}
                        onChange={(e) => setLabel(i, e.currentTarget.value)}
                      />
                      <span className="lc-bset__counter">
                        {(buttonLabels[i] ?? '').length}/{LABEL_LIMIT}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="lc-bset__field">
                  <FieldLabel>Button style</FieldLabel>
                  <div className="lc-bset__styles">
                    {BUTTON_STYLES.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        role="radio"
                        aria-checked={style.id === buttonStyle}
                        className="lc-bset__style"
                        data-active={style.id === buttonStyle}
                        onClick={() => patch({ buttonStyle: style.id })}
                      >
                        <span className="lc-bset__style-preview" aria-hidden="true">
                          <span className="lc-bset__style-bar" data-variant="filled" />
                          <span
                            className="lc-bset__style-bar"
                            data-variant={style.id === 'all-filled' ? 'filled' : 'outline'}
                          />
                        </span>
                        <span className="lc-bset__style-copy">
                          <span className="lc-bset__style-radio" aria-hidden="true" />
                          <span className="lc-bset__style-text">
                            <span className="lc-bset__style-label">{style.label}</span>
                            <span className="lc-bset__style-desc">{style.description}</span>
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lc-bset__field">
                  <FieldLabel>Button layout</FieldLabel>
                  <div className="lc-bset__segmented">
                    {BUTTON_LAYOUTS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className="lc-bset__segment"
                        data-active={option.id === buttonLayout}
                        aria-pressed={option.id === buttonLayout}
                        onClick={() => patch({ buttonLayout: option.id })}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <p className="lc-bset__helper">
                    Side by side fits two short labels. Three buttons always stack.
                  </p>
                </div>

                <Toggle
                  label="Buy now opens the product page"
                  description="Off sends the shopper straight to checkout with the item in their cart."
                  checked={buyNowOpensPage}
                  onChange={(next) => patch({ buyNowOpensPage: next })}
                />
              </Section>

              <Section title="Products shown" subtitle="Which products and variants the bot is allowed to send.">
                <Toggle
                  label="Show product variants"
                  description="Lets the shopper pick size, colour or flavour on the card."
                  checked={showVariants}
                  onChange={(next) => patch({ showVariants: next })}
                />
                <Toggle
                  label="Select cheapest in-stock variant"
                  description="Opens the card on the lowest-priced variant that is in stock."
                  checked={cheapestVariant}
                  onChange={(next) => patch({ cheapestVariant: next })}
                />
                <Toggle
                  label="Show out-of-stock products"
                  description="Out-of-stock items appear with their buttons disabled."
                  checked={showOutOfStock}
                  onChange={(next) => patch({ showOutOfStock: next })}
                />
              </Section>
            </div>
          </div>

          <div className="lc-bset__preview-col">
            <div className="lc-bset__layout-tabs" role="tablist" aria-label="Preview layout">
              {PRODUCT_CARD_LAYOUTS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={option.id === previewLayout}
                  className="lc-bset__layout-tab"
                  data-active={option.id === previewLayout}
                  onClick={() => setPreviewLayout(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="lc-bset__stage">
              <ProductCardPreview
                layout={previewLayout}
                elements={elements}
                buttons={buttons}
                currency={currency}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BotSettings;
