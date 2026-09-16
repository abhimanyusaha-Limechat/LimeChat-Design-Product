/**
 * TopNavBar — LimeChat product top navigation bar.
 *
 * A 64px white bar: product wordmark + breadcrumb + status badges on the left,
 * a product-specific CTA slot, an apps-menu button and the account chip on the
 * right. Ported 1:1 from the LimeChat Design System V3 (Figma node 8847:4018).
 *
 * Presentation-only and data-driven. Pass `breadcrumbs`, `badges`, `updatedAt`,
 * an `actions` node for the CTA area, and `account`. Product presets (Campaigns
 * / HelpDesk / Automation), plus the `TopNavButton` / `TopNavSelect` CTA
 * building blocks, live in `./presets`.
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { TopNavIcon } from './icons';
import { Tooltip } from '../Tooltip';
import { ProductSwitcher, type ProductSwitcherItem } from '../ProductSwitcher';
import { AccountSwitcher, type AccountSwitcherProps } from '../AccountSwitcher';
import { Avatar } from '../Avatar';
import './TopNavBar.css';

export interface TopNavCrumb {
  label: string;
  href?: string;
  onClick?: () => void;
  /** Marks the active crumb (dark, non-interactive). Defaults to the last one. */
  current?: boolean;
  /** Renders a "Click to copy" tooltip and copies `label` to the clipboard on click. */
  copyable?: boolean;
}

export interface TopNavBadge {
  label: string;
  tone?: 'info' | 'draft';
}

export interface TopNavAccount {
  name: string;
  /** Avatar glyph; defaults to the first letter of `name`. */
  initial?: string;
  /** Image avatar; overrides `initial` when set. */
  avatarSrc?: string;
  /** Compact "No name" variant — avatar only, no name label (Figma node 9755:6709). */
  compact?: boolean;
  onClick?: () => void;
}

export interface TopNavBarProps {
  /** Product wordmark. A string renders as bold brand-green text; a node (e.g. `<img />`) renders as-is. */
  logo?: ReactNode;
  /** Called when the wordmark is clicked; renders it as a button when set. */
  onLogoClick?: () => void;
  breadcrumbs?: TopNavCrumb[];
  /** Status pills after the breadcrumb, e.g. `[{ label: 'ID number' }, { label: 'draft', tone: 'draft' }]`. */
  badges?: TopNavBadge[];
  /** Renders the edit pencil after the badges when provided. */
  onEdit?: () => void;
  /** Renders `Updated: {updatedAt}` after the breadcrumb (HelpDesk pattern). */
  updatedAt?: string;
  /** Right-side CTA slot — a `<TopNavSelect />`, one or more `<TopNavButton />`, etc. */
  actions?: ReactNode;
  /** Show the 9-dot apps menu button. Default `true`. */
  showAppsMenu?: boolean;
  /** Called when the apps-menu button is clicked. Ignored when `products` is set (the button opens the product switcher instead). */
  onAppsMenuClick?: () => void;
  /** When set, the apps-menu button toggles a `ProductSwitcher` popover with these products. */
  products?: ProductSwitcherItem[];
  selectedProductId?: string;
  onProductChange?: (id: string) => void;
  account?: TopNavAccount;
  /** When set, clicking the account chip toggles an `AccountSwitcher` popover. */
  accountMenu?: AccountSwitcherProps;
  className?: string;
  style?: CSSProperties;
}

/** Copy-to-clipboard crumb label — "Click to copy" tooltip; the label itself flips to "Copied" briefly on click. */
function CopyableCrumbLabel({ crumb, isCurrent }: { crumb: TopNavCrumb; isCurrent: boolean }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(crumb.label);
    } catch {
      // Clipboard access denied/unavailable — the label simply won't confirm.
    }
    crumb.onClick?.();
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1000);
  };

  return (
    <Tooltip label="Click to copy" position="bottom">
      <button
        type="button"
        className={`lc-topnav__crumb-link lc-topnav__crumb-link--copyable${
          copied ? ' lc-topnav__crumb-link--copied' : ''
        }`}
        onClick={handleClick}
        aria-current={isCurrent ? 'page' : undefined}
      >
        {copied ? 'Copied' : crumb.label}
      </button>
    </Tooltip>
  );
}

function Crumb({ crumb, isCurrent }: { crumb: TopNavCrumb; isCurrent: boolean }) {
  const className = `lc-topnav__crumb${isCurrent ? ' lc-topnav__crumb--current' : ''}`;
  const label = <span className="lc-topnav__crumb-link">{crumb.label}</span>;

  return (
    <li className={className}>
      {crumb.copyable ? (
        <CopyableCrumbLabel crumb={crumb} isCurrent={isCurrent} />
      ) : isCurrent ? (
        <span className="lc-topnav__crumb-link" aria-current="page">
          {crumb.label}
        </span>
      ) : crumb.href ? (
        <a className="lc-topnav__crumb-link" href={crumb.href} onClick={crumb.onClick}>
          {crumb.label}
        </a>
      ) : crumb.onClick ? (
        <button type="button" className="lc-topnav__crumb-link" onClick={crumb.onClick}>
          {crumb.label}
        </button>
      ) : (
        label
      )}
      {!isCurrent && <TopNavIcon name="slash" className="lc-topnav__separator" />}
    </li>
  );
}

