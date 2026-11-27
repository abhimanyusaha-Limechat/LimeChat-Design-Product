/**
 * Version 2 of the Bot settings tabs: the Helpdesk inbox page's layout, where each tab is a
 * list of groups (a heading, optionally with its on/off switch, outside a bordered card) and
 * each setting is a label | control row inside the card. Same values, copy and search as
 * Version 1 (`sections.tsx`); only the hierarchy and the boxes differ.
 */
import { useContext, useId, useMemo, useState, type ReactNode } from 'react';
import { CheckIcon } from '../icons';
import { PRODUCT_CARD_LAYOUTS, ProductCardPreview, type ButtonLayout, type ButtonStyle, type ProductCardElements, type ProductCardLayout } from './ProductCardPreview';
import { BUTTON_LAYOUTS, BUTTON_STYLES, CARD_ELEMENT_ROWS, CURRENCIES, LABEL_LIMIT, type ElementKey } from './productCardsOptions';
import { SectionHeading } from '../InboxSettings';
import { NativeSelect } from '../Select';
import { TagsInput } from '../TagsInput';
import { HighlightMatch } from '../HighlightMatch';
import { Helper, NumberField, SearchFilterContext } from './SettingRow';
import { RichTextField } from './RichTextField';
import { FLOW_OPTIONS, LANGUAGES, RATING_SCALES, TRANSCRIPTION_MODELS } from './botSettingsValues';
import { row, type SettingId } from './settingsIndex';
import type { SectionProps } from './sections';

/**
 * A heading plus a card of rows. `id` names the switch row the heading stands for, so a
 * search that matches it keeps the whole group; otherwise the group stays while any of its
 * `rows` match.
 */
function Group({
  id,
  title,
  description,
  toggle,
  rows,
  children,
}: {
  id?: SettingId;
  title: string;
  description: string;
  toggle?: { checked: boolean; onChange: (next: boolean) => void };
  rows: SettingId[];
  children: ReactNode;
}) {
  const filter = useContext(SearchFilterContext);
  const visible = !filter.query || (id != null && filter.shows(id)) || rows.some((r) => filter.shows(r));
  if (!visible) return null;
  return (
    <section className="lc-inbs__group" aria-label={title}>
      <SectionHeading title={title} description={description} toggle={toggle} />
      <div className="lc-inbs__table">{children}</div>
    </section>
  );
}

/** A label | control row. `stacked` puts the control under the label, for editors. */
function V2Row({ id, off, stacked, children }: { id: SettingId; off?: boolean; stacked?: boolean; children: ReactNode }) {
  const filter = useContext(SearchFilterContext);
  if (!filter.shows(id)) return null;
  const { label, tip } = row(id);
  return (
    <div className={`lc-inbs__row${stacked ? ' lc-inbs__row--stacked' : ' lc-inbs__row--top'}`} data-disabled={!!off} data-setting-id={id}>
      <div className="lc-inbs__row-label">
        <span className="lc-inbs__label">
          <HighlightMatch text={label} query={filter.query} />
        </span>
        <p className="lc-inbs__row-desc">{tip}</p>
      </div>
      <div className="lc-bset-v2__control">{children}</div>
    </div>
  );
}

function V2SwitchRow({ id, checked, off, onChange }: { id: SettingId; checked: boolean; off?: boolean; onChange: (next: boolean) => void }) {
  const filter = useContext(SearchFilterContext);
  if (!filter.shows(id)) return null;
  const { label, tip } = row(id);
  return (
    <div className="lc-inbs__row" data-disabled={!!off} data-setting-id={id}>
      <div className="lc-inbs__row-label">
        <span className="lc-inbs__label">
          <HighlightMatch text={label} query={filter.query} />
        </span>
        <p className="lc-inbs__row-desc">{tip}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={off}
        className="lc-inbs__switch-track lc-inbs__switch-track--end"
        onClick={() => onChange(!checked)}
      >
        <span className="lc-inbs__switch-thumb" />
      </button>
    </div>
  );
}

