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
 *     selectedFileTypes={selectedFileTypes}
 *     onFileTypeToggle={(id, next) => ...}
 *   />
 */
import { useId, useState, type ReactNode } from 'react';
import { ChevronDownIcon as ChevronIcon } from '../icons';
import './HelpDeskAccountSettings.css';

/** One label(+description) | control settings row. */
function Row({
  label,
  description,
  descriptionPosition = 'label',
  htmlFor,
  required,
  first,
  last,
  children,
}: {
  label: string;
  description?: string;
  /** Where the description renders — under the label (default) or under the control, as a caption. */
  descriptionPosition?: 'label' | 'control';
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
        {description && descriptionPosition === 'label' && <p className="lc-hda__row-desc">{description}</p>}
      </div>
      <div className="lc-hda__row-control">
        {children}
        {description && descriptionPosition === 'control' && <p className="lc-hda__row-desc">{description}</p>}
      </div>
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

export interface FileTypeOption {
  id: string;
  label: string;
  /** Nested under the `All …` option whose id this names — indented, and hidden when that group is collapsed. */
  group?: string;
}

const FILE_TYPE_OPTIONS: FileTypeOption[] = [
  { id: 'allDocuments', label: 'All Documents' },
  { id: 'pdfDocuments', label: 'PDF Documents', group: 'allDocuments' },
  { id: 'wordDocuments', label: 'Word Documents', group: 'allDocuments' },
  { id: 'wordDocumentsDocx', label: 'Word Documents (DOCX)', group: 'allDocuments' },
  { id: 'excelSpreadsheets', label: 'Excel Spreadsheets', group: 'allDocuments' },
  { id: 'excelSpreadsheetsXlsx', label: 'Excel Spreadsheets (XLSX)', group: 'allDocuments' },
  { id: 'powerpointPresentations', label: 'PowerPoint Presentations', group: 'allDocuments' },
  { id: 'powerpointPresentationsPptx', label: 'PowerPoint Presentations (PPTX)', group: 'allDocuments' },
  { id: 'textFiles', label: 'Text Files', group: 'allDocuments' },
  { id: 'csvFiles', label: 'CSV Files', group: 'allDocuments' },
  { id: 'jsonFiles', label: 'JSON Files', group: 'allDocuments' },
  { id: 'zipArchives', label: 'ZIP Archives', group: 'allDocuments' },

  { id: 'allImages', label: 'All Images' },
  { id: 'jpegImages', label: 'JPEG Images', group: 'allImages' },
  { id: 'pngImages', label: 'PNG Images', group: 'allImages' },
  { id: 'gifImages', label: 'GIF Images', group: 'allImages' },
  { id: 'webpImages', label: 'WebP Images', group: 'allImages' },
  { id: 'heicImages', label: 'HEIC Images', group: 'allImages' },
  { id: 'heifImages', label: 'HEIF Images', group: 'allImages' },
  { id: 'svgImages', label: 'SVG Images', group: 'allImages' },
  { id: 'tiffImages', label: 'TIFF Images', group: 'allImages' },
  { id: 'bmpImages', label: 'BMP Images', group: 'allImages' },

  { id: 'allVideos', label: 'All Videos' },
  { id: 'mp4Videos', label: 'MP4 Videos', group: 'allVideos' },
  { id: 'threeGppVideos', label: '3GPP Videos', group: 'allVideos' },
  { id: 'movVideos', label: 'MOV Videos', group: 'allVideos' },
  { id: 'aviVideos', label: 'AVI Videos', group: 'allVideos' },
  { id: 'mkvVideos', label: 'MKV Videos', group: 'allVideos' },
  { id: 'webmVideos', label: 'WebM Videos', group: 'allVideos' },

  { id: 'allAudio', label: 'All Audio' },
  { id: 'mp3Audio', label: 'MP3 Audio', group: 'allAudio' },
  { id: 'oggAudio', label: 'OGG Audio', group: 'allAudio' },
  { id: 'wavAudio', label: 'WAV Audio', group: 'allAudio' },
  { id: 'aacAudio', label: 'AAC Audio', group: 'allAudio' },
  { id: 'flacAudio', label: 'FLAC Audio', group: 'allAudio' },
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

  /** Defaults to `FILE_TYPE_OPTIONS` — override only to offer a different set. */
  fileTypeOptions?: FileTypeOption[];
  selectedFileTypes: string[];
  onFileTypeToggle: (id: string, next: boolean) => void;

  /** Company name/website/currency/site language section. Defaults to shown. */
  showCompanyInfo?: boolean;
  /** "Supported file types for attachments" row. Defaults to shown. */
  showFileTypes?: boolean;
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
  fileTypeOptions = FILE_TYPE_OPTIONS,
  selectedFileTypes,
  onFileTypeToggle,
  showCompanyInfo = true,
  showFileTypes = true,
}: HelpDeskAccountSettingsProps) {
  const companyId = useId();
  const websiteId = useId();
  const currencyId = useId();
  const languageId = useId();
  const [collapsedFileTypeGroups, setCollapsedFileTypeGroups] = useState<Set<string>>(new Set());

  return (
    <div className="lc-hda">
      {showCompanyInfo && (
      <section className="lc-hda__section">
        <Row
          label="Company name"
          htmlFor={companyId}
          required
          description="Shown to customers across the helpdesk."
          first
        >
          <input
            id={companyId}
            className="lc-hda__input"
            value={companyName}
            onChange={(e) => onCompanyNameChange(e.currentTarget.value)}
          />
        </Row>

        <Row
          label="Website url"
          htmlFor={websiteId}
          description="Shown on customer-facing pages and invoices."
        >
          <input
            id={websiteId}
            className="lc-hda__input"
            placeholder="Your website url"
            value={websiteUrl}
            onChange={(e) => onWebsiteUrlChange(e.currentTarget.value)}
          />
        </Row>

        <Row
          label="Currency"
          htmlFor={currencyId}
          required
          description="The currency your products are sold in."
        >
          <input
            id={currencyId}
            className="lc-hda__input"
            value={currency}
            onChange={(e) => onCurrencyChange(e.currentTarget.value)}
          />
        </Row>

        <Row
          label="Site language (Beta)"
          htmlFor={languageId}
          description="Sets the default language for agent replies."
          last
        >
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
        </Row>
      </section>
      )}

      <section className="lc-hda__section">
        {TOGGLE_ORDER.map((key, i) => (
          <ToggleRow
            key={key}
            label={TOGGLE_COPY[key]}
            checked={toggles[key]}
            onChange={(next) => onToggleChange(key, next)}
            first={i === 0}
            last={!showFileTypes && i === TOGGLE_ORDER.length - 1}
          />
        ))}

        {showFileTypes && (
        <Row
          label="Supported file types for attachments"
          description="Only selected file types will be allowed for conversation attachments. Unsupported files will show as ‘Attachment not supported’. Leave empty to allow all file types."
          last
        >
          <div className="lc-hda__file-types-list" role="group" aria-label="Supported file types for attachments">
            {fileTypeOptions.map((opt) => {
              if (opt.group && collapsedFileTypeGroups.has(opt.group)) return null;

              const checked = selectedFileTypes.includes(opt.id);
              const children = fileTypeOptions.filter((o) => o.group === opt.id);
              const isGroup = children.length > 0;
              const selectedChildCount = children.filter((c) => selectedFileTypes.includes(c.id)).length;
              const collapsed = collapsedFileTypeGroups.has(opt.id);
              const cls = ['lc-hda__file-type-option', opt.group && 'lc-hda__file-type-option--indent']
                .filter(Boolean)
                .join(' ');
              const rowCls = [
                'lc-hda__file-type-row',
                isGroup && 'lc-hda__file-type-row--group',
                opt.group && 'lc-hda__file-type-row--child',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <div key={opt.id} className={rowCls}>
                  <label className={cls}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = e.currentTarget.checked;
                        onFileTypeToggle(opt.id, next);
                        children.forEach((child) => onFileTypeToggle(child.id, next));
                      }}
                    />
                    {opt.label}
                  </label>
                  {isGroup && (
                    <span className="lc-hda__file-type-badge" data-active={selectedChildCount > 0}>
                      {selectedChildCount}/{children.length} selected
                    </span>
                  )}
                  {isGroup && (
                    <button
                      type="button"
                      className="lc-hda__file-type-collapse"
                      aria-expanded={!collapsed}
                      aria-label={collapsed ? `Expand ${opt.label}` : `Collapse ${opt.label}`}
                      data-collapsed={collapsed}
                      onClick={() =>
                        setCollapsedFileTypeGroups((prev) => {
                          const next = new Set(prev);
                          if (next.has(opt.id)) next.delete(opt.id);
                          else next.add(opt.id);
                          return next;
                        })
                      }
                    >
                      <ChevronIcon />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Row>
        )}
      </section>
    </div>
  );
}

export default HelpDeskAccountSettings;
