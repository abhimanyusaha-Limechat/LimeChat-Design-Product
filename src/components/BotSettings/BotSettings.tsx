/**
 * BotSettings — Settings → Bot settings, Automation product
 * (Figma "Agentic Bot Builder", section 5619:12026; Product cards is node 5205:13540).
 *
 * A section tab bar + settings search sit under the page header. Five of the tabs are a
 * single column of setting rows (`sections.tsx`); Product cards splits into a scrolling
 * form column and a sticky preview column that renders the card as the bot will send it.
 *
 * The values live in `SettingsScreen`, which owns Save; `savedValues` is its last saved
 * copy, so a tab with edits to save gets an amber dot.
 */
import { Fragment, useMemo, useRef, useState } from 'react';
import { NativeSelect } from '../Select';
import { SegmentedTabs } from '../SegmentedTabs';
import { CheckIcon, CloseIcon } from '../icons';
import { PRODUCT_CARD_LAYOUTS, ProductCardPreview, type ProductCardElements, type ProductCardLayout } from './ProductCardPreview';
import {
  DEFAULT_BOT_SETTINGS,
  SECTION_TABS,
  unsavedChanges,
  type BotSettingsSection,
  type BotSettingsValues,
} from './botSettingsValues';
import { AdvancedSection, BotBehaviourSection, ChannelsSection, CsatSection, MessagingSection } from './sections';
import {
  AdvancedSectionV2,
  BotBehaviourSectionV2,
  ChannelsSectionV2,
  CsatSectionV2,
  MessagingSectionV2,
  ProductCardsSectionV2,
} from './sectionsV2';
import { BUTTON_LAYOUTS, BUTTON_STYLES, CARD_ELEMENT_ROWS, CURRENCIES, LABEL_LIMIT, type ElementKey } from './productCardsOptions';
import { searchSettings, settingEntry, type SettingEntry } from './settingsIndex';
import { NO_FILTER, SearchFilterContext, type SearchFilter } from './SettingRow';
import './BotSettings.css';

export { DEFAULT_BOT_SETTINGS, SECTION_TABS, unsavedChanges };
export type { BotSettingsSection, BotSettingsValues };

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

/**
 * The line above the open tab while "Search all settings" has a query: how many of its
 * settings match, or, when none do, which tabs have matches.
 */
function SearchSummary({
  query,
  matches,
  section,
  unfiltered,
  onSection,
}: {
  query: string;
  matches: SettingEntry[];
  section: BotSettingsSection;
  /** The open tab shows every setting regardless of the search (Version 1 Product cards). */
  unfiltered: boolean;
  onSection: (next: BotSettingsSection) => void;
}) {
  const counts = SECTION_TABS.map((tab) => ({ ...tab, count: matches.filter((m) => m.section === tab.id).length }));
  const here = counts.find((tab) => tab.id === section)!;
  const elsewhere = counts.filter((tab) => tab.id !== section && tab.count > 0);

  if (matches.length === 0) {
    return (
      <div className="lc-bset__search-empty" role="status">
        <p className="lc-bset__search-empty-title">No settings match "{query}"</p>
        <p className="lc-bset__search-empty-desc">Try another word, or clear the search.</p>
      </div>
    );
  }
  if (here.count === 0) {
    return (
      <div className="lc-bset__search-empty" role="status">
        <p className="lc-bset__search-empty-title">No matches in {here.label}</p>
        <p className="lc-bset__search-empty-desc">
          Found in{' '}
          {elsewhere.map((tab, i) => (
            <Fragment key={tab.id}>
              {i > 0 && ', '}
              <button type="button" className="lc-bset__search-link" onClick={() => onSection(tab.id)}>
                {`${tab.label} (${tab.count})`}
              </button>
            </Fragment>
          ))}
          .
        </p>
      </div>
    );
  }
  return (
    <p className="lc-bset__search-count" role="status">
      {here.count} {here.count === 1 ? 'setting matches' : 'settings match'} "{query}" in {here.label}
      {unfiltered && '. Product cards shows all its settings while you search'}.
    </p>
  );
}

