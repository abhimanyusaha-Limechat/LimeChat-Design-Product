/**
 * BotTemplatesTable — Automation → Settings → Bot templates: search + type/
 * industry/account filters and a table of templates (Name, Type, Usecases,
 * Industries, Scope, row actions). Same anatomy as InboxesTable, scoped to "lc-bt".
 */
import { useState, type CSSProperties, type ReactNode } from 'react';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import { NativeSelect } from '../Select';
import { ActionMenu } from '../Menu';
import { Tooltip } from '../Tooltip';
import { InboxIcon, type InboxType } from '../InboxesTable';
import { TemplateIcon } from '../TemplatesHomePage';
import {
  DataTable,
  DataTableEmpty,
  DataTableHead,
  DataTableRow,
  DataTableSkeleton,
  DataTableSortHeader,
  digitsOf,
  Skeleton,
  type SortValue,
  useTableSort,
} from '../DataTable';
import { Icon } from '../icons';
import { useDragReorder } from './useDragReorder';
import { useTreeDrag } from './useTreeDrag';
import type { DropTarget } from '../SettingsScreen/tagTree';
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
  /** Custom fields only — shows a "Mandatory" chip after the name. */
  mandatory?: boolean;
  /** Agents only — invited but not yet verified; shows a "Pending" chip after the name. */
  pending?: boolean;
  /** Contacts only — pre-formatted, e.g. "+91-98201 44312". */
  phone?: string;
  /** Contacts only — number of tickets the contact has raised. */
  tickets?: number;
  /** Contacts only — Instagram handle without the "@", e.g. "priya.styles". */
  instagram?: string;
  /** Contacts only — tags used by the Tags filter, e.g. "VIP". */
  tags?: string[];
  /** Tags only — id of the parent tag (tags nest up to three levels); omit for a top-level tag. */
  parentId?: string;
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