/** A row of radio choices, the inbox page's `RadioRow`, searchable by its setting id. */
function V2RadioRow<V extends string>({
  id,
  choices,
  value,
  off,
  helper,
  onChange,
}: {
  id: SettingId;
  choices: { value: V; label: string }[];
  value: V;
  off?: boolean;
  helper?: ReactNode;
  onChange: (next: V) => void;
}) {
  const name = useId();
  return (
    <V2Row id={id} off={off}>
      <div className="lc-inbs__radios lc-bset-v2__radios" role="radiogroup" aria-label={row(id).label}>
        {choices.map((choice) => (
          <label key={choice.value} className="lc-inbs__radio">
            <input type="radio" name={name} checked={value === choice.value} disabled={off} onChange={() => onChange(choice.value)} />
            {choice.label}
          </label>
        ))}
      </div>
      {helper && <Helper>{helper}</Helper>}
    </V2Row>
  );
}

export function BotBehaviourSectionV2({ values, patch }: SectionProps) {
  const ai = values.aiDecisionMaking;
  const reminderOn = ai && values.reminderEnabled;
  return (
    <div className="lc-inbs lc-bset-v2">
      <Group
        id="aiDecisionMaking"
        title={row('aiDecisionMaking').label}
        description="The bot works out what to do next instead of only following fixed flows. Two settings in this tab and three in Messaging depend on this."
        toggle={{ checked: ai, onChange: (next) => patch({ aiDecisionMaking: next }) }}
        rows={['topicSwitch']}
      >
        <V2Row id="topicSwitch" off={!ai} stacked>
          <RichTextField
            label={row('topicSwitch').label}
            value={values.topicSwitchMessage}
            disabled={!ai}
            onChange={(next) => patch({ topicSwitchMessage: next })}
          />
        </V2Row>
      </Group>

      <Group title="Fallback" description="What happens when a message fits none of your flows." rows={['noFlowMatch']}>
        <V2Row id="noFlowMatch">
          <NativeSelect
            aria-label={row('noFlowMatch').label}
            size="sm"
            fullWidth
            placeholder="Select a flow"
            data={FLOW_OPTIONS}
            value={values.noFlowMatchFlow}
            error={values.noFlowMatchFlow === ''}
            onChange={(e) => patch({ noFlowMatchFlow: e.currentTarget.value })}
          />
          {values.noFlowMatchFlow === '' && (
            <Helper error>Required. Nothing is set, so messages that match no flow get no reply at all.</Helper>
          )}
        </V2Row>
      </Group>

      <Group
        id="reminder"
        title={row('reminder').label}
        description={row('reminder').tip}
        toggle={{ checked: values.reminderEnabled, onChange: (next) => patch({ reminderEnabled: next }) }}
        rows={['reminderFlow', 'reminderAfter']}
      >
        <V2Row id="reminderFlow" off={!reminderOn}>
          <NativeSelect
            aria-label={row('reminderFlow').label}
            size="sm"
            fullWidth
            placeholder="Select a flow"
            data={FLOW_OPTIONS}
            value={values.reminderFlow}
            disabled={!reminderOn}
            onChange={(e) => patch({ reminderFlow: e.currentTarget.value })}
          />
        </V2Row>
        <V2Row id="reminderAfter" off={!reminderOn}>
          <NumberField
            label={row('reminderAfter').label}
            value={values.reminderAfterSeconds}
            min={60}
            max={86400}
            unit="seconds"
            disabled={!reminderOn}
            onChange={(next) => patch({ reminderAfterSeconds: next })}
          />
          <Helper>60 to 86,400. Default 300.</Helper>
        </V2Row>
      </Group>
    </div>
  );
}