export interface BotSettingsProps {
  values: BotSettingsValues;
  onChange: (next: BotSettingsValues) => void;
  /** The last saved copy; sections that differ from it get a dot on their tab. */
  savedValues?: BotSettingsValues;
  /** Section tab to open on mount. */
  initialSection?: BotSettingsSection;
  /**
   * 'v1' lays the tabs out as the Figma frames do; 'v2' uses the Helpdesk inbox page's boxed
   * groups. Both are kept to compare; the state switcher picks, opening in 'v2'.
   */
  version?: 'v1' | 'v2';
}

export function BotSettings({ values, onChange, savedValues, initialSection = 'bot-behaviour', version = 'v1' }: BotSettingsProps) {
  const [section, setSection] = useState<BotSettingsSection>(initialSection);
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const clearSearch = () => {
    setSearch('');
    searchRef.current?.focus();
  };
  const unsavedSections = savedValues ? unsavedChanges(values, savedValues).sections : [];

  // Search narrows the open tab to its matching rows (a parent row stays while one of its
  // rows matches) and counts matches on every tab, so the tabs show where else to look.
  const query = search.trim();
  const matches = useMemo(() => (query ? searchSettings(query) : null), [query]);
  const filter = useMemo<SearchFilter>(() => {
    if (!matches) return NO_FILTER;
    const hit = new Set(matches.map((m) => m.id));
    const parents = new Set(matches.map((m) => m.parent).filter((p): p is string => !!p));
    return {
      query,
      shows: (id) => !id || hit.has(id) || parents.has(id) || hit.has(settingEntry(id)?.parent ?? ''),
    };
  }, [matches, query]);
  const tabs = SECTION_TABS.map((tab) => ({
    ...tab,
    dot: unsavedSections.includes(tab.id),
    badge: matches ? matches.filter((m) => m.section === tab.id).length || undefined : undefined,
  }));
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
        <SegmentedTabs ariaLabel="Bot settings sections" tabs={tabs} value={section} onChange={setSection} />
        <label className="lc-bset__search">
          <SearchIcon />
          <input
            ref={searchRef}
            type="search"
            placeholder="Search all settings"
            aria-label="Search all settings"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') clearSearch();
            }}
          />
          {search && (
            <button type="button" className="lc-bset__search-clear" aria-label="Clear search" onClick={clearSearch}>
              <CloseIcon size={14} />
            </button>
          )}
        </label>
      </div>

      <div className="lc-bset__rule" />

      {matches && (
        <SearchSummary
          query={query}
          matches={matches}
          section={section}
          unfiltered={section === 'product-cards' && version === 'v1'}
          onSection={setSection}
        />
      )}

      <SearchFilterContext.Provider value={filter}>
      {section !== 'product-cards' ? (
        <div className="lc-bset__page lc-scrollbar-thin" data-version={version}>
          {version === 'v2' ? (
            <>
              {section === 'bot-behaviour' && <BotBehaviourSectionV2 values={values} patch={patch} />}
              {section === 'messaging' && <MessagingSectionV2 values={values} patch={patch} />}
              {section === 'channels' && <ChannelsSectionV2 values={values} patch={patch} />}
              {section === 'csat' && <CsatSectionV2 values={values} patch={patch} />}
              {section === 'advanced' && <AdvancedSectionV2 values={values} patch={patch} />}
            </>
          ) : (
            <>
              {section === 'bot-behaviour' && <BotBehaviourSection values={values} patch={patch} />}
              {section === 'messaging' && <MessagingSection values={values} patch={patch} />}
              {section === 'channels' && <ChannelsSection values={values} patch={patch} />}
              {section === 'csat' && <CsatSection values={values} patch={patch} />}
              {section === 'advanced' && <AdvancedSection values={values} patch={patch} />}
            </>
          )}
        </div>
      ) : version === 'v2' ? (
        <div className="lc-bset__page lc-scrollbar-thin" data-version="v2">
          <ProductCardsSectionV2 values={values} patch={patch} />
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
      </SearchFilterContext.Provider>
    </div>
  );
}

export default BotSettings;
