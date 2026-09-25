/**
 * TicketDetailsPanel — LimeChat design system (Figma node 9530:21902
 * "right_hand_panel_conversation"), the right-hand contact/ticket panel
 * beside an open conversation.
 *
 *   <TicketDetailsPanel
 *     tabs={['Overview', 'Orders', 'Products']}
 *     activeTab={tab} onTabChange={setTab}
 *     agent={{ value: 'john', options: ['John Adams', 'Jane Doe'], onChange: setAgent }}
 *     team={{ value: 'marketing', options: ['Marketing', 'Support'], onChange: setTeam }}
 *     sections={[
 *       { id: 'previous', label: 'Previous tickets', count: 21, items: [...] },
 *       { id: 'sub-tickets', label: 'Sub tickets', count: 21, emptyText: 'There are no sub tickets for this customer' },
 *     ]}
 *   />
 */
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { NativeSelect } from '../Select';
import { Menu } from '../Menu';
import { Tooltip } from '../Tooltip';
import { ProductsPanel } from '../ProductsPanel';
import { OrdersPanel } from '../OrdersPanel';
import { CartPanel } from '../CartPanel';
import { Modal, ModalTextarea, ModalCheckbox } from '../Modal';
import { Button } from '../Button';
import './TicketDetailsPanel.css';
import { iconProps } from '../iconProps';
import { ChevronDownIcon, CloseIcon as TagCloseIcon } from '../icons';

const RANDOM_AGENT_NAMES = [
  'Aditi Sharma',
  'Rahul Verma',
  'Priya Nair',
  'Karan Mehta',
  'Sneha Iyer',
  'Vikram Singh',
  'Neha Gupta',
  'Arjun Reddy',
  'Ishita Kapoor',
  'Manish Joshi',
  'Divya Menon',
  'Rohan Kulkarni',
];

const PlusIcon = () => (
  <svg {...iconProps()}>
    <path d="M12 5l0 14" />
    <path d="M5 12l14 0" />
  </svg>
);
const ChevronIcon = ({ open }: { open: boolean }) => (
  <ChevronDownIcon style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 150ms ease' }} />
);
const MailIcon = () => (
  <svg {...iconProps()}>
    <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" />
    <path d="M3 7l9 6l9 -6" />
  </svg>
);
const PhoneIcon = () => (
  <svg {...iconProps()}>
    <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
  </svg>
);
const OverviewIcon = () => (
  <svg {...iconProps()}>
    <rect x="4" y="4" width="7" height="7" rx="1" />
    <rect x="13" y="4" width="7" height="7" rx="1" />
    <rect x="4" y="13" width="7" height="7" rx="1" />
    <rect x="13" y="13" width="7" height="7" rx="1" />
  </svg>
);
const OrdersIcon = () => (
  <svg {...iconProps()}>
    <path d="M6.331 8h11.339a2 2 0 0 1 1.977 2.304l-1.255 8.152a3 3 0 0 1 -2.966 2.544h-6.852a3 3 0 0 1 -2.966 -2.544l-1.255 -8.152a2 2 0 0 1 1.977 -2.304z" />
    <path d="M9 11v-5a3 3 0 0 1 6 0v5" />
  </svg>
);
const ProductsIcon = () => (
  <svg {...iconProps()}>
    <path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5" />
    <path d="M12 12l8 -4.5" />
    <path d="M12 12l0 9" />
    <path d="M12 12l-8 -4.5" />
  </svg>
);
const CartIcon = () => (
  <svg {...iconProps()}>
    <circle cx="6" cy="19" r="2" />
    <circle cx="17" cy="19" r="2" />
    <path d="M17 17h-11v-14h-2" />
    <path d="M6 5l14 1l-1 7h-13" />
  </svg>
);

const TAB_ICONS: Record<string, () => ReactNode> = {
  Overview: OverviewIcon,
  Orders: OrdersIcon,
  Products: ProductsIcon,
  Cart: CartIcon,
};

