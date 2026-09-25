import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TicketListItem } from './TicketListItem';

describe('TicketListItem', () => {
  it('marks unread rows structurally, not only with a colored count', () => {
    const { container } = render(
      <TicketListItem user="John" timestamp="4m" message="Where is my order?" unreadCount={2} />,
    );
    expect(container.firstChild).toHaveAttribute('data-unread');
    expect(screen.getByLabelText('2 unread messages')).toBeInTheDocument();
  });

  it('leaves read rows unmarked', () => {
    const { container } = render(<TicketListItem user="John" timestamp="4m" message="Thanks!" />);
    expect(container.firstChild).not.toHaveAttribute('data-unread');
  });
});
