import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Menu, type MenuItemData } from './Menu';

/** A menu between two other buttons, so Tab has somewhere to come from and go to. */
function Demo({
  items,
  header,
  closeOnItemClick,
}: {
  items: MenuItemData[];
  header?: React.ReactNode;
  closeOnItemClick?: boolean;
}) {
  return (
    <>
      <button type="button">Before</button>
      <Menu
        ariaLabel="Row actions"
        items={items}
        header={header}
        closeOnItemClick={closeOnItemClick}
        trigger={({ ref, onClick }) => (
          <button ref={ref} type="button" onClick={onClick}>
            Actions
          </button>
        )}
      />
      <button type="button">After</button>
    </>
  );
}

const actions = (onPick: (label: string) => void = () => {}): MenuItemData[] => [
  { label: 'Edit', onClick: () => onPick('Edit') },
  { label: 'Clone', disabled: true, onClick: () => onPick('Clone') },
  { label: 'Archive', onClick: () => onPick('Archive') },
  { label: 'Delete', danger: true, onClick: () => onPick('Delete') },
];

const item = (name: string) => screen.getByRole('menuitem', { name });
const trigger = () => screen.getByRole('button', { name: 'Actions' });

/** Tabs to the trigger and opens the menu with Enter, as a keyboard user would. */
async function openWithKeyboard(user: ReturnType<typeof userEvent.setup>) {
  await user.tab(); // Before
  await user.tab(); // Actions
  await user.keyboard('{Enter}');
}

describe('Menu keyboard use', () => {
  it('moves focus to the first item when opened from the keyboard', async () => {
    const user = userEvent.setup();
    render(<Demo items={actions()} />);
    await openWithKeyboard(user);
    expect(screen.getByRole('menu', { name: 'Row actions' })).toBeInTheDocument();
    expect(item('Edit')).toHaveFocus();
  });

  it('starts on the chosen row of a single-choice list', async () => {
    const user = userEvent.setup();
    render(
      <Demo
        items={['Last 7 days', 'Last 30 days', 'Last 90 days'].map((label) => ({
          label,
          selected: label === 'Last 30 days',
        }))}
      />,
    );
    await openWithKeyboard(user);
    expect(item('Last 30 days')).toHaveFocus();
  });

  it('leaves focus on the trigger when opened with the mouse, and still takes the arrow keys', async () => {
    const user = userEvent.setup();
    render(<Demo items={actions()} />);
    await user.click(trigger());
    expect(trigger()).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(item('Edit')).toHaveFocus();
  });

  it('walks the items with the arrow keys, skipping disabled ones and wrapping at both ends', async () => {
    const user = userEvent.setup();
    render(<Demo items={actions()} />);
    await openWithKeyboard(user);

    await user.keyboard('{ArrowDown}');
    expect(item('Archive')).toHaveFocus(); // Clone is disabled
    await user.keyboard('{ArrowDown}');
    expect(item('Delete')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(item('Edit')).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(item('Delete')).toHaveFocus();
  });

  it('jumps to the first and last item with Home and End', async () => {
    const user = userEvent.setup();
    render(<Demo items={actions()} />);
    await openWithKeyboard(user);

    await user.keyboard('{End}');
    expect(item('Delete')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(item('Edit')).toHaveFocus();
  });

  it('closes on Escape and hands focus back to the trigger', async () => {
    const user = userEvent.setup();
    render(<Demo items={actions()} />);
    await openWithKeyboard(user);

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
  });

  it('closes on Tab and moves on to what follows the trigger', async () => {
    const user = userEvent.setup();
    render(<Demo items={actions()} />);
    await openWithKeyboard(user);

    await user.tab();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('closes on Shift+Tab and moves back to what precedes the trigger', async () => {
    const user = userEvent.setup();
    render(<Demo items={actions()} />);
    await openWithKeyboard(user);

    await user.tab({ shift: true });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
  });

  it('runs the focused item on Enter, then closes and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();
    render(<Demo items={actions(onPick)} />);
    await openWithKeyboard(user);

    await user.keyboard('{ArrowDown}{Enter}');
    expect(onPick).toHaveBeenCalledExactlyOnceWith('Archive');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
  });

  it('does not pull focus to the trigger when an item is picked with the mouse', async () => {
    const user = userEvent.setup();
    render(<Demo items={actions()} />);
    await user.click(trigger());
    await user.click(item('Archive'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger()).not.toHaveFocus();
  });

  it('keeps a checkbox menu open while Space ticks its options, with focus staying put', async () => {
    function Checks() {
      const [picked, setPicked] = useState<string[]>([]);
      const toggle = (name: string) =>
        setPicked((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
      return (
        <Demo
          closeOnItemClick={false}
          items={['Agent', 'Task', 'Flow'].map((name) => ({
            key: name,
            label: name,
            checked: picked.includes(name),
            onClick: () => toggle(name),
          }))}
        />
      );
    }
    const user = userEvent.setup();
    render(<Checks />);
    await openWithKeyboard(user);

    const task = () => screen.getByRole('menuitemcheckbox', { name: 'Task' });
    await user.keyboard('{ArrowDown} ');
    expect(task()).toHaveAttribute('aria-checked', 'true');
    expect(task()).toHaveFocus();
    await user.keyboard(' ');
    expect(task()).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('starts in a search header, steps between it and the items with the arrows, and leaves Home to the field', async () => {
    const user = userEvent.setup();
    render(<Demo items={actions()} header={<input type="text" aria-label="Search actions" />} />);
    await openWithKeyboard(user);

    const search = screen.getByRole('textbox', { name: 'Search actions' });
    expect(search).toHaveFocus();
    await user.keyboard('{Home}');
    expect(search).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(item('Edit')).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(search).toHaveFocus();

    // Tab steps from the field into the items; it only closes the menu from an item.
    await user.tab();
    expect(item('Edit')).toHaveFocus();
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('ignores arrow keys pressed elsewhere on the page while it is open', async () => {
    const user = userEvent.setup();
    render(<Demo items={actions()} />);
    await user.click(trigger());
    const before = screen.getByRole('button', { name: 'Before' });
    before.focus();

    await user.keyboard('{ArrowDown}');
    expect(before).toHaveFocus();
  });
});
