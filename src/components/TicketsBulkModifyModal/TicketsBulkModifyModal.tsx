/**
 * TicketsBulkModifyModal — LimeChat design system.
 *
 * Opened from the Tickets list's bulk-select "Modify" action: reassign
 * agent/team, change status, add tags, leave a note, and mark starred for
 * every selected ticket at once. Built on the shared `<Modal>` shell +
 * `NativeSelect` / `ModalTextarea`.
 *
 *   <TicketsBulkModifyModal
 *     open={open} onClose={close} selectedCount={checkedIds.size}
 *     onApply={(values) => modifyTickets(values)}
 *   />
 */
import { useEffect, useId, useState } from 'react';
import { Button } from '../Button';
import { Menu } from '../Menu';
import { Modal } from '../Modal';
import { NativeSelect } from '../Select';
import { TICKETS_STATUS_OPTIONS } from '../TicketsSection';
import './TicketsBulkModifyModal.css';

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9l6 6l6 -6" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12l5 5l10 -10" />
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="10" cy="10" r="7" />
    <path d="M21 21l-6 -6" />
  </svg>
);

/** A `NativeSelect`-styled field backed by a `Menu` popover instead of a real `<select>` — optionally searchable. */
function MenuSelectField({
  label,
  placeholder,
  options,
  value,
  onChange,
  searchable = false,
}: {
  label: string;
  placeholder?: string;
  options: string[];
  value: string;
  onChange: (next: string) => void;
  searchable?: boolean;
}) {
  const [query, setQuery] = useState('');
  const filtered = searchable
    ? options.filter((opt) => opt.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  return (
    <div className="lc-select lc-tbm-field" data-size="sm" data-full-width>
      <span className="lc-select__label">{label}</span>
      <Menu
        ariaLabel={`Select ${label}`}
        align="start"
        width={260}
        header={
          searchable ? (
            <div className="lc-create-ticket-menu__search">
              <SearchIcon />
              <input
                type="text"
                placeholder={`Search ${label.toLowerCase()}`}
                value={query}
                autoFocus
                onChange={(e) => setQuery(e.currentTarget.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ) : undefined
        }
        emptyState={searchable ? <div className="lc-create-ticket-menu__empty">No results found</div> : undefined}
        items={filtered.map((opt) => ({
          key: opt,
          label: opt,
          selected: opt === value,
          trailingIcon: opt === value ? <CheckIcon /> : undefined,
          onClick: () => onChange(opt),
        }))}
        trigger={({ ref, onClick }) => (
          <div className="lc-select__control">
            <button
              ref={ref}
              type="button"
              className="lc-select__input lc-tbm-select-trigger"
              data-placeholder={!value || undefined}
              onClick={onClick}
            >
              {value || placeholder}
            </button>
            <span className="lc-select__chevron" aria-hidden="true">
              <ChevronDownIcon />
            </span>
          </div>
        )}
      />
    </div>
  );
}

export interface TicketsBulkModifyValues {
  agent: string;
  team: string;
  status: string;
  tags: string;
  note: string;
  markStarred: boolean;
}

const DEFAULTS: TicketsBulkModifyValues = {
  agent: '',
  team: '',
  status: '',
  tags: '',
  note: '',
  markStarred: false,
};

const AGENT_OPTIONS = ['John Adams', 'Jane Cooper', 'Marcus Lee', 'Priya Nair'];
const TEAM_OPTIONS = ['Marketing', 'Support', 'Billing', 'Escalations'];
const TAG_OPTIONS = ['All Tags', 'VIP', 'Refund', 'Bug', 'Feedback'];

export interface TicketsBulkModifyModalProps {
  open: boolean;
  onClose: () => void;
  /** Number of tickets the bulk action applies to, shown in the title. */
  selectedCount: number;
  onApply?: (values: TicketsBulkModifyValues) => void;
}

export function TicketsBulkModifyModal({
  open,
  onClose,
  selectedCount,
  onApply,
}: TicketsBulkModifyModalProps) {
  const [values, setValues] = useState<TicketsBulkModifyValues>(DEFAULTS);
  const noteId = useId();

  useEffect(() => {
    if (open) setValues(DEFAULTS);
  }, [open]);

  const set = <K extends keyof TicketsBulkModifyValues>(key: K, value: TicketsBulkModifyValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <>
          <span className="lc-tbm-count">{selectedCount}</span> Ticket{selectedCount === 1 ? '' : 's'} selected
        </>
      }
      width={719}
      style={{ minHeight: 512 }}
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Button variant="subtle" color="gray" size="sm" onClick={() => setValues(DEFAULTS)}>
            Clear all
          </Button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button variant="subtle" color="gray" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="filled" color="primary" size="sm" onClick={() => onApply?.(values)}>
              Apply changes
            </Button>
          </div>
        </div>
      }
    >
      <div className="lc-tbm-row">
        <MenuSelectField
          label="Agents"
          placeholder="Assign Agents"
          options={AGENT_OPTIONS}
          value={values.agent}
          onChange={(v) => set('agent', v)}
          searchable
        />
        <MenuSelectField
          label="Teams"
          placeholder="Assign Teams"
          options={TEAM_OPTIONS}
          value={values.team}
          onChange={(v) => set('team', v)}
          searchable
        />
        <MenuSelectField
          label="Assign Status"
          placeholder="Assign Status"
          options={[...TICKETS_STATUS_OPTIONS]}
          value={values.status}
          onChange={(v) => set('status', v)}
        />
      </div>
      <NativeSelect
        label="Assign Tags"
        data={TAG_OPTIONS}
        value={values.tags || TAG_OPTIONS[0]}
        onChange={(e) => set('tags', e.currentTarget.value)}
        size="sm"
        wrapperClassName="lc-tbm-field"
        fullWidth
      />

      <div className="lc-modal__field">
        <label className="lc-modal__field-label" htmlFor={noteId}>
          Reply
        </label>
        <textarea
          id={noteId}
          className="lc-modal__textarea"
          rows={3}
          placeholder="Press Shift + Enter for a new line. Type '/' to browse canned responses."
          value={values.note}
          onChange={(e) => set('note', e.currentTarget.value)}
        />
      </div>

      <div className="lc-modal__field">
        <span className="lc-modal__field-label">Actions</span>
        <Button
          variant="outline"
          color="gray"
          size="sm"
          textTransform="none"
          leftSection={<StarIcon />}
          style={{ borderRadius: 999, alignSelf: 'flex-start' }}
          onClick={() => set('markStarred', !values.markStarred)}
        >
          Mark Starred
        </Button>
      </div>
    </Modal>
  );
}

export default TicketsBulkModifyModal;
