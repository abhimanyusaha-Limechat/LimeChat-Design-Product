import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelpdeskTicketsPage } from './HelpdeskTicketsPage';

describe('HelpdeskTicketsPage resize handles', () => {
  it('are keyboard-focusable and resize with arrow keys, clamped to min/max', async () => {
    const user = userEvent.setup();
    render(
      <HelpdeskTicketsPage
        ticketsSection={<div>Tickets</div>}
        conversation={<div>Hi</div>}
        minListWidth={280}
        maxListWidth={520}
        defaultListWidth={336}
      />,
    );
    const handle = screen.getByRole('separator', { name: 'Resize ticket list' });
    expect(handle).toHaveAttribute('tabindex', '0');
    expect(handle).toHaveAttribute('aria-valuenow', '336');

    handle.focus();
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
    expect(handle).toHaveAttribute('aria-valuenow', '360'); // 336 + 3*8

    await user.keyboard('{Home}');
    expect(handle).toHaveAttribute('aria-valuenow', '280');

    await user.keyboard('{End}');
    expect(handle).toHaveAttribute('aria-valuenow', '520');
  });

  it('re-jumps to the bottom when switching threads, even with an equal message count', () => {
    // jsdom never lays anything out, so scrollHeight is always 0 — stub it so we can
    // tell whether the scroll-to-bottom effect actually re-ran on thread switch.
    let scrollHeight = 100;
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get: () => scrollHeight,
    });

    const { container, rerender } = render(
      <HelpdeskTicketsPage
        ticketsSection={<div>Tickets</div>}
        conversation={<div>Msg A</div>}
        conversationKey="ticket-1"
      />,
    );
    const conversationEl = container.querySelector('.lc-hd-tickets__conversation') as HTMLElement;
    expect(conversationEl.scrollTop).toBe(100);

    // Simulate ticket-2 loading with the same single-message shape, but scrolled up
    // by the user reading history — a real ticket switch must still jump to bottom.
    conversationEl.scrollTop = 0;
    scrollHeight = 250;
    rerender(
      <HelpdeskTicketsPage
        ticketsSection={<div>Tickets</div>}
        conversation={<div>Msg B</div>}
        conversationKey="ticket-2"
      />,
    );
    expect(conversationEl.scrollTop).toBe(250);

    // @ts-expect-error -- restore the real (jsdom) descriptor
    delete HTMLElement.prototype.scrollHeight;
  });
});
