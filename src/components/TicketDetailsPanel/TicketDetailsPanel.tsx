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
import { forwardRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { NativeSelect } from '../Select';
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

function DetailRow({ icon, label, value, action }: { icon?: ReactNode; label: string; value: string; action?: ReactNode }) {
  return (
    <div className="lc-tdp__detail-row">
      {icon != null && <span className="lc-tdp__detail-icon">{icon}</span>}
      <span className="lc-tdp__detail-label">{label}</span>
      <span className="lc-tdp__detail-value">{value}</span>
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
  return (
    <div className="lc-tdp__section">
      <div className="lc-tdp__section-header">
        <div className="lc-tdp__section-title">
          <span>{section.label}</span>
          {section.count != null && <span className="lc-tdp__badge">{section.count}</span>}
        </div>
        <div className="lc-tdp__section-actions">
          {!section.hideAdd && (
            <button type="button" className="lc-tdp__icon-btn" aria-label={`Add ${section.label}`} onClick={section.onAdd}>
              <PlusIcon />
            </button>
          )}
          <button
            type="button"
            className="lc-tdp__icon-btn"
            aria-label={open ? 'Collapse' : 'Expand'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <ChevronIcon open={open} />
          </button>
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
    tabs = ['Overview', 'Orders', 'Products'],
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
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={resolvedActiveTab === tab}
            className="lc-tdp__tab"
            data-active={resolvedActiveTab === tab || undefined}
            onClick={() => onTabChange?.(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="lc-tdp__body">
        {(ticketId || agent || team) && (
          <div className="lc-tdp__info">
            {ticketId && <DetailRow label="Ticket Id" value={ticketId} />}
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
    </div>
  );
});

export default TicketDetailsPanel;
