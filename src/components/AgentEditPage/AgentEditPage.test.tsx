import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AgentsScreen } from '../ListScreens/AgentsScreen';

/** The screen with its URL param held in state, as App does. */
function Harness({ start = '' }: { start?: string }) {
  const [id, setId] = useState(start);
  return <AgentsScreen agentId={id} onAgentChange={setId} />;
}

describe('Agent edit page', () => {
  it('opens from Customise, edits guardrails and updates', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getAllByRole('button', { name: 'Customise' })[1]);
    expect(screen.getByRole('heading', { name: 'Sales Agent' })).toBeInTheDocument();
    expect(screen.getAllByLabelText(/^Guardrail \d$/)).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: 'Add Guardrail' }));
    expect(screen.getAllByLabelText(/^Guardrail \d$/)).toHaveLength(3);
    await user.click(screen.getByRole('button', { name: 'Delete guardrail 3' }));
    await user.click(screen.getByRole('button', { name: 'Delete guardrail 1' }));
    expect(screen.getAllByLabelText(/^Guardrail \d$/)).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Publish' }));
    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.queryByText('Unsaved')).not.toBeInTheDocument();
  });

  it('shows the prompt in its card and edits it behind the edit button', async () => {
    const user = userEvent.setup();
    render(<Harness start="support" />);

    expect(screen.getByRole('heading', { name: 'Prompt/Instruction' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Description (Prompt)' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit prompt' }));
    const prompt = screen.getByRole('textbox', { name: 'Description (Prompt)' });
    expect(screen.getByText(/^\d+ characters$/)).toBeInTheDocument();

    await user.clear(prompt);
    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled();

    await user.type(prompt, 'Hello');
    await user.tripleClick(prompt);
    await user.click(screen.getByRole('button', { name: 'Bold' }));
    expect(prompt).toHaveValue('*Hello*');
  });

  it('adds and removes trigger examples, falling back to the AI empty state', async () => {
    const user = userEvent.setup();
    render(<Harness start="payment" />);

    // The Payment agent starts with two examples, so the empty state is hidden and the
    // AI shortcut sits in the section heading instead.
    expect(screen.queryByText(/Create triggers manually/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /AI suggested triggers/ })).toBeInTheDocument();

    const box = screen.getByRole('textbox', { name: 'Add trigger example' });
    await user.type(box, 'Refund not received{Enter}');
    expect(screen.getByText('Refund not received')).toBeInTheDocument();

    for (const label of ['Remove My payment failed', 'Remove Where is my refund?', 'Remove Refund not received']) {
      await user.click(screen.getByRole('button', { name: label }));
    }
    expect(screen.getByText(/Create triggers manually/)).toBeInTheDocument();
  });

  it('renames the agent from the overflow menu, not from the heading', async () => {
    const user = userEvent.setup();
    render(<Harness start="support" />);

    // The title is a heading now — there is no name text box on the page.
    expect(screen.queryByRole('textbox', { name: 'Title' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Support Agent' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'More agent actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Rename agent' }));

    const field = screen.getByLabelText(/Agent name/);
    await user.clear(field);
    await user.type(field, 'Post-purchase Agent');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByRole('heading', { name: 'Post-purchase Agent' })).toBeInTheDocument();
  });

  it('opens publish history from the overflow menu and closes it again', async () => {
    const user = userEvent.setup();
    render(<Harness start="support" />);

    expect(screen.queryByRole('dialog', { name: 'Publish History' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'More agent actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'See publish history' }));

    const panel = screen.getByRole('dialog', { name: 'Publish History' });
    // The Current card is not one of the publishes: it names who has the agent open, carries no
    // timestamp, and offers a snapshot download of its own.
    const currentCard = within(panel).getByRole('region', { name: 'Current version' });
    expect(within(currentCard).getByText('Arjun Mehta is editing')).toBeInTheDocument();
    expect(within(currentCard).getByText('Current')).toBeInTheDocument();
    expect(within(currentCard).getByRole('button', { name: 'Download the current snapshot' })).toBeInTheDocument();

    // Below it, the publishes. Restoring is not offered here — it lives on the banner once a
    // version is on screen — but every row can be viewed and downloaded.
    expect(within(panel).getAllByRole('listitem')).toHaveLength(12);
    // A day takes a whole number and each further publish that day adds a decimal.
    expect(within(panel).getByText('v9.3')).toBeInTheDocument();
    expect(within(panel).getByText('v9.2')).toBeInTheDocument();
    expect(within(panel).getByText('v9')).toBeInTheDocument();
    expect(within(panel).queryByRole('button', { name: 'Restore' })).not.toBeInTheDocument();
    expect(within(panel).getAllByRole('button', { name: /^View the version published/ })).toHaveLength(12);
    expect(within(panel).getAllByRole('button', { name: /^Download version from/ })).toHaveLength(12);

    await user.click(screen.getByRole('button', { name: 'Close publish history' }));
    expect(screen.queryByRole('dialog', { name: 'Publish History' })).not.toBeInTheDocument();
  });

  it('loads a past version read-only and restores it from the banner', async () => {
    const user = userEvent.setup();
    render(<Harness start="support" />);

    await user.click(screen.getByRole('button', { name: 'More agent actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'See publish history' }));

    await user.click(screen.getByRole('button', { name: /published 4:10 pm, 28th Jul/ }));

    // It loads through its steps first rather than appearing straight away.
    expect(screen.getByText('Analyzing the Agent...')).toBeInTheDocument();
    expect(screen.queryByText('I want a refund')).not.toBeInTheDocument();

    await screen.findByText('Viewing v7', {}, { timeout: 5000 });
    const banner = screen.getByRole('status');
    expect(within(banner).getByText(/Rajeev Sanyal/)).toBeInTheDocument();
    expect(within(banner).getByText(/Publish your current changes first/)).toBeInTheDocument();

    // That version's setup replaces the live one, and nothing on it can be edited.
    expect(screen.getByText('I want a refund')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Add trigger example' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add Guardrail' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled();

    // The second publish of a day carries that day's decimal.
    await user.click(screen.getByRole('button', { name: /published 4:05 pm, 1st Aug/ }));
    await screen.findByText('Viewing v8.2', {}, { timeout: 5000 });

    await user.click(screen.getByRole('button', { name: 'Restore this version' }));
    expect(screen.queryByText('Viewing v8.2')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publish' })).toBeEnabled();
    // The restored setup is now the editable draft.
    expect(screen.getAllByLabelText(/^Guardrail \d$/)).toHaveLength(2);
  }, 20000);

  it('keeps the previewed version when the panel closes, and leaves it from the banner', async () => {
    const user = userEvent.setup();
    render(<Harness start="support" />);

    await user.click(screen.getByRole('button', { name: 'More agent actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'See publish history' }));
    await user.click(screen.getByRole('button', { name: /published 4:10 pm, 28th Jul/ }));
    await screen.findByText('Viewing v7', {}, { timeout: 5000 });

    // Closing the list is not leaving the version: the page still shows v7, read-only.
    await user.click(screen.getByRole('button', { name: 'Close publish history' }));
    expect(screen.queryByRole('dialog', { name: 'Publish History' })).not.toBeInTheDocument();
    expect(screen.getByText('Viewing v7')).toBeInTheDocument();
    expect(screen.getByText('I want a refund')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Add trigger example' })).not.toBeInTheDocument();

    // The banner holds the ways out — Dismiss, and the × beside it.
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByText('Viewing v7')).not.toBeInTheDocument();
    expect(screen.queryByText('I want a refund')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Add trigger example' })).toBeInTheDocument();
  }, 20000);

  it('turns the agent off from the switch on the tab row', async () => {
    const user = userEvent.setup();
    render(<Harness start="support" />);

    await user.click(screen.getByRole('switch', { name: 'Active' }));
    expect(screen.getByRole('switch', { name: 'Disabled' })).toBeInTheDocument();
  });
});
