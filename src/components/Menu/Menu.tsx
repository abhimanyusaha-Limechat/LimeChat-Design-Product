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
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from 'react';
import { createPortal } from 'react-dom';
import { Tooltip } from '../Tooltip';
import './Menu.css';

export interface MenuItemData {
  key?: string;
  label: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
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
}

/** The shared trigger + portal-positioned dropdown. Closes on outside click, Escape, scroll, or resize-driven reposition. */
export function Menu({ items, trigger, ariaLabel, align = 'end', width = 190, className }: MenuProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Rows/cards often animate with a `transform`, which establishes a stacking
  // context even at rest — a menu positioned inside its own row can end up
  // painted behind a later row's stacking context despite z-index. Portalling
  // to <body> (like Tooltip already does) sidesteps that entirely.
  useLayoutEffect(() => {
    if (!open) return;
    const reposition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setCoords({
        top: rect.bottom + 6,
        left: align === 'end' ? rect.right - width : rect.left,
      });
    };
    reposition();
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open, align, width]);

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
            {items.map((item, i) => (
              <button
                key={item.key ?? i}
                type="button"
                role="menuitem"
                className={`lc-menu__item${item.danger ? ' lc-menu__item--danger' : ''}`}
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  item.onClick?.();
                }}
              >
                {item.icon && <span className="lc-menu__item-icon">{item.icon}</span>}
                {item.label}
              </button>
            ))}
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
