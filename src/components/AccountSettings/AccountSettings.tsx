/**
 * AccountSettings — Settings → Account: workspace/account identifiers and
 * the default Do Not Disturb window for broadcasts. Renders inside
 * `<SettingsPage>`'s content slot.
 *
 * Same design language as `ProfileSettings`: bordered settings tables of
 * label + description | control rows, split by dividers, with the DnD
 * table's "Save changes" in its footer.
 *
 *   <AccountSettings
 *     id="1"
 *     crmAccountId="189"
 *     company="Limechat Development"
 *     brandSubdomain="http://links.limechat.in"
 *     uiModeOptions={['Whatsapp', 'Instagram', 'Email']}
 *     uiModePreference={mode}
 *     onUiModePreferenceChange={setMode}
 *     dndStartTime={start}
 *     dndEndTime={end}
 *     onDndStartTimeChange={setStart}
 *     onDndEndTimeChange={setEnd}
 *     onSaveDnd={() => save()}
 *   />
 */
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Button } from '../Button';
import { CheckIcon, ChevronDownIcon as ChevronIcon } from '../icons';
import './AccountSettings.css';

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
    <span className="lc-as__status" data-state={state}>
      <CheckIcon />
      {children}
    </span>
  );
}

/** One label(+description) | control row of a settings table. */
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
    <div className="lc-as__row">
      <div className="lc-as__row-label">
        {htmlFor ? (
          <label className="lc-as__label" htmlFor={htmlFor}>
            {label}
          </label>
        ) : (
          <span className="lc-as__label">{label}</span>
        )}
        {description && <p className="lc-as__row-desc">{description}</p>}
      </div>
      <div className="lc-as__row-control">{children}</div>
    </div>
  );
}

export interface AccountSettingsProps {
  id: string;
  crmAccountId: string;
  company: string;
  brandSubdomain: string;
  uiModeOptions: string[];
  uiModePreference: string;
  onUiModePreferenceChange: (next: string) => void;

  dndStartTime: string;
  dndEndTime: string;
  onDndStartTimeChange: (next: string) => void;
  onDndEndTimeChange: (next: string) => void;
  onSaveDnd?: () => void;
  savingDnd?: boolean;
}

export function AccountSettings({
  id,
  crmAccountId,
  company,
  brandSubdomain,
  uiModeOptions,
  uiModePreference,
  onUiModePreferenceChange,
  dndStartTime,
  dndEndTime,
  onDndStartTimeChange,
  onDndEndTimeChange,
  onSaveDnd,
  savingDnd = false,
}: AccountSettingsProps) {
  const idId = useId();
  const crmId = useId();
  const companyId = useId();
  const subdomainId = useId();
  const uiModeId = useId();
  const startId = useId();
  const endId = useId();

  const dndStatus = useTransientStatus();

  return (
    <div className="lc-as">
      <section className="lc-as__table">
        <Row label="ID" htmlFor={idId} description="Internal identifier — can't be changed.">
          <input id={idId} className="lc-as__input" value={id} disabled readOnly />
        </Row>

        <Row label="CRM Account ID" htmlFor={crmId} description="Links this workspace to its CRM account.">
          <input id={crmId} className="lc-as__input" value={crmAccountId} disabled readOnly />
        </Row>

        <Row label="Company" htmlFor={companyId} description="The organization this account belongs to.">
          <input id={companyId} className="lc-as__input" value={company} disabled readOnly />
        </Row>

        <Row
          label="Brand Subdomain"
          htmlFor={subdomainId}
          description="The link domain used across this workspace's messages."
        >
          <input id={subdomainId} className="lc-as__input" value={brandSubdomain} disabled readOnly />
        </Row>

        <Row
          label="UI Mode Preference"
          htmlFor={uiModeId}
          description="The default channel shown when previewing conversations."
        >
          <div className="lc-as__select-wrap">
            <select
              id={uiModeId}
              className="lc-as__select"
              value={uiModePreference}
              onChange={(e) => onUiModePreferenceChange(e.currentTarget.value)}
            >
              {uiModeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronIcon />
          </div>
        </Row>
      </section>

      <div className="lc-as__section-heading">
        <h2 className="lc-as__section-title">Do Not Disturb Hours</h2>
        <p className="lc-as__section-desc">
          Set the default time window when broadcasts should not be sent. These hours will be
          applied by default to all new broadcast campaigns.
        </p>
      </div>

      <section className="lc-as__table">
        <Row label="Start time" htmlFor={startId} description="24-hour format.">
          <input
            id={startId}
            type="time"
            className="lc-as__input"
            value={dndStartTime}
            onChange={(e) => onDndStartTimeChange(e.currentTarget.value)}
          />
        </Row>

        <Row label="End time" htmlFor={endId} description="24-hour format.">
          <input
            id={endId}
            type="time"
            className="lc-as__input"
            value={dndEndTime}
            onChange={(e) => onDndEndTimeChange(e.currentTarget.value)}
          />
        </Row>

        <div className="lc-as__footer">
          <StatusNote state={dndStatus.state}>Saved</StatusNote>
          <Button
            variant="filled"
            color="primary"
            size="sm"
            loading={savingDnd}
            onClick={() => {
              onSaveDnd?.();
              dndStatus.trigger();
            }}
          >
            Save changes
          </Button>
        </div>
      </section>
    </div>
  );
}

export default AccountSettings;
