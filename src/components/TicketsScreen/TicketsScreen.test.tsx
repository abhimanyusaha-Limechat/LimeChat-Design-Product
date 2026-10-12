import { beforeAll, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TICKETS } from '../../data/ticketsDemo';
import { TicketsScreen, ticketMatches } from './TicketsScreen';

// jsdom has no ResizeObserver; the details panel and conversation only use it to re-measure.
beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const rowIds = () => [...document.querySelectorAll('[data-anchor="ticket-row"]')].map((r) => r.getAttribute('data-anchor-key'));
const row = (id: string) => document.querySelector<HTMLElement>(`[data-anchor="ticket-row"][data-anchor-key="${id}"]`)!;
const composer = () => screen.getByRole('textbox', { name: /Type a message/ });
const assignee = () => document.querySelector('.lc-tdp__assignee-trigger-value');
const detailsTab = (name: string) => within(screen.getAllByRole('tablist').slice(-1)[0]).getByRole('tab', { name });

describe('ticketMatches', () => {
  const ticket = TICKETS[0];
  it.each(['', '  ', ticket.user.toUpperCase(), 'still on its way', ticket.ticketId])('matches %j', (q) => {
    expect(ticketMatches(ticket, q)).toBe(true);
  });
  it('rejects a search found nowhere on the ticket', () => {
    expect(ticketMatches(ticket, 'lavender')).toBe(false);
  });
});

describe('TicketsScreen', () => {
  it('opens a ticket into the URL as a new history entry', async () => {
    const user = userEvent.setup();
    render(<TicketsScreen />);
    const before = history.length;
    await user.click(row('t-6'));
    expect(location.hash).toBe('#/helpdesk/tickets?ticket=t-6');
    expect(row('t-6')).toHaveAttribute('data-selected', 'true');
    expect(history.length).toBe(before + 1);
  });

  it('opens the ticket in the URL', () => {
    history.replaceState(null, '', '#/helpdesk/tickets?ticket=t-7');
    render(<TicketsScreen />);
    expect(row('t-7')).toHaveAttribute('data-selected', 'true');
    expect(row('t-1')).not.toHaveAttribute('data-selected');
  });

  it('starts a fresh Ticket session when the ticket changes, but keeps the details tab', async () => {
    const user = userEvent.setup();
    render(<TicketsScreen />);
    await user.type(composer(), 'Draft for John');
    await user.click(detailsTab('Orders'));

    await user.click(row('t-6'));
    expect(composer()).toHaveValue('');
    expect(detailsTab('Orders')).toHaveAttribute('aria-selected', 'true');

    await user.click(row('t-1'));
    expect(composer()).toHaveValue('');
  });

  it('starts the assignee from the ticket', async () => {
    const user = userEvent.setup();
    render(<TicketsScreen />);
    await user.click(detailsTab('Overview'));
    expect(assignee()).toHaveTextContent('Jane');
    await user.click(row('t-5')); // no assignee
    expect(assignee()).toHaveTextContent('Unassigned');
  });

  it('narrows the list by search and keeps the open conversation', async () => {
    const user = userEvent.setup();
    render(<TicketsScreen />);
    await user.type(screen.getByPlaceholderText('Search in Tickets'), 'refund');
    expect(rowIds()).toEqual(['t-3']);
    expect(composer()).toBeInTheDocument(); // t-1 (WhatsApp) is still open
    expect(location.hash).not.toContain('ticket=');
  });

  it('selects only the visible tickets', async () => {
    const user = userEvent.setup();
    render(<TicketsScreen />);
    await user.type(screen.getByPlaceholderText('Search in Tickets'), 'aditi');
    expect(rowIds()).toEqual(['t-3', 't-4']);
    await user.click(within(row('t-3')).getByRole('button', { name: 'More actions' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Select all' }));
    expect(screen.getByText('Select All').querySelector('.lc-tickets-section__selection-count')).toHaveTextContent('2');
  });
});
