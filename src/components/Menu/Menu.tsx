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
 */
import { useEffect, useRef, useState, type ReactNode, type Ref } from 'react';
import { createPortal } from 'react-dom';
import { Tooltip } from '../Tooltip';
import { usePopoverPosition } from '../../hooks/usePopoverPosition';
import './Menu.css';

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

  // Rows/cards often animate with a `transform`, which establishes a stacking
  // context even at rest — a menu positioned inside its own row can end up
  // painted behind a later row's stacking context despite z-index. Portalling
  // to <body> (like Tooltip already does) sidesteps that entirely.
  const coords = usePopoverPosition(open, triggerRef, menuRef, width, align);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
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
      {trigger({ ref: triggerRef, onClick: () => setOpen((o) => !o), open })}
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
            <div className="lc-menu__items">
              {items.length === 0 && emptyState}
              {items.map((item, i) => (
                <button
                  key={item.key ?? i}
                  type="button"
                  role="menuitem"
                  className={`lc-menu__item${item.danger ? ' lc-menu__item--danger' : ''}${item.selected ? ' lc-menu__item--selected' : ''}`}
                  disabled={item.disabled}
                  onClick={() => {
                    if (closeOnItemClick) setOpen(false);
                    item.onClick?.();
                  }}
                >
                  {item.icon && <span className="lc-menu__item-icon">{item.icon}</span>}
                  <span className="lc-menu__item-label">{item.label}</span>
                  {item.trailingIcon && (
                    <span className="lc-menu__item-icon lc-menu__item-icon--trailing">{item.trailingIcon}</span>
                  )}
                </button>
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
