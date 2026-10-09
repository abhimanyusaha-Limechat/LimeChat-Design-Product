import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InboxesTable, type InboxesTableProps } from './InboxesTable';
import type { InboxAgent, InboxRowData } from './inboxes';

const aarav: InboxAgent = { id: 'c1', name: 'Aarav Mehta', email: 'aarav@limechat.ai', role: 'Admin' };
const isha: InboxAgent = { id: 'c2', name: 'Isha Kapoor', email: 'isha@limechat.ai', role: 'Editor' };
const rohan: InboxAgent = { id: 'c3', name: 'Rohan Iyer', email: 'rohan@limechat.ai', role: 'Viewer' };
const agents = [aarav, isha, rohan];

const row = (patch: Partial<InboxRowData>): InboxRowData => ({
  id: '36000',
  name: 'Nimbus Coffee Orders',
  type: 'whatsapp',
  identifier: '+91 98000 10000',
  metaId: 'N/A',
  createdOn: '05:18 AM, 06 April 2026',
  status: 'connected',
  members: [aarav],
  ...patch,
});

const rows = [
  row({ id: '36000', name: 'Nimbus Coffee Orders' }),
  row({ id: '36421', name: 'Lantern Books', type: 'email', status: 'incomplete', members: [] }),
  row({ id: '36842', name: 'Saffron House Bookings', status: 'needs-reauth' }),
];

const setup = (props: Partial<InboxesTableProps> = {}) => {
  const user = userEvent.setup();
  render(<InboxesTable inboxes={rows} agents={agents} {...props} />);
  return user;
};

const rowOf = (name: string) => screen.getByRole('row', { name: new RegExp(name) });

describe('InboxesTable row actions', () => {
  it('opens on row click and on Enter, but not from the menu button', async () => {
    const onOpen = vi.fn();
    const user = setup({ onOpen });

    await user.click(screen.getByText('Lantern Books'));
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenLastCalledWith(rows[1]);

    await user.click(screen.getByRole('button', { name: 'Actions for Lantern Books' }));
    expect(onOpen).toHaveBeenCalledTimes(1);

    await user.keyboard('{Escape}');
    rowOf('Nimbus').focus();
    await user.keyboard('{Enter}');
    expect(onOpen).toHaveBeenCalledTimes(2);
    expect(onOpen).toHaveBeenLastCalledWith(rows[0]);
  });

  it('offers Reauthorize only for an inbox that needs it', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Actions for Nimbus Coffee Orders' }));
    expect(screen.queryByRole('menuitem', { name: 'Reauthorize' })).not.toBeInTheDocument();
    await user.keyboard('{Escape}');

    await user.click(screen.getByRole('button', { name: 'Actions for Saffron House Bookings' }));
    expect(screen.getByRole('menuitem', { name: 'Reauthorize' })).toBeInTheDocument();
  });

  it('deletes only after the confirm, and Cancel keeps the inbox', async () => {
    const onDelete = vi.fn();
    const user = setup({ onDelete });

    await user.click(screen.getByRole('button', { name: 'Actions for Lantern Books' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(onDelete).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onDelete).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Actions for Lantern Books' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Delete inbox' }));
    expect(onDelete).toHaveBeenCalledWith(rows[1]);
  });
});

describe('InboxesTable list', () => {
  it('has no status, created or id columns, and no copy-id chip', () => {
    setup();
    const headers = within(screen.getByRole('table', { name: 'Inboxes' })).getAllByRole('columnheader').map((h) => h.textContent || h.getAttribute('aria-label'));
    expect(headers).toEqual(['Name', 'Channel', 'Members', 'Actions']);
    expect(screen.queryByRole('button', { name: /Copy ID/ })).not.toBeInTheDocument();
  });

  it('shows status on the icon, and attention text only when needed', () => {
    setup();
    expect(rowOf('Nimbus')).not.toHaveTextContent(/Needs|incomplete/i);
    expect(within(rowOf('Nimbus')).getByRole('img', { name: 'WhatsApp, Connected' })).toBeInTheDocument();
    expect(rowOf('Lantern')).toHaveTextContent('Setup incomplete');
    expect(within(rowOf('Saffron')).getByRole('img', { name: 'WhatsApp, Needs reauthorization' })).toBeInTheDocument();
    expect(rowOf('Saffron')).toHaveTextContent('Needs reauthorization');
  });
});

