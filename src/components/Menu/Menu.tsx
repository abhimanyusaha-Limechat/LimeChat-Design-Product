/**
 * Menu — the LimeChat design system's shared popover-menu shell.
 *
 * A trigger-anchored, portal-positioned dropdown: consistent shadow/radius/
 * animation, closes on outside click or Escape, and repositions on scroll
 * or resize. Extracted from the near-identical row-action menus that had
 * been hand-rolled per page (Templates/BotFlows/Segments home pages).
 *
 *   <Menu
 *     ariaLabel="Template actions"
 *     items={[
 *       { label: 'Edit template', icon: <EditIcon />, onClick: () => {} },
 *       { label: 'Clone', icon: <CopyIcon />, onClick: () => {} },
 *       { label: 'Delete', icon: <TrashIcon />, danger: true, onClick: () => {} },
 *     ]}
 *     trigger={({ ref, onClick, open }) => (
 *       <button ref={ref} onClick={onClick} aria-label="More actions">⋮</button>
 *     )}
 *   />
 *
 * `ActionMenu` bundles the common case: a dots-vertical trigger with a
 * "More actions" tooltip.
 *
 * Keyboard: opening it from the keyboard moves focus into it (the menu sits at
 * the end of <body>, so Tab alone would not reach it). Arrow keys move
 * through the items, Home and End jump to the ends, Enter or Space picks, Escape
 * closes, and Tab closes and carries on from the trigger. Mouse use is untouched.
 */
import { Fragment, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type Ref } from 'react';
import { createPortal } from 'react-dom';
import { CheckIcon } from '../icons';
import { Tooltip } from '../Tooltip';
import { usePopoverPosition } from '../../hooks/usePopoverPosition';
import './Menu.css';

/** The rows a key can land on. */
const MENU_ITEMS = '[role^="menuitem"]:not(:disabled)';
/** Where the arrow keys stop, in order: a header field such as a search box, then every row. */
const KEYBOARD_STOPS = `input:not(:disabled), ${MENU_ITEMS}`;

/** Whether the element shows a keyboard focus ring, i.e. the user reached it with the keyboard. */
function hasFocusRing(el: Element): boolean {
  try {
    return el.matches(':focus-visible');
  } catch {
    return false; // an engine that doesn't know :focus-visible
  }
}

/**
 * Whether a click came from the keyboard: Enter or Space on a button fires a click with no
 * pointer behind it (`detail` 0), a real click counts at least one. Undefined when the trigger
 * didn't pass its event along, so there is nothing to tell by.
 */
function clickedFromKeyboard(event: unknown): boolean | undefined {
  if (typeof event !== 'object' || event === null || !('detail' in event)) return undefined;
  return event.detail === 0;
}

export interface MenuItemData {
  key?: string;
  label: ReactNode;
  icon?: ReactNode;
  /** Renders after the label, flush to the trailing edge — e.g. a selected-state checkmark. */
  trailingIcon?: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  /** Highlights the row with a light primary background, for the currently active option in a single-select list. */
  selected?: boolean;
  /**
   * Makes the row a checkbox, for a multi-select list: a tick box leads the row and it is
   * announced as checked or not. `'mixed'` is for a "select all" row with only some of its
   * options checked. Pair it with `closeOnItemClick={false}`.
   */
  checked?: boolean | 'mixed';
  /** Draws a rule under the row, e.g. to set an "All" option apart from the list it controls. */
  dividerAfter?: boolean;
}

export interface MenuTriggerRenderProps {
  ref: Ref<HTMLButtonElement>;
  onClick: () => void;
  open: boolean;
}

export interface MenuProps {
  items: MenuItemData[];
  trigger: (props: MenuTriggerRenderProps) => ReactNode;
  /** Accessible label for the menu popover itself. */
  ariaLabel: string;
  /** Which edge of the trigger the menu's edge aligns to. Default `end` (right-aligned, matches a trailing ⋮ trigger). */
  align?: 'start' | 'end';
  /** Menu width in px. Default `190`. */
  width?: number;
  className?: string;
  /** Rendered above the item list, e.g. a search input — stays put while `items` is filtered. */
  header?: ReactNode;
  /** Shown in place of `items` when the list is empty (e.g. "No results"). */
  emptyState?: ReactNode;
  /** Keep the menu open after an item is clicked — for multi-select lists. Default `true`. */
  closeOnItemClick?: boolean;
}

