import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QtyStepper } from './QtyStepper';

describe('QtyStepper', () => {
  it('increments and decrements', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<QtyStepper value={3} onChange={onChange} />);
    await user.click(screen.getByLabelText('Increase quantity'));
    expect(onChange).toHaveBeenLastCalledWith(4);
    await user.click(screen.getByLabelText('Decrease quantity'));
    expect(onChange).toHaveBeenLastCalledWith(2);
  });

  it('never goes below 1', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<QtyStepper value={1} onChange={onChange} />);
    await user.click(screen.getByLabelText('Decrease quantity'));
    expect(onChange).toHaveBeenCalledWith(1);
  });
});
