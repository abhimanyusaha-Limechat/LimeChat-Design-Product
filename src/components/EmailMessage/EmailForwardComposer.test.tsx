import { beforeAll, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmailForwardComposer } from './EmailForwardComposer';

// jsdom has no ResizeObserver; the tab indicator only uses it to re-measure.
beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe('EmailForwardComposer bottom bar', () => {
  it('always shows the labelled rich text icons', () => {
    render(<EmailForwardComposer mode="reply" value="" onChange={() => {}} onComposerModeChange={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Formatting options' })).toBeNull();
    const toolbar = screen.getByRole('toolbar', { name: 'Text formatting' });
    expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument();
    toolbar.querySelectorAll('button').forEach((button) => expect(button).toHaveAccessibleName());
    expect(screen.getByRole('toolbar', { name: 'Tools' })).toBeInTheDocument();
  });

  it('shows Delete instead of tabs when forwarding', () => {
    render(<EmailForwardComposer mode="forward" to={['a@b.co']} value="" onChange={() => {}} />);
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.getAllByRole('button', { name: 'Delete draft' }).length).toBeGreaterThan(0);
  });

  it('tooltips the rich text stubs and a disabled Send', async () => {
    const user = userEvent.setup();
    render(<EmailForwardComposer mode="reply" value="" onChange={() => {}} sendDisabled />);
    await user.hover(screen.getByRole('button', { name: 'Bold' }));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Make text bold');
    await user.unhover(screen.getByRole('button', { name: 'Bold' }));
    await user.hover(screen.getByRole('button', { name: 'Reply' }));
    expect(await screen.findByText('Write a message to send')).toBeInTheDocument();
  });
});
