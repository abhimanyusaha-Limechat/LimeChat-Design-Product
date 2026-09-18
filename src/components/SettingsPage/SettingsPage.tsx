/**
 * SettingsPage — LimeChat design system (Figma node 249:13332, "UI Pattern").
 *
 * Generic settings layout: a vertical tab list on the left, a titled content
 * card on the right. `children` renders inside the card.
 */
import { useRef, useState, type ReactNode, type UIEvent } from 'react';
import { Button } from '../Button';
import { Tooltip } from '../Tooltip';
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
  /** "Watch video" header CTA — opens a tutorial for this settings section. Omit to hide. */
  onWatchVideo?: () => void;
  /** "View docs" header CTA — opens the LimeChat docs page for this settings section. Omit to hide. */
  onViewDocs?: () => void;
  /** Rendered at the right end of the header (e.g. a Save button), after the video/docs CTAs. */
  headerActions?: ReactNode;
  children?: ReactNode;
}

const PlayCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M10 9l5 3l-5 3z" />
  </svg>
);

const DocsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
    <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
    <path d="M9 9h1" />
    <path d="M9 13h6" />
    <path d="M9 17h6" />
  </svg>
);

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
  onWatchVideo,
  onViewDocs,
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
            {(onWatchVideo || onViewDocs || headerActions) && (
              <div className="lc-sp__header-actions">
                {(onWatchVideo || onViewDocs) && (
                  <div className="lc-sp__help-ctas">
                    {onWatchVideo && (
                      <Tooltip label={`Learn more on ${title} on a video explainer`} position="bottom">
                        <Button
                          variant="light"
                          color="primary"
                          size="sm"
                          leftSection={<PlayCircleIcon />}
                          onClick={onWatchVideo}
                        >
                          Video
                        </Button>
                      </Tooltip>
                    )}
                    {onViewDocs && (
                      <Tooltip label={`Learn more on ${title} on Documentation`} position="bottom">
                        <Button
                          variant="light"
                          color="primary"
                          size="sm"
                          leftSection={<DocsIcon />}
                          onClick={onViewDocs}
                        >
                          Docs
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                )}
                {(onWatchVideo || onViewDocs) && headerActions && (
                  <span className="lc-sp__header-divider" aria-hidden="true" />
                )}
                {headerActions}
              </div>
            )}
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
