import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { useAuth, useClerk, useUser } from '@clerk/react';
import { LimeChatLogo } from '../Sidebar/icons';
import { pickerAccounts, type PickerAccount } from '../../data/accountsDemo';
import './AccountPicker.css';

const PICKED_KEY = 'lc-picked-account';
const RECENT_KEY = 'lc-recent-accounts';
const MAX_RECENT = 3;
/** Rows rendered before "Show more"; keeps the DOM small for users with hundreds of accounts. */
const PAGE_SIZE = 40;

function read(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function write(storage: Storage, key: string, value: string | null) {
  try {
    if (value) storage.setItem(key, value);
    else storage.removeItem(key);
  } catch {
    // storage unavailable: the picker just shows again on refresh
  }
}

// The pick is stored as `<clerk session id>:<account id>`, so a new sign-in never reuses an old pick.
/** The account chosen on the picker this session, if any. */
export function getPickedAccount() {
  const id = read(sessionStorage, PICKED_KEY)?.split(':')[1];
  return pickerAccounts.find((a) => a.id === id);
}

function readRecentIds(): string[] {
  try {
    const parsed: unknown = JSON.parse(read(localStorage, RECENT_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function initials(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
}

/** Wraps the matched part of `text` in <mark>. */
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const at = text.toLowerCase().indexOf(query.toLowerCase());
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark>{text.slice(at, at + query.length)}</mark>
      {text.slice(at + query.length)}
    </>
  );
}

/** Shown right after sign-in when the email belongs to several accounts; renders `children` once one is chosen. */
export function AccountPicker({ children }: { children: ReactNode }) {
  const { sessionId } = useAuth();
  const [stored, setStored] = useState(() => read(sessionStorage, PICKED_KEY));
  const picked = sessionId != null && stored?.startsWith(`${sessionId}:`);

  // One account: nothing to choose.
  if (pickerAccounts.length < 2 || picked) return <>{children}</>;

  return (
    <AccountPickerScreen
      onPick={(id) => {
        const value = `${sessionId}:${id}`;
        write(sessionStorage, PICKED_KEY, value);
        write(localStorage, RECENT_KEY, JSON.stringify([id, ...readRecentIds().filter((r) => r !== id)].slice(0, MAX_RECENT)));
        setStored(value);
      }}
    />
  );
}

function AccountPickerScreen({ onPick }: { onPick: (id: string) => void }) {
  const { signOut } = useClerk();
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const listRef = useRef<HTMLUListElement>(null);

  const q = query.trim();
  const { recent, rest } = useMemo(() => {
    if (q) {
      const needle = q.toLowerCase();
      return {
        recent: [],
        rest: pickerAccounts.filter((a) => a.name.toLowerCase().includes(needle) || a.id.includes(needle)),
      };
    }
    const byId = new Map(pickerAccounts.map((a) => [a.id, a]));
    const recent = readRecentIds().flatMap((id) => byId.get(id) ?? []);
    return { recent, rest: pickerAccounts.filter((a) => !recent.includes(a)) };
  }, [q]);

  const shownRest = rest.slice(0, limit);
  const options = [...recent, ...shownRest];
  const activeIndex = Math.min(active, options.length - 1);

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setActive((activeIndex + step + options.length) % options.length);
    } else if (e.key === 'Enter' && options[activeIndex]) {
      onPick(options[activeIndex].id);
    }
  };

  const renderRow = (a: PickerAccount, index: number) => (
    <li
      key={a.id}
      id={`account-option-${a.id}`}
      role="option"
      aria-selected={index === activeIndex}
      data-active={index === activeIndex}
      className="account-picker__row"
      style={{ '--i': Math.min(index, 10) } as CSSProperties}
      onClick={() => onPick(a.id)}
      onMouseMove={() => index !== activeIndex && setActive(index)}
    >
      <span className="account-picker__avatar" aria-hidden="true">{initials(a.name)}</span>
      <span className="account-picker__info">
        <span className="account-picker__name"><Highlight text={a.name} query={q} /></span>
        <span className="account-picker__id">#<Highlight text={a.id} query={q} /></span>
      </span>
      <span className="account-picker__role">{a.role}</span>
      <svg className="account-picker__arrow" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </li>
  );

  return (
    <main className="account-picker">
      <section className="account-picker__hero">
        <LimeChatLogo className="account-picker__logo" />
        <div className="account-picker__intro">
          <h1 className="account-picker__title">Choose a workspace</h1>
          <p className="account-picker__lead">
            {email ? <>Signed in as <strong>{email}</strong>, which</> : 'This email'} belongs to{' '}
            {pickerAccounts.length} accounts. Pick the one you want to open.
          </p>
        </div>
        <button
          type="button"
          className="account-picker__logout"
          onClick={() => {
            write(sessionStorage, PICKED_KEY, null);
            void signOut();
          }}
        >
          Not you? Log out
        </button>
      </section>

      <section className="account-picker__panel">
        <div className="account-picker__search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0M21 21l-6 -6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="account-listbox"
            aria-activedescendant={options[activeIndex] ? `account-option-${options[activeIndex].id}` : undefined}
            aria-label="Search accounts by name or id"
            placeholder="Search by name or id"
            autoComplete="off"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.currentTarget.value);
              setActive(0);
              setLimit(PAGE_SIZE);
            }}
            onKeyDown={onKeyDown}
          />
        </div>

        <p className="account-picker__count" aria-live="polite">
          {q ? `${rest.length} of ${pickerAccounts.length} accounts` : `${pickerAccounts.length} accounts`}
        </p>

        {options.length === 0 ? (
          <div className="account-picker__empty">
            <p>No account matches “{q}”.</p>
            <button type="button" onClick={() => setQuery('')}>Clear search</button>
          </div>
        ) : (
          <ul ref={listRef} id="account-listbox" role="listbox" aria-label="Accounts" className="account-picker__list lc-scrollbar-thin">
            {recent.length > 0 && <li role="presentation" className="account-picker__group">Recent</li>}
            {recent.map((a, i) => renderRow(a, i))}
            {recent.length > 0 && rest.length > 0 && <li role="presentation" className="account-picker__group">All accounts</li>}
            {shownRest.map((a, i) => renderRow(a, recent.length + i))}
            {rest.length > limit && (
              <li role="presentation">
                <button type="button" className="account-picker__more" onClick={() => setLimit(limit + PAGE_SIZE)}>
                  Show {Math.min(PAGE_SIZE, rest.length - limit)} more
                </button>
              </li>
            )}
          </ul>
        )}
      </section>
    </main>
  );
}
