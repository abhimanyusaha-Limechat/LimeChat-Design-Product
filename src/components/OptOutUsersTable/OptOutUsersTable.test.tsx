import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OptOutUsersTable, type OptOutUserRowData } from './OptOutUsersTable';

const users: OptOutUserRowData[] = [
  { id: '1', name: 'Aarav Mehta', phone: '+91-6205127441' },
  { id: '2', name: 'Isha Kapoor', phone: '+91-9876543210' },
];

describe('OptOutUsersTable', () => {
  it('filters by phone digits and shows an empty row', async () => {
    const user = userEvent.setup();
    render(<OptOutUsersTable users={users} />);

    const search = screen.getByRole('searchbox', { name: 'Search by phone number' });
    await user.type(search, '91 620');
    expect(screen.getByText('+91-6205127441')).toBeInTheDocument();
    expect(screen.queryByText('+91-9876543210')).not.toBeInTheDocument();

    await user.type(search, '0000');
    expect(screen.getByText('No users found')).toBeInTheDocument();
  });

});
