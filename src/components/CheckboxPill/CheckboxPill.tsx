/**
 * CheckboxPill — a labelled checkbox in a soft green pill, used for page-level options
 * such as Broadcast's "Show retry results" or Tags' "Use in Internal tickets".
 *
 *   <CheckboxPill checked={on} onChange={setOn} label="Show retry results" />
 */
import type { ReactNode } from 'react';
import './CheckboxPill.css';

export interface CheckboxPillProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
}

export function CheckboxPill({ checked, onChange, label }: CheckboxPillProps) {
  return (
    <label className="lc-checkbox-pill" data-checked={checked || undefined}>
      <input
        type="checkbox"
        className="lc-checkbox-pill__input"
        checked={checked}
        onChange={(e) => onChange(e.currentTarget.checked)}
      />
      <span className="lc-checkbox-pill__box" aria-hidden="true">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8.5l3 3l7-7" />
        </svg>
      </span>
      <span className="lc-checkbox-pill__label">{label}</span>
    </label>
  );
}

export default CheckboxPill;
