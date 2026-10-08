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
  it('switches status from a dropdown at the right of the title row', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    const trigger = screen.getByRole('button', { name: 'Status: Open' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await user.click(trigger);
    await user.click(screen.getByRole('menuitem', { name: 'Waiting' }));
    expect(onChange).toHaveBeenLastCalledWith('Waiting');
    expect(screen.getByRole('button', { name: 'Status: Waiting' })).toBeInTheDocument();
  });

  it('shows a count next to a tab label', () => {
    render(<TicketsSection tabs={[{ id: 'mine', label: 'Mine', count: 3 }]} activeTab="mine" />);
    expect(screen.getByRole('tab', { name: /^Mine\s*3$/ })).toBeInTheDocument();
  });

  it('exits selection mode from the Cancel button', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<TicketsSection selectedCount={2} onCancelSelection={onCancel} />);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
