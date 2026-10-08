/**
 * EventsTable — Settings → Events log: phone + event-name searches, a "Custom
 * Events" action and a table of received events (Event name, Phone, Created at)
 * whose payload opens in a Modal. Same toolbar/table anatomy as InboxesTable,
 * scoped to "lc-ev".
 *
 *   <EventsTable events={rows} onCustomEvents={() => openCustomEvents()} />
 *
 * Owns its two search boxes: the Settings Screen unmounts it on tab change,
 * so both reset whenever the user leaves the tab.
 */
import { useState } from 'react';
import { Button } from '../Button';
import { Modal } from '../Modal';
import { Tooltip } from '../Tooltip';
import { Icon } from '../icons';
import {
  DataTable,
  DataTableEmpty,
  DataTableHead,
  DataTableRow,
  DataTableSkeleton,
  DataTableSortHeader,
  digitsOf,
  Skeleton,
  toTimestamp,
  useTableSort,
} from '../DataTable';
import './EventsTable.css';

export interface EventRowData {
  id: string;
  name: string;
  /** Pre-formatted, e.g. "+91-6205127441". */
  phone: string;
  /** Pre-formatted, e.g. "01:45 AM, 07 October 2026". */
  createdAt: string;
  payload: Record<string, unknown>;
}

export interface EventsTableProps {
  /** Shows skeleton rows in place of the list while its data loads. */
  loading?: boolean;
  events: EventRowData[];
  onCustomEvents?: () => void;
}

export function EventsTable({ events, onCustomEvents, loading = false }: EventsTableProps) {
  const [phoneSearch, setPhoneSearch] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [openEvent, setOpenEvent] = useState<EventRowData | null>(null);

  // Phone matches on digits only, so "+91 620" and "91-620" both find "+91-6205127441".
  const phoneDigits = digitsOf(phoneSearch);
  const nameQuery = nameSearch.trim().toLowerCase();
  const visible = events.filter(
    (e) => digitsOf(e.phone).includes(phoneDigits) && e.name.toLowerCase().includes(nameQuery),
  );
  const { sorted, sort, toggle } = useTableSort(visible, (row, key: 'name' | 'phone' | 'createdAt') =>
    key === 'phone' ? Number(digitsOf(row.phone)) : key === 'createdAt' ? toTimestamp(row.createdAt) : row.name,
  );

  return (
    <div className="lc-ev">
      <div className="lc-ev__toolbar">
        <label className="lc-ev__search">
          <Icon name="search" className="lc-ev__search-icon" />
          <input
            className="lc-ev__search-input"
            type="search"
            inputMode="tel"
            aria-label="Search by phone number"
            placeholder="Search by phone number"
            value={phoneSearch}
            onChange={(e) => setPhoneSearch(e.currentTarget.value)}
          />
        </label>
        <div className="lc-ev__toolbar-end">
          <Tooltip label="Matches any part of the event name">
            <span className="lc-ev__info" tabIndex={0} aria-label="About event name search">
              <Icon name="info-circle" />
            </span>
          </Tooltip>
          <label className="lc-ev__search">
            <Icon name="search" className="lc-ev__search-icon" />
            <input
              className="lc-ev__search-input"
              type="search"
              aria-label="Search with event name"
              placeholder="Search with event name"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.currentTarget.value)}
            />
          </label>
          {onCustomEvents && (
            <Button variant="filled" color="primary" size="sm" leftSection={<Icon name="settings" />} onClick={onCustomEvents}>
              Custom Events
            </Button>
          )}
        </div>
      </div>

      <DataTable aria-busy={loading || undefined} aria-label="Events">
        <DataTableHead>
          <DataTableSortHeader className="lc-ev__cell lc-ev__cell--name" label="Event Name" sortKey="name" sort={sort} onSort={toggle} />
          <DataTableSortHeader className="lc-ev__cell lc-ev__cell--phone" label="Phone" sortKey="phone" sort={sort} onSort={toggle} />
          <DataTableSortHeader className="lc-ev__cell lc-ev__cell--date" label="Created At" sortKey="createdAt" sort={sort} onSort={toggle} />
          <div role="columnheader" className="lc-ev__cell lc-ev__cell--actions" aria-label="Actions" />
        </DataTableHead>

        {loading ? (
          <DataTableSkeleton>
            <div className="lc-ev__cell lc-ev__cell--name">
              <Skeleton />
            </div>
            <div className="lc-ev__cell lc-ev__cell--phone">
              <Skeleton />
            </div>
            <div className="lc-ev__cell lc-ev__cell--date">
              <Skeleton />
            </div>
            <div className="lc-ev__cell lc-ev__cell--actions" />
          </DataTableSkeleton>
        ) : visible.length === 0 ? (
          <DataTableEmpty>{events.length === 0 ? 'No events received yet' : 'No events found'}</DataTableEmpty>
        ) : (
          sorted.map((row) => (
            <DataTableRow key={row.id}>
              <div role="cell" className="lc-ev__cell lc-ev__cell--name lc-ev__name">{row.name}</div>
              <div role="cell" className="lc-ev__cell lc-ev__cell--phone">{row.phone}</div>
              <div role="cell" className="lc-ev__cell lc-ev__cell--date">{row.createdAt}</div>
              <div role="cell" className="lc-ev__cell lc-ev__cell--actions">
                <Button
                  variant="subtle"
                  color="primary"
                  size="xs"
                  aria-label={`View payload of ${row.name} from ${row.phone}`}
                  onClick={() => setOpenEvent(row)}
                >
                  View Payload
                </Button>
              </div>
            </DataTableRow>
          ))
        )}
      </DataTable>

      <Modal
        open={openEvent !== null}
        onClose={() => setOpenEvent(null)}
        title="Payload"
        description={openEvent && `${openEvent.name} · ${openEvent.phone} · ${openEvent.createdAt}`}
        width={560}
      >
        <pre className="lc-ev__payload">{openEvent && JSON.stringify(openEvent.payload, null, 2)}</pre>
      </Modal>
    </div>
  );
}

export default EventsTable;
