/**
 * The website Widget tab's Page rules: turn the widget icon and its pop-up on or off for
 * specific pages. "All pages" is the baseline; URL rules only narrow it, so the widget or
 * pop-up is off on a page if any rule matching it turns it off (rule order never matters).
 * A pop-up only shows where the widget does, so a row with the widget off shows its pop-up
 * switch off and disabled. The global switches (a device's widget, the Pop-up Message)
 * always win over a rule.
 */
import { Button } from '../Button';
import { NativeSelect, type SelectItem } from '../Select';
import { Icon } from '../icons';
import { SectionHeading } from './InboxSettingsSections';

export type PageRuleMatch = 'contains' | 'startsWith' | 'equals';

export interface PageRule {
  id: string;
  match: PageRuleMatch;
  url: string;
  widget: boolean;
  /** Kept as chosen while the widget is off; the effective value is `widget && popup`. */
  popup: boolean;
}

export interface InboxPageRules {
  /** Applies to every page; rules can only turn things off for the pages they match. */
  all: { widget: boolean; popup: boolean };
  rules: PageRule[];
}

const MATCHES: SelectItem[] = [
  { value: 'contains', label: 'Contains' },
  { value: 'startsWith', label: 'Starts with' },
  { value: 'equals', label: 'Exact match' },
];

/** Lowercase, no query or hash, no trailing slash (the root stays "/"). */
const normalise = (path: string) => path.trim().toLowerCase().replace(/[?#].*$/, '').replace(/(.)\/+$/, '$1');

function matches({ match, url }: PageRule, pathname: string) {
  const rule = normalise(url);
  const path = normalise(pathname);
  if (!rule) return false;
  return match === 'contains' ? path.includes(rule) : match === 'startsWith' ? path.startsWith(rule) : path === rule;
}

/** What the widget and pop-up do on `pathname`: on unless "All pages" or a matching rule turns them off. */
export function pageSettingsFor({ all, rules }: InboxPageRules, pathname: string) {
  const hits = [all, ...rules.filter((rule) => matches(rule, pathname))];
  const widget = hits.every((r) => r.widget);
  return { widget, popup: widget && hits.every((r) => r.popup) };
}

function Switch({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled: boolean; onChange: (next: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked && !disabled}
      aria-label={label}
      disabled={disabled}
      className="lc-inbs__switch-track"
      onClick={() => onChange(!checked)}
    >
      <span className="lc-inbs__switch-thumb" />
    </button>
  );
}

function SwitchPair({
  name,
  value,
  widgetOn,
  popupOn,
  onChange,
}: {
  name: string;
  value: { widget: boolean; popup: boolean };
  widgetOn: boolean;
  popupOn: boolean;
  onChange: (patch: { widget?: boolean; popup?: boolean }) => void;
}) {
  return (
    <>
      <Switch label={`Widget on ${name}`} checked={value.widget && widgetOn} disabled={!widgetOn} onChange={(widget) => onChange({ widget })} />
      <Switch label={`Pop-up on ${name}`} checked={value.popup} disabled={!widgetOn || !value.widget || !popupOn} onChange={(popup) => onChange({ popup })} />
    </>
  );
}

export function PageRulesSection({
  value,
  widgetOn,
  popupOn,
  onChange,
}: {
  value: InboxPageRules;
  /** At least one device's widget is on. */
  widgetOn: boolean;
  /** The Pop-up Message switch is on. */
  popupOn: boolean;
  onChange: (next: InboxPageRules) => void;
}) {
  const { all, rules } = value;
  const setRules = (next: PageRule[]) => onChange({ ...value, rules: next });
  const patch = (i: number, change: Partial<PageRule>) => setRules(rules.map((r, k) => (k === i ? { ...r, ...change } : r)));

  return (
    <section className="lc-inbs__group" aria-label="Page rules">
      <SectionHeading
        title="Page rules"
        description="Hide the widget or its pop-up on specific pages. Off in any matching rule wins."
      />
      <div className="lc-inbs__table">
        <div className="lc-inbs__rule lc-inbs__rule--head" aria-hidden="true">
          <span>Page</span>
          <span>Widget</span>
          <span>Pop-up</span>
          <span />
        </div>
        <div className="lc-inbs__rule">
          <div className="lc-inbs__rule-page">
            <span className="lc-inbs__label">All pages</span>
            {!widgetOn && <p className="lc-inbs__rule-note">Turn on a widget above to show it on any page.</p>}
          </div>
          <SwitchPair name="all pages" value={all} widgetOn={widgetOn} popupOn={popupOn} onChange={(change) => onChange({ ...value, all: { ...all, ...change } })} />
          <span />
        </div>
        {rules.map((rule, i) => {
          const name = rule.url.trim() || 'new rule';
          return (
            <div key={rule.id} className="lc-inbs__rule">
              <div className="lc-inbs__rule-page">
                <NativeSelect
                  size="sm"
                  aria-label={`Match type for ${name}`}
                  data={MATCHES}
                  value={rule.match}
                  onChange={(e) => patch(i, { match: e.currentTarget.value as PageRuleMatch })}
                />
                <input
                  className="lc-inbs__input"
                  placeholder="/checkout"
                  aria-label={`URL path for rule ${i + 1}`}
                  value={rule.url}
                  onChange={(e) => patch(i, { url: e.currentTarget.value })}
                />
              </div>
              <SwitchPair name={name} value={rule} widgetOn={widgetOn} popupOn={popupOn} onChange={(change) => patch(i, change)} />
              <button type="button" className="lc-inbs__rule-btn" aria-label={`Remove ${name}`} onClick={() => setRules(rules.filter((_, k) => k !== i))}>
                <Icon name="trash" size={16} />
              </button>
            </div>
          );
        })}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="lc-inbs__add-reminder"
        leftSection={<Icon name="plus" />}
        onClick={() => setRules([...rules, { id: crypto.randomUUID(), match: 'startsWith', url: '', widget: true, popup: true }])}
      >
        Add rule
      </Button>
    </section>
  );
}
