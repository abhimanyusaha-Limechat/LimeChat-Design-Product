/**
 * SettingsPage — LimeChat design system (Figma node 249:13332, "UI Pattern").
 *
 * Generic settings layout: a vertical tab list on the left, a titled content
 * card on the right. `children` renders inside the card; when omitted, a
 * placeholder swap-target is shown instead (matching the Figma pattern).
 */
import { useRef, useState, type ReactNode, type UIEvent } from 'react';
import './SettingsPage.css';

export interface SettingsTab {
  id: string;
  label: string;
}

export interface SettingsPageProps {
  tabs: SettingsTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  title: string;
  description?: string;
  children?: ReactNode;
}

/** Flags `data-scrolling` for 600ms after each scroll — same fade-in-thumb pattern as the tables. */
function useScrollFade() {
  const [isScrolling, setIsScrolling] = useState(false);
  const timeout = useRef<number>();
  const onScroll = (_e: UIEvent<HTMLElement>) => {
    setIsScrolling(true);
    window.clearTimeout(timeout.current);
    timeout.current = window.setTimeout(() => setIsScrolling(false), 600);
  };
  return { 'data-scrolling': isScrolling || undefined, onScroll } as const;
}

/** One label(+description) | control row — same anatomy as AccountSettings/ProfileSettings. */
function PlaceholderRow({
  label,
  description,
  first,
  last,
  children,
}: {
  label: string;
  description?: string;
  first?: boolean;
  last?: boolean;
  children: ReactNode;
}) {
  const cls = [
    'lc-sp__placeholder-row',
    first && 'lc-sp__placeholder-row--first',
    last && 'lc-sp__placeholder-row--last',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={cls}>
      <div className="lc-sp__placeholder-col">
        <span className="lc-sp__placeholder-label">{label}</span>
        {description && <p className="lc-sp__placeholder-desc">{description}</p>}
      </div>
      <div className="lc-sp__placeholder-control">{children}</div>
    </div>
  );
}

/**
 * Shown in the content card for any tab that has no real page wired in yet.
 * Built pixel-for-pixel in the same format as `AccountSettings`/
 * `ProfileSettings` — real (disabled) inputs and switches, not skeleton
 * bars — so it reads as "this page, not built yet" rather than a loading
 * state.
 */
function SettingsPlaceholder() {
  return (
    <div className="lc-sp__placeholder">
      <span className="lc-sp__placeholder-badge">Coming soon</span>

      <PlaceholderRow label="Setting name" description="What this setting controls." first>
        <input className="lc-sp__placeholder-input" disabled placeholder="Value" />
      </PlaceholderRow>

      <PlaceholderRow label="Another setting" description="A short explanation goes here.">
        <input className="lc-sp__placeholder-input" disabled placeholder="Value" />
      </PlaceholderRow>

      <PlaceholderRow label="Toggle setting">
        <button type="button" role="switch" aria-checked={false} className="lc-sp__placeholder-switch" disabled>
          <span className="lc-sp__placeholder-switch-thumb" />
        </button>
      </PlaceholderRow>

      <PlaceholderRow label="Another toggle" last>
        <button type="button" role="switch" aria-checked={false} className="lc-sp__placeholder-switch" disabled>
          <span className="lc-sp__placeholder-switch-thumb" />
        </button>
      </PlaceholderRow>
    </div>
  );
}

export function SettingsPage({
  tabs,
  activeTab,
  onTabChange,
  title,
  description,
  children,
}: SettingsPageProps) {
  const navScroll = useScrollFade();
  const contentScroll = useScrollFade();

  return (
    <div className="lc-sp">
      <nav className="lc-sp__side-panel" aria-label="Settings" {...navScroll}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className="lc-sp__tab"
            data-active={tab.id === activeTab}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="lc-sp__tab-accent" />
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="lc-sp__main">
        <div className="lc-sp__card">
          <div className="lc-sp__header">
            <h1 className="lc-sp__title">{title}</h1>
            {description && <p className="lc-sp__description">{description}</p>}
          </div>
          <div className="lc-sp__content" {...contentScroll}>
            {children ?? <SettingsPlaceholder />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
