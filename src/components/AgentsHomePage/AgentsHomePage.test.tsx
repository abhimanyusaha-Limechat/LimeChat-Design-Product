import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AgentsHomePage } from '.';
import { AGENTS } from '../../data/agentsDemo';

const cards = () => [...document.querySelectorAll('[data-anchor="agent-card"]')];

describe('AgentsHomePage', () => {
  it('renders a card per agent with its status', () => {
    render(<AgentsHomePage agents={AGENTS} />);

    expect(cards().map((card) => card.getAttribute('data-anchor-key'))).toEqual(['support', 'sales', 'payment']);
    expect(screen.getByRole('heading', { name: 'Support Agent' })).toBeInTheDocument();
    expect(screen.getByText('Unsaved')).toBeInTheDocument();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });

  it('centres a single row of cards, and fills from the top beyond three', () => {
    const { rerender } = render(<AgentsHomePage agents={AGENTS} />);
    expect(screen.getByLabelText('Agents')).toHaveClass('lc-ag__grid--centered');

    rerender(<AgentsHomePage agents={[...AGENTS, { ...AGENTS[0], id: 'fourth' }]} />);
    expect(screen.getByLabelText('Agents')).not.toHaveClass('lc-ag__grid--centered');
  });

  it('hands the clicked agent to its card actions', async () => {
    const user = userEvent.setup();
    const onCustomise = vi.fn();
    const onViewTasks = vi.fn();
    render(<AgentsHomePage agents={AGENTS} onCustomise={onCustomise} onViewTasks={onViewTasks} />);

    await user.click(screen.getAllByRole('button', { name: 'Customise' })[1]);
    expect(onCustomise).toHaveBeenCalledWith(AGENTS[1]);

    await user.click(screen.getAllByRole('button', { name: 'Tasks' })[0]);
    expect(onViewTasks).toHaveBeenCalledWith(AGENTS[0]);
  });

  it('shows placeholders while loading and an invitation when there are no agents', () => {
    const { rerender } = render(<AgentsHomePage agents={[]} loading />);
    expect(cards()).toHaveLength(0);
    expect(screen.getByLabelText('Agents')).toHaveAttribute('aria-busy', 'true');

    rerender(<AgentsHomePage agents={[]} />);
    expect(screen.getByText('No agents yet')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Add agent' })).toHaveLength(2);
  });
});
