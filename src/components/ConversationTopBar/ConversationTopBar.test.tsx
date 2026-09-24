import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConversationTopBar } from './ConversationTopBar';

describe('ConversationTopBar', () => {
  it('renders a single call control, and it is wired', async () => {
    const user = userEvent.setup();
    const onCall = vi.fn();
    render(<ConversationTopBar name="John" onCall={onCall} />);

    const callButtons = screen.getAllByRole('button', { name: /call/i });
    expect(callButtons).toHaveLength(1);
    await user.click(callButtons[0]);
    expect(onCall).toHaveBeenCalledTimes(1);
  });

  it('applies a status straight from the split menu and never offers "Resolve" twice', async () => {
    const user = userEvent.setup();
    const onResolve = vi.fn();
    const onResolveStatusChange = vi.fn();
    render(<ConversationTopBar name="John" onResolve={onResolve} onResolveStatusChange={onResolveStatusChange} />);

    await user.click(screen.getByRole('button', { name: 'More resolve options' }));
    expect(screen.queryByRole('menuitem', { name: /^resolve$/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: /waiting/i }));

    expect(onResolveStatusChange).toHaveBeenCalledWith('Waiting');
    expect(onResolve).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Resolve' })).toBeInTheDocument();
  });
});
