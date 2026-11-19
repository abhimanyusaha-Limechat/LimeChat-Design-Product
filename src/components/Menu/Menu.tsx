/**
 * Menu — the LimeChat design system's shared popover-menu shell.
 *
 * A data-driven adapter over arceus `Menu` (Mantine): positioning, portal,
 * outside-click and Escape handling all come from arceus. This file only maps
 * the `items` / `trigger` API the screens use onto arceus's compound parts.
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
import { useState, type ReactNode, type Ref } from 'react';
import { ActionIcon, Menu as ArceusMenu, Tooltip } from 'arceus';
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
  /** Highlights the row for the currently active option in a single-select list. */
  selected?: boolean;
}

export interface MenuTriggerRenderProps {
  /** Always null: arceus attaches its own ref to the trigger element. Kept so triggers can spread props. */
  ref: Ref<HTMLButtonElement>;
  /** No-op: arceus toggles the menu when the trigger is clicked. Kept so triggers can spread props. */
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

const noop = () => undefined;

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

  return (
    <ArceusMenu
      opened={open}
      onChange={setOpen}
      position={align === 'end' ? 'bottom-end' : 'bottom-start'}
      width={width}
      closeOnItemClick={closeOnItemClick}
      withinPortal
    >
      <ArceusMenu.Target>{trigger({ ref: null, onClick: noop, open })}</ArceusMenu.Target>
      <ArceusMenu.Dropdown className={`lc-menu${className ? ` ${className}` : ''}`} aria-label={ariaLabel}>
        {header}
        <div className="lc-menu__items lc-scrollbar-thin">
          {items.length === 0 && emptyState}
          {items.map((item, i) => (
            <ArceusMenu.Item
              key={item.key ?? i}
              leftSection={item.icon}
              rightSection={item.trailingIcon}
              color={item.danger ? 'red' : undefined}
              disabled={item.disabled}
              data-selected={item.selected || undefined}
              className="lc-menu__item"
              onClick={item.onClick}
            >
              {item.label}
            </ArceusMenu.Item>
          ))}
        </div>
      </ArceusMenu.Dropdown>
    </ArceusMenu>
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
      trigger={({ open }) => (
        <Tooltip label={tooltip} disabled={open}>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="xs"
            className={`lc-menu__trigger${triggerClassName ? ` ${triggerClassName}` : ''}`}
            aria-label={tooltip}
          >
            {icon}
          </ActionIcon>
        </Tooltip>
      )}
    />
  );
}

export default Menu;
