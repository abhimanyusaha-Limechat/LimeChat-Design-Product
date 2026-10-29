/**
 * The widget editor's Pre Chat form tab: capture the visitor's details before a
 * conversation starts. A welcome message above the form and which fields it asks for.
 */
import { useId } from 'react';
import { Row, SectionHeading, SwitchRow } from './InboxSettingsSections';

export interface InboxWidgetPreChat {
  enabled: boolean;
  message: string;
  name: boolean;
  email: boolean;
  phone: boolean;
}

const FIELDS: { key: 'name' | 'email' | 'phone'; label: string; description: string }[] = [
  { key: 'name', label: 'Name', description: 'This will help collect the name of your visiting customer' },
  { key: 'email', label: 'Email-id', description: 'This will help collect the email of your visiting customer' },
  { key: 'phone', label: 'Contact Number', description: 'This will help collect the phone number of your visiting customer' },
];

export function WidgetPreChatSection({
  value,
  onChange,
}: {
  value: InboxWidgetPreChat;
  onChange: (next: InboxWidgetPreChat) => void;
}) {
  const messageId = useId();
  const set = (patch: Partial<InboxWidgetPreChat>) => onChange({ ...value, ...patch });
  const off = !value.enabled;
  return (
    <section className="lc-inbs__group" aria-label="Pre Chat Form">
      <SectionHeading
        title="Pre Chat Form"
        description="Pre chat forms enable you to capture user information before they start conversation with you. This form has the given fields: Full Name, Email Address, Phone Number and Message."
        toggle={{ checked: value.enabled, onChange: (enabled) => set({ enabled }) }}
      />
      <div className="lc-inbs__table">
        <Row label="Pre Chat Message" description="This will appear on the top of the form. This is like a welcome message to start filling the form." off={off}>
          <textarea
            id={messageId}
            className="lc-inbs__input lc-inbs__textarea"
            rows={5}
            aria-label="Pre Chat Message"
            placeholder="This message would be visible to the users along with the form"
            value={value.message}
            disabled={off}
            onChange={(e) => set({ message: e.currentTarget.value })}
          />
        </Row>
        {FIELDS.map(({ key, label, description }) => (
          <SwitchRow key={key} label={label} description={description} checked={value[key]} off={off} onChange={(next) => set({ [key]: next })} />
        ))}
      </div>
    </section>
  );
}
