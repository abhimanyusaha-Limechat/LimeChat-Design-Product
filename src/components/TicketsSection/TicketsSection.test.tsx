import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketsSection } from './TicketsSection';

function Harness({ onChange }: { onChange: (s: string) => void }) {
  const [status, setStatus] = useState('Open');
  return (
    <TicketsSection
      status={status}
      onStatusChange={(s) => {
        setStatus(s);
        onChange(s);
      }}
    />
  );
}

describe('TicketsSection status filter', () => {
  it('lays statuses out as a single-select row, one click to switch', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    const group = screen.getByRole('radiogroup', { name: 'Filter by status' });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Open' })).toHaveAttribute('aria-checked', 'true');

    await user.click(screen.getByRole('radio', { name: 'Waiting' }));
    expect(onChange).toHaveBeenLastCalledWith('Waiting');
    expect(screen.getByRole('radio', { name: 'Waiting' })).toHaveAttribute('aria-checked', 'true');
  });

  it('moves between statuses with arrow keys, keeping one tab stop', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    const open = screen.getByRole('radio', { name: 'Open' });
    expect(open).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('radio', { name: 'Closed' })).toHaveAttribute('tabindex', '-1');

    open.focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('Closed');
    expect(screen.getByRole('radio', { name: 'Closed' })).toHaveFocus();
  });
});
