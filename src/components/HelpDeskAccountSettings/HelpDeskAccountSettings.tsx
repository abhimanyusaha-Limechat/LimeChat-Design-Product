/**
 * HelpDeskAccountSettings — Settings → Account, HelpDesk product.
 *
 * Same design language as `AccountSettings`/`ProfileSettings`: bordered
 * settings tables of label + description | control rows split by dividers —
 * company info in one table, the toggles and attachment file types in another.
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
import { SettingsSection, Switch } from '../SettingsPage';
import './HelpDeskAccountSettings.css';

/** One label(+description) | control row of a settings table. */
function Row({
  label,
  description,
  htmlFor,
  required,
  children,
}: {
  label: string;
  description?: string;
  htmlFor?: string;
  /** Red dot after the label — matches the reference's required-field marker. */
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="lc-hda__row">
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

/** Table row with the label on the left and a switch at the far right. */
function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="lc-hda__toggle-row">
      <label className="lc-hda__toggle-label" htmlFor={id}>
        {label}
      </label>
      <Switch id={id} checked={checked} onChange={onChange} />
    </div>
  );
}

const ACCOUNT_TOGGLES = [
  { key: 'hideAllTicketsAgents', label: 'Hide all tickets tab for agents on this account.' },
  { key: 'hideQueuedTicketsAgents', label: 'Hide queued tickets tab for agents on this account.' },
  { key: 'hideAllTicketsSupervisors', label: 'Hide all tickets tab for supervisors on this account.' },
  { key: 'hideQueuedTicketsSupervisors', label: 'Hide queued tickets tab for supervisors on this account.' },
  { key: 'hideBotTicketsAgents', label: 'Hide bot tickets for agents on this account.' },
  { key: 'enforceTagging', label: 'Enforce tagging on tickets resolved by Agents' },
  { key: 'hideOutOfStockShopify', label: 'Hide Out of Stock products from shopify' },
  { key: 'applyPiiMasking', label: 'Apply Personal Identity Information (PII) Masking for all users' },
  { key: 'enableActionCableMonitoring', label: 'Enable ActionCable event monitoring for this account' },
] as const;

export type HelpDeskToggleKey = (typeof ACCOUNT_TOGGLES)[number]['key'];

interface ToggleTableProps<K extends string> {
  options: readonly { key: K; label: string }[];
  values: Record<K, boolean>;
  onChange: (key: K, next: boolean) => void;
  /** Extra rows after the switches, inside the same table. */
  children?: ReactNode;
}

/** Bordered table of label | switch rows. */
function ToggleTable<K extends string>({ options, values, onChange, children }: ToggleTableProps<K>) {
  return (
    <section className="lc-hda__table">
      {options.map(({ key, label }) => (
        <ToggleRow key={key} label={label} checked={values[key]} onChange={(next) => onChange(key, next)} />
      ))}
      {children}
    </section>
  );
}

/** A HelpDesk toggle table as its own collapsible section, with an "X/Y enabled" count — e.g. push notifications. */
export function HelpDeskToggleSettings<K extends string>({
  title,
  description,
  ...table
}: { title: string; description: string } & Omit<ToggleTableProps<K>, 'children'>) {
  const enabledCount = table.options.filter(({ key }) => table.values[key]).length;
  return (
    <SettingsSection
      title={title}
      description={description}
      aside={
        <span className="lc-hda__badge" data-active={enabledCount > 0}>
          {enabledCount}/{table.options.length} enabled
        </span>
      }
    >
      <div className="lc-hda">
        <ToggleTable {...table} />
      </div>
    </SettingsSection>
  );
}

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
}: HelpDeskAccountSettingsProps) {
  const companyId = useId();
  const websiteId = useId();
  const currencyId = useId();
  const languageId = useId();
  const [collapsedFileTypeGroups, setCollapsedFileTypeGroups] = useState<Set<string>>(new Set());

  return (
    <div className="lc-hda">
      <section className="lc-hda__table">
        <Row
          label="Company name"
          htmlFor={companyId}
          required
          description="Shown to customers across the helpdesk."
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

      <ToggleTable options={ACCOUNT_TOGGLES} values={toggles} onChange={onToggleChange}>
        <Row
          label="Supported file types for attachments"
          description="Only selected file types will be allowed for conversation attachments. Unsupported files will show as ‘Attachment not supported’. Leave empty to allow all file types."
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
                    <span className="lc-hda__badge" data-active={selectedChildCount > 0}>
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
      </ToggleTable>
    </div>
  );
}

export default HelpDeskAccountSettings;
