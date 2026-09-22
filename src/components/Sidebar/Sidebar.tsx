/**
 * Sidebar — LimeChat product rail navigation.
 *
 * A 72px vertical rail with the LimeChat brand mark at the top, a scrollable
 * stack of icon-only nav items in the middle, and a pinned footer (quick
 * actions + user avatar) at the bottom. Ported 1:1 from the LimeChat Design
 * System V3 (Figma node 8773:1123).
 *
 * The component is presentation-only and fully data-driven: pass the nav
 * `items`, the `selectedId`, and an `onSelect` handler (or per-item `href`s for
 * link-based routing). Product presets live in `./presets`.
 */
import { useId, useRef, useState, type ReactNode } from 'react';
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
  /** Accessible label — shown to assistive tech and as the native tooltip. */
  label: string;
  /** Named icon from the built-in set, or any custom node (e.g. an <svg />). */
  icon: SidebarIconName | React.ReactNode;
  /** Render as a link instead of a button when provided. */
  href?: string;
  /** Per-item click handler; receives the item id. Runs after `onSelect`. */
  onClick?: (id: string) => void;
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
  /** Signed-in user. Renders initials when `avatarUrl` is omitted. */
  profile?: {
    name: string;
    avatarUrl?: string;
    /** Ignored when `menuItems` is set — the avatar opens the popover instead. */
    onClick?: () => void;
    /** Shown as a popover menu above the avatar when clicked (e.g. Profile settings, Account settings, Logout). */
    menuItems?: SidebarMenuItem[];
  };
  /** Brand-mark target. A string renders an anchor; a function renders a button. */
  logo?: { href?: string; onClick?: () => void; label?: string };
  /** Accessible name for the <nav> landmark. */
  ariaLabel?: string;
  /** Show a label tooltip to the right of each item on hover / focus. Default `true`. */
  showTooltips?: boolean;
  className?: string;
  style?: React.CSSProperties;
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

function SidebarLogo({ logo }: { logo: SidebarProps['logo'] }) {
  const label = logo?.label ?? 'LimeChat home';

  if (logo?.href) {
    return (
      <a className="lc-sidebar__logo" href={logo.href} onClick={logo.onClick} aria-label={label}>
        <LimeChatLogo />
      </a>
    );
  }
  if (logo?.onClick) {
    return (
      <button type="button" className="lc-sidebar__logo" onClick={logo.onClick} aria-label={label}>
        <LimeChatLogo />
      </button>
    );
  }
  return (
    <div className="lc-sidebar__logo" aria-label={label}>
      <LimeChatLogo />
    </div>
  );
}

function ActionControl({
  item,
  selected,
  onSelect,
  nativeTitle = true,
  ...rest
}: {
  item: SidebarItem;
  selected: boolean;
  onSelect?: (id: string) => void;
  /** Set the native `title` attribute (disable when a custom Tooltip wraps this). */
  nativeTitle?: boolean;
  /** Forwarded to the rendered control (e.g. `aria-describedby` injected by Tooltip). */
  'aria-describedby'?: string;
}) {
  const className = `lc-sidebar__item${selected ? ' lc-sidebar__item--selected' : ''}`;
  const title = nativeTitle ? item.label : undefined;
  const activate = () => {
    onSelect?.(item.id);
    item.onClick?.(item.id);
  };

  if (item.href) {
    return (
      <a
        className={className}
        href={item.href}
        aria-label={item.label}
        title={title}
        aria-current={selected ? 'page' : undefined}
        onClick={activate}
        {...rest}
      >
        {renderIcon(item.icon)}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={className}
      aria-label={item.label}
      title={title}
      aria-pressed={selected}
      onClick={activate}
      {...rest}
    >
      {renderIcon(item.icon)}
    </button>
  );
}

/** An ActionControl, optionally wrapped in a right-aligned label Tooltip. */
function SidebarEntry({
  item,
  selected,
  onSelect,
  withTooltip,
}: {
  item: SidebarItem;
  selected: boolean;
  onSelect?: (id: string) => void;
  withTooltip: boolean;
}) {
  if (!withTooltip || !item.label) {
    return <ActionControl item={item} selected={selected} onSelect={onSelect} />;
  }
  return (
    <Tooltip
      label={item.label}
      position="right"
      arrowPosition="center"
      openDelay={2000}
      closeDelay={50}
      instantGrace={false}
    >
      <ActionControl item={item} selected={selected} onSelect={onSelect} nativeTitle={false} />
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

export function Sidebar({
  items,
  selectedId,
  onSelect,
  footerItems = [],
  profile,
  logo,
  ariaLabel = 'Primary',
  showTooltips = true,
  className,
  style,
}: SidebarProps) {
  const navId = useId();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileWrapRef = useRef<HTMLDivElement>(null);
  const hasProfileMenu = !!profile?.menuItems && profile.menuItems.length > 0;

  useDismiss([
    { open: profileMenuOpen, ref: profileWrapRef, onClose: () => setProfileMenuOpen(false) },
  ]);

  return (
    <div className={`lc-sidebar${className ? ` ${className}` : ''}`} style={style}>
      <SidebarLogo logo={logo} />

      <nav
        className="lc-sidebar__nav lc-scrollbar-hidden"
        aria-label={ariaLabel}
        id={navId}
        aria-orientation="vertical"
      >
        {items.map((item) => (
          <SidebarEntry
            key={item.id}
            item={item}
            selected={item.id === selectedId}
            onSelect={onSelect}
            withTooltip={showTooltips}
          />
        ))}
      </nav>

      {(footerItems.length > 0 || profile) && (
        <div className="lc-sidebar__footer">
          {footerItems.map((item) => (
            <SidebarEntry
              key={item.id}
              item={item}
              selected={item.id === selectedId}
              onSelect={onSelect}
              withTooltip={showTooltips}
            />
          ))}

          {profile && (
            <div className="lc-sidebar__profile-wrap" ref={profileWrapRef}>
              <Avatar
                className="lc-sidebar__avatar"
                src={profile.avatarUrl}
                alt={profile.name}
                size="md"
                radius="xs"
                {...(hasProfileMenu
                  ? {
                      onClick: () => setProfileMenuOpen((o) => !o),
                      role: 'button' as const,
                      tabIndex: 0,
                      'aria-haspopup': 'menu' as const,
                      'aria-expanded': profileMenuOpen,
                    }
                  : profile.onClick
                    ? { onClick: profile.onClick, role: 'button' as const, tabIndex: 0 }
                    : {})}
              >
                {profile.avatarUrl ? undefined : initials(profile.name)}
              </Avatar>
              {hasProfileMenu && profileMenuOpen && (
                <ProfileMenu
                  items={profile.menuItems!}
                  onSelect={(item) => {
                    setProfileMenuOpen(false);
                    item.onClick?.();
                  }}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Sidebar;
