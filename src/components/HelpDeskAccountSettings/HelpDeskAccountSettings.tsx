/**
 * HelpDeskAccountSettings — Settings → Account, HelpDesk product.
 *
 * Same design language as `AccountSettings`/`ProfileSettings` (two-column
 * rows, no boxed sections, divider strokes) — built from a rough reference
 * (bordered grey fields, pill toggles, a multi-select chip control)
 * translated into that established pattern instead of copied pixel-for-pixel.
 *
 *   <HelpDeskAccountSettings
 *     companyName={companyName}
 *     onCompanyNameChange={setCompanyName}
 *     websiteUrl={websiteUrl}
 *     onWebsiteUrlChange={setWebsiteUrl}
 *     currency={currency}
 *     onCurrencyChange={setCurrency}
 *     siteLanguageOptions={['English (En)']}
 *     siteLanguage={siteLanguage}
 *     onSiteLanguageChange={setSiteLanguage}
 *     toggles={toggles}
 *     onToggleChange={(key, next) => ...}
 *     supportedFileTypesSummary="PDF Documents +5"
 *     onConfigureFileTypes={() => ...}
 *   />
 */
import { useId, type ReactNode } from 'react';
import './HelpDeskAccountSettings.css';

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9l6 6l6 -6" />
  </svg>
);

/** One label(+description) | control settings row. */
function Row({
  label,
  description,
  htmlFor,
  required,
  first,
  last,
  children,
}: {
  label: string;
  description?: string;
  htmlFor?: string;
  /** Red dot after the label — matches the reference's required-field marker. */
  required?: boolean;
  /** No top divider/padding — this is the first row in its section. */
  first?: boolean;
  /** Bottom divider closing out the section, mirroring the top one. */
  last?: boolean;
  children: ReactNode;
}) {
  const cls = ['lc-hda__row', first && 'lc-hda__row--first', last && 'lc-hda__row--last']
    .filter(Boolean)
    .join(' ');
  return (
    <div className={cls}>
      <div className="lc-hda__row-label">
        {htmlFor ? (
          <label className="lc-hda__label" htmlFor={htmlFor}>
            {required && <span className="lc-hda__required">•</span>}
            {label}
          </label>
        ) : (
          <span className="lc-hda__label">
            {required && <span className="lc-hda__required">•</span>}
            {label}
          </span>
        )}
        {description && <p className="lc-hda__row-desc">{description}</p>}
      </div>
      <div className="lc-hda__row-control">{children}</div>
    </div>
  );
}

/** Full-width label-left / switch-right row, matching the reference's toggle list. */
function ToggleRow({
  label,
  checked,
  onChange,
  first,
  last,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  first?: boolean;
  last?: boolean;
}) {
  const id = useId();
  const cls = ['lc-hda__toggle-row', first && 'lc-hda__row--first', last && 'lc-hda__row--last']
    .filter(Boolean)
    .join(' ');
  return (
    <div className={cls}>
      <label className="lc-hda__toggle-label" htmlFor={id}>
        {label}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        className="lc-hda__switch-track"
        onClick={() => onChange(!checked)}
      >
        <span className="lc-hda__switch-thumb" />
      </button>
    </div>
  );
}

export type HelpDeskToggleKey =
  | 'hideAllTicketsAgents'
  | 'hideQueuedTicketsAgents'
  | 'hideAllTicketsSupervisors'
  | 'hideQueuedTicketsSupervisors'
  | 'hideBotTicketsAgents'
  | 'enforceTagging'
  | 'hideOutOfStockShopify'
  | 'applyPiiMasking'
  | 'enableActionCableMonitoring';

const TOGGLE_COPY: Record<HelpDeskToggleKey, string> = {
  hideAllTicketsAgents: 'Hide all tickets tab for agents on this account.',
  hideQueuedTicketsAgents: 'Hide queued tickets tab for agents on this account.',
  hideAllTicketsSupervisors: 'Hide all tickets tab for supervisors on this account.',
  hideQueuedTicketsSupervisors: 'Hide queued tickets tab for supervisors on this account.',
  hideBotTicketsAgents: 'Hide bot tickets for agents on this account.',
  enforceTagging: 'Enforce tagging on tickets resolved by Agents',
  hideOutOfStockShopify: 'Hide Out of Stock products from shopify',
  applyPiiMasking: 'Apply Personal Identity Information (PII) Masking for all users',
  enableActionCableMonitoring: 'Enable ActionCable event monitoring for this account',
};

