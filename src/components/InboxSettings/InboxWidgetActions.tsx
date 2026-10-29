/**
 * The widget editor's header actions, left of Update: an Active / Inactive switch and a
 * button that copies the widget's embed code.
 */
import { useId } from 'react';
import { Button } from '../Button';
import { Icon } from '../icons';
import { useCopied } from './useCopied';

/** A bordered label + switch for a page header, e.g. "Active" or "Auto-assign". */
export function HeaderSwitch({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  const labelId = useId();
  return (
    <div className="lc-inbs__header-switch">
      <span id={labelId} className="lc-inbs__label">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        disabled={disabled}
        className="lc-inbs__switch-track"
        onClick={() => onChange(!checked)}
      >
        <span className="lc-inbs__switch-thumb" />
      </button>
    </div>
  );
}

export function WidgetEditorActions({
  active,
  canToggle,
  code,
  onActiveChange,
}: {
  active: boolean;
  /** Disabled and errored widgets can't be switched from here. */
  canToggle: boolean;
  /** The embed script to copy. */
  code: string;
  onActiveChange: (next: boolean) => void;
}) {
  const { copied, copy } = useCopied(code);
  return (
    <>
      <HeaderSwitch label={active ? 'Active' : 'Inactive'} checked={active} disabled={!canToggle} onChange={onActiveChange} />
      <Button variant="outline" color="primary" size="sm" leftSection={<Icon name="copy" size={14} />} onClick={copy}>
        <span aria-live="polite">{copied ? 'Copied' : 'Copy widget code'}</span>
      </Button>
    </>
  );
}
