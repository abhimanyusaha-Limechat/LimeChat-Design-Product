/**
 * VisualizeFlowModal — LimeChat design system (Figma node 130:20891, "Visualize flow").
 *
 * Opened from the canvas toolbar's "Visualize flow" / "Test" action. Lets the
 * user add one or more phone numbers (with a country code) and, optionally,
 * email addresses to send the live flow demo to.
 *
 *   <VisualizeFlowModal
 *     open={open}
 *     onClose={close}
 *     onSend={(v) => send(v)}
 *   />
 *
 * Built on the shared `<Modal>` shell + `NativeSelect`.
 */
import { useEffect, useState } from 'react';
import { Button } from '../Button';
import { NativeSelect } from '../Select';
import { Modal } from '../Modal';

const PLUS_ICON_PATHS = ['M12 5l0 14', 'M5 12l14 0'];
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PLUS_ICON_PATHS.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export interface VisualizeFlowValues {
  countryCode: string;
  phones: string[];
  emails: string[];
}

export interface VisualizeFlowModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with the accumulated phones/emails when "Send" is clicked. */
  onSend?: (values: VisualizeFlowValues) => void;
  title?: string;
  description?: string;
  countryCodes?: string[];
  defaults?: Partial<VisualizeFlowValues>;
}

const DEFAULT_COUNTRY_CODES = ['+91', '+1', '+44', '+61', '+971'];

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="lc-modal__chip">
      {label}
      <button type="button" className="lc-modal__chip-remove" aria-label={`Remove ${label}`} onClick={onRemove}>
        ×
      </button>
    </span>
  );
}

export function VisualizeFlowModal({
  open,
  onClose,
  onSend,
  title = 'Send Test Message',
  description = 'Test the flow using your WhatsApp number to see what it is like. This is a demo, so no real actions—such as placing or cancelling an order—will occur.',
  countryCodes = DEFAULT_COUNTRY_CODES,
  defaults,
}: VisualizeFlowModalProps) {
  const [countryCode, setCountryCode] = useState(defaults?.countryCode ?? countryCodes[0]);
  const [phoneInput, setPhoneInput] = useState('');
  const [phones, setPhones] = useState<string[]>(defaults?.phones ?? []);
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState<string[]>(defaults?.emails ?? []);

  // Snapshot the incoming defaults each time the modal opens.
  useEffect(() => {
    if (!open) return;
    setCountryCode(defaults?.countryCode ?? countryCodes[0]);
    setPhoneInput('');
    setPhones(defaults?.phones ?? []);
    setEmailInput('');
    setEmails(defaults?.emails ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const addPhone = () => {
    const value = phoneInput.trim();
    if (!value) return;
    setPhones((p) => [...p, `${countryCode} ${value}`]);
    setPhoneInput('');
  };
  const addEmail = () => {
    const value = emailInput.trim();
    if (!value) return;
    setEmails((e) => [...e, value]);
    setEmailInput('');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <Button
          variant="filled"
          color="primary"
          size="sm"
          onClick={() => onSend?.({ countryCode, phones, emails })}
        >
          Send
        </Button>
      }
    >
      <div className="lc-modal__field">
        <span className="lc-modal__field-label">Add phone number</span>
        <div className="lc-modal__row lc-modal__row--end">
          <NativeSelect
            data={countryCodes}
            value={countryCode}
            onChange={(e) => setCountryCode(e.currentTarget.value)}
            size="sm"
            wrapperClassName="lc-modal__country-code"
          />
          <input
            type="tel"
            className="lc-modal__input"
            value={phoneInput}
            placeholder="Add phone number"
            aria-label="Add phone number"
            onChange={(e) => setPhoneInput(e.currentTarget.value)}
          />
          <Button
            variant="default"
            color="primary"
            size="sm"
            textTransform="none"
            leftSection={<PlusIcon />}
            onClick={addPhone}
          >
            Add
          </Button>
        </div>
        {phones.length > 0 && (
          <div className="lc-modal__chip-list">
            {phones.map((p, i) => (
              <Chip key={`${p}-${i}`} label={p} onRemove={() => setPhones((v) => v.filter((_, j) => j !== i))} />
            ))}
          </div>
        )}
      </div>

      <div className="lc-modal__field">
        <span className="lc-modal__field-label">Add email address (Optional)</span>
        <div className="lc-modal__row lc-modal__row--end">
          <input
            type="email"
            className="lc-modal__input"
            value={emailInput}
            placeholder="Email address"
            aria-label="Email address"
            onChange={(e) => setEmailInput(e.currentTarget.value)}
          />
          <Button
            variant="default"
            color="primary"
            size="sm"
            textTransform="none"
            leftSection={<PlusIcon />}
            onClick={addEmail}
          >
            Add
          </Button>
        </div>
        {emails.length > 0 && (
          <div className="lc-modal__chip-list">
            {emails.map((email, i) => (
              <Chip key={`${email}-${i}`} label={email} onRemove={() => setEmails((v) => v.filter((_, j) => j !== i))} />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default VisualizeFlowModal;
