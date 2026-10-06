/**
 * BotTemplatesTable — Automation → Settings → Bot templates: search + type/
 * industry/account filters and a table of templates (Name, Type, Usecases,
 * Industries, Scope, row actions). Same anatomy as InboxesTable, scoped to "lc-bt".
 */
import { type CSSProperties, type ReactNode } from 'react';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import { NativeSelect } from '../Select';
import { ActionMenu } from '../Menu';
import { Tooltip } from '../Tooltip';
import { InboxIcon, type InboxType } from '../InboxesTable';
import { TemplateIcon } from '../TemplatesHomePage';
import { DataTable, DataTableEmpty, DataTableHead, DataTableRow } from '../DataTable';
import './BotTemplatesTable.css';

export type BotTemplateType = 'task' | 'flow';
export type BotTemplateScope = 'global' | 'account';

export interface BotTemplateRow {
  id: string;
  name: string;
  description: string;
  type: BotTemplateType;
  usecases: string[];
  industries: string[];
  scope: BotTemplateScope;
  /** Files only — tints the subtitle (status line): red for failed, amber for partial. */
  status?: 'failed' | 'partial';
  /** Custom fields — data type, e.g. "Text", "Date". Shown in the Type column. */
  kind?: string;
  /** Canned responses — shows a leading "T" (text) or photo (image) badge before the name. */
  mediaType?: 'text' | 'image';
  /** Rules only — whether the rule is switched on. */
  enabled?: boolean;
  /** Agents only — inboxes the agent belongs to, shown as channel icons with the inbox name in a tooltip. */
  inboxes?: { name: string; type: InboxType }[];
  /** Industries only — any mix of "Agent", "Task", "Flows". Shown as text in the Scope column. */
  scopes?: string[];
  /** Variables only — e.g. "Text", "Number". Shown in the Data type column. */
  dataType?: string;
  /** Collaborators only — e.g. "Admin", "Editor". Shown in the Role column. */
  role?: string;
  /** Files only — file type, e.g. "PDF". Shown as a chip in the Format column. */
  format?: string;
}

const TYPE_LABEL: Record<BotTemplateType, string> = { task: 'Task', flow: 'Flow' };
/** Avatar sets its initials size from the avatar size (42%); pin it to 12px. */
const AVATAR_STYLE = { '--lc-avatar-font': '12px' } as CSSProperties;

const initials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const ROLE_CAPTION: Record<string, string> = {
  Admin: 'Full access',
  Editor: 'Can edit bots',
  Viewer: 'Read-only access',
};
const SCOPE_LABEL: Record<BotTemplateScope, string> = { global: 'Global', account: 'Account-scoped' };
/** Chips visible per cell before collapsing the rest into "+N". */
const MAX_CHIPS = 2;

function Chips({ items, light }: { items: string[]; light?: boolean }) {
  if (items.length === 0) return <span className="lc-bt__dash">—</span>;
  const extra = items.length - MAX_CHIPS;
  return (
    <div className="lc-bt__chips" data-light={light || undefined}>
      {items.slice(0, MAX_CHIPS).map((item) => (
        <span key={item} className="lc-bt__chip" title={item}>
          {item}
        </span>
      ))}
      {extra > 0 && (
        <span className="lc-bt__chip lc-bt__chip--more" title={items.slice(MAX_CHIPS).join(', ')}>
          +{extra}
        </span>
      )}
    </div>
  );
}

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

const EditIcon = () => (
  <svg {...iconProps}>
    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
    <path d="M13.5 6.5l4 4" />
  </svg>
);

const TrashIcon = () => (
  <svg {...iconProps}>
    <path d="M4 7h16" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
  </svg>
);

const DotsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

interface Column {
  /** Suffix of the `lc-bt__cell--*` width class. */
  key: string;
  header: string;
  cell: (row: BotTemplateRow) => ReactNode;
}

/** On/off switch for a rule / custom field — sits left of Edit in the row actions. */
function RuleSwitch({ row, onToggle }: { row: BotTemplateRow; onToggle?: (row: BotTemplateRow) => void }) {
  return (
    <Tooltip label={row.enabled ? 'Turn off rule' : 'Turn on rule'}>
      <button
        type="button"
        role="switch"
        aria-checked={!!row.enabled}
        aria-label={`${row.enabled ? 'Turn off' : 'Turn on'} ${row.name}`}
        className="lc-bt__toggle"
        data-checked={row.enabled || undefined}
        onClick={() => onToggle?.(row)}
      >
        <span className="lc-bt__toggle-thumb" aria-hidden="true" />
      </button>
    </Tooltip>
  );
}

const dash = (value?: string | number) => value ?? '—';

