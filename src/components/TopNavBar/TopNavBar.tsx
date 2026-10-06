/**
 * TopNavBar — LimeChat product top navigation bar.
 *
 * A 56px white bar: product wordmark + breadcrumb on the left, a
 * product-specific CTA slot, the product-switcher button and the account chip
 * on the right. Ported 1:1 from the LimeChat Design System V3 (Figma node 8847:4018).
 *
 * Presentation-only and data-driven. Pass `breadcrumbs`, an `actions` node for
 * the CTA area, `products`, `account` and `accountMenu`. Product presets
 * (Campaigns / HelpDesk / Automation), plus the `TopNavButton` / `TopNavSelect`
 * CTA building blocks, live in `./presets`.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { TopNavIcon } from './icons';
import { Tooltip } from '../Tooltip';
import { ProductSwitcher, type ProductSwitcherItem } from '../ProductSwitcher';
import { AccountSwitcher, type AccountSwitcherProps } from '../AccountSwitcher';
import { Avatar } from '../Avatar';
import { useDismiss } from '../../hooks/useDismiss';
import './TopNavBar.css';

export interface TopNavCrumb {
  label: string;
  onClick?: () => void;
  /** Renders a "Click to copy" tooltip and copies `label` to the clipboard on click. */
  copyable?: boolean;
}

export interface TopNavAccount {
  name: string;
}

export interface TopNavBarProps {
  /** Product wordmark. A string renders as bold brand-green text; a node (e.g. `<img />`) renders as-is. */
  logo?: ReactNode;
  /** The last crumb is the current page. */
  breadcrumbs?: TopNavCrumb[];
  /** Right-side CTA slot — a `<TopNavSelect />`, one or more `<TopNavButton />`, etc. */
  actions?: ReactNode;
  /** The 9-dot apps button toggles a `ProductSwitcher` popover with these products. */
  products: ProductSwitcherItem[];
  selectedProductId?: string;
  onProductChange?: (id: string) => void;
  /** Avatar-only account chip ("No name" variant, Figma node 9755:6709); the name shows as a tooltip. */
  account: TopNavAccount;
  /** Clicking the account chip toggles this `AccountSwitcher` popover. */
  accountMenu: AccountSwitcherProps;
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
  return (
    <li className={`lc-topnav__crumb${isCurrent ? ' lc-topnav__crumb--current' : ''}`}>
      {crumb.copyable ? (
        <CopyableCrumbLabel crumb={crumb} isCurrent={isCurrent} />
      ) : isCurrent ? (
        <span className="lc-topnav__crumb-link" aria-current="page">
          {crumb.label}
        </span>
      ) : crumb.onClick ? (
        <button type="button" className="lc-topnav__crumb-link" onClick={crumb.onClick}>
          {crumb.label}
        </button>
      ) : (
        <span className="lc-topnav__crumb-link">{crumb.label}</span>
      )}
      {!isCurrent && <TopNavIcon name="slash" className="lc-topnav__separator" />}
    </li>
  );
}

export function TopNavBar({
  logo,
  breadcrumbs = [],
  actions,
  products,
  selectedProductId,
  onProductChange,
  account,
  accountMenu,
}: TopNavBarProps) {
  const appsWrapRef = useRef<HTMLDivElement>(null);
  const accountWrapRef = useRef<HTMLDivElement>(null);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  useDismiss([
    { open: switcherOpen, ref: appsWrapRef, onClose: () => setSwitcherOpen(false) },
    { open: accountMenuOpen, ref: accountWrapRef, onClose: () => setAccountMenuOpen(false) },
  ]);

  return (
    <header className="lc-topnav" data-anchor="top-nav-bar">
      <div className="lc-topnav__side">
        {logo != null && <span className="lc-topnav__logo">{logo}</span>}

        {breadcrumbs.length > 0 && (
          <div className="lc-topnav__breadcrumb">
            <nav aria-label="Breadcrumb">
              <ol className="lc-topnav__crumbs">
                {breadcrumbs.map((crumb, i) => (
                  <Crumb key={`${crumb.label}-${i}`} crumb={crumb} isCurrent={i === breadcrumbs.length - 1} />
                ))}
              </ol>
            </nav>
          </div>
        )}
      </div>

      <div className="lc-topnav__side lc-topnav__side--end">
        {actions}

        <div className="lc-topnav__apps-wrap" ref={appsWrapRef}>
          <button
            type="button"
            className="lc-topnav__icon-button lc-topnav__icon-button--apps"
            onClick={() => setSwitcherOpen((o) => !o)}
            aria-label="Switch product"
            aria-haspopup="menu"
            aria-expanded={switcherOpen}
          >
            <TopNavIcon name="grid-dots" />
          </button>

          {switcherOpen && (
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

        <div className="lc-topnav__account-wrap" ref={accountWrapRef}>
          <Tooltip label={account.name} position="bottom-end" arrowPosition="side">
            <button
              type="button"
              className="lc-topnav__account"
              onClick={() => setAccountMenuOpen((o) => !o)}
              aria-label={account.name}
              aria-haspopup="dialog"
              aria-expanded={accountMenuOpen}
            >
              <Avatar className="lc-topnav__account-avatar" alt={account.name} size={30} radius="xs">
                {account.name.trim().charAt(0)}
              </Avatar>
            </button>
          </Tooltip>
          {accountMenuOpen && (
            <AccountSwitcher
              {...accountMenu}
              className="lc-topnav__account-popover"
              onSelect={(id) => {
                accountMenu.onSelect?.(id);
                setAccountMenuOpen(false);
              }}
            />
          )}
        </div>
      </div>
    </header>
  );
}

export default TopNavBar;