export interface TicketDetailsSectionItem {
  icon?: ReactNode;
  title: string;
  timestamp?: string;
  preview?: string;
  /** Call length, e.g. "5 minutes 10 seconds" — when set, the item renders as a voice log card instead of the generic layout. */
  duration?: string;
}

export type TicketFieldType = 'text' | 'date' | 'select' | 'cascading';

export interface TicketFieldOption {
  value: string;
  label: string;
  /** Next-level options — present only on `cascading` fields, up to 3 levels deep. */
  children?: TicketFieldOption[];
}

export interface TicketDetailsField {
  id: string;
  label: string;
  type: TicketFieldType;
  defaultValue?: string;
  /** Options for `select` and `cascading` fields. */
  options?: TicketFieldOption[];
}

export interface TicketDetailsSection {
  id: string;
  label: string;
  count?: number;
  items?: TicketDetailsSectionItem[];
  fields?: TicketDetailsField[];
  /** Removable chips, e.g. conversation/contact tags. */
  tags?: string[];
  emptyText?: string;
  defaultOpen?: boolean;
  onAdd?: () => void;
  hideAdd?: boolean;
  /** Sections sharing a group render under one small heading (e.g. "Tickets", "Tags"),
   * in order of first appearance. Ungrouped sections render without a heading. */
  group?: string;
  /** "See more (N)" paging for `items`, ported from the Vue app's previous-conversations list:
   * shows `collapsedCount` items, the first "See more" expands to the already-fetched page, each
   * later click fetches the next `pageSize`, and "See less" collapses once everything is loaded. */
  pagination?: { collapsedCount: number; pageSize: number; total?: number };
}

export interface AssignmentField {
  value: string;
  options: string[];
  onChange?: (value: string) => void;
}

export interface TicketDetailsPanelProps extends HTMLAttributes<HTMLDivElement> {
  tabs?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  ticketId?: string;
  agent?: AssignmentField;
  team?: AssignmentField;
  sections?: TicketDetailsSection[];
}

/** Copy-to-clipboard detail value — "Click to copy" tooltip; flips to "Copied" briefly on click. */
function CopyableDetailValue({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard access denied/unavailable — the value simply won't confirm.
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1000);
  };

  return (
    <Tooltip label="Click to copy" position="bottom">
      <button
        type="button"
        className={`lc-tdp__detail-value lc-tdp__detail-value--copyable${
          copied ? ' lc-tdp__detail-value--copied' : ''
        }`}
        aria-live="polite"
        onClick={handleClick}
      >
        {copied ? 'Copied' : value}
      </button>
    </Tooltip>
  );
}

function DetailRow({
  icon,
  label,
  value,
  action,
  copyable,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
  action?: ReactNode;
  copyable?: boolean;
}) {
  return (
    <div className="lc-tdp__detail-row">
      {icon != null && <span className="lc-tdp__detail-icon">{icon}</span>}
      <span className="lc-tdp__detail-label">{label}</span>
      {copyable ? <CopyableDetailValue value={value} /> : <span className="lc-tdp__detail-value">{value}</span>}
      {action}
    </div>
  );
}