describe('InboxesTable panel', () => {
  const panel = () => screen.getByRole('complementary');

  it('shows nothing when no inbox is open, or the id is unknown', () => {
    setup({ openId: 'nope' });
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });

  it('shows the inbox, its collaborators and the actions', () => {
    setup({ openId: '36000' });
    expect(panel()).toHaveAccessibleName('Nimbus Coffee Orders');
    expect(within(panel()).getByText('Aarav Mehta')).toBeInTheDocument();
    expect(within(panel()).getByText('aarav@limechat.ai · Admin')).toBeInTheDocument();
    expect(within(panel()).getByRole('button', { name: 'Open settings' })).toBeInTheDocument();
    expect(within(panel()).queryByRole('button', { name: 'Reauthorize' })).not.toBeInTheDocument();
    expect(within(panel()).getByRole('button', { name: 'Delete inbox' })).toBeInTheDocument();
  });

  it('moves focus into the panel and returns it to the row on close', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    const view = render(<InboxesTable inboxes={rows} agents={agents} onClose={onClose} />);
    const target = rowOf('Nimbus');
    target.focus();
    view.rerender(<InboxesTable inboxes={rows} agents={agents} openId="36000" onClose={onClose} />);
    expect(panel()).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
    view.rerender(<InboxesTable inboxes={rows} agents={agents} onClose={onClose} />);
    expect(target).toHaveFocus();
  });

  it('closes with the close button', async () => {
    const onClose = vi.fn();
    const user = setup({ openId: '36000', onClose });
    await user.click(screen.getByRole('button', { name: 'Close panel' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows Reauthorize only for an inbox that needs it', async () => {
    const onReauthorize = vi.fn();
    const user = setup({ openId: '36842', onReauthorize });
    await user.click(within(panel()).getByRole('button', { name: 'Reauthorize' }));
    expect(onReauthorize).toHaveBeenCalledWith(rows[2]);
  });

  it('opens settings', async () => {
    const onOpenSettings = vi.fn();
    const user = setup({ openId: '36000', onOpenSettings });
    await user.click(within(panel()).getByRole('button', { name: 'Open settings' }));
    expect(onOpenSettings).toHaveBeenCalledWith(rows[0]);
  });

  it('searches collaborators and shows the empty states', async () => {
    const user = setup({ openId: '36000' });
    const search = within(panel()).getByRole('textbox', { name: 'Search collaborators' });
    await user.type(search, 'zzz');
    expect(within(panel()).getByText('No one matches your search.')).toBeInTheDocument();
  });

  it('shows an empty state when the inbox has no collaborators', () => {
    setup({ openId: '36421' });
    expect(within(panel()).getByText('No collaborators yet.')).toBeInTheDocument();
  });

  it('removes a collaborator', async () => {
    const onRemoveMember = vi.fn();
    const user = setup({ openId: '36000', onRemoveMember });
    await user.click(within(panel()).getByRole('button', { name: 'Remove Aarav Mehta from this inbox' }));
    expect(onRemoveMember).toHaveBeenCalledWith(rows[0], aarav);
  });

  it('adds only agents not yet on the inbox, searchable, and Esc steps back before closing', async () => {
    const onAddMember = vi.fn();
    const onClose = vi.fn();
    const user = setup({ openId: '36000', onAddMember, onClose });
    await user.click(within(panel()).getByRole('button', { name: 'Add collaborators' }));

    expect(within(panel()).queryByText('Aarav Mehta')).not.toBeInTheDocument();
    await user.type(within(panel()).getByRole('textbox', { name: 'Search agents' }), 'rohan');
    expect(within(panel()).queryByText('Isha Kapoor')).not.toBeInTheDocument();
    await user.click(within(panel()).getByRole('button', { name: 'Add Rohan Iyer' }));
    expect(onAddMember).toHaveBeenCalledWith(rows[0], rohan);

    await user.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
    expect(within(panel()).getByText('Aarav Mehta')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('deletes from the panel through the confirm', async () => {
    const onDelete = vi.fn();
    const user = setup({ openId: '36000', onDelete });
    await user.click(within(panel()).getByRole('button', { name: 'Delete inbox' }));
    expect(onDelete).not.toHaveBeenCalled();
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete inbox' }));
    expect(onDelete).toHaveBeenCalledWith(rows[0]);
  });

  it('highlights the open inbox row', () => {
    setup({ openId: '36000' });
    expect(rowOf('Nimbus')).toHaveAttribute('data-selected', 'true');
    expect(rowOf('Lantern')).not.toHaveAttribute('data-selected');
  });
});

describe('InboxesTable filtering and states', () => {
  it('filters by channel and offers Clear filters when nothing matches', async () => {
    const onSearchChange = vi.fn();
    const user = setup({ searchValue: 'zzz', onSearchChange });

    expect(screen.getByText('No inboxes match your filters')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(onSearchChange).toHaveBeenCalledWith('');
  });

  it('narrows the list with a channel chip', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: /^Email/ }));
    const table = screen.getByRole('table', { name: 'Inboxes' });
    expect(within(table).getByText('Lantern Books')).toBeInTheDocument();
    expect(within(table).queryByText('Nimbus Coffee Orders')).not.toBeInTheDocument();
  });

  it('shows a create action on a first-run empty list', async () => {
    const onCreate = vi.fn();
    const user = setup({ inboxes: [], onCreate });
    await user.click(screen.getByRole('button', { name: 'New inbox' }));
    expect(onCreate).toHaveBeenCalled();
  });

  it('shows the error state with a working retry', async () => {
    const onRetry = vi.fn();
    const user = setup({ error: true, onRetry });
    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load inboxes.");
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('focuses search on "/" unless already typing', async () => {
    const user = setup();
    await user.keyboard('/');
    const search = screen.getByRole('textbox', { name: 'Search inboxes' });
    expect(search).toHaveFocus();
    await user.keyboard('a/');
    expect(search).toHaveValue('');
  });
});

describe('InboxesTable header sorting', () => {
  const order = () => screen.getAllByRole('row').map((r) => r.textContent ?? '').filter((x) => /Lantern|Nimbus|Saffron/.test(x)).map((x) => x.match(/Lantern|Nimbus|Saffron/)![0]);
  const header = (name: string) => screen.getByRole('columnheader', { name });

  it('sorts from the header buttons and sets aria-sort', async () => {
    const user = setup();
    expect(order()).toEqual(['Nimbus', 'Lantern', 'Saffron']);
    expect(header('Name')).not.toHaveAttribute('aria-sort');

    await user.click(screen.getByRole('button', { name: 'Name' }));
    expect(order()).toEqual(['Lantern', 'Nimbus', 'Saffron']);
    expect(header('Name')).toHaveAttribute('aria-sort', 'ascending');

    await user.click(screen.getByRole('button', { name: 'Name' }));
    expect(order()).toEqual(['Saffron', 'Nimbus', 'Lantern']);
    expect(header('Name')).toHaveAttribute('aria-sort', 'descending');

    await user.click(screen.getByRole('button', { name: 'Name' }));
    expect(order()).toEqual(['Nimbus', 'Lantern', 'Saffron']);
    expect(header('Name')).not.toHaveAttribute('aria-sort');
  });

  it('sorts by channel and members, moving aria-sort to the active column', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Members' }));
    expect(order()[0]).toBe('Lantern'); // no members
    await user.click(screen.getByRole('button', { name: 'Channel' }));
    expect(header('Channel')).toHaveAttribute('aria-sort', 'ascending');
    expect(header('Members')).not.toHaveAttribute('aria-sort');
    expect(order()[0]).toBe('Lantern'); // Email before WhatsApp
  });
});

describe('InboxesTable loading', () => {
  it('shows card skeleton rows and no inbox rows', () => {
    setup({ loading: true });
    expect(screen.getByRole('table', { name: 'Inboxes' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('Lantern Books')).not.toBeInTheDocument();
    expect(document.querySelectorAll('.lc-dt__row--skeleton').length).toBeGreaterThan(0);
  });
});
