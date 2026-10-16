/**
 * ProfileSettings — Settings → Profile: account details, password reset, and
 * API key management. Renders inside `<SettingsPage>`'s content slot.
 *
 * Laid out as a settings table: each row is label + description on the
 * left, the control on the right. "Save changes" lives in the page header
 * (`<SettingsPage headerActions>`), owned by the parent.
 *
 *   <ProfileSettings
 *     email="team@limechat.ai"
 *     name={name}
 *     onNameChange={setName}
 *     onRequestPasswordChange={() => requestReset()}
 *     apiKeyMasked="lcuat.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
 *     apiKeyExpiry="Never"
 *     onGenerateKey={() => generateKey()}
 *   />
 */
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import { Icon, CheckIcon, ChevronDownIcon } from '../icons';
import './ProfileSettings.css';

/** "Copy" action sitting inside a read-only field — copies `value` to the clipboard. */
function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="default"
      color="gray"
      size="xs"
      leftSection={copied ? <CheckIcon /> : <Icon name="copy" />}
      aria-label={label}
      onClick={() => {
        navigator.clipboard?.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? 'Copied' : 'Copy'}
    </Button>
  );
}

/** Shows `children` briefly after `trigger()` is called — fades in, holds, fades out. */
function useTransientStatus(holdMs = 1800) {
  const [state, setState] = useState<'idle' | 'visible' | 'leaving'>('idle');
  const timers = useRef<{ hold?: number; leave?: number }>({});

  const trigger = useCallback(() => {
    window.clearTimeout(timers.current.hold);
    window.clearTimeout(timers.current.leave);
    setState('visible');
    timers.current.hold = window.setTimeout(() => {
      setState('leaving');
      timers.current.leave = window.setTimeout(() => setState('idle'), 180);
    }, holdMs);
  }, [holdMs]);

  useEffect(
    () => () => {
      window.clearTimeout(timers.current.hold);
      window.clearTimeout(timers.current.leave);
    },
    [],
  );

  return { state, trigger };
}

function StatusNote({ state, children }: { state: 'idle' | 'visible' | 'leaving'; children: ReactNode }) {
  if (state === 'idle') return null;
  return (
    <span className="lc-ps__status" data-state={state}>
      <CheckIcon />
      {children}
    </span>
  );
}

/** One label(+description) | control row of the settings table. */
function Row({
  label,
  description,
  htmlFor,
  children,
}: {
  label: string;
  description?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="lc-ps__row">
      <div className="lc-ps__row-label">
        {htmlFor ? (
          <label className="lc-ps__label" htmlFor={htmlFor}>
            {label}
          </label>
        ) : (
          <span className="lc-ps__label">{label}</span>
        )}
        {description && <p className="lc-ps__row-desc">{description}</p>}
      </div>
      <div className="lc-ps__row-control">{children}</div>
    </div>
  );
}

/** Masked secret (API key, access token): read-only value + Copy, optionally with expiry and a regenerate action. */
function SecretRow({
  label,
  description,
  masked,
  regenerate,
}: {
  label: string;
  description: string;
  masked: string;
  regenerate?: {
    /** Short word for the action copy — "Generate new key", "New key generated". */
    noun: string;
    expiry: string;
    generating?: boolean;
    onGenerate?: () => void;
  };
}) {
  const id = useId();
  const status = useTransientStatus();
  return (
    <Row label={label} htmlFor={id} description={description}>
      <div className="lc-ps__field">
        <input id={id} className="lc-ps__field-value" value={masked} readOnly />
        <CopyButton value={masked} label={`Copy ${label}`} />
      </div>
      {regenerate && (
        <>
          <div className="lc-ps__control-meta">
            <span className="lc-ps__row-desc">Expires: {regenerate.expiry}</span>
            <Button
              variant="subtle"
              color="primary"
              size="xs"
              loading={regenerate.generating}
              onClick={() => {
                regenerate.onGenerate?.();
                status.trigger();
              }}
            >
              Generate new {regenerate.noun}
            </Button>
          </div>
          <StatusNote state={status.state}>New {regenerate.noun} generated</StatusNote>
        </>
      )}
    </Row>
  );
}

const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

/** "Aditi Rao" → "AR" — shown until a photo is uploaded. */
function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase();
}

