import { useState, type ComponentProps } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketComposer } from './TicketComposer';
import type { ComposerMode } from './channelConfig';

// jsdom has no ResizeObserver; the tab indicator only uses it to re-measure.
beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const CANNED = [
  { name: 'Greeting', message: 'Hi! How can I help?' },
  { name: 'Order status', message: 'Share the order ID' },
  { name: 'Size guide', message: 'Sends the size chart', attachment: 'size-guide.png' },
];

const TEMPLATES = [
  { name: 'Diwali offer', code: '09687', message: 'Happy Diwali! Enjoy 20% off.' },
  { name: 'Cart reminder', code: '09686', message: 'You left something in your cart.' },
  { name: 'Shipping update', code: '09685', message: 'Order {} ships on {}.', params: ['Order ID', 'Date'] },
];

type HarnessProps = Partial<ComponentProps<typeof TicketComposer>>;

function Harness({ onSend, ...props }: HarnessProps) {
  const [value, setValue] = useState('');
  const [mode, setMode] = useState<ComposerMode>('reply');
  return (
    <TicketComposer
      value={value}
      onChange={setValue}
      mode={mode}
      onModeChange={setMode}
      cannedResponses={CANNED}
      templates={TEMPLATES}
      channel="whatsapp"
      onSend={(sentFrom) => {
        onSend?.(sentFrom);
        if (sentFrom !== 'template') setValue('');
      }}
      {...props}
    />
  );
}

const tabNames = () => screen.getAllByRole('tab').map((tab) => tab.getAttribute('aria-label'));

describe('TicketComposer canned responses', () => {
  it('picks a template from the Template tab and fills nothing in the draft', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('tab', { name: 'Template' }));
    expect(screen.getByRole('listbox', { name: 'Templates' })).toBeInTheDocument();
    expect(screen.getAllByRole('option')[0]).toHaveTextContent('09687Diwali offer');

    await user.type(screen.getByRole('searchbox'), 'cart');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option').querySelector('mark')).toHaveTextContent('Cart');
    await user.keyboard('{Enter}');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(screen.getByText('You left something in your cart.')).toBeInTheDocument();
  });

  it('attaches an image response instead of filling the box', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const box = screen.getByRole('textbox');

    await user.type(box, '/size');
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'Remove size-guide.png' })).toBeInTheDocument();
    expect(box).toHaveValue('');
  });

  it('opens on "/", filters as you type and inserts the pick with Enter', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const box = screen.getByRole('textbox');

    await user.type(box, '/');
    expect(screen.getAllByRole('option')).toHaveLength(3);

    await user.type(box, 'ord');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option').querySelector('mark')).toHaveTextContent('Ord');

    await user.keyboard('{Enter}');
    expect(box).toHaveValue('Share the order ID');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('moves with the arrows and closes on Escape', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByRole('textbox'), '/');
    await user.keyboard('{ArrowDown}');
    expect(screen.getAllByRole('option')[1]).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('stays closed for a "/" in the middle of a message', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(screen.getByRole('textbox'), 'and/or');
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});