interface Column {
  /** Suffix of the `lc-bt__cell--*` width class. */
  key: string;
  header: string;
  cell: (row: BotTemplateRow) => ReactNode;
  /** What the column sorts by when its header is clicked. */
  sortValue: (row: BotTemplateRow) => SortValue;
  /** Loading placeholder for this column's cells (default: one text line). */
  skeleton?: ReactNode;
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

const ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
/** Tree mode: px each level is indented by. Keep in sync with the tags skeleton indent in the CSS. */
const TREE_INDENT = 60;

type NameOptions = { avatar?: boolean; desc?: boolean; onViewDetails?: (row: BotTemplateRow) => void };

const nameColumn = (header = 'Name', { avatar = false, desc = true, onViewDetails }: NameOptions = {}): Column => ({
  key: 'name',
  header,
  sortValue: (row) => row.name,
  skeleton: (
    <>
      {avatar && <Skeleton shape="circle" />}
      <Skeleton lines={desc ? 2 : 1} />
    </>
  ),
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
        <span className="lc-bt__name-line">
          <span className="lc-bt__name">{row.name}</span>
          {row.mandatory && (
            <span className="lc-bt__badge" data-tone="danger">
              Mandatory
            </span>
          )}
          {row.pending && (
            <Tooltip label="Pending verification">
              {/* Focusable so keyboard users can reach the tooltip too. */}
              <span className="lc-bt__badge" data-tone="warning" tabIndex={0}>
                Pending
              </span>
            </Tooltip>
          )}
        </span>
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
    sortValue: (row) => TYPE_LABEL[row.type],
    cell: (row) => <span className="lc-bt__type-label">{TYPE_LABEL[row.type]}</span>,
  },
  role: {
    key: 'type',
    header: 'Role',
    sortValue: (row) => row.role,
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
  usecases: { key: 'usecases', header: 'Usecases', sortValue: (row) => row.usecases.join(', '), cell: (row) => <Chips items={row.usecases} /> },
  industries: { key: 'industries', header: 'Industries', sortValue: (row) => row.industries.join(', '), cell: (row) => <Chips items={row.industries} /> },
  scope: {
    key: 'scope',
    header: 'Scope',
    sortValue: (row) => SCOPE_LABEL[row.scope],
    cell: (row) => <span className="lc-bt__scope" data-scope={row.scope}>{SCOPE_LABEL[row.scope]}</span>,
  },
  scopes: { key: 'scope', header: 'Scope', sortValue: (row) => row.scopes?.join(', '), cell: (row) => <Chips items={row.scopes ?? []} light /> },
  dataType: { key: 'scope', header: 'Data type', sortValue: (row) => row.dataType, cell: (row) => dash(row.dataType) },
  frequency: { key: 'scope', header: 'Frequency', sortValue: (row) => row.dataType, cell: (row) => dash(row.dataType) },
  size: { key: 'scope', header: 'Size', sortValue: (row) => row.dataType, cell: (row) => dash(row.dataType) },
  domain: {
    key: 'format',
    header: 'Domain',
    sortValue: (row) => row.format,
    cell: (row) => <span className="lc-bt__domain" title={row.format}>{dash(row.format)}</span>,
  },
  format: { key: 'format', header: 'Format', sortValue: (row) => row.format, cell: (row) => <Chips items={row.format ? [row.format] : []} /> },
  inboxes: { key: 'inboxes', header: 'Inboxes', sortValue: (row) => row.inboxes?.map((i) => i.name).join(', '), cell: (row) => (
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
  kind: { key: 'type', header: 'Type', sortValue: (row) => row.kind, cell: (row) => dash(row.kind) },
  industryText: { key: 'industries', header: 'Industry', sortValue: (row) => row.industries.join(', '), cell: (row) => row.industries.join(', ') || '—' },
  phone: { key: 'type', header: 'Phone number', sortValue: (row) => (row.phone ? Number(digitsOf(row.phone)) : undefined), cell: (row) => dash(row.phone) },
  tickets: { key: 'scope', header: 'Tickets', sortValue: (row) => row.tickets, cell: (row) => dash(row.tickets) },
  useCaseCount: { key: 'industries', header: 'Use cases', sortValue: (row) => row.usecases.length, cell: (row) => row.usecases.length },
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
  tags: 'Tags',
  fields: 'Custom fields',
  contacts: 'Contacts',
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
    case 'contacts':
      return [nameColumn('Name', { avatar: true }), COLUMNS.phone, COLUMNS.tickets];
    case 'teams':
      return [nameColumn()];
    case 'rules':
      return [nameColumn()];
    case 'tags':
      return [nameColumn('Name', { desc: false })];
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
  /** Shows skeleton rows in place of the list while its data loads. */
  loading?: boolean;
  searchPlaceholder?: string;
  /** Renders an "Invite" button next to the search box. */
  onInvite?: () => void;
  /** Hides the whole filter group (label + dropdowns) on the right of the toolbar. */
  hideFilters?: boolean;
  /** Hides the search box. */
  hideSearch?: boolean;
  /** Industries variant — the last column shows the use-case count instead of industries. */
  showUseCases?: boolean;
  /** Files only — web sources: "url" shows Name / Domain / Frequency, "domain" shows Name / Frequency. */
  webSource?: 'url' | 'domain';
  /** Dropdown right before the search box that picks what the search matches (e.g. Name / Phone number). */
  searchBy?: { options: { value: string; label: string }[]; value: string; onChange: (value: string) => void };
  /** Dropdowns shown after the search box (e.g. Role / Inbox). */
  selects?: { ariaLabel: string; options: { value: string; label: string }[]; value: string; onChange: (value: string) => void }[];
  /** Single-select chip filter shown beside the tabs. */
  chipFilter?: { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void };
  /** "variables" relabels Name → "Variable name" ("files" → "Name", value column "Size", no search chevron) and drops the Type / Usecases / Industries columns and their filters. */
  variant?: 'templates' | 'variables' | 'collaborators' | 'files' | 'industries' | 'agents' | 'teams' | 'rules' | 'tags' | 'fields' | 'contacts';
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
  /**
   * Reorder mode: rows show a drag handle and keep the given order (no sorting),
   * and the toolbar shows `hint` instead of tabs / search / filters.
   */
  reorder?: { onMove: (from: number, to: number) => void; hint: string };
  /**
   * Tree mode (Tags): `templates` are the rows in tree order. Rows indent by level, and each
   * row's handle drags it onto another row (nest inside) or between rows (same level as that
   * row). Sorting is off so the tree order shows.
   */
  tree?: {
    levels: ReadonlyMap<string, { depth: number; hasChildren: boolean }>;
    canDrop: (dragId: string, target: DropTarget) => boolean;
    onDrop: (dragId: string, target: DropTarget) => void;
    /** Arrow key on a focused handle: up/down reorder, right nests into the tag above, left moves up a level. */
    onKeyMove: (id: string, key: string) => void;
    /** Hides the handles, e.g. while searching shows only part of the tree. */
    dragDisabled?: boolean;
    /** Adds a "+" before the row menu on levels 1–2 that creates a tag inside that row. */
    onAddChild?: (id: string) => void;
  };
}

export function BotTemplatesTable({
  searchPlaceholder = 'Search templates…',
  onInvite,
  hideFilters = false,
  hideSearch = false,
  showUseCases = false,
  webSource,
  chipFilter,
  searchBy,
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
  reorder,
  tree,
  loading = false,
}: BotTemplatesTableProps) {
  const isFiles = variant === 'files';
  const isVariables = variant === 'variables' || isFiles;
  const canClone = variant === 'templates' || isVariables;
  // No row handlers (e.g. Contacts) means no ⋯ menu.
  const hasRowMenu = !!(onRowEdit || onRowClone || onRowDelete);
  const columns = columnsFor(variant, showUseCases, webSource, onViewDetails);
  const { sorted: sortedTemplates, sort, toggle: toggleSort } = useTableSort(templates, (row, header: string) =>
    columns.find((col) => col.header === header)?.sortValue(row),
  );
  const [announcement, setAnnouncement] = useState('');
  const moveRow = (from: number, to: number) => {
    reorder?.onMove(from, to);
    setAnnouncement(`${templates[from].name}, moved to position ${to + 1} of ${templates.length}`);
  };
  const { draggingId, dragOffset, handleProps } = useDragReorder(templates.length, moveRow);
  // Reorder and tree modes show rows in the order given, so column sorting is off.
  const manualOrder = !!(reorder || tree);
  const rows = manualOrder ? templates : sortedTemplates;
  const nameOf = (id: string) => templates.find((t) => t.id === id)?.name ?? '';
  const treeDrag = useTreeDrag(
    (dragId, raw) => {
      if (!tree) return null;
      let target = raw;
      // "After" a parent is the gap above its first child, so it means "before that child".
      if (raw.position === 'after' && tree.levels.get(raw.id)?.hasChildren) {
        const next = rows[rows.findIndex((r) => r.id === raw.id) + 1];
        if (next) target = { id: next.id, position: 'before' };
      }
      return tree.canDrop(dragId, target) ? target : null;
    },
    (dragId, target) => {
      tree?.onDrop(dragId, target);
      const where = target.position === 'inside' ? 'into' : target.position;
      setAnnouncement(`${nameOf(dragId)} moved ${where} ${nameOf(target.id)}`);
    },
  );

  return (
    <div className="lc-bt" data-variant={variant}>
      <div className="lc-bt__toolbar">
        {reorder ? (
          <p className="lc-bt__reorder-hint">
            <Icon name="info-circle" />
            {reorder.hint}
          </p>
        ) : (
        <>
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
          {searchBy && (
            <NativeSelect
              size="sm"
              aria-label="Search by"
              wrapperClassName="lc-bt__search-by"
              data={searchBy.options}
              value={searchBy.value}
              onChange={(e) => searchBy.onChange(e.currentTarget.value)}
            />
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
            {!isFiles && variant !== 'agents' && variant !== 'teams' && variant !== 'contacts' && <InboxIcon name="chevron-down" className="lc-bt__search-chevron" />}
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
        </>
        )}
      </div>

      <DataTable aria-busy={loading || undefined} aria-label={TABLE_LABEL[variant]}>
        <DataTableHead className="lc-bt__row--head">
          {(reorder || tree) && <div role="columnheader" className="lc-bt__cell lc-bt__cell--handle" aria-label="Move" />}
          {columns.map((col) =>
            manualOrder ? (
              <div key={col.header} role="columnheader" className={`lc-bt__cell lc-bt__cell--${col.key}`}>
                {col.header}
              </div>
            ) : (
            <DataTableSortHeader
              key={col.header}
              className={`lc-bt__cell lc-bt__cell--${col.key}`}
              label={col.header}
              sortKey={col.header}
              sort={sort}
              onSort={toggleSort}
            />
            ),
          )}
          <div role="columnheader" className="lc-bt__cell lc-bt__cell--actions" aria-label="Actions" />
        </DataTableHead>

        {loading ? (
          <DataTableSkeleton>
            {(reorder || tree) && <div className="lc-bt__cell lc-bt__cell--handle" />}
            {columns.map((col) => (
              <div key={col.header} className={`lc-bt__cell lc-bt__cell--${col.key}`}>
                {col.skeleton ?? <Skeleton />}
              </div>
            ))}
            <div className="lc-bt__cell lc-bt__cell--actions">
              {(variant === 'rules' || variant === 'tags' || variant === 'fields') && <Skeleton shape="switch" />}
            </div>
          </DataTableSkeleton>
        ) : templates.length === 0 ? (
          <DataTableEmpty>No {TABLE_LABEL[variant].toLowerCase()} found</DataTableEmpty>
        ) : (
          rows.map((row, index) => {
            const level = tree?.levels.get(row.id);
            const depth = level?.depth ?? 0;
            return (
            <DataTableRow
              key={row.id}
              className="lc-bt__row--body"
              data-tree-id={tree ? row.id : undefined}
              data-level={tree ? depth + 1 : undefined}
              data-drop={treeDrag.dropTarget?.id === row.id ? treeDrag.dropTarget.position : undefined}
              data-dragging={row.id === draggingId || row.id === treeDrag.draggingId || undefined}
              style={
                row.id === draggingId
                  ? { translate: `0 ${dragOffset}px` }
                  : tree
                    ? // Each level indents the whole row (handle, name, divider); the actions stay right-aligned.
                      { marginLeft: depth * TREE_INDENT }
                    : undefined
              }
            >
              {tree && (
                <div role="cell" className="lc-bt__cell lc-bt__cell--handle">
                  {!tree.dragDisabled && (
                    <button
                      type="button"
                      className="lc-bt__drag-handle"
                      aria-label={`Move ${row.name}, level ${depth + 1} of 3. Drag onto a tag to nest it, or between tags to place it. Arrow keys: up and down reorder, right nests under the tag above, left moves up a level.`}
                      {...treeDrag.handleProps(row.id)}
                      onKeyDown={(e) => {
                        if (!ARROW_KEYS.includes(e.key)) return;
                        e.preventDefault();
                        tree.onKeyMove(row.id, e.key);
                        setAnnouncement(`${row.name} moved`);
                        // The row's DOM node may move, which drops focus; put it back on this handle.
                        const handle = e.currentTarget;
                        requestAnimationFrame(() => handle.focus());
                      }}
                    >
                      <Icon name="grip" />
                    </button>
                  )}
                </div>
              )}
              {reorder && (
                <div role="cell" className="lc-bt__cell lc-bt__cell--handle">
                  <button
                    type="button"
                    className="lc-bt__drag-handle"
                    aria-label={`Reorder ${row.name}, position ${index + 1} of ${rows.length}. Use the up and down arrow keys to move.`}
                    {...handleProps(row.id, index)}
                  >
                    <Icon name="grip" />
                  </button>
                </div>
              )}
              {columns.map((col) => (
                <div key={col.header} role="cell" className={`lc-bt__cell lc-bt__cell--${col.key}`}>{col.cell(row)}</div>
              ))}
              <div role="cell" className="lc-bt__cell lc-bt__cell--actions">
                {!reorder && (
                <>
                {(variant === 'rules' || variant === 'tags' || variant === 'fields') && <RuleSwitch row={row} onToggle={onToggleRow} />}
                {tree?.onAddChild &&
                  // Level 3 can't have children; an empty slot keeps the switches lined up.
                  (depth < 2 ? (
                    <Tooltip label="Add a tag inside">
                      <button
                        type="button"
                        className="lc-menu__trigger"
                        aria-label={`Add a tag inside ${row.name}`}
                        onClick={() => tree.onAddChild?.(row.id)}
                      >
                        <Icon name="plus" />
                      </button>
                    </Tooltip>
                  ) : (
                    <span className="lc-bt__action-slot" aria-hidden="true" />
                  ))}
                {hasRowMenu && (
                  <ActionMenu
                    ariaLabel={`Actions for ${row.name}`}
                    icon={<Icon name="dots-vertical" />}
                    items={[
                      { label: 'Edit', onClick: () => onRowEdit?.(row) },
                      ...(canClone ? [{ label: 'Clone', onClick: () => onRowClone?.(row) }] : []),
                      { label: 'Delete', danger: true, onClick: () => onRowDelete?.(row) },
                    ]}
                  />
                )}
                </>
                )}
              </div>
            </DataTableRow>
            );
          })
        )}
      </DataTable>
      {(reorder || tree) && (
        <p className="lc-dt__sr-only" aria-live="polite">
          {announcement}
        </p>
      )}
    </div>
  );
}

export default BotTemplatesTable;