/** Avatar preview + Upload / Remove. Rejects anything but JPG/PNG/WebP up to 2 MB. */
function AvatarPicker({ name, src, onChange }: { name: string; src?: string; onChange: (file: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="lc-ps__avatar-picker">
      <Avatar src={src} alt={src ? name : undefined} size="lg" radius={8} className="lc-ps__avatar">
        {initials(name)}
      </Avatar>
      <div className="lc-ps__avatar-actions">
        <div className="lc-ps__avatar-buttons">
          <Button variant="outline" color="primary" size="xs" onClick={() => inputRef.current?.click()}>
            {src ? 'Change photo' : 'Upload photo'}
          </Button>
          {src && (
            <Button variant="subtle" color="gray" size="xs" onClick={() => onChange(null)}>
              Remove
            </Button>
          )}
        </div>
        {error && (
          <p className="lc-ps__error" role="alert">
            {error}
          </p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={AVATAR_TYPES.join(',')}
        hidden
        aria-label="Upload profile picture"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          e.currentTarget.value = ''; // so picking the same file again still fires
          if (!file) return;
          if (!AVATAR_TYPES.includes(file.type)) return setError('Use a JPG, PNG or WebP image.');
          if (file.size > AVATAR_MAX_BYTES) return setError('Image must be 2 MB or smaller.');
          setError(null);
          onChange(file);
        }}
      />
    </div>
  );
}

/** Collapsible section: heading + subheading (the toggle) above a bordered settings table. Starts open. */
function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="lc-ps__group" aria-label={title}>
      <details className="lc-ps__collapse" open>
        <summary className="lc-ps__section-heading">
          <span className="lc-ps__section-text">
            <h2 className="lc-ps__section-title">{title}</h2>
            <span className="lc-ps__section-desc">{description}</span>
          </span>
          <ChevronDownIcon className="lc-ps__section-chevron" />
        </summary>
        <div className="lc-ps">{children}</div>
      </details>
    </section>
  );
}

/** Extra contact fields HelpDesk agents keep on their profile. */
export interface HelpDeskContact {
  displayName: string;
  phone: string;
  webrtcId: string;
  timezone: string;
  address: string;
}

// ponytail: short curated list; swap for Intl.supportedValuesOf('timeZone') once tsconfig lib is ES2022+.
export const TIMEZONE_OPTIONS = [
  'Asia/Kolkata (GMT+5:30)',
  'Asia/Dubai (GMT+4:00)',
  'Asia/Singapore (GMT+8:00)',
  'Europe/London (GMT+0:00)',
  'Europe/Berlin (GMT+1:00)',
  'America/New_York (GMT-5:00)',
  'America/Los_Angeles (GMT-8:00)',
  'Australia/Sydney (GMT+10:00)',
];

export interface ProfileSettingsProps {
  email: string;
  name: string;
  onNameChange: (next: string) => void;

  /**
   * HelpDesk only — when set, the page splits into a "Profile" section (Full name / Display name /
   * Email address / Phone / WebRTC ID / Timezone / Address) and an "Access" section (Access token /
   * ActionCable / API key).
   */
  contact?: HelpDeskContact;
  onContactChange?: (next: HelpDeskContact) => void;

  onRequestPasswordChange?: () => void;
  requestingPasswordChange?: boolean;

  /** Fully masked value, e.g. "lcuat.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX". */
  apiKeyMasked: string;
  apiKeyExpiry: string;
  onGenerateKey?: () => void;
  generatingKey?: boolean;

  /** HelpDesk (with `contact`) — read-only "Access token" row (value + Copy) in the Access section. */
  accessTokenMasked?: string;

  /** HelpDesk only — when set, the table opens with a Profile picture row. `src` is the current photo, if any. */
  avatar?: { src?: string; onChange: (file: File | null) => void };


  /** HelpDesk (with `contact`) — ActionCable event receipt collection switch in the Access section. */
  actionCableReceipts?: { checked: boolean; onChange: (next: boolean) => void };
}