/** The shared trigger + portal-positioned dropdown. Closes on outside click, Escape, scroll, or resize-driven reposition. */
export function Menu({
  items,
  trigger,
  ariaLabel,
  align = 'end',
  width = 190,
  className,
  header,
  emptyState,
  closeOnItemClick = true,
}: MenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // How the trigger was last pressed; see `clickedFromKeyboard`.
  const pressedFromKeyboard = useRef<boolean | undefined>(undefined);
  // Triggers hand this straight to `onClick`, so the click event arrives as its argument.
  const toggle = (event?: unknown) => {
    pressedFromKeyboard.current = clickedFromKeyboard(event);
    setOpen((o) => !o);
  };

  // Rows/cards often animate with a `transform`, which establishes a stacking
  // context even at rest — a menu positioned inside its own row can end up
  // painted behind a later row's stacking context despite z-index. Portalling
  // to <body> (like Tooltip already does) sidesteps that entirely.
  const coords = usePopoverPosition(open, triggerRef, menuRef, width, align);
  const positioned = coords !== null;

  // Opened from the keyboard: focus moves into the menu, to a header field if there is one,
  // else the row already chosen in a single-choice list, else the first row. A mouse click
  // leaves focus where it is, and so does a header field that focused itself. Where the
  // trigger didn't pass its click along, its focus ring says whether the keyboard got the user
  // there. It waits for the first position because the menu is hidden, and so unfocusable,
  // until then.
  useLayoutEffect(() => {
    const menu = menuRef.current;
    const trigger = triggerRef.current;
    if (!open || !positioned || !menu || !trigger || document.activeElement !== trigger) return;
    if (!(pressedFromKeyboard.current ?? hasFocusRing(trigger))) return;
    const start =
      menu.querySelector<HTMLElement>('input:not(:disabled)') ??
      menu.querySelector<HTMLElement>(`.lc-menu__item--selected${MENU_ITEMS}`) ??
      menu.querySelector<HTMLElement>(MENU_ITEMS);
    start?.focus();
  }, [open, positioned]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const menu = menuRef.current;
      const trigger = triggerRef.current;
      const active = document.activeElement;
      const inMenu = !!menu && menu.contains(active);
      if (e.key === 'Escape') {
        setOpen(false);
        // Focus was inside the menu, which is about to go: hand it back rather than lose it.
        if (inMenu) trigger?.focus();
        return;
      }
      // The rest are the menu's keys only while focus is in it or on its trigger.
      if (!menu || !(inMenu || active === trigger)) return;
      const onItem = inMenu && !!active?.matches(MENU_ITEMS);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const stops = Array.from(menu.querySelectorAll<HTMLElement>(KEYBOARD_STOPS));
        if (stops.length === 0) return;
        e.preventDefault(); // keep the page, the list and a header field's caret still
        const at = stops.findIndex((stop) => stop === active);
        const next = e.key === 'ArrowDown' ? (at + 1) % stops.length : at <= 0 ? stops.length - 1 : at - 1;
        stops[next].focus();
      } else if ((e.key === 'Home' || e.key === 'End') && onItem) {
        // In a header field these move the caret, so only the rows take them.
        const rows = menu.querySelectorAll<HTMLElement>(MENU_ITEMS);
        e.preventDefault();
        rows[e.key === 'Home' ? 0 : rows.length - 1]?.focus();
      } else if (e.key === 'Tab') {
        // Tab leaves the menu: close it and let the key carry on from the trigger. A header
        // field is the exception going forwards, where Tab steps into the rows as usual.
        const leaving = onItem || (e.shiftKey && inMenu);
        if (!leaving) return;
        setOpen(false);
        trigger?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <>
      {trigger({ ref: triggerRef, onClick: toggle, open })}
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            className={`lc-menu${className ? ` ${className}` : ''}`}
            role="menu"
            aria-label={ariaLabel}
            style={{ width, ...(coords ? { top: coords.top, left: coords.left } : { visibility: 'hidden' as const }) }}
          >
            {header}
            <div className="lc-menu__items lc-scrollbar-thin">
              {items.length === 0 && emptyState}
              {items.map((item, i) => (
                <Fragment key={item.key ?? i}>
                  <button
                    type="button"
                    role={item.checked === undefined ? 'menuitem' : 'menuitemcheckbox'}
                    aria-checked={item.checked}
                    className={`lc-menu__item${item.danger ? ' lc-menu__item--danger' : ''}${item.selected ? ' lc-menu__item--selected' : ''}`}
                    disabled={item.disabled}
                    onClick={(e) => {
                      if (closeOnItemClick) {
                        setOpen(false);
                        // Picked from the keyboard (a click with no pointer behind it): focus goes
                        // back to the trigger instead of vanishing with the menu.
                        if (e.detail === 0) triggerRef.current?.focus();
                      }
                      item.onClick?.();
                    }}
                  >
                    {item.checked !== undefined && (
                      <span className="lc-menu__check" data-checked={item.checked} aria-hidden="true">
                        {item.checked === true && <CheckIcon />}
                      </span>
                    )}
                    {item.icon && <span className="lc-menu__item-icon">{item.icon}</span>}
                    <span className="lc-menu__item-label">{item.label}</span>
                    {item.trailingIcon && (
                      <span className="lc-menu__item-icon lc-menu__item-icon--trailing">{item.trailingIcon}</span>
                    )}
                  </button>
                  {item.dividerAfter && <div role="separator" className="lc-menu__divider" />}
                </Fragment>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

export interface ActionMenuProps {
  items: MenuItemData[];
  /** Icon for the trigger button — typically a dots-vertical glyph. */
  icon: ReactNode;
  tooltip?: string;
  ariaLabel: string;
  align?: 'start' | 'end';
  width?: number;
  className?: string;
  triggerClassName?: string;
}

/** The common row-actions case: a dots-vertical trigger with a "More actions" tooltip. */
export function ActionMenu({
  items,
  icon,
  tooltip = 'More actions',
  ariaLabel,
  align,
  width,
  className,
  triggerClassName,
}: ActionMenuProps) {
  return (
    <Menu
      items={items}
      ariaLabel={ariaLabel}
      align={align}
      width={width}
      className={className}
      trigger={({ ref, onClick, open }) => (
        <Tooltip label={tooltip} disabled={open}>
          <button
            ref={ref}
            type="button"
            className={`lc-menu__trigger${triggerClassName ? ` ${triggerClassName}` : ''}`}
            aria-label={tooltip}
            onClick={onClick}
          >
            {icon}
          </button>
        </Tooltip>
      )}
    />
  );
}

export default Menu;
