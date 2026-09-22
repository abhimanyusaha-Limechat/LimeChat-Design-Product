/**
 * CreateTicketMenu — the "+ Ticket" top-nav CTA's inbox picker.
 *
 * Clicking "+ Ticket" opens a searchable popover listing the available
 * inboxes (Whatsapp/Email); picking one starts a new ticket in that inbox.
 *
 *   <CreateTicketMenu
 *     inboxes={[{ id: 'wa-1', name: 'Support Whatsapp', type: 'whatsapp' }]}
 *     onSelectInbox={(inbox) => createTicket(inbox)}
 *   />
 */
import { useMemo, useState } from 'react';
import { Menu } from '../Menu';
import { Button } from '../Button';
import { TopNavIcon } from './icons';
import './CreateTicketMenu.css';

export type TicketInboxType = 'whatsapp' | 'email';

export interface TicketInboxOption {
  id: string;
  name: string;
  type: TicketInboxType;
}

export interface CreateTicketMenuProps {
  inboxes: TicketInboxOption[];
  onSelectInbox: (inbox: TicketInboxOption) => void;
}

export function CreateTicketMenu({ inboxes, onSelectInbox }: CreateTicketMenuProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? inboxes.filter((inbox) => inbox.name.toLowerCase().includes(q)) : inboxes;
  }, [inboxes, query]);

  return (
    <Menu
      ariaLabel="Select an inbox"
      align="end"
      width={240}
      className="lc-create-ticket-menu"
      header={
        <div className="lc-create-ticket-menu__search">
          <TopNavIcon name="search" />
          <input
            type="text"
            placeholder="Search inboxes"
            value={query}
            autoFocus
            onChange={(e) => setQuery(e.currentTarget.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      }
      emptyState={<div className="lc-create-ticket-menu__empty">No inboxes found</div>}
      items={filtered.map((inbox) => ({
        key: inbox.id,
        label: inbox.name,
        icon: <TopNavIcon name={inbox.type} />,
        onClick: () => onSelectInbox(inbox),
      }))}
      trigger={({ ref, onClick }) => (
        <Button
          ref={ref}
          variant="default"
          size="sm"
          textTransform="none"
          leftSection={<TopNavIcon name="plus" />}
          onClick={onClick}
        >
          Ticket
        </Button>
      )}
    />
  );
}

export default CreateTicketMenu;
