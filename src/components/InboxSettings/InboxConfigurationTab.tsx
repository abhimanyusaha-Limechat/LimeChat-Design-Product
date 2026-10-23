/**
 * The Configuration tab of InboxSettings: the callback URL to paste into the channel
 * provider (Twilio). It's set up by an admin, so an inbox without one shows a hint instead.
 */
import { useEffect, useId, useState } from 'react';
import { Button } from '../Button';
import { SectionHeading } from './InboxSettingsSections';

export interface InboxConfiguration {
  /** Empty until an admin has set the inbox up. */
  callbackUrl: string;
}

const COPIED_MS = 2000;

export function ConfigurationTab({ value }: { value: InboxConfiguration }) {
  const urlId = useId();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = () => {
    // The clipboard can be unavailable (insecure context, denied permission); the URL stays selectable.
    navigator.clipboard?.writeText(value.callbackUrl).then(() => setCopied(true), () => undefined);
  };

  return (
    <section className="lc-inbs__group" aria-label="Callback URL">
      <SectionHeading
        title="Callback URL"
        description="You have to configure the message callback URL in Twilio with the URL mentioned here."
      />
      <div className="lc-inbs__table">
        {value.callbackUrl ? (
          <div className="lc-inbs__row">
            <div className="lc-inbs__row-label">
              <label className="lc-inbs__label" htmlFor={urlId}>Message callback URL</label>
              <p className="lc-inbs__row-desc">Paste this into Twilio's message callback setting.</p>
            </div>
            <div className="lc-inbs__copy">
              <input id={urlId} className="lc-inbs__input" value={value.callbackUrl} readOnly onFocus={(e) => e.currentTarget.select()} />
              <Button variant="outline" size="sm" onClick={copy}>{copied ? 'Copied' : 'Copy'}</Button>
            </div>
          </div>
        ) : (
          <p className="lc-inbs__row lc-inbs__note">Please contact admin to set this up.</p>
        )}
      </div>
    </section>
  );
}
