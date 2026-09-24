import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketDetailsPanel } from './TicketDetailsPanel';

describe('TicketDetailsPanel assignment', () => {
  it('offers each picker its own options — teams for team, agents for agent', async () => {
    const user = userEvent.setup();
    const onTeamChange = vi.fn();
    render(
      <TicketDetailsPanel
        ticketId="100230"
        agent={{ value: '', options: ['Jane Doe', 'Marcus Lee'] }}
        team={{ value: 'Support', options: ['Support', 'Sales'], onChange: onTeamChange }}
      />,
    );

    expect(screen.getByText('Unassigned')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /support/i }));
    const menu = screen.getByRole('menu');
    expect(within(menu).getByText('Sales')).toBeInTheDocument();
    expect(within(menu).queryByText('Jane Doe')).not.toBeInTheDocument();

    await user.click(within(menu).getByText('Sales'));
    expect(onTeamChange).toHaveBeenCalledWith('Sales');
  });
});
