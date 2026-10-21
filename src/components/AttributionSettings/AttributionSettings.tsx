/**
 * AttributionSettings — Settings → Attribution, HelpDesk product.
 *
 * Same design language as `ProfileSettings`/`HelpDeskAccountSettings`: one
 * section per attribution type (not collapsible, unlike those), each a heading above a bordered
 * table holding the attribution window row. Only Link Sent has an on/off switch, in its heading.
 *
 *   <AttributionSettings
 *     enabled={attrEnabled}
 *     onEnabledChange={(key, next) => ...}
 *     windows={attributionWindows}
 *     onWindowChange={(key, field, value) => ...}
 *   />
 */
import { useId } from 'react';
import './AttributionSettings.css';

export type AttributionWindowKey = 'linkClick' | 'linkSent' | 'botIntent';
export type AttributionWindowField = 'days' | 'hours';

export interface AttributionWindowValue {
  days: number;
  hours: number;
}

export interface AttributionSettingsProps {
  enabled: Record<AttributionWindowKey, boolean>;
  onEnabledChange: (key: AttributionWindowKey, next: boolean) => void;
  windows: Record<AttributionWindowKey, AttributionWindowValue>;
  onWindowChange: (key: AttributionWindowKey, field: AttributionWindowField, value: number) => void;
}

// Only `optional` sections get an on/off switch; the rest are always on.
const SECTIONS: { key: AttributionWindowKey; title: string; info: string; optional?: true }[] = [
  {
    key: 'linkClick',
    title: 'Link Click Attribution',
    info: 'Attribute a ticket to the campaign whose link the customer clicked.',
  },
  {
    key: 'linkSent',
    title: 'Link Sent Attribution',
    optional: true,
    info: 'Attribute a ticket to the campaign whose link was sent to the customer, even if it was never clicked.',
  },
  {
    key: 'botIntent',
    title: 'Bot Intent Attribution',
    info: 'Attribute a ticket to the bot intent that started the conversation.',
  },
];

function clampField(field: AttributionWindowField, value: number) {
  if (Number.isNaN(value) || value < 0) return 0;
  if (field === 'hours') return Math.min(value, 23);
  return value;
}

function AttributionSection({
  section,
  enabled,
  onEnabledChange,
  value,
  onWindowChange,
}: {
  section: (typeof SECTIONS)[number];
  enabled: boolean;
  onEnabledChange: (next: boolean) => void;
  value: AttributionWindowValue;
  onWindowChange: (field: AttributionWindowField, value: number) => void;
}) {
  const titleId = useId();
  const on = !section.optional || enabled;
  const field = (name: AttributionWindowField, label: string, max?: number) => (
    <label className="lc-attr__field">
      <span className="lc-attr__field-label">{label}</span>
      <input
        type="number"
        min={0}
        max={max}
        className="lc-attr__input"
        value={value[name]}
        disabled={!on}
        onChange={(e) => onWindowChange(name, clampField(name, e.currentTarget.valueAsNumber))}
      />
    </label>
  );

  return (
    <section className="lc-attr__group" aria-label={section.title}>
      <div className="lc-attr__section-heading">
        <div className="lc-attr__section-text">
          <h2 id={titleId} className="lc-attr__section-title">{section.title}</h2>
          <p className="lc-attr__section-desc">{section.info}</p>
        </div>
        {section.optional && (
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-labelledby={titleId}
            className="lc-attr__switch-track"
            onClick={() => onEnabledChange(!enabled)}
          >
            <span className="lc-attr__switch-thumb" />
          </button>
        )}
      </div>
      <div className="lc-attr__table">
        <div className="lc-attr__row" data-disabled={!on}>
          <div className="lc-attr__row-label">
            <span className="lc-attr__label">Attribution window</span>
          </div>
          <div className="lc-attr__row-control">
            {field('days', 'Days')}
            {field('hours', 'Hours', 23)}
          </div>
        </div>
      </div>
    </section>
  );
}

export function AttributionSettings({ enabled, onEnabledChange, windows, onWindowChange }: AttributionSettingsProps) {
  return (
    <div className="lc-attr">
      {SECTIONS.map((section) => (
        <AttributionSection
          key={section.key}
          section={section}
          enabled={enabled[section.key]}
          onEnabledChange={(next) => onEnabledChange(section.key, next)}
          value={windows[section.key]}
          onWindowChange={(field, value) => onWindowChange(section.key, field, value)}
        />
      ))}
    </div>
  );
}

export default AttributionSettings;