describe('TicketComposer text formatting', () => {
  it('wraps the selection in WhatsApp markers from the Aa toolbar', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const box = screen.getByRole('textbox') as HTMLTextAreaElement;

    await user.type(box, 'hello world');
    box.setSelectionRange(6, 11);
    await user.click(screen.getByRole('button', { name: 'Formatting options' }));
    await user.click(screen.getByRole('button', { name: 'Bold' }));
    expect(box).toHaveValue('hello *world*');
  });

  it('undoes and redoes a format and typed text', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const box = screen.getByRole('textbox') as HTMLTextAreaElement;

    await user.type(box, 'hello');
    await user.click(screen.getByRole('button', { name: 'Formatting options' }));
    box.setSelectionRange(0, 5);
    await user.click(screen.getByRole('button', { name: 'Bold' }));
    expect(box).toHaveValue('*hello*');

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(box).toHaveValue('hello');
    await user.click(screen.getByRole('button', { name: 'Redo' }));
    expect(box).toHaveValue('*hello*');

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(box).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
  });

  it('opens the canned responses drawer from the "/" button', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Canned responses' }));
    expect(screen.getByRole('listbox', { name: 'Canned responses' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Canned responses' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('textbox')).toHaveValue('/');
  });

  it('replaces a half-written message with "/" when the "/" button is pressed', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByRole('textbox'), 'hello');
    await user.click(screen.getByRole('button', { name: 'Canned responses' }));
    expect(screen.getByRole('textbox')).toHaveValue('/');
    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(screen.getByText(/Search for canned responses/)).toBeInTheDocument();

    await user.keyboard('g');
    expect(screen.queryByText(/Search for canned responses/)).toBeNull();
  });

  it('allows at most five attachments', async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const files = Array.from({ length: 7 }, (_, i) => new File(['x'], `f${i}.txt`, { type: 'text/plain' }));

    await user.upload(input, files);
    expect(screen.getAllByRole('button', { name: /^Remove / })).toHaveLength(5);
    expect(screen.getByRole('button', { name: 'Attach file' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('5 files can be added as attachments');
  });

  it('turns away files over 16 MB with a notice', async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const big = new File(['x'], 'big.pdf', { type: 'application/pdf' });
    Object.defineProperty(big, 'size', { value: 17 * 1024 * 1024 });

    await user.upload(input, big);
    expect(screen.queryByRole('button', { name: 'Remove big.pdf' })).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('16 MB');
  });

  it('turns into a dropzone while files are dragged over it, and takes the drop', () => {
    const { container } = render(<Harness />);
    const composer = container.querySelector('.lc-ticket-composer') as HTMLElement;
    const file = new File(['x'], 'photo.txt', { type: 'text/plain' });
    const dataTransfer = { types: ['Files'], files: [file] };

    fireEvent.dragEnter(composer, { dataTransfer });
    expect(screen.getByText('Drop files to attach')).toBeInTheDocument();

    fireEvent.drop(composer, { dataTransfer });
    expect(screen.queryByText('Drop files to attach')).toBeNull();
    expect(screen.getByRole('button', { name: 'Remove photo.txt' })).toBeInTheDocument();
  });

  it('ignores drags that carry no files', () => {
    const { container } = render(<Harness />);
    fireEvent.dragEnter(container.querySelector('.lc-ticket-composer') as HTMLElement, {
      dataTransfer: { types: ['text/plain'], files: [] },
    });
    expect(screen.queryByText('Drop files to attach')).toBeNull();
  });

  it('enables Improve with AI only once there is a draft', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.getByRole('button', { name: 'Improve with AI' })).toBeDisabled();

    await user.type(screen.getByRole('textbox'), 'hi');
    expect(screen.getByRole('button', { name: 'Improve with AI' })).toBeEnabled();
  });

  it('shows the Aa button on the widget channel and hides it on facebook, instagram and sms', () => {
    const { unmount } = render(<Harness channel="widget" />);
    expect(screen.getByRole('button', { name: 'Formatting options' })).toBeInTheDocument();
    unmount();

    for (const channel of ['facebook', 'instagram', 'sms'] as const) {
      const view = render(<Harness channel={channel} />);
      expect(screen.queryByRole('button', { name: 'Formatting options' })).toBeNull();
      view.unmount();
    }
  });
});