export function ProfileSettings({
  email,
  name,
  onNameChange,
  contact,
  onContactChange,
  onRequestPasswordChange,
  requestingPasswordChange = false,
  apiKeyMasked,
  apiKeyExpiry,
  onGenerateKey,
  generatingKey = false,
  accessTokenMasked,
  actionCableReceipts,
  avatar,
}: ProfileSettingsProps) {
  const emailId = useId();
  const nameId = useId();
  const fieldId = useId();

  const passwordStatus = useTransientStatus();

  const contactInput = (key: Exclude<keyof HelpDeskContact, 'timezone' | 'address'>, type = 'text', autoComplete?: string) =>
    contact && (
      <input
        id={`${fieldId}-${key}`}
        className="lc-ps__input"
        type={type}
        autoComplete={autoComplete}
        value={contact[key]}
        onChange={(e) => onContactChange?.({ ...contact, [key]: e.currentTarget.value })}
      />
    );

  const emailInput = <input id={emailId} className="lc-ps__input" value={email} disabled readOnly />;
  const nameInput = (
    <input id={nameId} className="lc-ps__input" value={name} onChange={(e) => onNameChange(e.currentTarget.value)} />
  );


  const avatarRow = avatar && (
    <Row label="Profile picture" description="JPG, PNG or WebP, up to 2 MB.">
      <AvatarPicker name={name} src={avatar.src} onChange={avatar.onChange} />
    </Row>
  );

  const passwordRow = (
    <Row label="Password" description="We'll email you a secure link to set a new one.">
      <Button
        variant="outline"
        color="primary"
        size="sm"
        loading={requestingPasswordChange}
        onClick={() => {
          onRequestPasswordChange?.();
          passwordStatus.trigger();
        }}
      >
        Request password change
      </Button>
      <StatusNote state={passwordStatus.state}>Reset link sent</StatusNote>
    </Row>
  );

  const apiKeyRow = (
    <SecretRow
      label="API key"
      description="Store it securely — generate a new one if you've lost it."
      masked={apiKeyMasked}
      regenerate={{ noun: 'key', expiry: apiKeyExpiry, generating: generatingKey, onGenerate: onGenerateKey }}
    />
  );

  if (!contact) {
    return (
      <div className="lc-ps">
        {avatarRow}
        <Row label="Email" htmlFor={emailId} description="Used to sign in — can't be changed.">
          {emailInput}
        </Row>
        <Row label="Name" htmlFor={nameId} description="Shown across LimeChat.">
          {nameInput}
        </Row>
        {passwordRow}
        {apiKeyRow}
      </div>
    );
  }

  return (
    <>
      <Section title="Profile" description="Your photo, name and how customers and teammates reach you.">
        {avatarRow}
        <Row label="Full name" htmlFor={nameId} description="Your legal name, visible to admins.">
          {nameInput}
        </Row>
        <Row label="Display name" htmlFor={`${fieldId}-displayName`} description="What customers see in conversations.">
          {contactInput('displayName', 'text', 'nickname')}
        </Row>
        <Row label="Email address" htmlFor={emailId} description="Used to sign in — can't be changed.">
          {emailInput}
        </Row>
        <Row label="Phone number" htmlFor={`${fieldId}-phone`} description="Include the country code, e.g. +91.">
          {contactInput('phone', 'tel', 'tel')}
        </Row>
        <Row label="WebRTC ID" htmlFor={`${fieldId}-webrtcId`} description="Routes in-browser calls to you.">
          {contactInput('webrtcId')}
        </Row>
        <Row label="Timezone" htmlFor={`${fieldId}-timezone`} description="Used for shift hours and ticket timestamps.">
          <div className="lc-ps__select-wrap">
            <select
              id={`${fieldId}-timezone`}
              className="lc-ps__input lc-ps__select"
              value={contact.timezone}
              onChange={(e) => onContactChange?.({ ...contact, timezone: e.currentTarget.value })}
            >
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
            <ChevronDownIcon />
          </div>
        </Row>
        <Row label="Address" htmlFor={`${fieldId}-address`} description="Your work location.">
          <textarea
            id={`${fieldId}-address`}
            className="lc-ps__input lc-ps__textarea"
            rows={3}
            autoComplete="street-address"
            value={contact.address}
            onChange={(e) => onContactChange?.({ ...contact, address: e.currentTarget.value })}
          />
        </Row>
        {passwordRow}
      </Section>

      <Section title="Access" description="Credentials for API access and real-time event delivery.">
        {accessTokenMasked && (
          <SecretRow
            label="Access token"
            description="Authenticates your API requests to LimeChat HelpDesk. Treat it like a password."
            masked={accessTokenMasked}
          />
        )}
        {actionCableReceipts && (
          <Row
            label="ActionCable event receipt collection"
            htmlFor={`${fieldId}-actioncable`}
            description="Records delivery receipts for real-time events sent to you — useful when debugging missed updates."
          >
            <button
              id={`${fieldId}-actioncable`}
              type="button"
              role="switch"
              aria-checked={actionCableReceipts.checked}
              className="lc-ps__switch-track"
              onClick={() => actionCableReceipts.onChange(!actionCableReceipts.checked)}
            >
              <span className="lc-ps__switch-thumb" />
            </button>
          </Row>
        )}
        {apiKeyRow}
      </Section>
    </>
  );
}

export default ProfileSettings;