type NameOptions = { avatar?: boolean; desc?: boolean; onViewDetails?: (row: BotTemplateRow) => void };

const nameColumn = (header = 'Name', { avatar = false, desc = true, onViewDetails }: NameOptions = {}): Column => ({
  key: 'name',
  header,
  cell: (row) => (
    <>
      {avatar && (
        <Avatar size={36} radius="xl" alt={row.name} className="lc-bt__avatar" style={AVATAR_STYLE}>
          {initials(row.name)}
        </Avatar>
      )}
      {row.mediaType && (
        <span className="lc-bt__type-badge" title={row.mediaType === 'text' ? 'Text' : 'Image'}>
          {row.mediaType === 'text' ? 'T' : <TemplateIcon name="photo" />}
        </span>
      )}
      <div className="lc-bt__name-block">
        <span className="lc-bt__name">{row.name}</span>
        {desc && (
          <span className="lc-bt__desc-row">
            <span className="lc-bt__desc" data-status={row.status}>{row.description}</span>
            {row.status && onViewDetails && (
              <button type="button" className="lc-bt__link" onClick={() => onViewDetails(row)}>
                View details
              </button>
            )}
          </span>
        )}
      </div>
    </>
  ),
});

const COLUMNS = {
  type: {
    key: 'type',
    header: 'Type',
    cell: (row) => <span className="lc-bt__type-label">{TYPE_LABEL[row.type]}</span>,
  },
  role: {
    key: 'type',
    header: 'Role',
    cell: (row) => (
      <div className="lc-bt__role">
        <div className="lc-bt__type-block">
          <span className="lc-bt__type-label">{dash(row.role)}</span>
          {row.role && ROLE_CAPTION[row.role] && (
            <span className="lc-bt__type-caption">{ROLE_CAPTION[row.role]}</span>
          )}
        </div>
      </div>
    ),
  },
  usecases: { key: 'usecases', header: 'Usecases', cell: (row) => <Chips items={row.usecases} /> },
  industries: { key: 'industries', header: 'Industries', cell: (row) => <Chips items={row.industries} /> },
  scope: {
    key: 'scope',
    header: 'Scope',
    cell: (row) => <span className="lc-bt__scope" data-scope={row.scope}>{SCOPE_LABEL[row.scope]}</span>,
  },
  scopes: { key: 'scope', header: 'Scope', cell: (row) => <Chips items={row.scopes ?? []} light /> },
  dataType: { key: 'scope', header: 'Data type', cell: (row) => dash(row.dataType) },
  frequency: { key: 'scope', header: 'Frequency', cell: (row) => dash(row.dataType) },
  size: { key: 'scope', header: 'Size', cell: (row) => dash(row.dataType) },
  domain: {
    key: 'format',
    header: 'Domain',
    cell: (row) => <span className="lc-bt__domain" title={row.format}>{dash(row.format)}</span>,
  },
  format: { key: 'format', header: 'Format', cell: (row) => <Chips items={row.format ? [row.format] : []} /> },
  inboxes: { key: 'inboxes', header: 'Inboxes', cell: (row) => (
      <div className="lc-bt__inbox-icons">
        {row.inboxes?.map((inbox) => (
          <Tooltip key={inbox.name} label={inbox.name}>
            <span className="lc-bt__inbox-icon" role="img" aria-label={`${inbox.type}: ${inbox.name}`}>
              <InboxIcon name={inbox.type} />
            </span>
          </Tooltip>
        )) ?? dash()}
      </div>
    ),
  },
  kind: { key: 'type', header: 'Type', cell: (row) => dash(row.kind) },
  industryText: { key: 'industries', header: 'Industry', cell: (row) => row.industries.join(', ') || '—' },
  useCaseCount: { key: 'industries', header: 'Use cases', cell: (row) => row.usecases.length },
} satisfies Record<string, Column>;

const TABLE_LABEL: Record<NonNullable<BotTemplatesTableProps['variant']>, string> = {
  templates: 'Templates',
  variables: 'Variables',
  collaborators: 'Collaborators',
  files: 'Files',
  industries: 'Industries',
  agents: 'Agents',
  teams: 'Teams',
  rules: 'Rules',
  fields: 'Custom fields',
};

