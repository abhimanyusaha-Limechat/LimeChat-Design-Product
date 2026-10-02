/**
 * BotTemplatesTable — Automation → Settings → Bot templates: search + type/
 * industry/account filters and a table of templates (Name, Type, Usecases,
 * Industries, Scope, row actions). Same anatomy as InboxesTable, scoped to "lc-bt".
 */
import { useRef, useState, type CSSProperties } from 'react';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import { NativeSelect } from '../Select';
import { ActionMenu } from '../Menu';
import { Tooltip } from '../Tooltip';
import { InboxIcon } from '../InboxesTable';
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
  /** Variables only — e.g. "Text", "Number". Shown in the Data type column. */
  dataType?: string;
  /** Collaborators only — e.g. "Admin", "Editor". Shown in the Role column. */
  role?: string;
  /** Files only — file type, e.g. "PDF". Shown as a chip in the Format column. */
  format?: string;
}

const TYPE_LABEL: Record<BotTemplateType, string> = { task: 'Task', flow: 'Flow' };
const TYPE_CAPTION: Record<BotTemplateType, string> = { task: 'Single action', flow: 'Multi-step conversation' };
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

function Chips({ items }: { items: string[] }) {
  if (items.length === 0) return <span className="lc-bt__dash">—</span>;
  const extra = items.length - MAX_CHIPS;
  return (
    <div className="lc-bt__chips">
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

export interface BotTemplatesTableProps {
  searchPlaceholder?: string;
  /** Renders an "Invite" button next to the search box. */
  onInvite?: () => void;
  /** Hides the whole filter group (label + dropdowns) on the right of the toolbar. */
  hideFilters?: boolean;
  /** "variables" relabels Name → "Variable name" ("files" → "Name", value column "Size", no search chevron) and drops the Type / Usecases / Industries columns and their filters. */
  variant?: 'templates' | 'variables' | 'collaborators' | 'files';
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
  onRowEdit?: (row: BotTemplateRow) => void;
  onRowClone?: (row: BotTemplateRow) => void;
  onRowDelete?: (row: BotTemplateRow) => void;
}

export function BotTemplatesTable({
  searchPlaceholder = 'Search templates…',
  onInvite,
  hideFilters = false,
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
  onRowEdit,
  onRowClone,
  onRowDelete,
}: BotTemplatesTableProps) {
  const isFiles = variant === 'files';
  const isVariables = variant === 'variables' || isFiles;
  const isCollaborators = variant === 'collaborators';
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<number>();
  const handleScroll = () => {
    setIsScrolling(true);
    window.clearTimeout(scrollTimeout.current);
    scrollTimeout.current = window.setTimeout(() => setIsScrolling(false), 600);
  };

  return (
    <div className="lc-bt" data-variant={variant}>
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
            {!isFiles && <InboxIcon name="chevron-down" className="lc-bt__search-chevron" />}
          </div>
          {onInvite && <Button onClick={onInvite}>Invite</Button>}
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

      <div className="lc-bt__table" data-scrolling={isScrolling || undefined} onScroll={handleScroll}>
        <div className="lc-bt__row lc-bt__row--head">
          <div className="lc-bt__cell lc-bt__cell--name">{variant === 'variables' ? 'Variable name' : 'Name'}</div>
          {isFiles && <div className="lc-bt__cell lc-bt__cell--format">Format</div>}
          {!isVariables && (
            <div className="lc-bt__cell lc-bt__cell--type">{isCollaborators ? 'Role' : 'Type'}</div>
          )}
          {!isVariables && !isCollaborators && (
            <>
              <div className="lc-bt__cell lc-bt__cell--usecases">Usecases</div>
              <div className="lc-bt__cell lc-bt__cell--industries">Industries</div>
            </>
          )}
          {!isCollaborators && (
            <div className="lc-bt__cell lc-bt__cell--scope">{isFiles ? 'Size' : isVariables ? 'Data type' : 'Scope'}</div>
          )}
          <div className="lc-bt__cell lc-bt__cell--actions" />
        </div>

        {templates.length === 0 ? (
          <div className="lc-bt__empty">No templates found</div>
        ) : (
          templates.map((row) => (
            <div key={row.id} className="lc-bt__row lc-bt__row--body">
              <div className="lc-bt__cell lc-bt__cell--name">
                {isCollaborators && (
                  <Avatar size={36} radius="xl" alt={row.name} className="lc-bt__avatar" style={AVATAR_STYLE}>
                    {initials(row.name)}
                  </Avatar>
                )}
                <div className="lc-bt__name-block">
                  <span className="lc-bt__name">{row.name}</span>
                  <span className="lc-bt__desc">{row.description}</span>
                </div>
              </div>
              {isFiles && (
                <div className="lc-bt__cell lc-bt__cell--format">
                  <Chips items={row.format ? [row.format] : []} />
                </div>
              )}
              {!isVariables && (
                <div className="lc-bt__cell lc-bt__cell--type">
                  {isCollaborators ? (
                    <div className="lc-bt__role">
                      <div className="lc-bt__type-block">
                        <span className="lc-bt__type-label">{row.role ?? '—'}</span>
                        {row.role && ROLE_CAPTION[row.role] && (
                          <span className="lc-bt__type-caption">{ROLE_CAPTION[row.role]}</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="lc-bt__type-block">
                      <span className="lc-bt__type-label">{TYPE_LABEL[row.type]}</span>
                      <span className="lc-bt__type-caption">{TYPE_CAPTION[row.type]}</span>
                    </div>
                  )}
                </div>
              )}
              {!isVariables && !isCollaborators && (
                <>
                  <div className="lc-bt__cell lc-bt__cell--usecases"><Chips items={row.usecases} /></div>
                  <div className="lc-bt__cell lc-bt__cell--industries"><Chips items={row.industries} /></div>
                </>
              )}
              {!isCollaborators && (
                <div className="lc-bt__cell lc-bt__cell--scope">
                  {isVariables ? (
                    row.dataType ?? '—'
                  ) : (
                    <span className="lc-bt__scope" data-scope={row.scope}>{SCOPE_LABEL[row.scope]}</span>
                  )}
                </div>
              )}
              <div className="lc-bt__cell lc-bt__cell--actions">
                {isCollaborators ? (
                  <>
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BotTemplatesTable;
