/**
 * OptOutUsersTable — Settings → Opt out users: a phone search and a table of
 * opted-out users (Name, Phone number). Same toolbar/table anatomy as
 * EventsTable, and reuses its "lc-ev" styles rather than copying them.
 *
 *   <OptOutUsersTable users={rows} />
 *
 * Owns its search box: the Settings Screen unmounts it on tab change, so the
 * search resets whenever the user leaves the tab.
 */
import { useState } from 'react';
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
  useTableSort,
} from '../DataTable';
import '../EventsTable/EventsTable.css';

export interface OptOutUserRowData {
  id: string;
  name: string;
  /** Pre-formatted, e.g. "+91-6205127441". */
  phone: string;
}

export interface OptOutUsersTableProps {
  /** Shows skeleton rows in place of the list while its data loads. */
  loading?: boolean;
  users: OptOutUserRowData[];
}

export function OptOutUsersTable({ users, loading = false }: OptOutUsersTableProps) {
  const [phoneSearch, setPhoneSearch] = useState('');

  // Phone matches on digits only, so "+91 620" and "91-620" both find "+91-6205127441".
  const phoneDigits = digitsOf(phoneSearch);
  const visible = users.filter((u) => digitsOf(u.phone).includes(phoneDigits));
  const { sorted, sort, toggle } = useTableSort(visible, (row, key: 'name' | 'phone') =>
    key === 'phone' ? Number(digitsOf(row.phone)) : row.name,
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
      </div>

      <DataTable aria-busy={loading || undefined} aria-label="Opt out users">
        <DataTableHead>
          <DataTableSortHeader className="lc-ev__cell lc-ev__cell--name" label="Name" sortKey="name" sort={sort} onSort={toggle} />
          <DataTableSortHeader className="lc-ev__cell lc-ev__cell--phone lc-ev__cell--end" label="Phone Number" sortKey="phone" sort={sort} onSort={toggle} />
        </DataTableHead>

        {loading ? (
          <DataTableSkeleton>
            <div className="lc-ev__cell lc-ev__cell--name">
              <Skeleton />
            </div>
            <div className="lc-ev__cell lc-ev__cell--phone">
              <Skeleton />
            </div>
          </DataTableSkeleton>
        ) : visible.length === 0 ? (
          <DataTableEmpty>{users.length === 0 ? 'No users have opted out yet' : 'No users found'}</DataTableEmpty>
        ) : (
          sorted.map((row) => (
            <DataTableRow key={row.id}>
              <div role="cell" className="lc-ev__cell lc-ev__cell--name lc-ev__name">{row.name}</div>
              <div role="cell" className="lc-ev__cell lc-ev__cell--phone lc-ev__cell--end">{row.phone}</div>
            </DataTableRow>
          ))
        )}
      </DataTable>
    </div>
  );
}

export default OptOutUsersTable;
