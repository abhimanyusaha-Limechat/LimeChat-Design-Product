/**
 * ProfileSettings — Settings → Profile: account details, password reset, and
 * API key management. Renders inside `<SettingsPage>`'s content slot.
 *
 * Redesigned from a rough reference (plain bordered boxes, all-green buttons,
 * a form stacked in a narrow column that leaves the rest of the page empty)
 * into a standard two-column settings row — label + description on the
 * left, the control on the right — the pattern GitHub/Stripe/Linear settings
 * pages use, which both fills the available width sensibly and reads as a
 * settings page rather than a plain form.
 *
 *   <ProfileSettings
 *     email="team@limechat.ai"
 *     name={name}
 *     onNameChange={setName}
 *     onUpdateProfile={() => save(name)}
 *     onRequestPasswordChange={() => requestReset()}
 *     apiKeyMasked="lcuat.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
 *     apiKeyExpiry="Never"
 *     onGenerateKey={() => generateKey()}
 *   />
 */
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Button } from '../Button';
import { Tooltip } from '../Tooltip';
import './ProfileSettings.css';

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12l5 5l10 -10" />
  </svg>
);

const CopyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
    <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />
  </svg>
);

/** Secondary icon-only action next to a field — copies `value` to the clipboard. */
function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Tooltip label={copied ? 'Copied!' : label}>
      <button
        type="button"
        className="lc-ps__icon-btn"
        aria-label={label}
        onClick={() => {
          navigator.clipboard?.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        }}
      >
        <CopyIcon />
      </button>
    </Tooltip>
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

/** One label(+description) | control settings row. */
function Row({
  label,
  description,
  descriptionPosition = 'label',
  htmlFor,
  first,
  last,
  children,
}: {
  label: string;
  description?: string;
  /** Where the description renders — under the label (default) or under the control, as a caption. */
  descriptionPosition?: 'label' | 'control';
  htmlFor?: string;
  /** No top divider/padding — this is the first row in its section. */
  first?: boolean;
  /** Bottom divider closing out the section, mirroring the top one. */
  last?: boolean;
  children: ReactNode;
}) {
  const cls = ['lc-ps__row', first && 'lc-ps__row--first', last && 'lc-ps__row--last']
    .filter(Boolean)
    .join(' ');
  return (
    <div className={cls}>
      <div className="lc-ps__row-label">
        {htmlFor ? (
          <label className="lc-ps__label" htmlFor={htmlFor}>
            {label}
          </label>
        ) : (
          <span className="lc-ps__label">{label}</span>
        )}
        {description && descriptionPosition === 'label' && <p className="lc-ps__row-desc">{description}</p>}
      </div>
      <div className="lc-ps__row-control">
        {children}
        {description && descriptionPosition === 'control' && <p className="lc-ps__row-desc">{description}</p>}
      </div>
    </div>
  );
}

export interface ProfileSettingsProps {
  email: string;
  name: string;
  onNameChange: (next: string) => void;
  onUpdateProfile?: () => void;
  updatingProfile?: boolean;

  onRequestPasswordChange?: () => void;
  requestingPasswordChange?: boolean;

  /** Fully masked value, e.g. "lcuat.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX". */
  apiKeyMasked: string;
  apiKeyExpiry: string;
  onGenerateKey?: () => void;
  generatingKey?: boolean;
}

export function ProfileSettings({
  email,
  name,
  onNameChange,
  onUpdateProfile,
  updatingProfile = false,
  onRequestPasswordChange,
  requestingPasswordChange = false,
  apiKeyMasked,
  apiKeyExpiry,
  onGenerateKey,
  generatingKey = false,
}: ProfileSettingsProps) {
  const emailId = useId();
  const nameId = useId();
  const apiKeyId = useId();

  const profileStatus = useTransientStatus();
  const passwordStatus = useTransientStatus();
  const keyStatus = useTransientStatus();

  return (
    <div className="lc-ps">
      <section className="lc-ps__section">
        <Row label="Email" htmlFor={emailId} description="Used to sign in — can't be changed." first>
          <input id={emailId} className="lc-ps__input" value={email} disabled readOnly />
        </Row>

        <Row label="Name" htmlFor={nameId} description="Shown across LimeChat." last>
          <div className="lc-ps__inline-control">
            <input
              id={nameId}
              className="lc-ps__input"
              value={name}
              onChange={(e) => onNameChange(e.currentTarget.value)}
            />
            <Button
              variant="filled"
              color="primary"
              size="sm"
              loading={updatingProfile}
              onClick={() => {
                onUpdateProfile?.();
                profileStatus.trigger();
              }}
            >
              Update
            </Button>
          </div>
          <StatusNote state={profileStatus.state}>Profile updated</StatusNote>
        </Row>
      </section>

      <section className="lc-ps__section">
        <Row label="Password" description="We'll email you a secure link to set a new one." last>
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
        </Row>

        <div className="lc-ps__section-footer">
          <StatusNote state={passwordStatus.state}>Reset link sent</StatusNote>
        </div>
      </section>

      <section className="lc-ps__section">
        <Row
          label="Last API key"
          htmlFor={apiKeyId}
          description="Store it securely — generate a new one if you've lost it."
          last
        >
          <div className="lc-ps__inline-control">
            <input
              id={apiKeyId}
              className="lc-ps__input lc-ps__input--mono"
              value={apiKeyMasked}
              disabled
              readOnly
            />
            <CopyButton value={apiKeyMasked} label="Copy API key" />
            <Button
              variant="light"
              color="primary"
              size="sm"
              loading={generatingKey}
              onClick={() => {
                onGenerateKey?.();
                keyStatus.trigger();
              }}
            >
              Generate new key
            </Button>
          </div>
          <p className="lc-ps__row-desc">Expiry : {apiKeyExpiry}</p>
          <StatusNote state={keyStatus.state}>New key generated</StatusNote>
        </Row>
      </section>
    </div>
  );
}

export default ProfileSettings;
