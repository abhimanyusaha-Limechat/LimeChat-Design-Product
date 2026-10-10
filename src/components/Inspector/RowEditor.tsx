import { useState } from 'react';
import { isOnSpacingGrid } from './designScale';
import { fmt, type RowEdit } from './report';

interface NumberInputProps {
  /** Short visible label (`T`); empty for a lone field. */
  label: string;
  /** The row's label; with `label`, names the input for screen readers. */
  rowLabel: string;
  value: number;
  step: number;
  min?: number;
  /** The value is off the spacing grid: marked on the field. */
  offGrid: boolean;
  onChange: (value: number) => void;
}

/** Applies every valid keystroke, but keeps what you typed until you leave the field. */
function NumberInput({ label, rowLabel, value, step, min, offGrid, onChange }: NumberInputProps) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <label className="lc-inspector__field" data-off-grid={offGrid || undefined}>
      {label && <span aria-hidden="true">{label}</span>}
      <input
        type="number"
        inputMode="decimal"
        aria-label={label ? `${rowLabel} ${label}` : rowLabel}
        step={step}
        min={min}
        value={draft ?? fmt(value)}
        onChange={(e) => {
          setDraft(e.target.value);
          const n = e.target.valueAsNumber;
          if (Number.isFinite(n)) onChange(n);
        }}
        onBlur={() => setDraft(null)}
      />
    </label>
  );
}

interface RowEditorProps {
  /** The row's label, used to name the inputs. */
  label: string;
  edit: RowEdit;
  onEdit: (prop: string, value: string) => void;
  flagOffGrid?: boolean;
}

/** The inputs that change one row's value on the live page. */
export function RowEditor({ label, edit, onEdit, flagOffGrid }: RowEditorProps) {
  if (edit.kind === 'choice') {
    return (
      <select
        className="lc-inspector__select"
        aria-label={label}
        value={edit.value}
        onChange={(e) => onEdit(edit.prop, e.target.value)}
      >
        {edit.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }
  return (
    <span className="lc-inspector__fields">
      {edit.fields.map((f) => (
        <NumberInput
          key={f.prop}
          label={f.label}
          rowLabel={label}
          value={f.value}
          step={edit.step}
          min={edit.min}
          offGrid={Boolean(flagOffGrid) && !isOnSpacingGrid(f.value)}
          onChange={(n) => onEdit(f.prop, `${n}px`)}
        />
      ))}
    </span>
  );
}
