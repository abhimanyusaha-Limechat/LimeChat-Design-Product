/**
 * InboxSettings — Settings → Inboxes → Edit: one inbox's settings, split into tabs.
 *
 * Same design language as `AttributionSettings`: section headings above bordered
 * tables of label + description | control rows. Only General, Business Hours, CSAT, Collaborators and Configuration have content so far;
 * the other tabs show a placeholder. The open tab is local — it resets per inbox.
 *
 *   <InboxSettings
 *     type="whatsapp"
 *     detail="918240146769"
 *     values={values}
 *     onChange={(patch) => ...}
 *   />
 */
import { useId, useState } from 'react';
import type { InboxType } from '../InboxesTable';
import type { SelectItem } from '../Select';
import { BusinessHoursTab, type InboxBusinessHours } from './InboxBusinessHoursTab';
import { ConfigurationTab, type InboxConfiguration } from './InboxConfigurationTab';
import { CollaboratorsTab, type InboxAgent, type InboxCollaborators } from './InboxCollaboratorsTab';
import { CsatTab, type InboxCsat } from './InboxCsatTab';
import {
  DurationSection,
  OptInOutSection,
  SectionHeading,
  WaitingReminderSection,
  type DurationRow,
  type InboxDuration,
  type InboxDurationField,
  type OptInOut,
  type WaitingReminders,
} from './InboxSettingsSections';
import './InboxSettings.css';

export type { InboxDuration, InboxDurationField };
export type InboxDurationKey = 'autoClose' | 'autoResolve' | 'autoResolveBot' | 'autoAlert';
/** Internal tickets have no bot, so no auto resolve bot duration. */
export type InternalDurationKey = Exclude<InboxDurationKey, 'autoResolveBot'>;

export interface InboxSettingsValues {
  name: string;
  durations: Record<InboxDurationKey, InboxDuration>;
  internalDurations: Record<InternalDurationKey, InboxDuration>;
  /** Sent to a customer waiting in the queue; `%{position}` and `%{time}` are filled in. */
  waitTimeMessage: { enabled: boolean; text: string };
  /** Reminds the agent to follow up on a tracked conversation after `reminder`. */
  conversationTracking: { enabled: boolean; reminder: InboxDuration };
  optInOut: OptInOut;
  waitingReminders: WaitingReminders;
  csat: InboxCsat;
  businessHours: InboxBusinessHours;
  collaborators: InboxCollaborators;
  configuration: InboxConfiguration;
}

export interface InboxSettingsProps {
  type: InboxType;
  /** The channel identifier (phone number, email address or handle); read-only. */
  detail: string;
  values: InboxSettingsValues;
  onChange: (patch: Partial<InboxSettingsValues>) => void;
  /** Templates a waiting reminder can send. */
  templates: SelectItem[];
  /** Every agent that can be added to the inbox. */
  agents: InboxAgent[];
  /** Creates a new account agent from the Collaborators tab; returns its id. */
  onCreateAgent: (agent: { name: string; email: string; role: string }) => string;
}

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'business-hours', label: 'Business Hours' },
  { id: 'csat', label: 'CSAT' },
  { id: 'collaborators', label: 'Collaborators' },
  { id: 'configuration', label: 'Configuration' },
  { id: 'whatsapp-widget', label: 'WhatsApp Widget' },
];

const DETAIL_LABEL: Record<InboxType, string> = {
  whatsapp: 'Phone number',
  sms: 'Phone number',
  email: 'Email address',
  instagram: 'Handle',
  facebook: 'Page',
};

const DURATIONS: DurationRow<InboxDurationKey>[] = [
  { key: 'autoClose', label: 'Auto close duration', description: 'Close a ticket after this long with no reply from the customer.' },
  { key: 'autoResolve', label: 'Auto resolve duration', description: 'Resolve a ticket after this long with no activity.' },
  { key: 'autoResolveBot', label: 'Auto resolve bot duration', description: 'Resolve a bot-handled ticket after this long with no activity.' },
  { key: 'autoAlert', label: 'Auto alert duration', description: 'Alert the assigned agent when a ticket has waited this long for a reply.' },
];

const TRACKING_DURATIONS: DurationRow<'reminder'>[] = [
  { key: 'reminder', label: 'Tracking reminder time', description: 'Remind the agent to follow up after this long.' },
];

const INTERNAL_DURATIONS = DURATIONS.filter((d): d is DurationRow<InternalDurationKey> => d.key !== 'autoResolveBot');

