import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AgentsScreen } from '../ListScreens/AgentsScreen';

/** The screen with its URL param held in state, as App does. */
function Harness({ start = '' }: { start?: string }) {
  const [id, setId] = useState(start);
  return <AgentsScreen agentId={id} onAgentChange={setId} />;
}

describe('Agent edit page', () => {
  it('opens from Customise, edits guardrails and publishes', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getAllByRole('button', { name: 'Customise' })[1]);
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Sales Agent');
    expect(screen.getByText(/^\d+ characters$/)).toBeInTheDocument();
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

  it('wraps the selected text and turns the agent off from the header switch', async () => {
    const user = userEvent.setup();
    render(<Harness start="support" />);

    const prompt = screen.getByRole('textbox', { name: 'Description (Prompt)' });
    await user.clear(prompt);
    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled();
    await user.type(prompt, 'Hello');
    await user.tripleClick(prompt);
    await user.click(screen.getByRole('button', { name: 'Bold' }));
    expect(prompt).toHaveValue('*Hello*');

    await user.click(screen.getByRole('switch', { name: 'Active' }));
    expect(screen.getByRole('switch', { name: 'Disabled' })).toBeInTheDocument();
  });
});
