/**
 * StateSwitcher: a reviewer tool, not product UI. A dropdown that flips a Screen between the
 * states it can be shown in (with data, its zero state, and whatever else that Screen lists),
 * so each one can be seen and commented on without touching the demo data.
 *
 *   <StateSwitcher states={states} value={state} onChange={setState} />
 *
 * It is the prototype's own NativeSelect in the dark floating look of Inspect mode's bar, so it
 * never reads as part of the design. A dropdown rather than buttons, so a Screen with five
 * states takes no more room than one with two.
 */
import { NativeSelect } from '../Select';
import { Icon } from '../icons';
import './StateSwitcher.css';

export interface StateSwitcherProps {
  /** The states to offer, in the order to list them. */
  states: readonly { id: string; label: string }[];
  /** The id of the state shown now. */
  value: string;
  onChange: (id: string) => void;
  /** Extra class on the pill, for layout only. */
  className?: string;
}

export function StateSwitcher({ states, value, onChange, className }: StateSwitcherProps) {
  return (
    <div
      className={className ? `lc-state-switcher ${className}` : 'lc-state-switcher'}
      title="Switch the state this screen is shown in"
    >
      <Icon name="eye" className="lc-state-switcher__icon" />
      <NativeSelect
        aria-label="State of this screen"
        size="xs"
        wrapperClassName="lc-state-switcher__select"
        data={states.map((state) => ({ value: state.id, label: state.label }))}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
      />
    </div>
  );
}

export default StateSwitcher;
