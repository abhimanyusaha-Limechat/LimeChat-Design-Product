import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageBubble } from './MessageBubble';

describe('MessageBubble reactions', () => {
  it('renders no reaction UI when neither `reaction` nor `onReact` is passed', () => {
    render(<MessageBubble side="customer">Hi there</MessageBubble>);
    expect(screen.queryByRole('button', { name: 'React to message' })).not.toBeInTheDocument();
    expect(screen.queryByText('👍')).not.toBeInTheDocument();
  });

  it('renders an existing reaction as a plain, non-interactive chip when `onReact` is omitted', () => {
    render(
      <MessageBubble side="agent" reaction={{ emoji: '❤️', count: 2 }}>
        Glad that helped!
      </MessageBubble>,
    );
    expect(screen.getByText('❤️')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Change reaction' })).not.toBeInTheDocument();
  });

  it('shows the hover-reveal trigger only when `onReact` is provided', () => {
    const { rerender } = render(<MessageBubble side="customer">Hi</MessageBubble>);
    expect(screen.queryByRole('button', { name: 'React to message' })).not.toBeInTheDocument();

    rerender(
      <MessageBubble side="customer" onReact={() => {}}>
        Hi
      </MessageBubble>,
    );
    expect(screen.getByRole('button', { name: 'React to message' })).toBeInTheDocument();
  });

  it('opens a picker with the default emoji options and calls onReact with the pick', async () => {
    const user = userEvent.setup();
    const onReact = vi.fn();
    render(
      <MessageBubble side="customer" onReact={onReact}>
        Hi
      </MessageBubble>,
    );

    await user.click(screen.getByRole('button', { name: 'React to message' }));

    const picker = screen.getByRole('group', { name: 'Pick a reaction' });
    expect(picker).toBeInTheDocument();
    for (const emoji of ['👍', '❤️', '😂', '😮', '😢', '🙏']) {
      expect(screen.getByRole('button', { name: emoji })).toBeInTheDocument();
    }

    await user.click(screen.getByRole('button', { name: '❤️' }));
    expect(onReact).toHaveBeenCalledExactlyOnceWith('❤️');
    expect(screen.queryByRole('group', { name: 'Pick a reaction' })).not.toBeInTheDocument();
  });

  it('respects a custom `reactionOptions` list', async () => {
    const user = userEvent.setup();
    render(
      <MessageBubble side="customer" onReact={() => {}} reactionOptions={['🎉', '👀']}>
        Hi
      </MessageBubble>,
    );
    await user.click(screen.getByRole('button', { name: 'React to message' }));
    expect(screen.getByRole('button', { name: '🎉' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '👀' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '👍' })).not.toBeInTheDocument();
  });

  it('hides the corner trigger once a reaction exists, leaving the chip as the sole control', () => {
    render(
      <MessageBubble side="customer" onReact={() => {}} reaction={{ emoji: '👍' }}>
        Hi
      </MessageBubble>,
    );
    expect(screen.queryByRole('button', { name: 'React to message' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Change reaction' })).toBeInTheDocument();
  });

  it('clicking the existing chip reopens the picker with the current emoji marked active', async () => {
    const user = userEvent.setup();
    const onReact = vi.fn();
    render(
      <MessageBubble side="customer" onReact={onReact} reaction={{ emoji: '😮' }}>
        Hi
      </MessageBubble>,
    );

    await user.click(screen.getByRole('button', { name: 'Change reaction' }));
    const activeOption = screen.getByRole('button', { name: '😮' });
    expect(activeOption).toHaveAttribute('data-active');

    // Re-picking the active emoji reports the same emoji back — the caller (not
    // MessageBubble) owns toggle/remove semantics for what happens next.
    await user.click(activeOption);
    expect(onReact).toHaveBeenCalledExactlyOnceWith('😮');
  });

  it('offers an explicit remove control for an existing reaction', async () => {
    const user = userEvent.setup();
    const onReact = vi.fn();
    render(
      <MessageBubble side="customer" onReact={onReact} reaction={{ emoji: '🙏' }}>
        Hi
      </MessageBubble>,
    );

    await user.click(screen.getByRole('button', { name: 'Change reaction' }));
    await user.click(screen.getByRole('button', { name: 'Remove reaction' }));
    expect(onReact).toHaveBeenCalledExactlyOnceWith('🙏');
  });

  it('does not offer a remove control when no reaction is set yet', async () => {
    const user = userEvent.setup();
    render(
      <MessageBubble side="customer" onReact={() => {}}>
        Hi
      </MessageBubble>,
    );
    await user.click(screen.getByRole('button', { name: 'React to message' }));
    expect(screen.queryByRole('button', { name: 'Remove reaction' })).not.toBeInTheDocument();
  });

  it('closes the picker on outside click without calling onReact', async () => {
    const user = userEvent.setup();
    const onReact = vi.fn();
    render(
      <div>
        <button type="button">outside</button>
        <MessageBubble side="customer" onReact={onReact}>
          Hi
        </MessageBubble>
      </div>,
    );
    await user.click(screen.getByRole('button', { name: 'React to message' }));
    expect(screen.getByRole('group', { name: 'Pick a reaction' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'outside' }));
    expect(screen.queryByRole('group', { name: 'Pick a reaction' })).not.toBeInTheDocument();
    expect(onReact).not.toHaveBeenCalled();
  });

  it('closes the picker on Escape without calling onReact', async () => {
    const user = userEvent.setup();
    const onReact = vi.fn();
    render(
      <MessageBubble side="customer" onReact={onReact}>
        Hi
      </MessageBubble>,
    );
    await user.click(screen.getByRole('button', { name: 'React to message' }));
    expect(screen.getByRole('group', { name: 'Pick a reaction' })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('group', { name: 'Pick a reaction' })).not.toBeInTheDocument();
    expect(onReact).not.toHaveBeenCalled();
  });

  it('moves focus into the picker on open and back to the trigger on close', async () => {
    const user = userEvent.setup();
    render(
      <MessageBubble side="customer" onReact={() => {}}>
        Hi
      </MessageBubble>,
    );
    const trigger = screen.getByRole('button', { name: 'React to message' });
    await user.click(trigger);

    await waitFor(() => expect(screen.getByRole('button', { name: '👍' })).toHaveFocus());

    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
