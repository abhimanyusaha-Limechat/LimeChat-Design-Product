/**
 * The Configuration tab of InboxSettings: the callback URL to paste into the channel
 * provider (Twilio). It's set up by an admin, so an inbox without one shows a hint instead.
 */
import { useId } from 'react';
import { Button } from '../Button';
import { SectionHeading } from './InboxSettingsSections';
import { useCopied } from './useCopied';

export interface InboxConfiguration {
  /** Empty until an admin has set the inbox up. */
  callbackUrl: string;
}

export function ConfigurationTab({ value }: { value: InboxConfiguration }) {
  const urlId = useId();
  const { copied, copy } = useCopied(value.callbackUrl);

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
