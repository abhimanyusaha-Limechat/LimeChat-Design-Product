/**
 * SegmentedTabs — the pill tab bar introduced on Bot settings → Product cards: a grey track with
 * the selected tab raised on a white pill. Use it for switching sections of one page; for a list
 * of pages use the vertical tabs in SettingsPage.
 *
 *   <SegmentedTabs ariaLabel="Agent settings" tabs={TABS} value={tab} onChange={setTab} />
 */
import './SegmentedTabs.css';

export interface SegmentedTab<Id extends string = string> {
  id: Id;
  label: string;
  /** Marks the tab with a small amber dot, e.g. for unsaved changes in that section. Decorative: say why elsewhere. */
  dot?: boolean;
  /** A count after the label, e.g. how many search results the section holds. */
  badge?: number;
}

export interface SegmentedTabsProps<Id extends string> {
  tabs: readonly SegmentedTab<Id>[];
  value: Id;
  onChange: (id: Id) => void;
  /** Names the tab list for screen readers, e.g. "Bot settings sections". */
  ariaLabel: string;
  /** Extra class on the track, for layout only. */
  className?: string;
}

export function SegmentedTabs<Id extends string>({ tabs, value, onChange, ariaLabel, className }: SegmentedTabsProps<Id>) {
  return (
    <div className={className ? `lc-segtabs ${className}` : 'lc-segtabs'} role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={tab.id === value}
          className="lc-segtabs__tab"
          data-active={tab.id === value}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {tab.badge != null && <span className="lc-segtabs__badge">{tab.badge}</span>}
          {tab.dot && <span className="lc-segtabs__dot" data-testid="segtab-dot" aria-hidden="true" />}
        </button>
      ))}
    </div>
  );
}

export default SegmentedTabs;
