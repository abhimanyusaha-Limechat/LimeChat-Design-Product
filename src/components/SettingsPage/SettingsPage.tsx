/**
 * SettingsPage — LimeChat design system (Figma node 249:13332, "UI Pattern").
 *
 * Generic settings layout: a vertical tab list on the left, a titled content
 * card on the right. `children` renders inside the card.
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
  /** Rendered at the right end of the header (e.g. a Save button). */
  headerActions?: ReactNode;
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

export function SettingsPage({
  tabs,
  activeTab,
  onTabChange,
  title,
  description,
  headerActions,
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
            <div className="lc-sp__header-text">
              <h1 className="lc-sp__title">{title}</h1>
              {description && <p className="lc-sp__description">{description}</p>}
            </div>
            {headerActions && <div className="lc-sp__header-actions">{headerActions}</div>}
          </div>
          <div className="lc-sp__content" {...contentScroll}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
