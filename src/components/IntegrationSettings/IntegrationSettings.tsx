/**
 * IntegrationSettings — Settings → Integration → one partner (e.g. Freshdesk):
 * a status header (connection state, a refresh icon that re-checks the saved
 * details, and — only once a field is edited — an Update/Connect button) above
 * the partner's connection fields, each optionally with a "Where to find?" link.
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
 *     onRefresh={() => ...}
 *   />
 */
import { useId } from 'react';
import { Button } from '../Button';
import { Icon } from '../icons';
import { Tooltip } from '../Tooltip';
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
  /** Re-checks the saved details. Hidden while not connected — there is nothing to refresh. */
  onRefresh?: () => void;
  submitting?: boolean;
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
  onRefresh,
  submitting,
}: IntegrationSettingsProps) {
  const idPrefix = useId();
  const status: IntegrationStatus = submitting ? 'verifying' : savedStatus;
  const dirty = fields.some((f) => (values[f.id] ?? '') !== (savedValues[f.id] ?? ''));
  const complete = fields.every((f) => values[f.id]?.trim());
  return (
    <div className="lc-is">
      <div className="lc-is__status" data-status={status}>
        <span className="lc-is__status-pill" role="status">
          <span className="lc-is__status-dot" aria-hidden="true" />
          {STATUS_LABEL[status]} <span className="lc-is__status-target">to {partnerName}</span>
        </span>
        <div className="lc-is__actions">
          {savedStatus !== 'not-connected' && (
            <Tooltip label="Refresh connection" position="bottom">
              <button
                type="button"
                className="lc-is__action"
                aria-label="Refresh connection"
                aria-busy={submitting || undefined}
                disabled={submitting}
                onClick={onRefresh}
              >
                <Icon name="refresh" width={18} height={18} />
              </button>
            </Tooltip>
          )}
          {dirty && (
            <Button variant="filled" color="primary" size="sm" disabled={!complete || submitting} onClick={onSubmit}>
              {savedStatus === 'not-connected' ? 'Connect' : 'Update'}
            </Button>
          )}
        </div>
      </div>

      <div className="lc-is__table">
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
                autoComplete="off"
                placeholder={field.placeholder}
                value={values[field.id] ?? ''}
                onChange={(e) => onChange(field.id, e.currentTarget.value)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default IntegrationSettings;
