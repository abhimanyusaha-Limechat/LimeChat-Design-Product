/**
 * IntegrationSettings — Settings → Integration → one partner (e.g. Freshdesk):
 * a status header (connection state and — only once a field is edited — an
 * Update/Connect button) above the partner's connection fields, each optionally
 * with a "Where to find?" link.
 *
 * Same design language as `HelpDeskAccountSettings`: a bordered table of
 * label | input rows. The partner icon/title and back arrow live in the page
 * header (`<SettingsPage titleIcon onBack>`), owned by the parent.
 *
 *   <IntegrationSettings
 *     partnerName="Freshdesk"
 *     status="connected"
 *     fields={[{ id: 'widgetId', label: 'Widget ID', help: true }]}
 *     values={values}
 *     savedValues={savedValues}
 *     onChange={(id, value) => ...}
 *     onSubmit={() => ...}
 *   />
 */
import { useId, type ReactNode } from 'react';
import { Button } from '../Button';
import './IntegrationSettings.css';

export interface IntegrationField {
  id: string;
  label: string;
  /** `password` masks the value — use for API keys, tokens and passwords. */
  type?: 'text' | 'password';
  placeholder?: string;
  /** Subheading under the label, e.g. where the value comes from. */
  description?: string;
  /** Shows a "Where to find?" link beside the label. */
  help?: true;
}

/**
 * Every state a credential-based integration can be in:
 * - `not-connected` — never set up; the fields are empty.
 * - `verifying` — the details were just submitted and are being checked (shown while `submitting`).
 * - `connected` — the partner accepted the details and is syncing.
 * - `error` — the partner rejected the details (wrong key, changed password, revoked access).
 */
export type IntegrationStatus = 'not-connected' | 'verifying' | 'connected' | 'error';

/** `label` is followed by a smaller "to <partner>", e.g. "Connected to Freshdesk". */
const STATUS_LABEL: Record<IntegrationStatus, string> = {
  'not-connected': 'Not connected',
  verifying: 'Connecting',
  connected: 'Connected',
  error: 'Couldn’t connect',
};

export interface IntegrationSettingsProps {
  /** Shown in the status, e.g. "Connected to Freshdesk". */
  partnerName: string;
  /** The saved connection state; shows as `verifying` while `submitting`. */
  status: Exclude<IntegrationStatus, 'verifying'>;
  /** Every field is required; the submit button stays disabled until all are filled. */
  fields: IntegrationField[];
  /** What the inputs show now. */
  values: Record<string, string>;
  /** The last saved details; Update/Connect shows only while `values` differ from these. */
  savedValues: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
  /** Called when a field's "Where to find?" link is clicked. */
  onHelpClick?: (fieldId: string) => void;
  /** Saves `values` (Update, or Connect when not connected yet). */
  onSubmit?: () => void;
  submitting?: boolean;
  /** Extra rows (`.lc-is__row`) shown in the table after the fields, e.g. a partner's permissions. */
  children?: ReactNode;
  /** Whether the extra rows in `children` have unsaved edits; shows Update like an edited field does. */
  changed?: boolean;
  /** Whether the integration is switched on. Pair with `onActiveChange` to show the Active switch. */
  active?: boolean;
  /** Shows an Active switch; while it's off the fields are disabled. The submit button then always reads "Update". */
  onActiveChange?: (active: boolean) => void;
}

export function IntegrationSettings({
  partnerName,
  status: savedStatus,
  fields,
  values,
  savedValues,
  onChange,
  onHelpClick,
  onSubmit,
  submitting,
  children,
  changed,
  active,
  onActiveChange,
}: IntegrationSettingsProps) {
  const idPrefix = useId();
  const dirty = !!changed || fields.some((f) => (values[f.id] ?? '') !== (savedValues[f.id] ?? ''));
  // Switched off: the whole fields section is read-only until it's turned back on.
  const locked = onActiveChange !== undefined && !active;
  // Switched off reads as not connected, whatever the saved state.
  const status: IntegrationStatus = submitting ? 'verifying' : locked ? 'not-connected' : savedStatus;
  const complete = fields.every((f) => values[f.id]?.trim());
  return (
    <div className="lc-is">
      <div className="lc-is__status" data-status={status}>
        <span className="lc-is__status-pill" role="status">
          <span className="lc-is__status-dot" aria-hidden="true" />
          {STATUS_LABEL[status]} <span className="lc-is__status-target">to {partnerName}</span>
        </span>
        <div className="lc-is__actions">
          {onActiveChange && (
            <button
              type="button"
              role="switch"
              aria-checked={!!active}
              aria-label="Active"
              className="lc-is__switch"
              disabled={submitting}
              onClick={() => onActiveChange(!active)}
            >
              <span className="lc-is__switch-thumb" aria-hidden="true" />
            </button>
          )}
          {dirty && (
            <Button variant="filled" color="primary" size="sm" disabled={!complete || submitting} onClick={onSubmit}>
              {savedStatus === 'not-connected' && !onActiveChange ? 'Connect' : 'Update'}
            </Button>
          )}
        </div>
      </div>

      <div className="lc-is__table" data-disabled={locked || undefined}>
        {fields.map((field) => {
          const id = `${idPrefix}-${field.id}`;
          return (
            <div key={field.id} className="lc-is__row">
              <div className="lc-is__row-label">
                <div className="lc-is__label-line">
                  <label className="lc-is__label" htmlFor={id}>
                    <span className="lc-is__required" aria-hidden="true">•</span>
                    {field.label}
                  </label>
                  {field.help && (
                    <button
                      type="button"
                      className="lc-is__help"
                      disabled={locked}
                      aria-label={`Where to find the ${field.label}?`}
                      onClick={() => onHelpClick?.(field.id)}
                    >
                      Where to find?
                    </button>
                  )}
                </div>
                {field.description && (
                  <p id={`${id}-desc`} className="lc-is__row-desc">
                    {field.description}
                  </p>
                )}
              </div>
              <input
                id={id}
                aria-describedby={field.description ? `${id}-desc` : undefined}
                className="lc-is__input"
                type={field.type ?? 'text'}
                required
                disabled={locked}
                autoComplete="off"
                placeholder={field.placeholder}
                value={values[field.id] ?? ''}
                onChange={(e) => onChange(field.id, e.currentTarget.value)}
              />
            </div>
          );
        })}
        {children}
      </div>
    </div>
  );
}

export default IntegrationSettings;