const columnsFor = (
  variant: NonNullable<BotTemplatesTableProps['variant']>,
  showUseCases: boolean,
  webSource: 'url' | 'domain' | undefined,
  onViewDetails?: (row: BotTemplateRow) => void,
): Column[] => {
  switch (variant) {
    case 'variables':
      return [nameColumn('Variable name'), COLUMNS.dataType];
    case 'files': {
      const name = nameColumn('Name', { onViewDetails });
      if (webSource === 'url') return [name, COLUMNS.domain, COLUMNS.frequency];
      if (webSource === 'domain') return [name, COLUMNS.frequency];
      return [name, COLUMNS.format, COLUMNS.size];
    }
    case 'agents':
      return [nameColumn('Name', { avatar: true }), COLUMNS.role, COLUMNS.inboxes];
    case 'teams':
      return [nameColumn()];
    case 'rules':
      return [nameColumn()];
    case 'fields':
      return [nameColumn(), COLUMNS.kind, COLUMNS.inboxes];
    case 'collaborators':
      return [nameColumn('Name', { avatar: true }), COLUMNS.role];
    case 'industries':
      return [nameColumn('Name', { desc: false }), COLUMNS.scopes, showUseCases ? COLUMNS.useCaseCount : COLUMNS.industryText];
    default:
      return [nameColumn(), COLUMNS.type, COLUMNS.usecases, COLUMNS.industries, COLUMNS.scope];
  }
};

