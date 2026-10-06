import { StrictMode, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Inspector } from './Inspector';
import { Menu } from '../Menu';
import { Modal } from '../Modal';

// jsdom has no layout: give every element a box so targets don't resolve up to <body>.
beforeEach(() => {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    x: 10,
    y: 10,
    left: 10,
    top: 10,
    width: 100,
    height: 20,
    right: 110,
    bottom: 30,
    toJSON: () => ({}),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

const fab = () => screen.getByRole('button', { name: 'Inspect spacing and type' });
const panel = () => screen.queryByRole('region', { name: 'Element spec' });

function setup(app: React.ReactNode = null) {
  const user = userEvent.setup();
  render(
    <StrictMode>
      {app}
      <Inspector />
    </StrictMode>,
  );
  return user;
}

describe('Inspector toolbar', () => {
  it('expands into independent tool toggles, all on', async () => {
    const user = setup();
    expect(fab()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('group', { name: 'Inspect tools' })).not.toBeInTheDocument();

    await user.click(fab());
    expect(fab()).toHaveAttribute('aria-expanded', 'true');
    const tools = within(screen.getByRole('group', { name: 'Inspect tools' }));
    for (const name of ['Type', 'Padding', 'Gap']) {
      expect(tools.getByRole('button', { name })).toHaveAttribute('aria-pressed', 'true');
    }

    await user.click(tools.getByRole('button', { name: 'Padding' }));
    expect(tools.getByRole('button', { name: 'Padding' })).toHaveAttribute('aria-pressed', 'false');
    expect(tools.getByRole('button', { name: 'Type' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('closes from ×, remembering the tools', async () => {
    const user = setup();
    await user.click(fab());
    await user.click(screen.getByRole('button', { name: 'Gap' }));
    await user.click(screen.getByRole('button', { name: 'Close inspect mode' }));
    expect(fab()).toHaveAttribute('aria-expanded', 'false');

    await user.click(fab());
    expect(screen.getByRole('button', { name: 'Gap' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('returns keyboard focus to the FAB when the focused × unmounts', async () => {
    const user = setup();
    await user.keyboard('{Shift>}I{/Shift}');
    screen.getByRole('button', { name: 'Close inspect mode' }).focus();
    await user.keyboard('{Enter}');
    expect(fab()).toHaveAttribute('aria-expanded', 'false');
    expect(fab()).toHaveFocus();
  });

  it("keeps the app's focus when the bar is clicked", async () => {
    const user = setup(<input aria-label="Reply" />);
    await user.click(screen.getByRole('textbox', { name: 'Reply' }));
    await user.click(fab());
    expect(screen.getByRole('textbox', { name: 'Reply' })).toHaveFocus();
  });
});

describe('Shift+I', () => {
  it('toggles Inspect mode', async () => {
    const user = setup();
    await user.keyboard('{Shift>}I{/Shift}');
    expect(fab()).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Shift>}I{/Shift}');
    expect(fab()).toHaveAttribute('aria-expanded', 'false');
  });

  it('is ignored while typing and with Ctrl/Cmd held (DevTools)', async () => {
    const user = setup(<input aria-label="Search" />);
    await user.click(screen.getByRole('textbox', { name: 'Search' }));
    await user.keyboard('{Shift>}I{/Shift}');
    expect(screen.getByRole('textbox', { name: 'Search' })).toHaveValue('I');
    expect(fab()).toHaveAttribute('aria-expanded', 'false');

    await user.click(document.body);
    await user.keyboard('{Control>}{Shift>}I{/Shift}{/Control}');
    expect(fab()).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('pinning', () => {
  it('pins on click without the app seeing the press', async () => {
    const onClick = vi.fn();
    const onMouseDown = vi.fn();
    const user = setup(
      <button type="button" className="app-btn" onClick={onClick} onMouseDown={onMouseDown}>
        Save
      </button>,
    );
    await user.click(fab());
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(panel()).toBeInTheDocument());
    expect(within(panel()!).getByText('button.app-btn')).toBeInTheDocument();
    expect(onClick).not.toHaveBeenCalled();
    expect(onMouseDown).not.toHaveBeenCalled();
  });

  it("doesn't close an open Menu when opening Inspect mode or pinning outside it", async () => {
    const user = setup(
      <>
        <button type="button">Outside</button>
        <Menu
          ariaLabel="Ticket actions"
          items={[{ label: 'Archive', onClick: () => {} }]}
          trigger={({ ref, onClick }) => (
            <button ref={ref} type="button" onClick={onClick}>
              Actions
            </button>
          )}
        />
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.click(fab());
    await user.click(screen.getByRole('button', { name: 'Outside' }));
    await waitFor(() => expect(panel()).toBeInTheDocument());
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('Esc unpins, then closes — without closing an open Modal', async () => {
    const onClose = vi.fn();
    const user = setup(
      <Modal open onClose={onClose} title="Delete ticket">
        <p>Body text</p>
      </Modal>,
    );
    await user.click(fab());
    await user.click(screen.getByText('Body text'));
    await waitFor(() => expect(panel()).toBeInTheDocument());

    await user.keyboard('{Escape}');
    await waitFor(() => expect(panel()).not.toBeInTheDocument());
    expect(fab()).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');
    expect(fab()).toHaveAttribute('aria-expanded', 'false');
    expect(onClose).not.toHaveBeenCalled();

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('selects the parent from the button and Alt+↑', async () => {
    const user = setup(
      <section className="card">
        <div className="row">
          <span className="leaf">Leaf</span>
        </div>
      </section>,
    );
    await user.click(fab());
    await user.click(screen.getByText('Leaf'));
    await waitFor(() => expect(within(panel()!).getByText('span.leaf')).toBeInTheDocument());

    await user.click(within(panel()!).getByRole('button', { name: /Select parent/ }));
    await waitFor(() => expect(within(panel()!).getByText('div.row')).toBeInTheDocument());

    await user.keyboard('{Alt>}{ArrowUp}{/Alt}');
    await waitFor(() => expect(within(panel()!).getByText('section.card')).toBeInTheDocument());
  });

  it('pins an icon as its <svg>, not the shape inside it', async () => {
    const user = setup(
      <svg className="icon" data-testid="icon" viewBox="0 0 24 24">
        <path data-testid="shape" d="M4 4h16" />
      </svg>,
    );
    await user.click(fab());
    await user.click(screen.getByTestId('shape'));
    await waitFor(() => expect(within(panel()!).getByText('svg.icon')).toBeInTheDocument());
  });

  it('keeps keyboard focus in the inspector when Esc unpins from inside the panel', async () => {
    const user = setup(<p>Text</p>);
    await user.click(fab());
    await user.click(screen.getByText('Text'));
    await waitFor(() => expect(panel()).toBeInTheDocument());

    within(panel()!).getByRole('button', { name: /Copy CSS/ }).focus();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(panel()).not.toBeInTheDocument());
    expect(fab()).toHaveFocus();
  });

  it('pins the focused element with Alt+Enter', async () => {
    const user = setup(
      <button type="button" className="focus-me">
        Focus me
      </button>,
    );
    await user.click(fab());
    screen.getByRole('button', { name: 'Focus me' }).focus();
    await user.keyboard('{Alt>}{Enter}{/Alt}');
    await waitFor(() => expect(within(panel()!).getByText('button.focus-me')).toBeInTheDocument());
  });

  it('unpins when the pinned element leaves the page', async () => {
    function Removable() {
      const [shown, setShown] = useState(true);
      return (
        <>
          {shown && <p className="gone">Temporary</p>}
          <button type="button" data-inspector-ui="" onClick={() => setShown(false)}>
            Remove
          </button>
        </>
      );
    }
    const user = setup(<Removable />);
    await user.click(fab());
    await user.click(screen.getByText('Temporary'));
    await waitFor(() => expect(panel()).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Remove' }));
    window.dispatchEvent(new Event('resize'));
    await waitFor(() => expect(panel()).not.toBeInTheDocument());
  });

  it('copies the values as CSS, and says so when the clipboard is unavailable', async () => {
    const user = setup(<p className="copy-me">Copy</p>);
    await user.click(fab());
    await user.click(screen.getByText('Copy'));
    await waitFor(() => expect(panel()).toBeInTheDocument());

    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    await user.click(within(panel()!).getByRole('button', { name: /Copy CSS/ }));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('padding: 0;'));
    expect(within(panel()!).getByRole('status')).toHaveTextContent('Copied');

    writeText.mockRejectedValue(new Error('denied'));
    await user.click(within(panel()!).getByRole('button', { name: /Copy CSS/ }));
    await waitFor(() => expect(within(panel()!).getByRole('status')).toHaveTextContent("Couldn't copy"));
  });
});

describe('listeners', () => {
  it('adds no press listeners until expanded, and removes them all on close', async () => {
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const presses = (spy: typeof add) => spy.mock.calls.filter(([type]) => type === 'mousedown').length;

    const user = setup();
    expect(presses(add)).toBe(0);

    await user.click(fab());
    expect(presses(add)).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Close inspect mode' }));
    expect(presses(remove)).toBe(presses(add));
  });
});
