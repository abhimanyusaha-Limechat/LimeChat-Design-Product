import { beforeAll, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TasksScreen } from '../ListScreens/TasksScreen';

// jsdom has no ResizeObserver; the tab indicator only uses it to re-measure.
beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const open = (hash: string) => history.replaceState(null, '', hash);
const flowRows = () => [...document.querySelectorAll('[data-anchor="task-flow-row"]')];

describe('Task edit page', () => {
  it('opens from Configure and shows the task its own General tab', async () => {
    const user = userEvent.setup();
    open('#/automation/tasks');
    render(<TasksScreen />);

    await user.click(screen.getAllByRole('button', { name: 'Configure' })[0]);
    expect(location.hash).toBe('#/automation/tasks?task=track-order');
    expect(screen.getByRole('heading', { name: 'Track Order' })).toBeInTheDocument();
    expect(screen.getByLabelText('Agent linked')).toHaveValue('Support Agent');
    expect(screen.getByRole('heading', { name: 'Task Guardrails' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Custom Instructions for flows' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Prompt/Instruction' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(location.hash).toBe('#/automation/tasks');
  });

  it('keeps Update disabled until something is edited', async () => {
    const user = userEvent.setup();
    open('#/automation/tasks?task=track-order');
    render(<TasksScreen />);
    expect(screen.getByRole('button', { name: 'Update' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Add Guardrail' }));
    expect(screen.getByRole('button', { name: 'Update' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Update' }));
    expect(screen.getByRole('button', { name: 'Update' })).toBeDisabled();
  });

  it('edits the guardrails and the flow instructions separately', async () => {
    const user = userEvent.setup();
    open('#/automation/tasks?task=track-order');
    render(<TasksScreen />);
    expect(screen.getAllByLabelText(/^Guardrail \d$/)).toHaveLength(2);
    expect(screen.getAllByLabelText(/^Instruction \d$/)).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: 'Delete guardrail 1' }));
    expect(screen.getAllByLabelText(/^Guardrail \d$/)).toHaveLength(1);
    expect(screen.getAllByLabelText(/^Instruction \d$/)).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: 'Add Instruction' }));
    expect(screen.getAllByLabelText(/^Instruction \d$/)).toHaveLength(3);
  });

  it('lists the task flows, edits a trigger and switches one off', async () => {
    const user = userEvent.setup();
    open('#/automation/tasks?task=track-order');
    render(<TasksScreen />);

    await user.click(screen.getByRole('tab', { name: 'Flows' }));
    expect(flowRows()).toHaveLength(7);
    expect(screen.getByText('Thinking flow')).toBeInTheDocument();

    const trigger = screen.getByLabelText('When to trigger Track Order Status');
    await user.clear(trigger);
    await user.type(trigger, 'Order found');
    expect(trigger).toHaveValue('Order found');

    await user.click(screen.getByRole('switch', { name: 'Turn off Collect Phone Number' }));
    expect(screen.getByRole('switch', { name: 'Turn on Collect Phone Number' })).toBeInTheDocument();
  });

  it('adds a sub flow and removes one from the task', async () => {
    const user = userEvent.setup();
    open('#/automation/tasks?task=csat');
    render(<TasksScreen />);

    await user.click(screen.getByRole('tab', { name: 'Flows' }));
    expect(flowRows()).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();

    await user.selectOptions(screen.getByLabelText('Search or select a sub flow'), 'Order Feedback Survey');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(flowRows()).toHaveLength(3);
    expect(screen.getByLabelText('When to trigger Order Feedback Survey')).toHaveValue('');

    await user.click(screen.getByRole('button', { name: 'More actions for Order Feedback Survey' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove from task' }));
    expect(flowRows()).toHaveLength(2);
  });

  it('renames the task from the overflow menu', async () => {
    const user = userEvent.setup();
    open('#/automation/tasks?task=csat');
    render(<TasksScreen />);

    await user.click(screen.getByRole('button', { name: 'More task actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Rename task' }));
    const field = screen.getByRole('textbox', { name: /Task name/ });
    await user.clear(field);
    await user.type(field, 'Satisfaction survey');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByRole('heading', { name: 'Satisfaction survey' })).toBeInTheDocument();
  });
});