export function MessagingSectionV2({ values, patch }: SectionProps) {
  const ai = values.aiDecisionMaking;
  const warmer = ai && values.warmerTone;
  const company = ai && values.companyInstructionsEnabled;
  const translate = ai && values.translateReplies;
  const holding = values.holdingMessageEnabled;
  return (
    <div className="lc-inbs lc-bset-v2">
      <Group
        id="warmerTone"
        title={row('warmerTone').label}
        description={row('warmerTone').tip}
        toggle={{ checked: values.warmerTone, onChange: (next) => patch({ warmerTone: next }) }}
        rows={['rewritingInstructions']}
      >
        <V2Row id="rewritingInstructions" off={!warmer} stacked>
          <RichTextField
            label={row('rewritingInstructions').label}
            value={values.rewritingInstructions}
            disabled={!warmer}
            onChange={(next) => patch({ rewritingInstructions: next })}
          />
        </V2Row>
      </Group>

      <Group
        id="companyInstructionsEnabled"
        title={row('companyInstructionsEnabled').label}
        description={row('companyInstructionsEnabled').tip}
        toggle={{ checked: values.companyInstructionsEnabled, onChange: (next) => patch({ companyInstructionsEnabled: next }) }}
        rows={['companyInstructions']}
      >
        <V2Row id="companyInstructions" off={!company} stacked>
          <RichTextField
            label={row('companyInstructions').label}
            value={values.companyInstructions}
            disabled={!company}
            onChange={(next) => patch({ companyInstructions: next })}
          />
        </V2Row>
      </Group>

      <Group
        id="translateReplies"
        title={row('translateReplies').label}
        description={row('translateReplies').tip}
        toggle={{ checked: values.translateReplies, onChange: (next) => patch({ translateReplies: next }) }}
        rows={['keepButtonLabels', 'supportedLanguages', 'languageDetectionInstructions', 'translationInstructions']}
      >
        <V2SwitchRow id="keepButtonLabels" checked={values.keepButtonLabels} off={!translate} onChange={(next) => patch({ keepButtonLabels: next })} />
        <V2Row id="supportedLanguages" off={!translate}>
          <TagsInput
            className="lc-bset__languages lc-bset-v2__languages"
            ariaLabel={row('supportedLanguages').label}
            data={LANGUAGES}
            value={values.supportedLanguages}
            placeholder="Add a language"
            searchPlaceholder="Add a language"
            disabled={!translate}
            onChange={(next) => patch({ supportedLanguages: next })}
          />
        </V2Row>
        <V2Row id="languageDetectionInstructions" off={!translate} stacked>
          <RichTextField
            label={row('languageDetectionInstructions').label}
            value={values.languageDetectionInstructions}
            disabled={!translate}
            onChange={(next) => patch({ languageDetectionInstructions: next })}
          />
        </V2Row>
        <V2Row id="translationInstructions" off={!translate} stacked>
          <RichTextField
            label={row('translationInstructions').label}
            value={values.translationInstructions}
            disabled={!translate}
            onChange={(next) => patch({ translationInstructions: next })}
          />
        </V2Row>
      </Group>

      <Group
        id="holdingMessageEnabled"
        title={row('holdingMessageEnabled').label}
        description={row('holdingMessageEnabled').tip}
        toggle={{ checked: values.holdingMessageEnabled, onChange: (next) => patch({ holdingMessageEnabled: next }) }}
        rows={['holdingAfter', 'holdingMessage']}
      >
        <V2Row id="holdingAfter" off={!holding}>
          <NumberField
            label={row('holdingAfter').label}
            value={values.holdingAfterSeconds}
            min={5}
            max={60}
            unit="seconds"
            disabled={!holding}
            onChange={(next) => patch({ holdingAfterSeconds: next })}
          />
          <Helper>5 to 60. Default 15.</Helper>
        </V2Row>
        <V2Row id="holdingMessage" off={!holding} stacked>
          <RichTextField
            label={row('holdingMessage').label}
            value={values.holdingMessage}
            disabled={!holding}
            onChange={(next) => patch({ holdingMessage: next })}
          />
          <Helper>Up to 120 characters.</Helper>
        </V2Row>
      </Group>
    </div>
  );
}

