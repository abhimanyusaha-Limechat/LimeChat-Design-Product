/**
 * Shared pieces of InboxSettings' tabs: a heading with an optional on/off switch,
 * label | control rows (plain, radio, switch), and the General tab's Opt in/out and
 * Waiting reminder sections.
 */
import { useId, useState, type ReactNode } from 'react';
import { Button } from '../Button';
import { NativeSelect, type SelectItem } from '../Select';
import { Icon } from '../icons';

export type InboxDurationField = 'days' | 'hours' | 'minutes';
export type InboxDuration = Record<InboxDurationField, number>;
export type DurationRow<K extends string> = { key: K; label: string; description: string };

export interface OptInOut {
  enabled: boolean;
  optInKeywords: string[];
  optOutKeywords: string[];
  /** `%<opt_in_key>s` is replaced with the first opt-in keyword. */
  optOutMessage: string;
  optInMessage: string;
}

export interface WaitingReminder {
  /** Minutes after the customer starts waiting. */
  delayMinutes: number;
  /** A template id; '' until one is picked. */
  templateId: string;
}

export interface WaitingReminders {
  enabled: boolean;
  reminders: WaitingReminder[];
}

export interface Heading {
  title: string;
  description?: string;
  isNew?: boolean;
  /** An on/off switch at the heading's far right; its section's rows dim when off. */
  toggle?: { checked: boolean; onChange: (next: boolean) => void };
}

export function SectionHeading({ title, description, isNew, toggle }: Heading) {
  const titleId = useId();
  return (
    <div className="lc-inbs__section-heading">
      <div className="lc-inbs__section-text">
        <div className="lc-inbs__section-title-row">
          <h2 id={titleId} className="lc-inbs__section-title">{title}</h2>
          {isNew && <span className="lc-inbs__badge">New</span>}
        </div>
        {description && <p className="lc-inbs__section-desc">{description}</p>}
      </div>
      {toggle && (
        <button
          type="button"
          role="switch"
          aria-checked={toggle.checked}
          aria-labelledby={titleId}
          className="lc-inbs__switch-track"
          onClick={() => toggle.onChange(!toggle.checked)}
        >
          <span className="lc-inbs__switch-thumb" />
        </button>
      )}
    </div>
  );
}

export interface Choice<V extends string> {
  value: V;
  label: string;
}

