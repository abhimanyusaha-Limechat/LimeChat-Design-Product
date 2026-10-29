/**
 * The widget editor's Cards tab: how products look when the bot recommends them in a
 * conversation — the layout template, which details each card shows, and its buttons.
 */
import type { ReactNode } from 'react';
import { Row, SectionHeading } from './InboxSettingsSections';

export type CardTemplate = 'compact' | 'wide' | 'immersive' | 'editorial';
export type ButtonStyle = 'primary-outline' | 'all-filled';
export type ButtonLayout = 'stacked' | 'side-by-side';

export type CardElementKey =
  | 'description'
  | 'sellingPrice'
  | 'mrp'
  | 'discount'
  | 'rating'
  | 'reviewCount'
  | 'tagPills'
  | 'ribbonBadge';

export interface InboxWidgetCards {
  template: CardTemplate;
  /** The product title is always shown, so it isn't stored. */
  elements: Record<CardElementKey, boolean>;
  buttonCount: 1 | 2 | 3;
  buttonStyle: ButtonStyle;
  buttonLayout: ButtonLayout;
}

interface Option<V extends string> {
  value: V;
  label: string;
  description: string;
}

const TEMPLATES: Option<CardTemplate>[] = [
  { value: 'compact', label: 'Compact tile', description: 'Image on top' },
  { value: 'wide', label: 'Wide row', description: 'Image on left' },
  { value: 'immersive', label: 'Immersive poster', description: 'Full-bleed image' },
  { value: 'editorial', label: 'Editorial', description: 'Text-led' },
];

const BUTTON_STYLES: Option<ButtonStyle>[] = [
  { value: 'primary-outline', label: 'Primary + outline', description: 'First button filled, others outlined' },
  { value: 'all-filled', label: 'All filled', description: 'Every button filled' },
];

const ELEMENTS: { key: CardElementKey; label: string; description: string; tag?: string }[] = [
  { key: 'description', label: 'Description', description: 'Short product summary, up to 2 lines' },
  { key: 'sellingPrice', label: 'Selling price', description: 'Number with currency symbol, e.g. ₹399' },
  { key: 'mrp', label: 'MRP / original price', description: 'Number with currency symbol, shown struck through' },
  { key: 'discount', label: 'Discount value', description: 'Shown as a percentage off MRP, e.g. -20%' },
  { key: 'rating', label: 'Rating', description: 'Out of 5, one decimal place, e.g. 4.6' },
  { key: 'reviewCount', label: 'Review count', description: 'Number of reviews, shown separately' },
  { key: 'tagPills', label: 'Tag pills', description: 'Up to 3 pills, 12 characters each, e.g. SPF 50+' },
  { key: 'ribbonBadge', label: 'Ribbon badge', description: 'Up to 12 characters, e.g. Top Pick', tag: 'Synced from store' },
];

const BUTTON_COUNTS: (1 | 2 | 3)[] = [1, 2, 3];

const LAYOUTS: { value: ButtonLayout; label: string }[] = [
  { value: 'stacked', label: 'Stacked' },
  { value: 'side-by-side', label: 'Side By Side' },
];

function OptionCards<V extends string>({
  label,
  options,
  value,
  thumb,
  onChange,
}: {
  label: string;
  options: Option<V>[];
  value: V;
  thumb: (value: V) => ReactNode;
  onChange: (next: V) => void;
}) {
  return (
    <div className="lc-inbs__option-cards" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          className="lc-inbs__option-card"
          onClick={() => onChange(o.value)}
        >
          <span className="lc-inbs__option-thumb" aria-hidden="true">{thumb(o.value)}</span>
          <span className="lc-inbs__option-text">
            <span className="lc-inbs__label">{o.label}</span>
            <span className="lc-inbs__row-desc">{o.description}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

export function WidgetCardsSection({
  value,
  onChange,
}: {
  value: InboxWidgetCards;
  onChange: (next: InboxWidgetCards) => void;
}) {
  const set = (patch: Partial<InboxWidgetCards>) => onChange({ ...value, ...patch });
  // The compact tile is too narrow for side-by-side buttons, so it always stacks.
  const compact = value.template === 'compact';
  const layout: ButtonLayout = compact ? 'stacked' : value.buttonLayout;
  return (
    <section className="lc-inbs__group" aria-label="Product cards">
      <SectionHeading title="Product cards" description="Choose how products appear when the bot recommends them in a conversation." />
      <div className="lc-inbs__table">
        <Row label="Card template" description="All templates show the same product details. Only the layout changes.">
          <OptionCards
            label="Card template"
            options={TEMPLATES}
            value={value.template}
            thumb={(t) => <span className="lc-inbs__thumb-card" data-template={t}><i /><i /><i /><b /></span>}
            onChange={(template) => set({ template })}
          />
        </Row>
        <Row label="Card elements" description="Choose what shows on each card. Title is always shown.">
          <div className="lc-inbs__elements">
            <ElementRow label="Product title" description="Name of the product, up to 2 lines" checked locked tag="Required" />
            {ELEMENTS.map(({ key, label, description, tag }) => (
              <ElementRow
                key={key}
                label={label}
                description={description}
                tag={tag}
                checked={value.elements[key]}
                onChange={(checked) => set({ elements: { ...value.elements, [key]: checked } })}
              />
            ))}
          </div>
        </Row>
        <Row label="Number of buttons" description="How many action buttons each card has.">
          <div className="lc-inbs__ratios" role="radiogroup" aria-label="Number of buttons">
            {BUTTON_COUNTS.map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={value.buttonCount === n}
                className="lc-inbs__segment"
                onClick={() => set({ buttonCount: n })}
              >
                {n}
              </button>
            ))}
          </div>
        </Row>
        <Row label="Button style" description="How the buttons are filled.">
          <OptionCards
            label="Button style"
            options={BUTTON_STYLES}
            value={value.buttonStyle}
            thumb={(style) => (
              <span className="lc-inbs__thumb-buttons" data-style={style}><i /><i /></span>
            )}
            onChange={(buttonStyle) => set({ buttonStyle })}
          />
        </Row>
        <Row
          label="Button layout"
          description={compact ? 'Compact tile is too narrow for side-by-side buttons, so they always stack.' : 'Stack the buttons, or place them next to each other.'}
        >
          <div className="lc-inbs__ratios" role="radiogroup" aria-label="Button layout">
            {LAYOUTS.map((l) => (
              <button
                key={l.value}
                type="button"
                role="radio"
                aria-checked={layout === l.value}
                disabled={compact && l.value === 'side-by-side'}
                className="lc-inbs__segment"
                onClick={() => set({ buttonLayout: l.value })}
              >
                {l.label}
              </button>
            ))}
          </div>
        </Row>
      </div>
    </section>
  );
}

function ElementRow({
  label,
  description,
  tag,
  checked,
  locked = false,
  onChange,
}: {
  label: string;
  description: string;
  tag?: string;
  checked: boolean;
  locked?: boolean;
  onChange?: (next: boolean) => void;
}) {
  return (
    <label className="lc-inbs__element" data-locked={locked || undefined}>
      <input type="checkbox" checked={checked} disabled={locked} onChange={(e) => onChange?.(e.currentTarget.checked)} />
      <span className="lc-inbs__option-text">
        <span className="lc-inbs__label">{label}</span>
        <span className="lc-inbs__row-desc">{description}</span>
      </span>
      {tag && <span className="lc-inbs__tag">{tag}</span>}
    </label>
  );
}