const TOGGLE_ORDER: HelpDeskToggleKey[] = [
  'hideAllTicketsAgents',
  'hideQueuedTicketsAgents',
  'hideAllTicketsSupervisors',
  'hideQueuedTicketsSupervisors',
  'hideBotTicketsAgents',
  'enforceTagging',
  'hideOutOfStockShopify',
  'applyPiiMasking',
  'enableActionCableMonitoring',
];

export interface HelpDeskAccountSettingsProps {
  companyName: string;
  onCompanyNameChange: (next: string) => void;
  websiteUrl: string;
  onWebsiteUrlChange: (next: string) => void;
  currency: string;
  onCurrencyChange: (next: string) => void;
  siteLanguageOptions: string[];
  siteLanguage: string;
  onSiteLanguageChange: (next: string) => void;

  toggles: Record<HelpDeskToggleKey, boolean>;
  onToggleChange: (key: HelpDeskToggleKey, next: boolean) => void;

  supportedFileTypesSummary: string;
  onConfigureFileTypes?: () => void;
}

export function HelpDeskAccountSettings({
  companyName,
  onCompanyNameChange,
  websiteUrl,
  onWebsiteUrlChange,
  currency,
  onCurrencyChange,
  siteLanguageOptions,
  siteLanguage,
  onSiteLanguageChange,
  toggles,
  onToggleChange,
  supportedFileTypesSummary,
  onConfigureFileTypes,
}: HelpDeskAccountSettingsProps) {
  const companyId = useId();
  const websiteId = useId();
  const currencyId = useId();
  const languageId = useId();

  return (
    <div className="lc-hda">
      <section className="lc-hda__section">
        <div className="lc-hda__field-grid">
          <div className="lc-hda__field">
            <label className="lc-hda__field-label" htmlFor={companyId}>
              <span className="lc-hda__required">•</span>Company name
            </label>
            <input
              id={companyId}
              className="lc-hda__input"
              value={companyName}
              onChange={(e) => onCompanyNameChange(e.currentTarget.value)}
            />
          </div>
          <div className="lc-hda__field">
            <label className="lc-hda__field-label" htmlFor={websiteId}>
              Website url
            </label>
            <input
              id={websiteId}
              className="lc-hda__input"
              placeholder="Your website url"
              value={websiteUrl}
              onChange={(e) => onWebsiteUrlChange(e.currentTarget.value)}
            />
          </div>
        </div>

        <div className="lc-hda__field lc-hda__field--stacked">
          <label className="lc-hda__field-label" htmlFor={currencyId}>
            <span className="lc-hda__required">•</span>Currency
          </label>
          <input
            id={currencyId}
            className="lc-hda__input"
            value={currency}
            onChange={(e) => onCurrencyChange(e.currentTarget.value)}
          />
          <p className="lc-hda__field-caption">The currency your products are sold in</p>
        </div>

        <div className="lc-hda__field lc-hda__field--stacked">
          <label className="lc-hda__field-label" htmlFor={languageId}>
            Site language (Beta)
          </label>
          <div className="lc-hda__select-wrap">
            <select
              id={languageId}
              className="lc-hda__select"
              value={siteLanguage}
              onChange={(e) => onSiteLanguageChange(e.currentTarget.value)}
            >
              {siteLanguageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronIcon />
          </div>
        </div>
      </section>

      <section className="lc-hda__section">
        {TOGGLE_ORDER.map((key, i) => (
          <ToggleRow
            key={key}
            label={TOGGLE_COPY[key]}
            checked={toggles[key]}
            onChange={(next) => onToggleChange(key, next)}
            first={i === 0}
          />
        ))}

        <Row label="Supported file types for attachments" last>
          <button type="button" className="lc-hda__select lc-hda__file-types-btn" onClick={onConfigureFileTypes}>
            <span>{supportedFileTypesSummary}</span>
            <ChevronIcon />
          </button>
          <p className="lc-hda__row-desc">
            Only selected file types will be allowed for conversation attachments. Unsupported
            files will show as &lsquo;Attachment not supported&rsquo;. Leave empty to allow all
            file types.
          </p>
        </Row>
      </section>
    </div>
  );
}

export default HelpDeskAccountSettings;