export function Row({ label, description, off = false, children }: { label: string; description: string; off?: boolean; children: ReactNode }) {
  return (
    <div className="lc-inbs__row" data-disabled={off}>
      <div className="lc-inbs__row-label">
        <span className="lc-inbs__label">{label}</span>
        <p className="lc-inbs__row-desc">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function RadioRow<V extends string>({
  label,
  description,
  choices,
  value,
  off,
  onChange,
}: {
  label: string;
  description: string;
  choices: Choice<V>[];
  value: V;
  off: boolean;
  onChange: (next: V) => void;
}) {
  const name = useId();
  return (
    <Row label={label} description={description} off={off}>
      <div className="lc-inbs__radios" role="radiogroup" aria-label={label}>
        {choices.map((c) => (
          <label key={c.value} className="lc-inbs__radio">
            <input
              type="radio"
              name={name}
              checked={value === c.value}
              disabled={off}
              onChange={() => onChange(c.value)}
            />
            {c.label}
          </label>
        ))}
      </div>
    </Row>
  );
}

export function SwitchRow({
  label,
  description,
  checked,
  off = false,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  off?: boolean;
  onChange: (next: boolean) => void;
}) {
  const labelId = useId();
  return (
    <div className="lc-inbs__row" data-disabled={off}>
      <div className="lc-inbs__row-label">
        <span id={labelId} className="lc-inbs__label">{label}</span>
        <p className="lc-inbs__row-desc">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        disabled={off}
        className="lc-inbs__switch-track lc-inbs__switch-track--end"
        onClick={() => onChange(!checked)}
      >
        <span className="lc-inbs__switch-thumb" />
      </button>
    </div>
  );
}

export function TextRow({
  label,
  description,
  placeholder,
  value,
  off = false,
  onChange,
}: {
  label: string;
  description: string;
  placeholder: string;
  value: string;
  off?: boolean;
  onChange: (next: string) => void;
}) {
  const id = useId();
  return (
    <div className="lc-inbs__row" data-disabled={off}>
      <div className="lc-inbs__row-label">
        <label className="lc-inbs__label" htmlFor={id}>{label}</label>
        <p className="lc-inbs__row-desc">{description}</p>
      </div>
      <input
        id={id}
        className="lc-inbs__input"
        placeholder={placeholder}
        value={value}
        disabled={off}
        onChange={(e) => onChange(e.currentTarget.value)}
      />
    </div>
  );
}

/** Type a keyword and press Enter to add it as a chip; keywords match case-insensitively. */
function KeywordInput({
  label,
  placeholder,
  value,
  disabled,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string[];
  disabled: boolean;
  onChange: (next: string[]) => void;
}) {
  const id = useId();
  const hintId = useId();
  const [pending, setPending] = useState('');
  const add = () => {
    const keyword = pending.trim().toUpperCase();
    if (keyword && !value.includes(keyword)) onChange([...value, keyword]);
    setPending('');
  };
  return (
    <div className="lc-inbs__row" data-disabled={disabled}>
      <div className="lc-inbs__row-label">
        <label className="lc-inbs__label" htmlFor={id}>{label}</label>
        <p id={hintId} className="lc-inbs__row-desc">Case insensitive. Type a keyword and press Enter.</p>
      </div>
      <div className="lc-inbs__field">
        <input
          id={id}
          className="lc-inbs__input"
          placeholder={placeholder}
          aria-describedby={hintId}
          value={pending}
          disabled={disabled}
          onChange={(e) => setPending(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
        />
        {value.length > 0 && (
          <ul className="lc-inbs__chips" aria-label={`${label}s`}>
            {value.map((keyword) => (
              <li key={keyword} className="lc-inbs__chip">
                {keyword}
                <button
                  type="button"
                  className="lc-inbs__chip-remove"
                  aria-label={`Remove ${keyword}`}
                  disabled={disabled}
                  onClick={() => onChange(value.filter((k) => k !== keyword))}
                >
                  <Icon name="close" width={12} height={12} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function OptInOutSection({ value, onChange }: { value: OptInOut; onChange: (next: OptInOut) => void }) {
  const optOutId = useId();
  const previewId = useId();
  const optInId = useId();
  const off = !value.enabled;
  const preview = value.optOutMessage.split('%<opt_in_key>s').join(value.optInKeywords[0] ?? '');
  return (
    <section className="lc-inbs__group" aria-label="Opt in/out">
      <SectionHeading
        title="Enable opt in/out"
        description="Let customers subscribe and unsubscribe by sending a keyword."
        toggle={{ checked: value.enabled, onChange: (enabled) => onChange({ ...value, enabled }) }}
      />
      <div className="lc-inbs__table">
        <KeywordInput
          label="Opt in keyword"
          placeholder="SUBSCRIBE"
          value={value.optInKeywords}
          disabled={off}
          onChange={(optInKeywords) => onChange({ ...value, optInKeywords })}
        />
        <KeywordInput
          label="Opt out keyword"
          placeholder="UNSUBSCRIBE"
          value={value.optOutKeywords}
          disabled={off}
          onChange={(optOutKeywords) => onChange({ ...value, optOutKeywords })}
        />
        <div className="lc-inbs__row" data-disabled={off}>
          <div className="lc-inbs__row-label">
            <label className="lc-inbs__label" htmlFor={optOutId}>Opt out message</label>
            <p className="lc-inbs__row-desc">
              <code>{'%<opt_in_key>s'}</code> becomes the first opt-in keyword.
            </p>
          </div>
          <textarea
            id={optOutId}
            className="lc-inbs__input lc-inbs__textarea"
            rows={4}
            value={value.optOutMessage}
            disabled={off}
            onChange={(e) => onChange({ ...value, optOutMessage: e.currentTarget.value })}
          />
        </div>
        <div className="lc-inbs__row" data-disabled={off}>
          <div className="lc-inbs__row-label">
            <label className="lc-inbs__label" htmlFor={previewId}>Preview</label>
            <p className="lc-inbs__row-desc">How the opt out message reads to customers.</p>
          </div>
          <textarea id={previewId} className="lc-inbs__input lc-inbs__textarea" rows={4} value={preview} readOnly />
        </div>
        <div className="lc-inbs__row" data-disabled={off}>
          <div className="lc-inbs__row-label">
            <label className="lc-inbs__label" htmlFor={optInId}>Opt in message</label>
          </div>
          <textarea
            id={optInId}
            className="lc-inbs__input lc-inbs__textarea"
            rows={4}
            value={value.optInMessage}
            disabled={off}
            onChange={(e) => onChange({ ...value, optInMessage: e.currentTarget.value })}
          />
        </div>
      </div>
    </section>
  );
}

export function WaitingReminderSection({
  value,
  templates,
  onChange,
}: {
  value: WaitingReminders;
  templates: SelectItem[];
  onChange: (next: WaitingReminders) => void;
}) {
  const off = !value.enabled;
  const setReminder = (index: number, patch: Partial<WaitingReminder>) =>
    onChange({ ...value, reminders: value.reminders.map((r, i) => (i === index ? { ...r, ...patch } : r)) });
  const last = value.reminders[value.reminders.length - 1];
  return (
    <section className="lc-inbs__group" aria-label="Waiting reminder">
      <SectionHeading
        title="Waiting reminder"
        description="Automatically send follow-up messages to customers who haven't responded within a set time."
        toggle={{ checked: value.enabled, onChange: (enabled) => onChange({ ...value, enabled }) }}
      />
      <div className="lc-inbs__table">
        {value.reminders.length === 0 && (
          <p className="lc-inbs__row lc-inbs__row-desc" data-disabled={off}>No reminders yet.</p>
        )}
        {value.reminders.map((reminder, i) => (
          // Reminders have no identity beyond their position; deleting renumbers the rest.
          <div key={i} className="lc-inbs__row lc-inbs__row--stacked" data-disabled={off} role="group" aria-label={`Reminder ${i + 1}`}>
            <div className="lc-inbs__reminder-head">
              <span className="lc-inbs__label">Reminder {i + 1}</span>
              <Button
                variant="outline"
                color="red"
                size="xs"
                className="lc-inbs__icon-btn"
                leftSection={<Icon name="trash" size={14} />}
                disabled={off}
                aria-label={`Delete reminder ${i + 1}`}
                title="Delete reminder"
                onClick={() => onChange({ ...value, reminders: value.reminders.filter((_, j) => j !== i) })}
              />
            </div>
            <div className="lc-inbs__reminder-fields">
              <label className="lc-inbs__field">
                <span className="lc-inbs__field-label">Delay from waiting start (minutes)</span>
                <input
                  type="number"
                  min={1}
                  className="lc-inbs__input"
                  value={reminder.delayMinutes}
                  disabled={off}
                  onChange={(e) => {
                    const minutes = e.currentTarget.valueAsNumber;
                    setReminder(i, { delayMinutes: Number.isNaN(minutes) ? 1 : Math.max(1, minutes) });
                  }}
                />
              </label>
              <NativeSelect
                label="Template"
                size="sm"
                fullWidth
                data={templates}
                placeholder="Select a template"
                value={reminder.templateId}
                disabled={off}
                onChange={(e) => setReminder(i, { templateId: e.currentTarget.value })}
              />
            </div>
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="lc-inbs__add-reminder"
        leftSection={<Icon name="plus" />}
        disabled={off}
        onClick={() =>
          onChange({
            ...value,
            // A new reminder fires 10 minutes after the previous one.
            reminders: [...value.reminders, { delayMinutes: (last?.delayMinutes ?? 50) + 10, templateId: '' }],
          })
        }
      >
        Add reminder
      </Button>
    </section>
  );
}

const FIELDS: { name: InboxDurationField; label: string; max?: number }[] = [
  { name: 'days', label: 'Days' },
  { name: 'hours', label: 'Hours', max: 23 },
  { name: 'minutes', label: 'Minutes', max: 59 },
];

export function clamp(value: number, max?: number) {
  if (Number.isNaN(value) || value < 0) return 0;
  return max === undefined ? value : Math.min(value, max);
}

/** A headed table of Days | Hours | Minutes rows. */
export function DurationSection<K extends string>({
  rows,
  values,
  onChange,
  children,
  ...heading
}: Heading & {
  /** Extra rows under the duration rows, inside the same table. */
  children?: ReactNode;
  rows: DurationRow<K>[];
  values: Record<K, InboxDuration>;
  onChange: (next: Record<K, InboxDuration>) => void;
}) {
  const off = heading.toggle?.checked === false;
  return (
    <section className="lc-inbs__group" aria-label={heading.title}>
      <SectionHeading {...heading} />
      <div className="lc-inbs__table">
        {rows.map(({ key, label, description }) => (
          <div key={key} className="lc-inbs__row" data-disabled={off}>
            <div className="lc-inbs__row-label">
              <span className="lc-inbs__label">{label}</span>
              <p className="lc-inbs__row-desc">{description}</p>
            </div>
            <div className="lc-inbs__duration" role="group" aria-label={label}>
              {FIELDS.map(({ name, label: fieldLabel, max }) => (
                <label key={name} className="lc-inbs__field">
                  <span className="lc-inbs__field-label">{fieldLabel}</span>
                  <input
                    type="number"
                    min={0}
                    max={max}
                    className="lc-inbs__input"
                    value={values[key][name]}
                    disabled={off}
                    onChange={(e) =>
                      onChange({ ...values, [key]: { ...values[key], [name]: clamp(e.currentTarget.valueAsNumber, max) } })
                    }
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
        {children}
      </div>
    </section>
  );
}
