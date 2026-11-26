import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TasksHomePage } from '.';
import { TASKS, TASK_AGENTS, TASK_FLOWS } from '../../data/tasksDemo';

const cards = () => [...document.querySelectorAll('[data-anchor="task-card"]')];
const chips = () => screen.getAllByRole('listitem').filter((li) => li.className === 'lc-tk__flow');

describe('TasksHomePage', () => {
  it('renders a card per task with its agent and metrics', () => {
    render(<TasksHomePage tasks={TASKS} />);

    expect(cards().map((card) => card.getAttribute('data-anchor-key'))).toEqual([
      'track-order',
      'return-or-replace',
      'product-inquiry',
      'csat',
    ]);
    expect(screen.getByRole('heading', { name: 'Track Order' })).toBeInTheDocument();
    expect(screen.getAllByText('Support Agent')).toHaveLength(3);
    expect(screen.getByLabelText('Times triggered: 987,342')).toBeInTheDocument();
    expect(screen.getByLabelText('Dropped off part-way: 18%')).toBeInTheDocument();
  });

  it('keeps the extra flow chips behind "Show more"', async () => {
    const user = userEvent.setup();
    render(<TasksHomePage tasks={[TASKS[0]]} />);
    expect(chips()).toHaveLength(5);

    await user.click(screen.getByRole('button', { name: 'Show 2 more' }));
    expect(chips()).toHaveLength(TASKS[0].flows.length);

    await user.click(screen.getByRole('button', { name: 'Show less' }));
    expect(chips()).toHaveLength(5);
  });

  it('hands the clicked task to Configure, and reports the switch', async () => {
    const user = userEvent.setup();
    const onConfigure = vi.fn();
    const onStatusChange = vi.fn();
    render(<TasksHomePage tasks={TASKS} onConfigure={onConfigure} onStatusChange={onStatusChange} />);

    await user.click(screen.getAllByRole('button', { name: 'Configure' })[1]);
    expect(onConfigure).toHaveBeenCalledWith(TASKS[1]);

    await user.click(screen.getByRole('switch', { name: 'Turn off Track Order' }));
    expect(onStatusChange).toHaveBeenCalledWith(TASKS[0], false);
  });

  it('reports what the search and the two filters are set to', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    const onAgentFilterChange = vi.fn();
    const onFlowFilterChange = vi.fn();
    render(
      <TasksHomePage
        tasks={TASKS}
        onSearchChange={onSearchChange}
        agentOptions={TASK_AGENTS}
        onAgentFilterChange={onAgentFilterChange}
        flowOptions={TASK_FLOWS}
        onFlowFilterChange={onFlowFilterChange}
      />,
    );

    await user.type(screen.getByPlaceholderText('Search by name'), 'c');
    expect(onSearchChange).toHaveBeenCalledWith('c');

    await user.selectOptions(screen.getByLabelText('Filter tasks by agent'), 'Sales Agent');
    expect(onAgentFilterChange).toHaveBeenCalledWith('Sales Agent');

    await user.selectOptions(screen.getByLabelText('Filter tasks by flow'), 'Collect Rating');
    expect(onFlowFilterChange).toHaveBeenCalledWith('Collect Rating');
  });

  it('shows placeholders while loading, an invitation when empty, and a way back when narrowed', () => {
    const { rerender } = render(<TasksHomePage tasks={[]} loading />);
    expect(cards()).toHaveLength(0);
    expect(screen.getByLabelText('Tasks')).toHaveAttribute('aria-busy', 'true');

    rerender(<TasksHomePage tasks={[]} />);
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Add task' })).toHaveLength(2);

    rerender(<TasksHomePage tasks={[]} searchValue="pricing" />);
    expect(screen.getByText('No tasks match this search')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();

    rerender(<TasksHomePage tasks={[]} agentFilter="Payment Agent" />);
    expect(screen.getByText('No tasks match these filters')).toBeInTheDocument();
  });
});
