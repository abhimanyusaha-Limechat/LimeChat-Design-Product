/**
 * Setting rows for Bot settings (Figma "Agentic Bot Builder", the "Bot settings · *" frames).
 *
 * A row is a label with a help tooltip, an optional switch at the right, and the control
 * under it. Rows that depend on a switch nest in `ChildRows`, behind a 2px rule that goes
 * green while the parent is on. `MasterCard` is the tinted card that governs a whole tab.
 */
import { createContext, useContext, useId, type ReactNode } from 'react';
import { Tooltip } from '../Tooltip';
import { Icon } from '../icons';
import { HighlightMatch } from '../HighlightMatch';
import './SettingRow.css';

/**
 * What "Search all settings" is filtering by. Rows with an id the filter does not show
 * render nothing; the rest highlight the query in their label.
 */
export interface SearchFilter {
  query: string;
  /** Whether a row with this id stays on the page. Rows without an id always do. */
  shows: (id?: string) => boolean;
}

export const NO_FILTER: SearchFilter = { query: '', shows: () => true };
export const SearchFilterContext = createContext<SearchFilter>(NO_FILTER);

/** The grey `?` after a label. Hover or focus shows the tip to its right. */
export function HelpTip({ label, tip }: { label: string; tip: string }) {
  return (
    <Tooltip label={tip} position="right" multiline>
      <button type="button" className="lc-bsr__help" aria-label={`About ${label}`}>
        <Icon name="help-circle" size={20} />
      </button>
    </Tooltip>
  );
}

export interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  /** Names the switch for assistive tech; the visible label sits beside it. */
  label: string;
  disabled?: boolean;
}

/** V3 Switch, size sm: a 42x20 track with a 14px thumb, in a 44px target. */
export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return (
    <span className="lc-bsr__switch-target">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className="lc-bsr__switch"
        disabled={disabled}
        onClick={() => onChange(!checked)}
      >
        <span className="lc-bsr__switch-thumb" />
      </button>
    </span>
  );
}

export interface SettingRowProps {
  /** Anchor for search's jump-to-row, written as `data-setting-id`. */
  id?: string;
  label: string;
  /** What the help icon says. */
  tip: string;
  /** With `onCheckedChange`, puts a switch at the right of the row. */
  checked?: boolean;
  onCheckedChange?: (next: boolean) => void;
  /** Greys the label and the switch. Controls in `children` take their own `disabled`. */
  disabled?: boolean;
  children?: ReactNode;
}

export function SettingRow({ id, label, tip, checked, onCheckedChange, disabled, children }: SettingRowProps) {
  const filter = useContext(SearchFilterContext);
  if (!filter.shows(id)) return null;
  return (
    <div className="lc-bsr" data-setting-id={id} data-disabled={disabled || undefined}>
      <div className="lc-bsr__header">
        <div className="lc-bsr__label-group">
          <span className="lc-bsr__label">
            <HighlightMatch text={label} query={filter.query} />
          </span>
          <HelpTip label={label} tip={tip} />
        </div>
        {onCheckedChange && <Switch checked={!!checked} onChange={onCheckedChange} label={label} disabled={disabled} />}
      </div>
      {children}
    </div>
  );
}

/** Rows that depend on the parent switch. `active` colours the rule green. */
export function ChildRows({ active, note, children }: { active: boolean; note?: string; children: ReactNode }) {
  const { query } = useContext(SearchFilterContext);
  return (
    <div className="lc-bsr__children" data-active={active}>
      {note && !query && <p className="lc-bsr__note">{note}</p>}
      {children}
    </div>
  );
}

export function RowDivider() {
  return <div className="lc-bsr__divider" role="separator" />;
}

/** Small copy under a control. `error` turns it red for a required field that is empty. */
export function Helper({ children, error }: { children: ReactNode; error?: boolean }) {
  return (
    <p className="lc-bsr__helper" data-error={error || undefined}>
      {children}
    </p>
  );
}

export interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (next: number) => void;
  min: number;
  max: number;
  /** Shown after the box, e.g. "seconds". */
  unit?: string;
  disabled?: boolean;
}

/** A 200px number box with a stepper at its right edge. Typing can go past the range; blur clamps. */
export function NumberField({ label, value, onChange, min, max, unit, disabled }: NumberFieldProps) {
  const id = useId();
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <div className="lc-bsr__number">
      <div className="lc-bsr__number-box" data-disabled={disabled || undefined}>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          className="lc-bsr__number-input"
          aria-label={label}
          value={value}
          min={min}
          max={max}
          disabled={disabled}
          onChange={(e) => {
            const n = e.currentTarget.valueAsNumber;
            if (!Number.isNaN(n)) onChange(n);
          }}
          onBlur={() => onChange(clamp(value))}
        />
        <span className="lc-bsr__stepper">
          <button
            type="button"
            tabIndex={-1}
            aria-label={`Increase ${label}`}
            disabled={disabled || value >= max}
            onClick={() => onChange(clamp(value + 1))}
          >
            <Icon name="chevron-up" size={10} />
          </button>
          <button
            type="button"
            tabIndex={-1}
            aria-label={`Decrease ${label}`}
            disabled={disabled || value <= min}
            onClick={() => onChange(clamp(value - 1))}
          >
            <Icon name="chevron-down" size={10} />
          </button>
        </span>
      </div>
      {unit && <span className="lc-bsr__unit">{unit}</span>}
    </div>
  );
}

export interface MasterCardProps {
  /** Anchor for search's jump-to-row, written as `data-setting-id`. */
  id?: string;
  title: string;
  tip: string;
  /** The uppercase badge after the title, e.g. "Controls this tab". */
  badge: string;
  description: string;
  /** The smaller line under the description. */
  note: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

/** The tinted card at the top of a tab whose switch governs the rows below it. */
export function MasterCard({ id, title, tip, badge, description, note, checked, onChange }: MasterCardProps) {
  const filter = useContext(SearchFilterContext);
  if (!filter.shows(id)) return null;
  return (
    <div className="lc-bsr__master" data-setting-id={id}>
      <div className="lc-bsr__master-copy">
        <div className="lc-bsr__master-title-row">
          <div className="lc-bsr__label-group">
            <span className="lc-bsr__master-title">
              <HighlightMatch text={title} query={filter.query} />
            </span>
            <HelpTip label={title} tip={tip} />
          </div>
          <span className="lc-bsr__badge">{badge}</span>
        </div>
        <p className="lc-bsr__master-desc">{description}</p>
        <p className="lc-bsr__note">{note}</p>
      </div>
      <Switch checked={checked} onChange={onChange} label={title} />
    </div>
  );
}
