import { useState } from 'react';
import { beforeAll, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketComposer } from './TicketComposer';

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
];

function Harness({ channel = 'whatsapp' }: { channel?: 'whatsapp' | 'instagram' }) {
  const [value, setValue] = useState('');
  return <TicketComposer value={value} onChange={setValue} cannedResponses={CANNED} templates={TEMPLATES} channel={channel} />;
}

describe('TicketComposer canned responses', () => {
  it('opens the templates drawer when "\\" is typed', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(screen.getByRole('textbox'), '\\');
    expect(screen.getByRole('listbox', { name: 'Templates' })).toBeInTheDocument();
  });

  it('shows the counter only past 80% of the limit', () => {
    const { rerender } = render(<TicketComposer value={'a'.repeat(799)} onChange={() => {}} maxLength={1000} />);
    expect(screen.queryByText(/\/ 1000/)).toBeNull();
    rerender(<TicketComposer value={'a'.repeat(800)} onChange={() => {}} maxLength={1000} />);
    expect(screen.getByText(/800 \/ 1000/)).toBeInTheDocument();
  });

  it('opens the templates drawer from its button, with a serial before each name', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const box = screen.getByRole('textbox');

    await user.click(screen.getByRole('button', { name: 'Templates' }));
    expect(screen.getByRole('listbox', { name: 'Templates' })).toBeInTheDocument();
    expect(screen.getAllByRole('option')[0]).toHaveTextContent('09687Diwali offer');

    await user.keyboard('{Enter}');
    expect(box).toHaveValue('Happy Diwali! Enjoy 20% off.');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('searches templates by keyword while the templates drawer is open', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Templates' }));
    await user.type(screen.getByRole('textbox'), 'cart');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option').querySelector('mark')).toHaveTextContent('Cart');

    await user.keyboard('{Enter}');
    expect(screen.getByRole('textbox')).toHaveValue('You left something in your cart.');
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

  it('undoes and redoes a format with the keyboard', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const box = screen.getByRole('textbox') as HTMLTextAreaElement;

    await user.type(box, 'hello');
    await user.click(screen.getByRole('button', { name: 'Formatting options' }));
    box.setSelectionRange(0, 5);
    await user.click(screen.getByRole('button', { name: 'Bold' }));
    expect(box).toHaveValue('*hello*');

    await user.keyboard('{Control>}z{/Control}');
    expect(box).toHaveValue('hello');
    await user.keyboard('{Control>}y{/Control}');
    expect(box).toHaveValue('*hello*');
  });

  it('opens the canned responses drawer from its icon next to the mic', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Canned responses' }));
    expect(screen.getByRole('listbox', { name: 'Canned responses' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Canned responses' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('textbox')).toHaveValue('/');
  });

  it('replaces a half-written message with "/" when the canned icon is pressed', async () => {
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

  it('clears the box and asks "Search for templates" when the templates icon is pressed', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByRole('textbox'), 'hello');
    await user.click(screen.getByRole('button', { name: 'Templates' }));
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(screen.getByPlaceholderText('Search for templates')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Templates' })).toHaveAttribute('aria-pressed', 'true');
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

  it('has no formatting for a channel that renders none', () => {
    render(<Harness channel="instagram" />);
    expect(screen.queryByRole('button', { name: 'Formatting options' })).toBeNull();
  });
});
