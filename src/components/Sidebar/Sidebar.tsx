/**
 * Sidebar — LimeChat product rail navigation.
 *
 * A 72px vertical rail with the LimeChat brand mark at the top, a scrollable
 * stack of icon-only nav items in the middle, and a pinned footer (quick
 * actions + user avatar) at the bottom. Ported 1:1 from the LimeChat Design
 * System V3 (Figma node 8773:1123).
 *
 * The component is presentation-only and fully data-driven: pass the nav
 * `items`, the `selectedId`, and an `onSelect` handler. Product presets live
 * in `./presets`.
 */
import { useRef, useState, type ReactNode } from 'react';
import { LimeChatLogo, SidebarIcon, type SidebarIconName } from './icons';
import { Tooltip } from '../Tooltip';
import { Avatar } from '../Avatar';
import { useDismiss } from '../../hooks/useDismiss';
import './Sidebar.css';
import '../scrollbar-hidden.css';

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon?: SidebarIconName | ReactNode;
  onClick?: () => void;
  /** Renders in the destructive red treatment (e.g. Logout). */
  danger?: boolean;
}

export interface SidebarItem {
  /** Stable identifier, also used as the selection key. */
  id: string;
  /** Accessible label — shown as the hover tooltip. */
  label: string;
  /** Named icon from the built-in set, or any custom node (e.g. an <svg />). */
  icon: SidebarIconName | ReactNode;
}

export interface SidebarProps {
  /** Primary navigation items rendered in the scrollable middle section. */
  items: SidebarItem[];
  /** id of the currently active item. */
  selectedId?: string;
  /** Called with the item id when a nav item is activated. */
  onSelect?: (id: string) => void;
  /** Secondary actions pinned above the avatar (e.g. WhatsApp, notifications). */
  footerItems?: SidebarItem[];
  /** Signed-in user, shown as initials; the avatar opens `menuItems` as a popover. */
  profile?: { name: string; menuItems: SidebarMenuItem[] };
  /** Brand-mark click handler. */
  logo?: { onClick: () => void };
}

function renderIcon(icon: SidebarItem['icon']): ReactNode {
  return typeof icon === 'string' ? <SidebarIcon name={icon as SidebarIconName} /> : icon;
}

/** Popover menu anchored above the avatar (the rail sits at the screen edge, so it opens up + right). */
function ProfileMenu({ items, onSelect }: { items: SidebarMenuItem[]; onSelect: (item: SidebarMenuItem) => void }) {
  return (
    <div className="lc-sidebar__profile-menu" role="menu" aria-label="Profile menu">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="menuitem"
          className={`lc-sidebar__profile-menu-item${item.danger ? ' lc-sidebar__profile-menu-item--danger' : ''}`}
          onClick={() => onSelect(item)}
        >
          <span className="lc-sidebar__profile-menu-icon">{renderIcon(item.icon)}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

/** A nav button wrapped in a right-aligned label Tooltip. */
function SidebarEntry({
  item,
  selected,
  onSelect,
}: {
  item: SidebarItem;
  selected: boolean;
  onSelect?: (id: string) => void;
}) {
  return (
    <Tooltip
      label={item.label}
      position="right"
      arrowPosition="center"
      openDelay={2000}
      closeDelay={50}
      instantGrace={false}
    >
      <button
        type="button"
        className={`lc-sidebar__item${selected ? ' lc-sidebar__item--selected' : ''}`}
        aria-label={item.label}
        aria-pressed={selected}
        onClick={() => onSelect?.(item.id)}
      >
        {renderIcon(item.icon)}
      </button>
    </Tooltip>
  );
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('');
}

export function Sidebar({ items, selectedId, onSelect, footerItems = [], profile, logo }: SidebarProps) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileWrapRef = useRef<HTMLDivElement>(null);

  useDismiss([
    { open: profileMenuOpen, ref: profileWrapRef, onClose: () => setProfileMenuOpen(false) },
  ]);

  return (
    <div className="lc-sidebar" data-anchor="sidebar">
      <button type="button" className="lc-sidebar__logo" onClick={logo?.onClick} aria-label="LimeChat home">
        <LimeChatLogo />
      </button>

      <nav className="lc-sidebar__nav lc-scrollbar-hidden" aria-label="Primary">
        {items.map((item) => (
          <SidebarEntry key={item.id} item={item} selected={item.id === selectedId} onSelect={onSelect} />
        ))}
      </nav>

      <div className="lc-sidebar__footer">
        {footerItems.map((item) => (
          <SidebarEntry key={item.id} item={item} selected={item.id === selectedId} onSelect={onSelect} />
        ))}

        {profile && (
          <div className="lc-sidebar__profile-wrap" ref={profileWrapRef}>
            <Avatar
              className="lc-sidebar__avatar"
              alt={profile.name}
              size="md"
              radius="xs"
              role="button"
              tabIndex={0}
              aria-haspopup="menu"
              aria-expanded={profileMenuOpen}
              onClick={() => setProfileMenuOpen((o) => !o)}
            >
              {initials(profile.name)}
            </Avatar>
            {profileMenuOpen && (
              <ProfileMenu
                items={profile.menuItems}
                onSelect={(item) => {
                  setProfileMenuOpen(false);
                  item.onClick?.();
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
