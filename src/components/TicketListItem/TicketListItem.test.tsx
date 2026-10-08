import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
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

  it('hover select checkbox starts selection without opening the ticket', () => {
    const onSelect = vi.fn();
    const onClick = vi.fn();
    render(<TicketListItem user="John" timestamp="4m" message="Hi" showCheckbox={false} onSelect={onSelect} onClick={onClick} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select John' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });
});