describe('TicketComposer tabs and locked states', () => {
  it('offers Reply, Template and Private note on WhatsApp', () => {
    render(<Harness />);
    expect(tabNames()).toEqual(['Reply', 'Template', 'Private note']);
  });

  it('drops Template for a channel without templates and for an opted-out contact', () => {
    const { unmount } = render(<Harness channel="instagram" />);
    expect(tabNames()).toEqual(['Reply', 'Private note']);
    unmount();
    render(<Harness contactOptedIn={false} />);
    expect(tabNames()).toEqual(['Reply', 'Private note']);
  });

  it('moves between tabs with the arrow keys and wraps', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    screen.getByRole('tab', { name: 'Reply' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Template' })).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Reply' })).toHaveAttribute('aria-selected', 'true');
  });

  it('forces a private note with a banner once the reply window closed', () => {
    render(<Harness windowOpen={false} windowClosedAgo="2 days ago" />);
    expect(tabNames()).toEqual(['Private note']);
    expect(screen.getByRole('status')).toHaveTextContent('Reply window closed 2 days ago. You can only leave a private note.');
    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Visible only to your team. Type @ to mention.');
    expect(screen.queryByRole('button', { name: 'Canned responses' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });

  it('ignores the reply window on a channel that has none', () => {
    render(<Harness channel="widget" windowOpen={false} />);
    expect(tabNames()).toEqual(['Reply', 'Template', 'Private note']);
  });

  it('locks to a private note for billing and voicebot', () => {
    const { unmount } = render(<Harness lockReason="billing" />);
    expect(tabNames()).toEqual(['Private note']);
    expect(screen.getByRole('status')).toHaveTextContent('billing');
    unmount();
    render(<Harness lockReason="voicebot" />);
    expect(screen.getByRole('status')).toHaveTextContent('voicebot');
  });
});

describe('TicketComposer sending', () => {
  it('sends on Enter and keeps Shift+Enter for a new line', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<Harness onSend={onSend} />);
    const box = screen.getByRole('textbox');

    await user.type(box, 'hello{Shift>}{Enter}{/Shift}there');
    expect(box).toHaveValue('hello\nthere');
    expect(onSend).not.toHaveBeenCalled();

    await user.keyboard('{Enter}');
    expect(onSend).toHaveBeenCalledWith('reply');
    expect(box).toHaveValue('');
  });

  it('lets an open canned list take Enter instead of sending', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<Harness onSend={onSend} />);
    await user.type(screen.getByRole('textbox'), '/greet{Enter}');
    expect(onSend).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox')).toHaveValue('Hi! How can I help?');
  });

  it('disables Send while the box is empty and labels it per mode', async () => {
    const user = userEvent.setup();
    render(<Harness channel="instagram" />);
    expect(screen.getByRole('button', { name: 'Reply' })).toBeDisabled();
    await user.type(screen.getByRole('textbox'), 'hi');
    expect(screen.getByRole('button', { name: 'Reply' })).toBeEnabled();
    await user.click(screen.getByRole('tab', { name: 'Private note' }));
    expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled();
  });

  it('shows the mic only on a voice channel with an empty box, then Send', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Harness />);
    expect(screen.getByRole('button', { name: 'Record voice note' })).toBeEnabled();
    await user.type(screen.getByRole('textbox'), 'hi');
    expect(screen.queryByRole('button', { name: 'Record voice note' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Reply' })).toBeEnabled();
    unmount();
    render(<Harness channel="instagram" />);
    expect(screen.queryByRole('button', { name: 'Record voice note' })).toBeNull();
  });

  it('keeps Send disabled in the Template tab until every parameter is filled', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<Harness onSend={onSend} />);

    await user.click(screen.getByRole('tab', { name: 'Template' }));
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Attach file' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Improve with AI' })).toBeDisabled();

    await user.type(screen.getByRole('searchbox'), 'shipping{Enter}');
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
    await user.type(screen.getByLabelText('Order ID'), 'A1');
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
    await user.type(screen.getByLabelText('Date'), 'Friday');
    expect(screen.getByRole('button', { name: 'Send' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSend).toHaveBeenCalledWith('template');
    expect(screen.getByRole('searchbox')).toHaveValue('');
  });

  it('Esc closes the canned list and the Aa strip', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(screen.getByRole('textbox'), '/');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();

    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'hi');
    await user.click(screen.getByRole('button', { name: 'Formatting options' }));
    expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('button', { name: 'Bold' })).toBeNull();
  });
});

describe('TicketComposer counter', () => {
  it('stays hidden until the draft nears the limit, then warns, then flags the limit', async () => {
    const user = userEvent.setup();
    render(<Harness channel="sms" />); // 160 characters
    const box = screen.getByRole('textbox');

    await user.type(box, 'hello');
    expect(screen.queryByText(/ \/ 160/)).toBeNull();

    await user.click(box);
    await user.paste('x'.repeat(125)); // 130
    expect(screen.getByText('130 / 160')).toHaveAttribute('data-level', 'warn');
    expect(screen.getByText('130 / 160')).toHaveAttribute('aria-live', 'polite');

    await user.paste('y'.repeat(30));
    expect(screen.getByText('160 / 160')).toHaveAttribute('data-level', 'limit');
  });

  it('uses 10000 for a private note whatever the channel', async () => {
    const user = userEvent.setup();
    render(<Harness channel="sms" />);
    await user.click(screen.getByRole('tab', { name: 'Private note' }));
    expect(screen.getByRole('textbox')).toHaveAttribute('maxlength', '10000');
  });
});
