import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StateSwitcher } from './StateSwitcher';

const STATES = [
  { id: 'data', label: 'With data' },
  { id: 'zero', label: 'Zero state' },
  { id: 'loading', label: 'Loading' },
  { id: 'error', label: 'Could not load' },
  { id: 'no-access', label: 'No access' },
];

describe('StateSwitcher', () => {
  it('lists every state it is given, in order, and shows the current one', () => {
    render(<StateSwitcher states={STATES} value="loading" onChange={() => {}} />);
    const select = screen.getByRole('combobox', { name: 'State of this screen' });
    expect(within(select).getAllByRole('option').map((option) => option.textContent)).toEqual([
      'With data',
      'Zero state',
      'Loading',
      'Could not load',
      'No access',
    ]);
    expect(select).toHaveDisplayValue('Loading');
  });

  it('reports the id of the state that is picked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StateSwitcher states={STATES} value="data" onChange={onChange} />);
    await user.selectOptions(screen.getByRole('combobox', { name: 'State of this screen' }), 'Could not load');
    expect(onChange).toHaveBeenCalledExactlyOnceWith('error');
  });
});
