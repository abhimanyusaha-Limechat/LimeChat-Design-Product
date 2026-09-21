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
import { forwardRef, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { NativeSelect } from '../Select';
import { Tooltip } from '../Tooltip';
import { ProductsPanel } from '../ProductsPanel';
import './TicketDetailsPanel.css';

function iconProps() {
  return {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
}

const PlusIcon = () => (
  <svg {...iconProps()}>
    <path d="M12 5l0 14" />
    <path d="M5 12l14 0" />
  </svg>
);
const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg {...iconProps()} style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 150ms ease' }}>
    <path d="M6 9l6 6l6 -6" />
  </svg>
);
const MailIcon = () => (
  <svg {...iconProps()}>
    <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" />
    <path d="M3 7l9 6l9 -6" />
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
}

export interface TicketDetailsSection {
  id: string;
  label: string;
  count?: number;
  items?: TicketDetailsSectionItem[];
  emptyText?: string;
  defaultOpen?: boolean;
  onAdd?: () => void;
  hideAdd?: boolean;
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

function AssignmentRow({ icon, label, field }: { icon?: ReactNode; label: string; field: AssignmentField }) {
  return (
    <div className="lc-tdp__assignment-row">
      <span className="lc-tdp__assignment-label">
        {icon != null && <span className="lc-tdp__detail-icon">{icon}</span>}
        {label}
      </span>
      <NativeSelect
        size="xs"
        data={field.options}
        value={field.value}
        onChange={(e) => field.onChange?.(e.currentTarget.value)}
        wrapperClassName="lc-tdp__assignment-select"
      />
    </div>
  );
}

function Section({ section }: { section: TicketDetailsSection }) {
  const [open, setOpen] = useState(section.defaultOpen ?? false);
  const toggle = () => setOpen((v) => !v);
  return (
    <div className="lc-tdp__section">
      <div
        className="lc-tdp__section-header"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
      >
        <div className="lc-tdp__section-title">
          <span>{section.label}</span>
          {section.count != null && <span className="lc-tdp__badge">{section.count}</span>}
        </div>
        <div className="lc-tdp__section-actions">
          {!section.hideAdd && (
            <button
              type="button"
              className="lc-tdp__icon-btn"
              aria-label={`Add ${section.label}`}
              onClick={(e) => {
                e.stopPropagation();
                section.onAdd?.();
              }}
            >
              <PlusIcon />
            </button>
          )}
          <span className="lc-tdp__icon-btn" aria-hidden="true">
            <ChevronIcon open={open} />
          </span>
        </div>
      </div>
      {open && (
        <div className="lc-tdp__section-body">
          {section.items && section.items.length > 0
            ? section.items.map((item, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <div key={i} className="lc-tdp__item">
                  <span className="lc-tdp__item-icon">{item.icon ?? <MailIcon />}</span>
                  <div className="lc-tdp__item-text">
                    <div className="lc-tdp__item-title-row">
                      <span className="lc-tdp__item-title">{item.title}</span>
                      {item.timestamp && <span className="lc-tdp__item-timestamp">{item.timestamp}</span>}
                    </div>
                    {item.preview && <p className="lc-tdp__item-preview">{item.preview}</p>}
                  </div>
                </div>
              ))
            : section.emptyText && <p className="lc-tdp__empty">{section.emptyText}</p>}
        </div>
      )}
    </div>
  );
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

  return (
    <div {...rest} ref={ref} className={`lc-tdp${className ? ` ${className}` : ''}`}>
      <div className="lc-tdp__tabs" role="tablist">
        {tabs.map((tab) => {
          const Icon = TAB_ICONS[tab];
          return (
            <Tooltip key={tab} label={tab} position="bottom">
              <button
                type="button"
                role="tab"
                aria-selected={resolvedActiveTab === tab}
                aria-label={tab}
                className="lc-tdp__tab"
                data-active={resolvedActiveTab === tab || undefined}
                onClick={() => onTabChange?.(tab)}
              >
                {Icon ? <Icon /> : tab}
              </button>
            </Tooltip>
          );
        })}
      </div>

      {resolvedActiveTab === 'Overview' && (
        <div className="lc-tdp__body">
          {(ticketId || agent || team) && (
            <div className="lc-tdp__info">
              {ticketId && <DetailRow label="Ticket Id" value={ticketId} copyable />}
              {agent && <AssignmentRow label="Assign Agent" field={agent} />}
              {team && <AssignmentRow label="Assign Team" field={team} />}
            </div>
          )}

          <div className="lc-tdp__sections">
            {sections.map((section) => (
              <Section key={section.id} section={section} />
            ))}
          </div>
        </div>
      )}

      {resolvedActiveTab === 'Products' && (
        <div className="lc-tdp__body">
          <ProductsPanel />
        </div>
      )}
    </div>
  );
});

export default TicketDetailsPanel;