function AccountChip({
  account,
  onClick,
  menuExpanded,
}: {
  account: TopNavAccount;
  /** Overrides `account.onClick` (used to toggle the account-switch popover). */
  onClick?: () => void;
  menuExpanded?: boolean;
}) {
  const inner = (
    <>
      {!account.compact && <span className="lc-topnav__account-name">{account.name}</span>}
      <Avatar
        className="lc-topnav__account-avatar"
        src={account.avatarSrc}
        alt={account.compact ? account.name : ''}
        size={30}
        radius="xs"
      >
        {account.avatarSrc ? undefined : (account.initial ?? account.name.trim().charAt(0))}
      </Avatar>
    </>
  );

  const handleClick = onClick ?? account.onClick;
  const className = `lc-topnav__account${account.compact ? ' lc-topnav__account--compact' : ''}`;
  const chip = handleClick ? (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      aria-label={account.compact ? account.name : undefined}
      aria-haspopup={menuExpanded !== undefined ? 'dialog' : undefined}
      aria-expanded={menuExpanded}
    >
      {inner}
    </button>
  ) : (
    <div className={className} aria-label={account.compact ? account.name : undefined}>
      {inner}
    </div>
  );

  // The compact chip hides the name — surface it on hover / focus.
  return account.compact ? (
    <Tooltip label={account.name} position="bottom-end" arrowPosition="side">
      {chip}
    </Tooltip>
  ) : (
    chip
  );
}

export function TopNavBar({
  logo,
  onLogoClick,
  breadcrumbs = [],
  badges = [],
  onEdit,
  updatedAt,
  actions,
  showAppsMenu = true,
  onAppsMenuClick,
  products,
  selectedProductId,
  onProductChange,
  account,
  accountMenu,
  className,
  style,
}: TopNavBarProps) {
  const lastIndex = breadcrumbs.length - 1;
  const hasCurrent = breadcrumbs.some((c) => c.current);

  const appsMenuIsSwitcher = products != null && products.length > 0;
  const appsWrapRef = useRef<HTMLDivElement>(null);
  const accountWrapRef = useRef<HTMLDivElement>(null);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  useEffect(() => {
    if (!switcherOpen && !accountMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (switcherOpen && !appsWrapRef.current?.contains(t)) setSwitcherOpen(false);
      if (accountMenuOpen && !accountWrapRef.current?.contains(t)) setAccountMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setSwitcherOpen(false);
      setAccountMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [switcherOpen, accountMenuOpen]);

  return (
    <header className={`lc-topnav${className ? ` ${className}` : ''}`} style={style}>
      <div className="lc-topnav__side">
        {logo != null &&
          (onLogoClick ? (
            <button
              type="button"
              className="lc-topnav__logo lc-topnav__logo--button"
              onClick={onLogoClick}
            >
              {logo}
            </button>
          ) : (
            <span className="lc-topnav__logo">{logo}</span>
          ))}

        {(breadcrumbs.length > 0 || badges.length > 0 || onEdit || updatedAt) && (
          <div className="lc-topnav__breadcrumb">
            {breadcrumbs.length > 0 && (
              <nav aria-label="Breadcrumb">
                <ol className="lc-topnav__crumbs">
                  {breadcrumbs.map((crumb, i) => (
                    <Crumb
                      key={`${crumb.label}-${i}`}
                      crumb={crumb}
                      isCurrent={crumb.current ?? (!hasCurrent && i === lastIndex)}
                    />
                  ))}
                </ol>
              </nav>
            )}

            {badges.map((badge, i) => (
              <span
                key={`${badge.label}-${i}`}
                className={`lc-topnav__badge lc-topnav__badge--${badge.tone ?? 'info'}`}
              >
                {badge.label}
              </span>
            ))}

            {onEdit && (
              <button
                type="button"
                className="lc-topnav__icon-button lc-topnav__icon-button--edit"
                onClick={onEdit}
                aria-label="Edit"
              >
                <TopNavIcon name="edit" />
              </button>
            )}

            {updatedAt && <span className="lc-topnav__updated">Updated: {updatedAt}</span>}
          </div>
        )}
      </div>

      <div className="lc-topnav__side lc-topnav__side--end">
        {actions}

        {showAppsMenu && (
          <div className="lc-topnav__apps-wrap" ref={appsWrapRef}>
            <button
              type="button"
              className="lc-topnav__icon-button lc-topnav__icon-button--apps"
              onClick={() =>
                appsMenuIsSwitcher ? setSwitcherOpen((o) => !o) : onAppsMenuClick?.()
              }
              aria-label={appsMenuIsSwitcher ? 'Switch product' : 'Apps menu'}
              aria-haspopup={appsMenuIsSwitcher ? 'menu' : undefined}
              aria-expanded={appsMenuIsSwitcher ? switcherOpen : undefined}
            >
              <TopNavIcon name="grid-dots" />
            </button>

            {appsMenuIsSwitcher && switcherOpen && (
              <ProductSwitcher
                className="lc-topnav__apps-popover"
                products={products}
                selectedId={selectedProductId}
                arrowOffset="calc(100% - 15px)"
                onSelect={(id) => {
                  onProductChange?.(id);
                  setSwitcherOpen(false);
                }}
              />
            )}
          </div>
        )}

        {account &&
          (accountMenu ? (
            <div className="lc-topnav__account-wrap" ref={accountWrapRef}>
              <AccountChip
                account={account}
                onClick={() => setAccountMenuOpen((o) => !o)}
                menuExpanded={accountMenuOpen}
              />
              {accountMenuOpen && (
                <AccountSwitcher
                  {...accountMenu}
                  className={`lc-topnav__account-popover${
                    accountMenu.className ? ` ${accountMenu.className}` : ''
                  }`}
                  onSelect={(id) => {
                    accountMenu.onSelect?.(id);
                    setAccountMenuOpen(false);
                  }}
                />
              )}
            </div>
          ) : (
            <AccountChip account={account} />
          ))}
      </div>
    </header>
  );
}

export default TopNavBar;