export interface BotTemplatesTableProps {
  searchPlaceholder?: string;
  /** Renders an "Invite" button next to the search box. */
  onInvite?: () => void;
  /** Hides the whole filter group (label + dropdowns) on the right of the toolbar. */
  hideFilters?: boolean;
  /** Hides the search box. */
  hideSearch?: boolean;
  /** Replaces the row's ⋯ menu with inline Edit / Delete icon buttons (always on for collaborators / agents). */
  iconActions?: boolean;
  /** Industries variant — the last column shows the use-case count instead of industries. */
  showUseCases?: boolean;
  /** Files only — web sources: "url" shows Name / Domain / Frequency, "domain" shows Name / Frequency. */
  webSource?: 'url' | 'domain';
  /** Dropdowns shown after the search box (e.g. Role / Inbox). */
  selects?: { ariaLabel: string; options: { value: string; label: string }[]; value: string; onChange: (value: string) => void }[];
  /** Single-select chip filter shown beside the tabs. */
  chipFilter?: { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void };
  /** "variables" relabels Name → "Variable name" ("files" → "Name", value column "Size", no search chevron) and drops the Type / Usecases / Industries columns and their filters. */
  variant?: 'templates' | 'variables' | 'collaborators' | 'files' | 'industries' | 'agents' | 'teams' | 'rules' | 'fields';
  /** Optional segmented control rendered left of the search (e.g. System / Bot / Flows). */
  tabs?: { id: string; label: string }[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  templates: BotTemplateRow[];
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  typeFilter?: string;
  onTypeFilterChange?: (value: string) => void;
  industryFilter?: string;
  onIndustryFilterChange?: (value: string) => void;
  industries?: string[];
  onAccountFilterClick?: () => void;
  /** Variables only — replaces the Account button with a Data type dropdown. */
  dataTypes?: string[];
  dataTypeFilter?: string;
  onDataTypeFilterChange?: (value: string) => void;
  /** Files only — shows a "View details" link on failed / partial rows. */
  onViewDetails?: (row: BotTemplateRow) => void;
  /** Rules only — flips a row's on/off switch. */
  onToggleRow?: (row: BotTemplateRow) => void;
  onRowEdit?: (row: BotTemplateRow) => void;
  onRowClone?: (row: BotTemplateRow) => void;
  onRowDelete?: (row: BotTemplateRow) => void;
}

export function BotTemplatesTable({
  searchPlaceholder = 'Search templates…',
  onInvite,
  hideFilters = false,
  hideSearch = false,
  iconActions = false,
  showUseCases = false,
  webSource,
  chipFilter,
  selects,
  variant = 'templates',
  tabs,
  activeTab,
  onTabChange,
  templates,
  searchValue,
  onSearchChange,
  typeFilter = 'all',
  onTypeFilterChange,
  industryFilter = 'all',
  onIndustryFilterChange,
  industries = [],
  onAccountFilterClick,
  dataTypes = [],
  dataTypeFilter = 'all',
  onDataTypeFilterChange,
  onViewDetails,
  onToggleRow,
  onRowEdit,
  onRowClone,
  onRowDelete,
}: BotTemplatesTableProps) {
  const isFiles = variant === 'files';
  const isVariables = variant === 'variables' || isFiles;
  const isCollaborators = variant === 'collaborators' || variant === 'agents' || variant === 'teams' || variant === 'rules' || variant === 'fields';
  const showIconActions = isCollaborators || iconActions;
  const columns = columnsFor(variant, showUseCases, webSource, onViewDetails);

  return (
    <div className="lc-bt" data-variant={variant} data-icon-actions={showIconActions || undefined}>
      <div className="lc-bt__toolbar">
        <div className="lc-bt__lead">
          {tabs && (
            <div className="lc-bt__tabs" role="tablist" data-count={tabs.length}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={tab.id === activeTab}
                  className="lc-bt__tab"
                  data-active={tab.id === activeTab || undefined}
                  onClick={() => onTabChange?.(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
          {chipFilter && (
            <div className="lc-bt__chip-filter" role="group" aria-label="Filter by category">
              {chipFilter.options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className="lc-bt__filter-chip"
                  aria-pressed={o.id === chipFilter.value}
                  onClick={() => chipFilter.onChange(o.id)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
          {!hideSearch && (
          <div className="lc-bt__search">
            <InboxIcon name="search" className="lc-bt__search-icon" />
            <input
              className="lc-bt__search-input"
              type="text"
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.currentTarget.value)}
            />
            {!isFiles && variant !== 'agents' && variant !== 'teams' && <InboxIcon name="chevron-down" className="lc-bt__search-chevron" />}
          </div>
          )}
          {onInvite && <Button onClick={onInvite}>Invite</Button>}
          {selects && (
            <div className="lc-bt__selects">
              {selects.map((sel) => (
                <NativeSelect
                  key={sel.ariaLabel}
                  size="sm"
                  aria-label={sel.ariaLabel}
                  data={sel.options}
                  value={sel.value}
                  onChange={(e) => sel.onChange(e.currentTarget.value)}
                />
              ))}
            </div>
          )}
        </div>
        {!hideFilters && (
          <div className="lc-bt__filters">
            <span className="lc-bt__filters-label">Filter by</span>
            {!isVariables && (
              <>
            <NativeSelect
              size="sm"
              aria-label="Filter by type"
              data={[
                { value: 'all', label: 'Type' },
                { value: 'task', label: 'Task' },
                { value: 'flow', label: 'Flow' },
              ]}
              value={typeFilter}
              onChange={(e) => onTypeFilterChange?.(e.currentTarget.value)}
            />
            <NativeSelect
              size="sm"
              aria-label="Filter by industry"
              data={[{ value: 'all', label: 'Industry' }, ...industries]}
              value={industryFilter}
              onChange={(e) => onIndustryFilterChange?.(e.currentTarget.value)}
            />
              </>
            )}
            {isVariables ? (
              <NativeSelect
                size="sm"
                aria-label="Filter by data type"
                data={[{ value: 'all', label: 'Data type' }, ...dataTypes]}
                value={dataTypeFilter}
                onChange={(e) => onDataTypeFilterChange?.(e.currentTarget.value)}
              />
            ) : (
              <button type="button" className="lc-bt__account-btn" onClick={onAccountFilterClick}>
                Account
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 4h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v7l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227z" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      <DataTable aria-label={TABLE_LABEL[variant]}>
        <DataTableHead className="lc-bt__row--head">
          {columns.map((col) => (
            <div key={col.header} role="columnheader" className={`lc-bt__cell lc-bt__cell--${col.key}`}>{col.header}</div>
          ))}
          <div role="columnheader" className="lc-bt__cell lc-bt__cell--actions" aria-label="Actions" />
        </DataTableHead>

        {templates.length === 0 ? (
          <DataTableEmpty>No {TABLE_LABEL[variant].toLowerCase()} found</DataTableEmpty>
        ) : (
          templates.map((row) => (
            <DataTableRow key={row.id} className="lc-bt__row--body">
              {columns.map((col) => (
                <div key={col.header} role="cell" className={`lc-bt__cell lc-bt__cell--${col.key}`}>{col.cell(row)}</div>
              ))}
              <div role="cell" className="lc-bt__cell lc-bt__cell--actions">
                {showIconActions ? (
                  <>
                    {(variant === 'rules' || variant === 'fields') && <RuleSwitch row={row} onToggle={onToggleRow} />}
                    <Tooltip label="Edit">
                      <button type="button" className="lc-bt__icon-btn" aria-label={`Edit ${row.name}`} onClick={() => onRowEdit?.(row)}>
                        <EditIcon />
                      </button>
                    </Tooltip>
                    <Tooltip label="Delete">
                      <button type="button" className="lc-bt__icon-btn lc-bt__icon-btn--danger" aria-label={`Delete ${row.name}`} onClick={() => onRowDelete?.(row)}>
                        <TrashIcon />
                      </button>
                    </Tooltip>
                  </>
                ) : (
                  <ActionMenu
                    ariaLabel="Template actions"
                    icon={<DotsIcon />}
                    items={[
                      { label: 'Edit', onClick: () => onRowEdit?.(row) },
                      { label: 'Clone', onClick: () => onRowClone?.(row) },
                      { label: 'Delete', danger: true, onClick: () => onRowDelete?.(row) },
                    ]}
                  />
                )}
              </div>
            </DataTableRow>
          ))
        )}
      </DataTable>
    </div>
  );
}

export default BotTemplatesTable;