function GeneralTab({ type, detail, values, onChange, templates }: InboxSettingsProps) {
  const nameId = useId();
  const detailId = useId();
  const waitMessageId = useId();
  const wait = values.waitTimeMessage;
  const tracking = values.conversationTracking;
  return (
    <>
      <section className="lc-inbs__group" aria-label="Inbox details">
        <SectionHeading title="Inbox details" description="How this inbox appears to your team and the channel it's connected to." />
        <div className="lc-inbs__table">
          <div className="lc-inbs__row">
            <label className="lc-inbs__label" htmlFor={nameId}>Inbox name</label>
            <input
              id={nameId}
              className="lc-inbs__input"
              value={values.name}
              onChange={(e) => onChange({ name: e.currentTarget.value })}
            />
          </div>
          <div className="lc-inbs__row">
            <div className="lc-inbs__row-label">
              <label className="lc-inbs__label" htmlFor={detailId}>{DETAIL_LABEL[type]}</label>
              <p className="lc-inbs__row-desc">Set when the inbox was connected; it can't be changed here.</p>
            </div>
            <input id={detailId} className="lc-inbs__input" value={detail} readOnly />
          </div>
        </div>
      </section>

      <DurationSection
        title="Ticket details"
        description="How long customer tickets in this inbox wait before they're closed, resolved or flagged."
        rows={DURATIONS}
        values={values.durations}
        onChange={(durations) => onChange({ durations })}
      />

      <DurationSection
        title="Internal ticket details"
        description="The same timers for internal tickets raised between your team."
        isNew
        rows={INTERNAL_DURATIONS}
        values={values.internalDurations}
        onChange={(internalDurations) => onChange({ internalDurations })}
      />

      <section className="lc-inbs__group" aria-label="Wait time message">
        <SectionHeading
          title="Enable wait time message"
          description="Tell customers their place in the queue while they wait for an agent."
          toggle={{ checked: wait.enabled, onChange: (enabled) => onChange({ waitTimeMessage: { ...wait, enabled } }) }}
        />
        <div className="lc-inbs__table">
          <div className="lc-inbs__row" data-disabled={!wait.enabled}>
            <div className="lc-inbs__row-label">
              <label className="lc-inbs__label" htmlFor={waitMessageId}>Message</label>
              <p className="lc-inbs__row-desc">
                Use <code>{'%{position}'}</code> for their place in the queue and <code>{'%{time}'}</code> for the
                approximate wait.
              </p>
            </div>
            <textarea
              id={waitMessageId}
              className="lc-inbs__input lc-inbs__textarea"
              rows={4}
              value={wait.text}
              disabled={!wait.enabled}
              onChange={(e) => onChange({ waitTimeMessage: { ...wait, text: e.currentTarget.value } })}
            />
          </div>
        </div>
      </section>

      <DurationSection
        title="Enable conversation tracking"
        description="Remind agents to follow up on conversations they're tracking."
        toggle={{
          checked: tracking.enabled,
          onChange: (enabled) => onChange({ conversationTracking: { ...tracking, enabled } }),
        }}
        rows={TRACKING_DURATIONS}
        values={{ reminder: tracking.reminder }}
        onChange={({ reminder }) => onChange({ conversationTracking: { ...tracking, reminder } })}
      />

      <OptInOutSection value={values.optInOut} onChange={(optInOut) => onChange({ optInOut })} />

      <WaitingReminderSection
        value={values.waitingReminders}
        templates={templates}
        onChange={(waitingReminders) => onChange({ waitingReminders })}
      />
    </>
  );
}

export function InboxSettings(props: InboxSettingsProps) {
  const [tab, setTab] = useState('general');
  // The widget is WhatsApp's chat button for websites, so other channels don't get the tab.
  const tabs = props.type === 'whatsapp' ? TABS : TABS.filter((t) => t.id !== 'whatsapp-widget');
  const tabLabel = tabs.find((t) => t.id === tab)?.label;

  return (
    <div className="lc-inbs">
      <div className="lc-inbs__tabbar">
        <div className="lc-inbs__tabs" role="tablist" aria-label="Inbox settings">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={t.id === tab}
              className="lc-inbs__tab"
              data-active={t.id === tab || undefined}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="lc-inbs__panel" role="tabpanel" aria-label={tabLabel}>
        {tab === 'general' ? (
          <GeneralTab {...props} />
        ) : tab === 'business-hours' ? (
          <BusinessHoursTab value={props.values.businessHours} onChange={(businessHours) => props.onChange({ businessHours })} />
        ) : tab === 'collaborators' ? (
          <CollaboratorsTab
            agents={props.agents}
            value={props.values.collaborators}
            onChange={(collaborators) => props.onChange({ collaborators })}
            onCreateAgent={props.onCreateAgent}
          />
        ) : tab === 'configuration' ? (
          <ConfigurationTab value={props.values.configuration} />
        ) : tab === 'csat' ? (
          <CsatTab value={props.values.csat} onChange={(csat) => props.onChange({ csat })} />
        ) : (
          // ponytail: placeholder until these tabs are designed.
          <p className="lc-inbs__empty">{tabLabel} settings aren't designed yet.</p>
        )}
      </div>
    </div>
  );
}

export default InboxSettings;
