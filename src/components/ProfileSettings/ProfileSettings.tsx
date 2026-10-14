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
import { Button } from '../Button';
import { Icon, CheckIcon } from '../icons';
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

export interface ProfileSettingsProps {
  email: string;
  name: string;
  onNameChange: (next: string) => void;

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

  const passwordStatus = useTransientStatus();
  const keyStatus = useTransientStatus();

  return (
    <div className="lc-ps">
      <Row label="Email" htmlFor={emailId} description="Used to sign in — can't be changed.">
        <input id={emailId} className="lc-ps__input" value={email} disabled readOnly />
      </Row>

      <Row label="Name" htmlFor={nameId} description="Shown across LimeChat.">
        <input
          id={nameId}
          className="lc-ps__input"
          value={name}
          onChange={(e) => onNameChange(e.currentTarget.value)}
        />
      </Row>

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

      <Row label="API key" htmlFor={apiKeyId} description="Store it securely — generate a new one if you've lost it.">
        <div className="lc-ps__field">
          <input id={apiKeyId} className="lc-ps__field-value" value={apiKeyMasked} readOnly />
          <CopyButton value={apiKeyMasked} label="Copy API key" />
        </div>
        <div className="lc-ps__control-meta">
          <span className="lc-ps__row-desc">Expires: {apiKeyExpiry}</span>
          <Button
            variant="subtle"
            color="primary"
            size="xs"
            loading={generatingKey}
            onClick={() => {
              onGenerateKey?.();
              keyStatus.trigger();
            }}
          >
            Generate new key
          </Button>
        </div>
        <StatusNote state={keyStatus.state}>New key generated</StatusNote>
      </Row>
    </div>
  );
}

export default ProfileSettings;