export function ChannelsSectionV2({ values, patch }: SectionProps) {
  const voice = values.voiceTranscription;
  const email = values.customEmailSummary;
  return (
    <div className="lc-inbs lc-bset-v2">
      <Group
        id="voiceTranscription"
        title={row('voiceTranscription').label}
        description={row('voiceTranscription').tip}
        toggle={{ checked: voice, onChange: (next) => patch({ voiceTranscription: next }) }}
        rows={['transcriptionModel']}
      >
        <V2Row id="transcriptionModel" off={!voice}>
          <NativeSelect
            aria-label={row('transcriptionModel').label}
            size="sm"
            fullWidth
            data={TRANSCRIPTION_MODELS}
            value={values.transcriptionModel}
            disabled={!voice}
            onChange={(e) => patch({ transcriptionModel: e.currentTarget.value })}
          />
          <Helper>Default. Change only if accuracy is poor for your languages.</Helper>
        </V2Row>
      </Group>

      <Group
        id="customEmailSummary"
        title={row('customEmailSummary').label}
        description={row('customEmailSummary').tip}
        toggle={{ checked: email, onChange: (next) => patch({ customEmailSummary: next }) }}
        rows={['emailSummaryPrompt']}
      >
        <V2Row id="emailSummaryPrompt" off={!email} stacked>
          <RichTextField
            label={row('emailSummaryPrompt').label}
            value={values.emailSummaryPrompt}
            disabled={!email}
            onChange={(next) => patch({ emailSummaryPrompt: next })}
          />
        </V2Row>
      </Group>
    </div>
  );
}

export function CsatSectionV2({ values, patch }: SectionProps) {
  return (
    <div className="lc-inbs lc-bset-v2">
      <Group title="Survey" description="How the bot asks customers to rate a conversation." rows={['surveyRatingScale']}>
        <V2Row id="surveyRatingScale">
          <NativeSelect
            aria-label={row('surveyRatingScale').label}
            size="sm"
            fullWidth
            data={RATING_SCALES}
            value={values.surveyRatingScale}
            onChange={(e) => patch({ surveyRatingScale: e.currentTarget.value })}
          />
          <Helper>Default 5 point.</Helper>
        </V2Row>
      </Group>
    </div>
  );
}

export function AdvancedSectionV2({ values, patch }: SectionProps) {
  return (
    <div className="lc-inbs lc-bset-v2">
      <Group title="Models" description="Which models the bot runs on." rows={['fastModel', 'selfHostedImageSearch']}>
        <V2SwitchRow id="fastModel" checked={values.fastModel} onChange={(next) => patch({ fastModel: next })} />
        <V2SwitchRow id="selfHostedImageSearch" checked={values.selfHostedImageSearch} onChange={(next) => patch({ selfHostedImageSearch: next })} />
      </Group>
      <Group title="Answers and logs" description="What the bot keeps between conversations." rows={['reuseAnswers', 'executionLogs']}>
        <V2SwitchRow id="reuseAnswers" checked={values.reuseAnswers} onChange={(next) => patch({ reuseAnswers: next })} />
        <V2SwitchRow id="executionLogs" checked={values.executionLogs} onChange={(next) => patch({ executionLogs: next })} />
      </Group>
    </div>
  );
}

/**
 * Product cards in the inbox layout: the same settings as the two-column Version 1, as
 * headed cards, with the card preview sticky at the right like the widget tabs' phone.
 */
