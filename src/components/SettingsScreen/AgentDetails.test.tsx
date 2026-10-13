import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { BotTemplateRow } from '../BotTemplatesTable';
import { AGENT_INBOXES } from '../../data/settingsDemo';
import { AgentDetails } from './AgentDetails';

const agent: BotTemplateRow = {
  id: 'a1',
  name: 'Arjun Malhotra',
  description: 'arjun@limechat.ai',
  type: 'task',
  usecases: [],
  industries: [],
  scope: 'account',
  phone: '+91-98497 53056',
  concurrency: 5,
  ticketLimit: 50,
  signature: 'Arjun',
  inboxes: [AGENT_INBOXES[0]],
};

describe('AgentDetails', () => {
  it('applies an added inbox right away', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AgentDetails agent={agent} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: '+ Add inbox' }));
    await user.click(screen.getByRole('menuitem', { name: AGENT_INBOXES[1].name }));

    expect(onChange).toHaveBeenCalledWith({ inboxes: [AGENT_INBOXES[0], AGENT_INBOXES[1]] });
  });

  it('edits the signature from its pencil and closes with Done', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AgentDetails agent={agent} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Edit signature' }));
    await user.type(screen.getByRole('textbox', { name: 'Signature' }), ' M');
    expect(onChange).toHaveBeenLastCalledWith({ signature: 'Arjun M' });

    await user.click(screen.getByRole('button', { name: 'Done editing signature' }));
    expect(screen.queryByRole('textbox', { name: 'Signature' })).not.toBeInTheDocument();
  });
});
