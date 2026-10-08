import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventsTable, type EventRowData } from './EventsTable';

const row = (id: string, name: string, phone: string): EventRowData => ({
  id, name, phone, createdAt: '01:45 AM, 07 October 2026', payload: { event: name },
});
const events = [row('1', 'test_var', '+91-6205127441'), row('2', 'order_placed', '+91-9876543210')];

describe('EventsTable', () => {
  it('filters by phone digits and event name, and shows an empty row', async () => {
    const user = userEvent.setup();
    render(<EventsTable events={events} />);

    await user.type(screen.getByRole('searchbox', { name: 'Search by phone number' }), '91 620');
    expect(screen.getByText('test_var')).toBeInTheDocument();
    expect(screen.queryByText('order_placed')).not.toBeInTheDocument();

    await user.type(screen.getByRole('searchbox', { name: 'Search with event name' }), 'order');
    expect(screen.getByText('No events found')).toBeInTheDocument();
  });

  it('opens the payload of a row', async () => {
    const user = userEvent.setup();
    render(<EventsTable events={events} />);

    await user.click(screen.getByRole('button', { name: /View payload of order_placed/ }));
    expect(screen.getByRole('dialog')).toHaveTextContent('"event": "order_placed"');
  });
});
