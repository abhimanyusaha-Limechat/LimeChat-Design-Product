/**
 * AccountSwitcher — LimeChat design system (Figma node 9753:518, "Account switch").
 *
 * A panel with the current-account header, a search field, and a scrollable list
 * of accounts. Presentation-only and fully controlled — you own the search value
 * and the visible page of `accounts`.
 *
 *   <AccountSwitcher
 *     current={{ id: 'a0', name: '30 sundays', number: '12345561', avatarSrc }}
 *     accounts={page}
 *     selectedId={activeId}
 *     onSelect={switchAccount}
 *     searchValue={q}
 *     onSearchChange={setQ}
 *   />
 *
 * Note: pagination is temporarily not rendered. The `pagination` prop and
 * `AccountSwitcherPagination` type are retained so it can be restored later.
 */
import type { CSSProperties, ReactNode } from 'react';
import { Avatar } from '../Avatar';
import './AccountSwitcher.css';

export interface SwitcherAccount {
  id: string;
  name: string;
  /** Company / account id shown under the name. */
  number: string;
  avatarSrc?: string;
}

export interface AccountSwitcherPagination {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface AccountSwitcherProps {
  /** The signed-in account shown in the header. */
  current: SwitcherAccount;
  /** Accounts for the current page. */
  accounts: SwitcherAccount[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  pagination?: AccountSwitcherPagination;
  /** Extra content above the list (rarely needed). */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const Icon = ({ d }: { d: string | string[] }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {(Array.isArray(d) ? d : [d]).map((p) => (
      <path key={p} d={p} />
    ))}
  </svg>
);
const ICONS = {
  search: ['M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0', 'M21 21l-6 -6'],
};

// Pagination is temporarily removed — see AccountSwitcherPagination / the `pagination`
// prop, which are kept so it can be restored without an API change.

export function AccountSwitcher({
  current,
  accounts,
  selectedId,
  onSelect,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search by name or id',
  children,
  className,
  style,
}: AccountSwitcherProps) {
  return (
    <div className={`lc-account-switcher${className ? ` ${className}` : ''}`} style={style} role="dialog" aria-label="Switch account">
      <div className="lc-account-switcher__header">
        <Avatar src={current.avatarSrc} alt={current.name} size="lg" radius="xs" />
        <div className="lc-account-switcher__header-info">
          <span className="lc-account-switcher__header-name">{current.name}</span>
          <span className="lc-account-switcher__header-id">{current.number}</span>
        </div>
      </div>

      <div className="lc-account-switcher__search">
        <span className="lc-account-switcher__search-icon">
          <Icon d={ICONS.search} />
        </span>
        <input
          type="search"
          value={searchValue}
          placeholder={searchPlaceholder}
          onChange={(e) => onSearchChange?.(e.currentTarget.value)}
          aria-label={searchPlaceholder}
        />
      </div>

      {children}

      <div className="lc-account-switcher__list" role="listbox" aria-label="Accounts">
        {accounts.map((a) => (
          <button
            key={a.id}
            type="button"
            role="option"
            aria-selected={a.id === selectedId}
            aria-current={a.id === selectedId}
            className="lc-account-switcher__row"
            onClick={() => onSelect?.(a.id)}
          >
            <Avatar src={a.avatarSrc} alt={a.name} size="md" radius="xl" />
            <span className="lc-account-switcher__row-info">
              <span className="lc-account-switcher__row-name">{a.name}</span>
              <span className="lc-account-switcher__row-id">{a.number}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default AccountSwitcher;
