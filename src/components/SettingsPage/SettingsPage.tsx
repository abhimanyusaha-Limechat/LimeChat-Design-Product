/**
 * SettingsPage — LimeChat design system (Figma node 249:13332, "UI Pattern").
 *
 * Generic settings layout: a vertical tab list on the left, a titled content
 * card on the right. `children` renders inside the card; when omitted, a
 * placeholder swap-target is shown instead (matching the Figma pattern).
 */
import type { ReactNode } from 'react';
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

export function SettingsPage({
  tabs,
  activeTab,
  onTabChange,
  title,
  description,
  children,
}: SettingsPageProps) {
  return (
    <div className="lc-sp">
      <nav className="lc-sp__side-panel" aria-label="Settings">
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
          <div className="lc-sp__content">
            {children ?? (
              <div className="lc-sp__placeholder">
                <span className="lc-sp__placeholder-label">Swap</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
