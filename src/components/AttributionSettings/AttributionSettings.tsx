/**
 * AttributionSettings — Settings → Attribution, HelpDesk product.
 *
 *   <AttributionSettings
 *     enabled={attrEnabled}
 *     onEnabledChange={(key, next) => ...}
 *     windows={attributionWindows}
 *     onWindowChange={(key, field, value) => ...}
 *   />
 */
import { Tooltip } from '../Tooltip';
import './AttributionSettings.css';

function InfoIcon() {
  return (
    <svg
      className="lc-attr__info-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function SwitchTrack({ checked }: { checked: boolean }) {
  return (
    <span className="lc-attr__switch-track" data-checked={checked} aria-hidden="true">
      <span className="lc-attr__switch-thumb" />
    </span>
  );
}

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

const SECTIONS: { key: AttributionWindowKey; title: string; info: string }[] = [
  {
    key: 'linkClick',
    title: 'Link Click Attribution',
    info: 'Attribute a ticket to the campaign whose link the customer clicked.',
  },
  {
    key: 'linkSent',
    title: 'Link Sent Attribution',
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

export function AttributionSettings({
  enabled,
  onEnabledChange,
  windows,
  onWindowChange,
}: AttributionSettingsProps) {
  return (
    <div className="lc-attr">
      {SECTIONS.map((section) => {
        const sectionEnabled = enabled[section.key];
        const disabled = !sectionEnabled;
        return (
          <section key={section.key} className="lc-attr__section">
            <div className="lc-attr__section-header">
              <span className="lc-attr__section-title">
                {section.title}
                <Tooltip label={section.info}>
                  <span
                    className="lc-attr__info-trigger"
                    tabIndex={0}
                    role="button"
                    aria-label={`About ${section.title}`}
                  >
                    <InfoIcon />
                  </span>
                </Tooltip>
              </span>

              <button
                type="button"
                role="switch"
                aria-checked={sectionEnabled}
                className="lc-attr__toggle"
                onClick={() => onEnabledChange(section.key, !sectionEnabled)}
              >
                <SwitchTrack checked={sectionEnabled} />
              </button>
            </div>

            <div className="lc-attr__row" data-disabled={disabled}>
              <span className="lc-attr__row-label">Attribution Window</span>
              <div className="lc-attr__fields">
                <label className="lc-attr__field">
                  <span className="lc-attr__field-label">Days</span>
                  <input
                    type="number"
                    min={0}
                    className="lc-attr__field-input"
                    value={windows[section.key].days}
                    disabled={disabled}
                    onChange={(e) =>
                      onWindowChange(section.key, 'days', clampField('days', e.currentTarget.valueAsNumber))
                    }
                  />
                </label>
                <label className="lc-attr__field">
                  <span className="lc-attr__field-label">Hours</span>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    className="lc-attr__field-input"
                    value={windows[section.key].hours}
                    disabled={disabled}
                    onChange={(e) =>
                      onWindowChange(section.key, 'hours', clampField('hours', e.currentTarget.valueAsNumber))
                    }
                  />
                </label>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default AttributionSettings;
