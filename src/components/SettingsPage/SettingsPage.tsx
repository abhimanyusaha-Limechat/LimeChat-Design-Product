/**
 * SettingsPage — LimeChat design system (Figma node 249:13332, "UI Pattern").
 *
 * Generic settings layout: a vertical tab list on the left, a titled content
 * card on the right. `children` renders inside the card.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { useScrollFade } from '../../hooks/useScrollFade';
import { Button } from '../Button';
import { Tooltip } from '../Tooltip';
import { Icon } from '../icons';
import type { IconName } from '../iconPaths';
import './SettingsPage.css';

export interface SettingsTab {
  id: string;
  label: string;
}

export interface DetailPanel {
  title: string;
  /** Small label below the title, e.g. "Agent". */
  subtitle?: string;
  /** Sits left of the title, e.g. an avatar or channel icon. */
  icon?: ReactNode;
  /** Icon buttons left of the close button (the label is the tooltip and accessible name), e.g. Edit. `onClick` may be omitted for a design placeholder. */
  actions?: { icon: IconName; label: string; onClick?: () => void }[];
  onClose: () => void;
  children: ReactNode;
}

export interface SettingsPageProps {
  /** Left tab list. Omit for a single page with no tab list. */
  tabs?: SettingsTab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  title: string;
  /** Sits left of the title, e.g. an integration partner's logo. */
  titleIcon?: ReactNode;
  /** Shows a back arrow at the far left of the header, for sub-pages. Omit to hide. */
  onBack?: () => void;
  description?: string;
  /** Makes the title a text box (a blank title is the caller's to reject). Omit for plain text. */
  onTitleChange?: (next: string) => void;
  /** Makes the description a text box, shown even when empty. Omit for plain text. */
  onDescriptionChange?: (next: string) => void;
  /** "Watch video" header CTA — opens a tutorial for this settings section. Omit to hide. */
  onWatchVideo?: () => void;
  /** "View docs" header CTA — opens the LimeChat docs page for this settings section. Omit to hide. */
  onViewDocs?: () => void;
  /** Rendered at the right end of the header (e.g. a Save button), after the video/docs CTAs. */
  headerActions?: ReactNode;
  /** Overrides the content card's padding: px for every side, or a CSS `padding` value (default 16). */
  contentPadding?: number | string;
  /** Closable 320px details panel at the right edge. Omit to hide. */
  detailPanel?: DetailPanel;
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

export function SettingsPage({
  tabs,
  activeTab,
  onTabChange,
  title,
  titleIcon,
  onBack,
  description,
  onTitleChange,
  onDescriptionChange,
  onWatchVideo,
  onViewDocs,
  headerActions,
  contentPadding,
  detailPanel,
  children,
}: SettingsPageProps) {
  const navScroll = useScrollFade();
  const contentScroll = useScrollFade();
  const detailScroll = useScrollFade();
  // Keep the last panel mounted so it can animate out; `open` flips a frame after mount so it animates in.
  const [heldPanel, setHeldPanel] = useState(detailPanel);
  if (detailPanel && detailPanel !== heldPanel) setHeldPanel(detailPanel);
  const [open, setOpen] = useState(false);
  const wantsOpen = !!detailPanel;
  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(wantsOpen));
    return () => cancelAnimationFrame(id);
  }, [wantsOpen]);
  const panel = detailPanel ?? heldPanel;
  const helpCtas = [
    onWatchVideo && { label: 'Video', tip: 'a video explainer', icon: <PlayCircleIcon />, onClick: onWatchVideo },
    onViewDocs && { label: 'Docs', tip: 'Documentation', icon: <DocsIcon />, onClick: onViewDocs },
  ].filter((cta) => !!cta);

  return (
    <div className="lc-sp">
      {tabs && (
      <nav className="lc-sp__side-panel" data-anchor="settings-tab-list" aria-label="Settings" {...navScroll}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className="lc-sp__tab"
            data-active={tab.id === activeTab}
            onClick={() => onTabChange?.(tab.id)}
          >
            <span className="lc-sp__tab-accent" />
            {tab.label}
          </button>
        ))}
      </nav>
      )}

      <div className="lc-sp__main">
        <div className="lc-sp__card">
          <div className="lc-sp__header" data-anchor="settings-header">
            {onBack && (
              <button type="button" className="lc-sp__detail-btn lc-sp__back" aria-label="Back" onClick={onBack}>
                <Icon name="chevron-left" width={20} height={20} />
              </button>
            )}
            {titleIcon}
            <div className="lc-sp__header-text">
              <h1 className="lc-sp__title">
                {onTitleChange ? (
                  <input
                    className="lc-sp__edit"
                    aria-label="Title"
                    aria-invalid={!title.trim() || undefined}
                    autoComplete="off"
                    value={title}
                    onChange={(e) => onTitleChange(e.currentTarget.value)}
                  />
                ) : (
                  title
                )}
              </h1>
              {onDescriptionChange ? (
                <p className="lc-sp__description">
                  <input
                    className="lc-sp__edit"
                    aria-label="Description"
                    placeholder="Add a description"
                    autoComplete="off"
                    value={description ?? ''}
                    onChange={(e) => onDescriptionChange(e.currentTarget.value)}
                  />
                </p>
              ) : (
                description && <p className="lc-sp__description">{description}</p>
              )}
            </div>
            {(helpCtas.length > 0 || headerActions) && (
              <div className="lc-sp__header-actions">
                {helpCtas.length > 0 && (
                  <div className="lc-sp__help-ctas">
                    {helpCtas.map((cta) => (
                      <Tooltip key={cta.label} label={`Learn more on ${title} on ${cta.tip}`} position="bottom">
                        <Button variant="default" size="sm" leftSection={cta.icon} onClick={cta.onClick}>
                          {cta.label}
                        </Button>
                      </Tooltip>
                    ))}
                  </div>
                )}
                {helpCtas.length > 0 && headerActions && <span className="lc-sp__header-divider" aria-hidden="true" />}
                {headerActions}
              </div>
            )}
          </div>
          <div className="lc-sp__body">
            <div
              className="lc-sp__content"
              data-anchor="settings-content"
              style={{ padding: contentPadding }}
              {...contentScroll}
            >
              {children}
            </div>
            {panel && (
              <div className="lc-sp__detail-wrap" data-open={open && wantsOpen}>
                <aside
                  className="lc-sp__detail"
                  aria-label={panel.title}
                  aria-hidden={!wantsOpen || undefined}
                  onKeyDown={(e) => e.key === 'Escape' && panel.onClose()}
                >
                  <div className="lc-sp__detail-header">
                    <div className="lc-sp__detail-heading">
                      {panel.icon}
                      <div className="lc-sp__detail-heading-text">
                        <h2 className="lc-sp__detail-title">{panel.title}</h2>
                        {panel.subtitle && (
                          <span className="lc-sp__detail-subtitle" title={panel.subtitle}>
                            {panel.subtitle}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="lc-sp__detail-actions">
                      {panel.actions?.map((action) => (
                        <Tooltip key={action.label} label={action.label}>
                          <button type="button" className="lc-sp__detail-btn" aria-label={action.label} onClick={action.onClick}>
                            <Icon name={action.icon} width={16} height={16} />
                          </button>
                        </Tooltip>
                      ))}
                      <button type="button" className="lc-sp__detail-btn" aria-label="Close details" onClick={panel.onClose}>
                        <Icon name="close" width={16} height={16} />
                      </button>
                    </div>
                  </div>
                  <div className="lc-sp__detail-body" {...detailScroll}>
                    {panel.children}
                  </div>
                </aside>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