export function ProductCardsSectionV2({ values, patch }: SectionProps) {
  const { layout, currency, elements, buttonCount, buttonLabels, buttonStyle, buttonLayout } = values;
  // Which card the stage shows; the tabs compare the four layouts without committing to one.
  const [previewLayout, setPreviewLayout] = useState<ProductCardLayout>(layout);
  const buttons = useMemo(
    () => ({ count: buttonCount, labels: buttonLabels, style: buttonStyle, layout: buttonLayout }),
    [buttonCount, buttonLabels, buttonStyle, buttonLayout],
  );
  const chooseLayout = (next: ProductCardLayout) => {
    patch({ layout: next });
    setPreviewLayout(next);
  };
  const toggleElement = (key: ElementKey) => {
    if (key === 'title' || key === 'price') return;
    patch({ elements: { ...elements, [key]: !elements[key] } });
  };
  const setLabel = (index: number, value: string) =>
    patch({ buttonLabels: buttonLabels.map((label, i) => (i === index ? value.slice(0, LABEL_LIMIT) : label)) });

  return (
    <div className="lc-inbs-shell lc-bset-v2__shell">
      <div className="lc-inbs lc-bset-v2">
        <Group title="Layout" description="How a product card is built when a flow sends one." rows={['cardLayout']}>
          <V2Row id="cardLayout">
            <NativeSelect
              aria-label={row('cardLayout').label}
              size="sm"
              fullWidth
              data={PRODUCT_CARD_LAYOUTS.map((l) => ({ value: l.id, label: l.label }))}
              value={layout}
              onChange={(e) => chooseLayout(e.currentTarget.value as ProductCardLayout)}
            />
          </V2Row>
        </Group>

        <Group
          title="Card content"
          description="Choose what shows on each card. Title and selling price are always shown."
          rows={['cardElements', 'currency']}
        >
          <V2Row id="cardElements" stacked>
            <ul className="lc-bset__elements">
              {CARD_ELEMENT_ROWS.map((item) => {
                const checked = item.required || elements[item.key as keyof ProductCardElements];
                return (
                  <li key={item.key} className="lc-bset__element">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={checked}
                      aria-label={item.label}
                      disabled={item.required}
                      className="lc-bset__check"
                      data-checked={checked}
                      onClick={() => toggleElement(item.key)}
                    >
                      {checked && <CheckIcon width={12} height={12} />}
                    </button>
                    <span className="lc-bset__element-copy">
                      <span className="lc-bset__element-label">{item.label}</span>
                      <span className="lc-bset__element-desc">{item.description}</span>
                    </span>
                    {item.required && <span className="lc-bset__pill">Required</span>}
                  </li>
                );
              })}
            </ul>
          </V2Row>
          <V2Row id="currency">
            <NativeSelect
              aria-label={row('currency').label}
              size="sm"
              fullWidth
              data={CURRENCIES}
              value={currency}
              onChange={(e) => patch({ currency: e.currentTarget.value })}
            />
          </V2Row>
        </Group>

        <Group
          title="Buttons"
          description="Up to three actions under every product card."
          rows={['buttonCount', 'buttonLabels', 'buttonStyle', 'buttonLayout', 'buyNowOpensPage']}
        >
          <V2RadioRow
            id="buttonCount"
            choices={[1, 2, 3].map((n) => ({ value: String(n), label: String(n) }))}
            value={String(buttonCount)}
            onChange={(next) => patch({ buttonCount: Number(next) })}
          />
          <V2Row id="buttonLabels">
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
          </V2Row>
          <V2RadioRow
            id="buttonStyle"
            choices={BUTTON_STYLES.map((style) => ({ value: style.id, label: style.label }))}
            value={buttonStyle}
            onChange={(next) => patch({ buttonStyle: next as ButtonStyle })}
          />
          <V2RadioRow
            id="buttonLayout"
            choices={BUTTON_LAYOUTS.map((option) => ({ value: option.id, label: option.label }))}
            value={buttonLayout}
            helper="Side by side fits two short labels. Three buttons always stack."
            onChange={(next) => patch({ buttonLayout: next as ButtonLayout })}
          />
          <V2SwitchRow id="buyNowOpensPage" checked={values.buyNowOpensPage} onChange={(next) => patch({ buyNowOpensPage: next })} />
        </Group>

        <Group
          title="Products shown"
          description="Which products and variants the bot is allowed to send."
          rows={['showVariants', 'cheapestVariant', 'showOutOfStock']}
        >
          <V2SwitchRow id="showVariants" checked={values.showVariants} onChange={(next) => patch({ showVariants: next })} />
          <V2SwitchRow id="cheapestVariant" checked={values.cheapestVariant} onChange={(next) => patch({ cheapestVariant: next })} />
          <V2SwitchRow id="showOutOfStock" checked={values.showOutOfStock} onChange={(next) => patch({ showOutOfStock: next })} />
        </Group>
      </div>

      <div className="lc-inbs-preview lc-bset-v2__preview">
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
        <div className="lc-bset__stage lc-bset-v2__stage">
          <ProductCardPreview layout={previewLayout} elements={elements} buttons={buttons} currency={currency} />
        </div>
      </div>
    </div>
  );
}
