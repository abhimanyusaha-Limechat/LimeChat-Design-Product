import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketComposer } from './TicketComposer';

function Harness({ onSend, initial = '' }: { onSend: () => void; initial?: string }) {
  const [value, setValue] = useState(initial);
  return <TicketComposer value={value} onChange={setValue} onSend={onSend} />;
}

describe('TicketComposer', () => {
  it('sends on Cmd/Ctrl+Enter but keeps plain Enter as a newline', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<Harness onSend={onSend} />);
    const input = screen.getByRole('textbox');

    await user.type(input, 'Line one{Enter}Line two');
    expect(onSend).not.toHaveBeenCalled();
    expect(input).toHaveValue('Line one\nLine two');

    await user.keyboard('{Meta>}{Enter}{/Meta}');
    expect(onSend).toHaveBeenCalledTimes(1);

    await user.keyboard('{Control>}{Enter}{/Control}');
    expect(onSend).toHaveBeenCalledTimes(2);
  });

  it('disables send while the draft is blank, so an empty reply cannot go out', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<Harness onSend={onSend} initial="   " />);

    expect(screen.getByRole('button', { name: /reply/i })).toBeDisabled();
    await user.click(screen.getByRole('textbox'));
    await user.keyboard('{Meta>}{Enter}{/Meta}');
    expect(onSend).not.toHaveBeenCalled();
  });
});
