/**
 * ContactsScreen — HelpDesk → Contacts: a searchable list of contacts
 * (Name, Phone number, Tickets) in the Settings page layout, without its tab list.
 * A dropdown left of the search box picks which field the search matches.
 */
import { useState } from 'react';
import { useDemoLoading } from '../../hooks/useDemoLoading';
import { SettingsPage } from '../SettingsPage';
import { BotTemplatesTable, type BotTemplateRow } from '../BotTemplatesTable';
import { digitsOf } from '../DataTable';
import { Button } from '../Button';
import { Icon } from '../icons';
import { CONTACT_TAGS, DEMO_CONTACTS } from '../../data/contactsDemo';

export type ContactSearchField = 'phone' | 'email' | 'name' | 'instagram';

const SEARCH_BY: { value: ContactSearchField; label: string }[] = [
  { value: 'phone', label: 'Phone number' },
  { value: 'email', label: 'Email' },
  { value: 'name', label: 'Name' },
  { value: 'instagram', label: 'Instagram username' },
];

/**
 * Whether `contact` matches `search` in the chosen field. An empty search matches everyone.
 * Phone compares digits only ("98201 44" finds "+91-98201 44312"); Instagram ignores a leading "@".
 */
export function contactMatches(contact: BotTemplateRow, field: ContactSearchField, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (q === '') return true;
  switch (field) {
    case 'phone': {
      const digits = digitsOf(q);
      return digits !== '' && digitsOf(contact.phone ?? '').includes(digits);
    }
    case 'email':
      return contact.description.toLowerCase().includes(q);
    case 'name':
      return contact.name.toLowerCase().includes(q);
    case 'instagram':
      return (contact.instagram ?? '').toLowerCase().includes(q.replace(/^@/, ''));
  }
}

export function ContactsScreen() {
  const [search, setSearch] = useState('');
  const [searchBy, setSearchBy] = useState<ContactSearchField>('phone');
  const [tag, setTag] = useState('all');
  const loading = useDemoLoading('contacts');
  const contacts = DEMO_CONTACTS.filter(
    (c) => contactMatches(c, searchBy, search) && (tag === 'all' || !!c.tags?.includes(tag)),
  );
  const label = SEARCH_BY.find((o) => o.value === searchBy)?.label.toLowerCase();

  return (
    <SettingsPage
      title="Contacts"
      description="Manage your contacts and see how many tickets each has raised."
      onWatchVideo={() => alert('Play tutorial video: Contacts')}
      onViewDocs={() => alert('Open docs: Contacts')}
      headerActions={
        <Button variant="filled" color="primary" size="sm" leftSection={<Icon name="download" />} onClick={() => alert('Download contacts data')}>
          Download data
        </Button>
      }
    >
      <BotTemplatesTable
        variant="contacts"
        hideFilters
        searchBy={{
          options: SEARCH_BY,
          value: searchBy,
          onChange: (value) => setSearchBy(value as ContactSearchField),
        }}
        selects={[
          {
            ariaLabel: 'Filter by tag',
            options: [{ value: 'all', label: 'Tags' }, ...CONTACT_TAGS.map((t) => ({ value: t, label: t }))],
            value: tag,
            onChange: setTag,
          },
        ]}
        searchPlaceholder={`Search by ${label}`}
        searchValue={search}
        onSearchChange={setSearch}
        templates={contacts}
        loading={loading}
      />
    </SettingsPage>
  );
}

export default ContactsScreen;
