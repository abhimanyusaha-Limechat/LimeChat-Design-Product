/**
 * BotCsatSettings — Settings → Bot CSAT, HelpDesk product.
 *
 *   <BotCsatSettings
 *     enabled={csatEnabled}
 *     onEnabledChange={setCsatEnabled}
 *     flows={csatFlows}
 *     onFlowChange={(key, next) => ...}
 *     ratingScale={csatRatingScale}
 *     onRatingScaleChange={setCsatRatingScale}
 *     csatDelay={csatDelay}
 *     onCsatDelayChange={(field, value) => ...}
 *     reminderDelay={csatReminderDelay}
 *     onReminderDelayChange={(field, value) => ...}
 *   />
 */
import { Tooltip } from '../Tooltip';
import { CheckIcon as SharedCheckIcon } from '../icons';
import './BotCsatSettings.css';

function StarIcon() {
  return (
    <svg
      className="lc-csat__header-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 17.75l-6.16 3.24l1.18 -6.88l-5 -4.87l6.91 -1l3.09 -6.26l3.09 6.26l6.91 1l-5 4.87l1.18 6.88z" />
    </svg>
  );
}

function CheckIcon() {
  return <SharedCheckIcon strokeWidth={3} />;
}

function InfoIcon() {
  return (
    <svg
      className="lc-csat__info-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function SwitchTrack({ checked }: { checked: boolean }) {
  return (
    <span className="lc-csat__switch-track" data-checked={checked} aria-hidden="true">
      <span className="lc-csat__switch-thumb" />
    </span>
  );
}

export type CsatFlowKey =
  | 'showProducts'
  | 'faq'
  | 'gptProductSearch'
  | 'myCaptain'
  | 'voucher'
  | 'cancelOrder'
  | 'trackOrder'
  | 'gptQna'
  | 'returnOrder'
  | 'addressChange'
  | 'returnRefund'
  | 'checkout'
  | 'gptAgenticQna'
  | 'exchangeOrder';

const FLOW_ORDER: CsatFlowKey[] = [
  'showProducts',
  'faq',
  'gptProductSearch',
  'myCaptain',
  'voucher',
  'cancelOrder',
  'trackOrder',
  'gptQna',
  'returnOrder',
  'addressChange',
  'returnRefund',
  'checkout',
  'gptAgenticQna',
  'exchangeOrder',
];

const FLOW_LABEL: Record<CsatFlowKey, string> = {
  showProducts: 'Show products',
  faq: 'Faq',
  gptProductSearch: 'Gpt product search',
  myCaptain: 'Mycaptain',
  voucher: 'Voucher',
  cancelOrder: 'Cancel order',
  trackOrder: 'Track order',
  gptQna: 'Gpt qna',
  returnOrder: 'Return order',
  addressChange: 'Address change',
  returnRefund: 'Return refund',
  checkout: 'Checkout',
  gptAgenticQna: 'Gpt agentic qna',
  exchangeOrder: 'Exchange order',
};

export type CsatRatingScale = '3' | '5';

export interface CsatTimeDelay {
  hours: number;
  minutes: number;
  seconds: number;
}

export type CsatTimeDelayField = keyof CsatTimeDelay;

export interface BotCsatSettingsProps {
  enabled: boolean;
  onEnabledChange: (next: boolean) => void;
  flows: Record<CsatFlowKey, boolean>;
  onFlowChange: (key: CsatFlowKey, next: boolean) => void;
  ratingScale: CsatRatingScale;
  onRatingScaleChange: (next: CsatRatingScale) => void;
  csatDelay: CsatTimeDelay;
  onCsatDelayChange: (field: CsatTimeDelayField, value: number) => void;
  reminderDelay: CsatTimeDelay;
  onReminderDelayChange: (field: CsatTimeDelayField, value: number) => void;
}

function clampDelay(value: number) {
  if (Number.isNaN(value) || value < 0) return 0;
  return value;
}

function TimeDelayFields({
  value,
  disabled,
  onChange,
}: {
  value: CsatTimeDelay;
  disabled: boolean;
  onChange: (field: CsatTimeDelayField, value: number) => void;
}) {
  return (
    <div className="lc-csat__delay-fields">
      {(['hours', 'minutes', 'seconds'] as CsatTimeDelayField[]).map((field) => (
        <label key={field} className="lc-csat__field">
          <span className="lc-csat__field-label">{field[0].toUpperCase() + field.slice(1)}</span>
          <input
            type="number"
            min={0}
            className="lc-csat__field-input"
            value={value[field]}
            disabled={disabled}
            onChange={(e) => onChange(field, clampDelay(e.currentTarget.valueAsNumber))}
          />
        </label>
      ))}
    </div>
  );
}

export function BotCsatSettings({
  enabled,
  onEnabledChange,
  flows,
  onFlowChange,
  ratingScale,
  onRatingScaleChange,
  csatDelay,
  onCsatDelayChange,
  reminderDelay,
  onReminderDelayChange,
}: BotCsatSettingsProps) {
  return (
    <div className="lc-csat" data-disabled={!enabled}>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        className="lc-csat__header-row"
        onClick={() => onEnabledChange(!enabled)}
      >
        <StarIcon />
        <span className="lc-csat__header-copy">
          <span className="lc-csat__header-label">Bot CSAT</span>
          <span className="lc-csat__header-desc">
            Automatically send a satisfaction survey when the bot resolves a ticket
          </span>
        </span>
        <SwitchTrack checked={enabled} />
      </button>

      <div className="lc-csat__body">
        <div className="lc-csat__row">
          <div className="lc-csat__row-label-col">
            <span className="lc-csat__row-label">Enable CSAT on available flows</span>
            <p className="lc-csat__row-desc">Choose which bot flows can trigger the CSAT survey once resolved.</p>
          </div>
          <div className="lc-csat__flow-grid">
            {FLOW_ORDER.map((key) => (
              <label key={key} className="lc-csat__checkbox">
                <input
                  type="checkbox"
                  checked={flows[key]}
                  disabled={!enabled}
                  onChange={(e) => onFlowChange(key, e.currentTarget.checked)}
                />
                <span className="lc-csat__checkbox-box" data-checked={flows[key]}>
                  {flows[key] && <CheckIcon />}
                </span>
                <span className="lc-csat__checkbox-label">{FLOW_LABEL[key]}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="lc-csat__row">
          <div className="lc-csat__row-label-col">
            <span className="lc-csat__row-label">
              Rating Scale
              <Tooltip label="Choose whether customers rate their experience out of 3 stars or 5 stars.">
                <span className="lc-csat__info-trigger" tabIndex={0} role="button" aria-label="About Rating Scale">
                  <InfoIcon />
                </span>
              </Tooltip>
            </span>
            <p className="lc-csat__row-desc">The scale customers use to rate their experience.</p>
          </div>
          <div className="lc-csat__radio-group" role="radiogroup" aria-label="Rating scale">
            {(['3', '5'] as CsatRatingScale[]).map((scale) => (
              <label key={scale} className="lc-csat__radio">
                <input
                  type="radio"
                  name="lc-csat-rating-scale"
                  checked={ratingScale === scale}
                  disabled={!enabled}
                  onChange={() => onRatingScaleChange(scale)}
                />
                <span className="lc-csat__radio-dot" data-checked={ratingScale === scale} />
                <span className="lc-csat__radio-label">{scale} star</span>
              </label>
            ))}
          </div>
        </div>

        <div className="lc-csat__row">
          <div className="lc-csat__row-label-col">
            <span className="lc-csat__row-label">
              CSAT Time Delay
              <Tooltip label="How long the bot waits after resolving a ticket before sending the CSAT survey.">
                <span className="lc-csat__info-trigger" tabIndex={0} role="button" aria-label="About CSAT Time Delay">
                  <InfoIcon />
                </span>
              </Tooltip>
            </span>
            <p className="lc-csat__row-desc">How long to wait after resolution before sending the survey.</p>
          </div>
          <TimeDelayFields value={csatDelay} disabled={!enabled} onChange={onCsatDelayChange} />
        </div>

        <div className="lc-csat__row">
          <div className="lc-csat__row-label-col">
            <span className="lc-csat__row-label">
              CSAT Reminder Time Delay
              <Tooltip label="How long the bot waits before sending a reminder if the customer hasn't responded to the CSAT survey.">
                <span
                  className="lc-csat__info-trigger"
                  tabIndex={0}
                  role="button"
                  aria-label="About CSAT Reminder Time Delay"
                >
                  <InfoIcon />
                </span>
              </Tooltip>
            </span>
            <p className="lc-csat__row-desc">How long to wait before nudging an unresponsive customer.</p>
          </div>
          <TimeDelayFields value={reminderDelay} disabled={!enabled} onChange={onReminderDelayChange} />
        </div>
      </div>
    </div>
  );
}

export default BotCsatSettings;
