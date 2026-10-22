/**
 * The switched sections of InboxSettings' General tab: a shared heading with an
 * optional on/off switch, Opt in/out and Waiting reminder.
 */
import { useId, useState } from 'react';
import { Button } from '../Button';
import { NativeSelect, type SelectItem } from '../Select';
import { Icon } from '../icons';

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
    <div className="lc-inbs__field">
      <label className="lc-inbs__label" htmlFor={id}>{label}</label>
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
      <p id={hintId} className="lc-inbs__row-desc">Case insensitive. Type a keyword and press Enter.</p>
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
        <div className="lc-inbs__row lc-inbs__row--pair" data-disabled={off}>
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
        </div>
        <div className="lc-inbs__row lc-inbs__row--pair" data-disabled={off}>
          <div className="lc-inbs__field">
            <label className="lc-inbs__label" htmlFor={optOutId}>Opt out message</label>
            <textarea
              id={optOutId}
              className="lc-inbs__input lc-inbs__textarea"
              rows={4}
              value={value.optOutMessage}
              disabled={off}
              onChange={(e) => onChange({ ...value, optOutMessage: e.currentTarget.value })}
            />
            <p className="lc-inbs__row-desc">
              <code>{'%<opt_in_key>s'}</code> becomes the first opt-in keyword.
            </p>
          </div>
          <div className="lc-inbs__field">
            <label className="lc-inbs__label" htmlFor={previewId}>Preview</label>
            <textarea id={previewId} className="lc-inbs__input lc-inbs__textarea" rows={4} value={preview} readOnly />
          </div>
        </div>
        <div className="lc-inbs__row lc-inbs__row--pair" data-disabled={off}>
          <div className="lc-inbs__field">
            <label className="lc-inbs__label" htmlFor={optInId}>Opt in message</label>
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
                variant="subtle"
                size="xs"
                disabled={off}
                aria-label={`Delete reminder ${i + 1}`}
                onClick={() => onChange({ ...value, reminders: value.reminders.filter((_, j) => j !== i) })}
              >
                Delete
              </Button>
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
                data={templates}
                placeholder="Select a template"
                value={reminder.templateId}
                disabled={off}
                error={reminder.templateId ? undefined : 'Select a template'}
                onChange={(e) => setReminder(i, { templateId: e.currentTarget.value })}
              />
            </div>
          </div>
        ))}
      </div>
      <Button
        variant="subtle"
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
