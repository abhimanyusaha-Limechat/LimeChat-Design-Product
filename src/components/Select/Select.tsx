/**
 * NativeSelect — LimeChat design system (Figma node 31:15).
 *
 * A styled wrapper around a real `<select>` element, so the native dropdown,
 * keyboard behaviour and form semantics come for free. Mirrors the Mantine v6
 * `NativeSelect` API the design is Code-Connected to.
 *
 *   <NativeSelect
 *     label="Channel"
 *     placeholder="Pick one"
 *     data={['WhatsApp', 'Instagram', 'Email']}
 *     value={value}
 *     onChange={(e) => setValue(e.currentTarget.value)}
 *   />
 *
 *   <NativeSelect
 *     label="Reach" withAsterisk error="Required"
 *     data={[{ value: 'all', label: 'Everyone' }, { group: 'Saved', items: [...] }]}
 *   />
 */
import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import './Select.css';

export type SelectVariant = 'default' | 'filled' | 'unstyled';
export type SelectSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface SelectItem {
  value: string;
  label?: string;
  disabled?: boolean;
}
export interface SelectGroup {
  group: string;
  items: (string | SelectItem)[];
}
export type SelectData = (string | SelectItem | SelectGroup)[];

export interface NativeSelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Options: strings, `{ value, label, disabled }`, or `{ group, items }`. */
  data: SelectData;
  label?: ReactNode;
  description?: ReactNode;
  /** Shown as a disabled first option when the field has no value. */
  placeholder?: string;
  /** `true` or a message — turns the control red and renders the message below. */
  error?: ReactNode | boolean;
  /** Helper text below the control (hidden by a string `error`). */
  caption?: ReactNode;
  /** Red `*` after the label. */
  withAsterisk?: boolean;
  variant?: SelectVariant;
  size?: SelectSize;
  fullWidth?: boolean;
  /** Extra class on the root wrapper. */
  wrapperClassName?: string;
}

function isGroup(x: string | SelectItem | SelectGroup): x is SelectGroup {
  return typeof x === 'object' && x !== null && 'group' in x;
}

function renderOption(item: string | SelectItem, key: number) {
  const opt: SelectItem = typeof item === 'string' ? { value: item, label: item } : item;
  return (
    <option key={key} value={opt.value} disabled={opt.disabled}>
      {opt.label ?? opt.value}
    </option>
  );
}

export const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(function NativeSelect(
  {
    data,
    label,
    description,
    placeholder,
    error,
    caption,
    withAsterisk,
    variant = 'default',
    size = 'sm',
    fullWidth,
    wrapperClassName,
    className,
    id,
    disabled,
    value,
    defaultValue,
    required,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const descId = description ? `${selectId}-desc` : undefined;
  const msgId = error || caption ? `${selectId}-msg` : undefined;

  const hasError = error != null && error !== false;
  const errorMessage = typeof error === 'string' || (error != null && typeof error === 'object') ? error : null;

  // Native selects can't show a placeholder; emulate one with a hidden empty option
  // and flag "empty" so CSS can grey the value text.
  const isControlled = value !== undefined;
  const showPlaceholderOption = placeholder != null;
  const isEmpty = showPlaceholderOption && (isControlled ? value === '' : defaultValue == null || defaultValue === '');

  return (
    <div
      className={`lc-select${wrapperClassName ? ` ${wrapperClassName}` : ''}`}
      data-variant={variant}
      data-size={size}
      data-error={hasError || undefined}
      data-disabled={disabled || undefined}
      data-full-width={fullWidth || undefined}
    >
      {label != null && (
        <label className="lc-select__label" htmlFor={selectId}>
          {label}
          {withAsterisk && (
            <span className="lc-select__asterisk" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {description != null && (
        <span className="lc-select__description" id={descId}>
          {description}
        </span>
      )}

      <div className="lc-select__control">
        <select
          {...rest}
          ref={ref}
          id={selectId}
          className={`lc-select__input${className ? ` ${className}` : ''}`}
          disabled={disabled}
          required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={[descId, msgId].filter(Boolean).join(' ') || undefined}
          data-placeholder={isEmpty || undefined}
          {...(isControlled ? { value } : { defaultValue: defaultValue ?? (showPlaceholderOption ? '' : undefined) })}
        >
          {showPlaceholderOption && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {data.map((entry, i) =>
            isGroup(entry) ? (
              <optgroup key={i} label={entry.group}>
                {entry.items.map((it, j) => renderOption(it, j))}
              </optgroup>
            ) : (
              renderOption(entry, i)
            ),
          )}
        </select>
        <span className="lc-select__chevron" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6l6 -6" />
          </svg>
        </span>
      </div>

      {(errorMessage || caption != null) && (
        <span className="lc-select__message-group" id={msgId}>
          {caption != null && (
            <span className="lc-select__message lc-select__message--caption">{caption}</span>
          )}
          {errorMessage && (
            <span className="lc-select__message lc-select__message--error">{errorMessage}</span>
          )}
        </span>
      )}
    </div>
  );
});

export default NativeSelect;
