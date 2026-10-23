/**
 * The CSAT tab of InboxSettings: how and when this inbox asks customers to rate an
 * agent's conversation. One master switch dims every row below it.
 */
import { useId } from 'react';
import {
  DurationSection,
  RadioRow,
  SectionHeading,
  SwitchRow,
  type Choice,
  type DurationRow,
  type InboxDuration,
} from './InboxSettingsSections';

export interface InboxCsat {
  enabled: boolean;
  format: 'link' | 'embedded';
  sendingType: 'automatic' | 'agent';
  ratingScale: '2' | '3' | '5';
  /** Also send the survey when a conversation was auto resolved. */
  sendWhenAutoResolved: boolean;
  /** Also send the survey during out-of-office hours. */
  sendOutOfOffice: boolean;
  message: string;
  /** Nudges a customer who hasn't answered the survey. */
  reminder: { enabled: boolean; delay: InboxDuration; message: string };
}

const FORMATS: Choice<InboxCsat['format']>[] = [
  { value: 'link', label: 'Link-based' },
  { value: 'embedded', label: 'Embedded CSAT' },
];

const SENDING_TYPES: Choice<InboxCsat['sendingType']>[] = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'agent', label: 'Agent Controlled' },
];

const REMINDER_DELAY: DurationRow<'delay'>[] = [
  { key: 'delay', label: 'CSAT reminder time delay', description: 'Remind the customer after this long without a rating.' },
];

const SCALES: Choice<InboxCsat['ratingScale']>[] = [
  { value: '2', label: '2 stars' },
  { value: '3', label: '3 stars' },
  { value: '5', label: '5 stars' },
];

export function CsatTab({ value, onChange }: { value: InboxCsat; onChange: (next: InboxCsat) => void }) {
  const messageId = useId();
  const reminderMessageId = useId();
  const off = !value.enabled;
  const reminder = value.reminder;
  const set = (patch: Partial<InboxCsat>) => onChange({ ...value, ...patch });
  const setReminder = (patch: Partial<InboxCsat['reminder']>) => set({ reminder: { ...reminder, ...patch } });
  return (
    <>
      <section className="lc-inbs__group" aria-label="Agent CSAT">
        <SectionHeading
          title="Agent CSAT"
          description="Ask customers to rate the support they got from an agent."
          toggle={{ checked: value.enabled, onChange: (enabled) => set({ enabled }) }}
        />
        <div className="lc-inbs__table">
          <RadioRow
            label="CSAT format"
            description="Send the survey as a link, or embed the rating in the conversation."
            choices={FORMATS}
            value={value.format}
            off={off}
            onChange={(format) => set({ format })}
          />
          <RadioRow
            label="CSAT sending type"
            description="Send automatically on resolution, or let the agent decide when."
            choices={SENDING_TYPES}
            value={value.sendingType}
            off={off}
            onChange={(sendingType) => set({ sendingType })}
          />
          <RadioRow
            label="CSAT rating scale"
            description="The scale customers use to rate their experience."
            choices={SCALES}
            value={value.ratingScale}
            off={off}
            onChange={(ratingScale) => set({ ratingScale })}
          />
          <SwitchRow
            label="Send CSAT message for auto resolved agent conversations"
            description="Also survey auto resolved conversations."
            checked={value.sendWhenAutoResolved}
            off={off}
            onChange={(sendWhenAutoResolved) => set({ sendWhenAutoResolved })}
          />
          <SwitchRow
            label="Send CSAT during Out Of Office (OOO) hours"
            description="Keep sending surveys outside your business hours."
            checked={value.sendOutOfOffice}
            off={off}
            onChange={(sendOutOfOffice) => set({ sendOutOfOffice })}
          />
          <div className="lc-inbs__row" data-disabled={off}>
            <div className="lc-inbs__row-label">
              <label className="lc-inbs__label" htmlFor={messageId}>Custom CSAT message</label>
              <p className="lc-inbs__row-desc">Shown to customers with the survey.</p>
            </div>
            <textarea
              id={messageId}
              className="lc-inbs__input lc-inbs__textarea"
              rows={4}
              value={value.message}
              disabled={off}
              onChange={(e) => set({ message: e.currentTarget.value })}
            />
          </div>
        </div>
      </section>

      <DurationSection
        title="Enable CSAT reminder"
        description="Nudge customers who haven't answered the survey yet."
        toggle={{ checked: reminder.enabled, onChange: (enabled) => setReminder({ enabled }) }}
        rows={REMINDER_DELAY}
        values={{ delay: reminder.delay }}
        onChange={({ delay }) => setReminder({ delay })}
      >
        <div className="lc-inbs__row" data-disabled={!reminder.enabled}>
          <div className="lc-inbs__row-label">
            <label className="lc-inbs__label" htmlFor={reminderMessageId}>CSAT reminder message</label>
            <p className="lc-inbs__row-desc">Sent with the reminder to customers who haven't rated yet.</p>
          </div>
          <textarea
            id={reminderMessageId}
            className="lc-inbs__input lc-inbs__textarea"
            rows={4}
            placeholder="CSAT reminder message"
            value={reminder.message}
            disabled={!reminder.enabled}
            onChange={(e) => setReminder({ message: e.currentTarget.value })}
          />
        </div>
      </DurationSection>
    </>
  );
}