/** Trigger + popover with a search box — used to assign an agent/team from a long, searchable name list. */
function AssigneeSearchSelect({
  value,
  options,
  noun,
  onChange,
}: {
  value: string;
  options: string[];
  /** Plural noun for the search copy, e.g. "agents" / "teams". */
  noun: string;
  onChange: (next: string) => void;
}) {
  const [query, setQuery] = useState('');
  const wasOpenRef = useRef(false);

  const filtered = options.filter((name) => name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <Menu
      ariaLabel="Select an assignee"
      align="start"
      width={198}
      header={
        <div className="lc-tdp__assignee-search-row">
          <input
            type="text"
            className="lc-tdp__assignee-search"
            aria-label={`Search ${noun}`}
            placeholder={`Search ${noun}…`}
            value={query}
            autoFocus
            onChange={(e) => setQuery(e.currentTarget.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      }
      emptyState={<p className="lc-tdp__assignee-empty">No {noun} found.</p>}
      items={filtered.map((name) => ({
        key: name,
        label: name,
        selected: name === value,
        onClick: () => onChange(name),
      }))}
      trigger={({ ref, onClick, open }) => {
        if (wasOpenRef.current && !open && query) setQuery('');
        wasOpenRef.current = open;
        return (
          <button
            ref={ref}
            type="button"
            className="lc-tdp__assignee-trigger"
            data-placeholder={!value || undefined}
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={onClick}
          >
            <span className="lc-tdp__assignee-trigger-value">{value || 'Unassigned'}</span>
            <ChevronIcon open={open} />
          </button>
        );
      }}
    />
  );
}

function AssignmentRow({
  icon,
  label,
  noun,
  field,
}: {
  icon?: ReactNode;
  label: string;
  noun: string;
  field: AssignmentField;
}) {
  return (
    <div className="lc-tdp__assignment-row">
      <span className="lc-tdp__assignment-label">
        {icon != null && <span className="lc-tdp__detail-icon">{icon}</span>}
        {label}
      </span>
      <AssigneeSearchSelect
        value={field.value}
        options={field.options}
        noun={noun}
        onChange={(next) => field.onChange?.(next)}
      />
    </div>
  );
}

/** Free-text field — a plain, unmanaged label + input pair. */
function TextField({ field }: { field: TicketDetailsField }) {
  const [value, setValue] = useState(field.defaultValue ?? '');
  return (
    <label className="lc-tdp__field">
      <span className="lc-tdp__field-label">{field.label}</span>
      <input
        className="lc-tdp__field-input"
        type="text"
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
      />
    </label>
  );
}

/** Native date picker field. */
function DateField({ field }: { field: TicketDetailsField }) {
  const [value, setValue] = useState(field.defaultValue ?? '');
  return (
    <label className="lc-tdp__field">
      <span className="lc-tdp__field-label">{field.label}</span>
      <input
        className="lc-tdp__field-input"
        type="date"
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
      />
    </label>
  );
}

/** Single-level dropdown, built on the shared NativeSelect. */
function SelectField({ field }: { field: TicketDetailsField }) {
  const [value, setValue] = useState(field.defaultValue ?? '');
  return (
    <NativeSelect
      label={field.label}
      size="sm"
      wrapperClassName="lc-tdp__select-field"
      placeholder="Select..."
      data={(field.options ?? []).map((o) => ({ value: o.value, label: o.label }))}
      value={value}
      onChange={(e) => setValue(e.currentTarget.value)}
    />
  );
}

/** Up to 3 chained dropdowns — picking a level reveals the next level's options. */
function CascadingField({ field }: { field: TicketDetailsField }) {
  const [path, setPath] = useState<string[]>([]);
  const level1 = field.options ?? [];
  const level1Selected = level1.find((o) => o.value === path[0]);
  const level2 = level1Selected?.children ?? [];
  const level2Selected = level2.find((o) => o.value === path[1]);
  const level3 = level2Selected?.children ?? [];

  return (
    <div className="lc-tdp__field">
      <span className="lc-tdp__field-label">{field.label}</span>
      <div className="lc-tdp__cascade">
        <NativeSelect
          size="sm"
          aria-label={field.label}
          placeholder="Select…"
          data={level1.map((o) => ({ value: o.value, label: o.label }))}
          value={path[0] ?? ''}
          onChange={(e) => setPath([e.currentTarget.value])}
        />
        {path[0] && level2.length > 0 && (
          <NativeSelect
            size="sm"
            aria-label={`${field.label}: ${level1Selected?.label}`}
            placeholder="Select…"
            data={level2.map((o) => ({ value: o.value, label: o.label }))}
            value={path[1] ?? ''}
            onChange={(e) => setPath([path[0], e.currentTarget.value])}
          />
        )}
        {path[1] && level3.length > 0 && (
          <NativeSelect
            size="sm"
            aria-label={`${field.label}: ${level2Selected?.label}`}
            placeholder="Select…"
            data={level3.map((o) => ({ value: o.value, label: o.label }))}
            value={path[2] ?? ''}
            onChange={(e) => setPath([path[0], path[1], e.currentTarget.value])}
          />
        )}
      </div>
    </div>
  );
}

function SectionField({ field }: { field: TicketDetailsField }) {
  switch (field.type) {
    case 'date':
      return <DateField field={field} />;
    case 'select':
      return <SelectField field={field} />;
    case 'cascading':
      return <CascadingField field={field} />;
    default:
      return <TextField field={field} />;
  }
}

/** Removable chip list for conversation/contact tags. */
function TagList({ tags: initialTags }: { tags: string[] }) {
  const [tags, setTags] = useState(initialTags);
  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  if (tags.length === 0) return <p className="lc-tdp__empty">No tags added yet.</p>;

  return (
    <div className="lc-tdp__tags">
      {tags.map((tag) => (
        <span key={tag} className="lc-tdp__tag">
          {tag}
          <button type="button" className="lc-tdp__tag-remove" aria-label={`Remove ${tag}`} onClick={() => removeTag(tag)}>
            <TagCloseIcon />
          </button>
        </span>
      ))}
    </div>
  );
}

/** "Create a Sub-ticket" modal (Figma node 41:12551) — opened from Sub tickets' + button. */
function SubTicketModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const [assignee, setAssignee] = useState('');
  const [requireResolution, setRequireResolution] = useState(true);

  const reset = () => {
    setReason('');
    setAssignee('');
    setRequireResolution(true);
  };
  const close = () => {
    onClose();
    reset();
  };
  const canCreate = reason.trim().length > 0 && assignee.trim().length > 0;

  return (
    <Modal
      open={open}
      onClose={close}
      title="Create a Sub-ticket"
      width={525}
      footer={
        <Button variant="filled" color="primary" size="sm" disabled={!canCreate} onClick={close}>
          Create
        </Button>
      }
    >
      <div className="lc-tdp__subticket-form">
        <ModalTextarea
          label="Reason for the sub ticket creation"
          required
          placeholder="Write your issue"
          value={reason}
          onChange={(e) => setReason(e.currentTarget.value)}
        />
        <NativeSelect
          label="Assign to"
          withAsterisk
          size="sm"
          placeholder="Select an internal agent"
          data={RANDOM_AGENT_NAMES}
          value={assignee}
          onChange={(e) => setAssignee(e.currentTarget.value)}
        />
        <ModalCheckbox
          checked={requireResolution}
          onChange={setRequireResolution}
          label="Resolving this ticket is required to close the parent ticket."
          description="This assists in determining the dependency of the parent ticket on the internal ticket."
        />
      </div>
    </Modal>
  );
}

/** What a collapsed header counts: explicit `count`, else items/tags/fields present. */
function sectionCount(section: TicketDetailsSection): number {
  return (
    section.count ??
    section.pagination?.total ??
    section.items?.length ??
    section.tags?.length ??
    section.fields?.length ??
    0
  );
}

/** Simulated fetch time for the next page of items. */
const SEE_MORE_DELAY_MS = 450;

function PaginatedItems({
  items,
  pagination,
}: {
  items: TicketDetailsSectionItem[];
  pagination: NonNullable<TicketDetailsSection['pagination']>;
}) {
  const { collapsedCount, pageSize } = pagination;
  const total = pagination.total ?? items.length;
  const [expanded, setExpanded] = useState(false);
  // The first page arrives with the section; later pages are "fetched" on demand.
  const [loadedCount, setLoadedCount] = useState(Math.min(pageSize, total));
  const [fetching, setFetching] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const canLoadMore = loadedCount < total;
  const hasMoreThanCollapsed = loadedCount > collapsedCount;
  const showButton = hasMoreThanCollapsed || canLoadMore;
  const showingAll = expanded && hasMoreThanCollapsed && !canLoadMore;
  const remaining = expanded ? total - loadedCount : total - collapsedCount;
  const visible = items.slice(0, expanded ? loadedCount : collapsedCount);

  const onClick = () => {
    if (showingAll) {
      setExpanded(false);
      return;
    }
    // No fetch on the first click — that page is already loaded; fetch from the second on.
    if (canLoadMore && expanded) {
      setFetching(true);
      timer.current = window.setTimeout(() => {
        setLoadedCount((c) => Math.min(total, c + pageSize));
        setFetching(false);
      }, SEE_MORE_DELAY_MS);
    }
    setExpanded(true);
  };

  return (
    <>
      {visible.map((item, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <SectionItem key={i} item={item} />
      ))}
      {showButton && (
        <button
          type="button"
          className="lc-tdp__see-more"
          onClick={onClick}
          disabled={fetching}
          aria-busy={fetching || undefined}
        >
          {fetching ? (
            <>
              <span className="lc-tdp__see-more-spinner" aria-hidden="true" />
              Loading…
            </>
          ) : showingAll ? (
            <>
              See less
              <ChevronDownIcon className="lc-tdp__see-more-icon" data-up="" />
            </>
          ) : (
            <>
              See more
              <span className="lc-tdp__badge">{remaining}</span>
              <ChevronDownIcon className="lc-tdp__see-more-icon" />
            </>
          )}
        </button>
      )}
    </>
  );
}

function SectionItem({ item }: { item: TicketDetailsSectionItem }) {
  const isVoice = item.duration != null;
  return (
    <div className="lc-tdp__item">
      <span className="lc-tdp__item-icon">{item.icon ?? (isVoice ? <PhoneIcon /> : <MailIcon />)}</span>
      <div className="lc-tdp__item-text">
        <div className="lc-tdp__item-title-row">
          <span className="lc-tdp__item-title">{item.title}</span>
          {item.timestamp && <span className="lc-tdp__item-timestamp">{item.timestamp}</span>}
        </div>
        {isVoice ? (
          <div className="lc-tdp__item-title-row">
            <span className="lc-tdp__item-preview">{item.duration}</span>
            <span className="lc-tdp__voice-transcript">See transcript</span>
          </div>
        ) : (
          item.preview && <p className="lc-tdp__item-preview">{item.preview}</p>
        )}
      </div>
    </div>
  );
}

function Section({ section }: { section: TicketDetailsSection }) {
  const [open, setOpen] = useState(section.defaultOpen ?? false);
  const [subTicketModalOpen, setSubTicketModalOpen] = useState(false);
  const bodyId = useId();
  const count = sectionCount(section);
  return (
    <div className="lc-tdp__section" data-open={open || undefined} data-empty={count === 0 || undefined}>
      <div className="lc-tdp__section-header">
        <button
          type="button"
          className="lc-tdp__section-toggle"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="lc-tdp__chevron" aria-hidden="true">
            <ChevronDownIcon />
          </span>
          <span className="lc-tdp__section-title">{section.label}</span>
          {count > 0 && <span className="lc-tdp__badge">{count}</span>}
        </button>
        {!section.hideAdd && (
          <button
            type="button"
            className="lc-tdp__icon-btn"
            aria-label={`Add ${section.label}`}
            onClick={() => {
              if (section.id === 'sub-tickets') setSubTicketModalOpen(true);
              else section.onAdd?.();
            }}
          >
            <PlusIcon />
          </button>
        )}
      </div>
      {open && (
        <div className="lc-tdp__section-body" id={bodyId}>
          {section.fields && section.fields.length > 0 && (
            <div className="lc-tdp__fields">
              {section.fields.map((field) => (
                <SectionField key={field.id} field={field} />
              ))}
            </div>
          )}
          {section.tags && <TagList tags={section.tags} />}
          {section.items && section.items.length > 0
            ? section.pagination
              ? <PaginatedItems items={section.items} pagination={section.pagination} />
              : section.items.map((item, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <SectionItem key={i} item={item} />
                ))
            : !section.fields?.length &&
              !section.tags &&
              section.emptyText && <p className="lc-tdp__empty">{section.emptyText}</p>}
        </div>
      )}
      {section.id === 'sub-tickets' && (
        <SubTicketModal open={subTicketModalOpen} onClose={() => setSubTicketModalOpen(false)} />
      )}
    </div>
  );
}

/** Sections bucketed by `group`, preserving first-appearance order. */
function groupSections(sections: TicketDetailsSection[]) {
  const groups: { name?: string; sections: TicketDetailsSection[] }[] = [];
  for (const section of sections) {
    const last = groups[groups.length - 1];
    const existing = section.group ? groups.find((g) => g.name === section.group) : undefined;
    if (existing) existing.sections.push(section);
    else if (!section.group && last && !last.name) last.sections.push(section);
    else groups.push({ name: section.group, sections: [section] });
  }
  return groups;
}

export const TicketDetailsPanel = forwardRef<HTMLDivElement, TicketDetailsPanelProps>(function TicketDetailsPanel(
  {
    tabs = ['Overview', 'Orders', 'Products', 'Cart'],
    activeTab,
    onTabChange,
    ticketId,
    agent,
    team,
    sections = [],
    className,
    ...rest
  },
  ref,
) {
  const resolvedActiveTab = activeTab ?? tabs[0];
  const idBase = useId();
  const tabId = (tab: string) => `${idBase}-tab-${tab}`;
  const panelId = (tab: string) => `${idBase}-panel-${tab}`;
  const panelProps = {
    className: 'lc-tdp__body',
    id: panelId(resolvedActiveTab),
    role: 'tabpanel' as const,
    'aria-labelledby': tabId(resolvedActiveTab),
    tabIndex: 0,
  };

  return (
    <div {...rest} ref={ref} className={`lc-tdp${className ? ` ${className}` : ''}`}>
      <div className="lc-tdp__tabs-wrap">
        <div className="lc-tdp__tabs" role="tablist">
          {tabs.map((tab) => {
            const Icon = TAB_ICONS[tab];
            const active = resolvedActiveTab === tab;
            return (
              <button
                key={tab}
                type="button"
                id={tabId(tab)}
                role="tab"
                aria-selected={active}
                aria-controls={panelId(tab)}
                // Inactive tabs collapse to their icon; the label stays in the DOM for the accessible name.
                title={active ? undefined : tab}
                className="lc-tdp__tab"
                data-active={active || undefined}
                onClick={() => onTabChange?.(tab)}
              >
                {Icon && <Icon />}
                <span className="lc-tdp__tab-label">{tab}</span>
              </button>
            );
          })}
        </div>
      </div>

      {resolvedActiveTab === 'Overview' && (
        <div {...panelProps}>
          {(ticketId || agent || team) && (
            <div className="lc-tdp__info">
              {ticketId && <DetailRow label="Ticket" value={`#${ticketId}`} copyable />}
              {agent && <AssignmentRow label="Agent" noun="agents" field={agent} />}
              {team && <AssignmentRow label="Team" noun="teams" field={team} />}
            </div>
          )}

          {groupSections(sections).map((group, gi) => (
            <div key={group.name ?? `ungrouped-${gi}`} className="lc-tdp__group">
              {group.name && <p className="lc-tdp__group-label">{group.name}</p>}
              <div className="lc-tdp__sections">
                {group.sections.map((section) => (
                  <Section key={section.id} section={section} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {resolvedActiveTab === 'Products' && (
        <div {...panelProps}>
          <ProductsPanel />
        </div>
      )}

      {resolvedActiveTab === 'Orders' && (
        <div {...panelProps}>
          <OrdersPanel />
        </div>
      )}

      {resolvedActiveTab === 'Cart' && (
        <div {...panelProps}>
          <CartPanel />
        </div>
      )}
    </div>
  );
});

export default TicketDetailsPanel;
