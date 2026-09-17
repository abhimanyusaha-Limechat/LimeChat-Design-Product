/**
 * TagsInput — LimeChat design system.
 *
 * A multi-select combobox: chosen values render as removable chips inside
 * the control, typing filters a dropdown of the remaining `data` options,
 * and clicking an option (or pressing Enter on a match) adds it. Mirrors
 * the shape of Mantine's `TagsInput`. Same tokens/anatomy as `NativeSelect`
 * so it reads as one input family.
 *
 *   <TagsInput
 *     label="Inboxes"
 *     placeholder="Enter inboxes"
 *     data={['Limechat (189)', 'Nonucare Support', ...]}
 *     value={selectedInboxes}
 *     onChange={setSelectedInboxes}
 *   />
 */
import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import './TagsInput.css';

export interface TagsInputProps {
  label?: string;
  /** Rendered to the left of the label (e.g. a channel icon). */
  labelIcon?: ReactNode;
  description?: string;
  /** Shown when no tags are selected yet. */
  placeholder?: string;
  /** Shown once at least one tag is selected, so it's clear you can keep typing to find more. Defaults to `placeholder`. */
  searchPlaceholder?: string;
  /** Selectable options — filtered by the typed query, and by ones already chosen. */
  data: string[];
  /** Selected values, rendered as chips. */
  value: string[];
  onChange: (next: string[]) => void;
  /** Allow adding a typed value that isn't in `data`. Default `false`. */
  creatable?: boolean;
  disabled?: boolean;
  /** `stacked` (label above control, default) or `horizontal` (label left, control right). */
  layout?: 'stacked' | 'horizontal';
  className?: string;
}

export function TagsInput({
  label,
  labelIcon,
  description,
  placeholder = 'Enter tags',
  searchPlaceholder,
  data,
  value,
  onChange,
  creatable = false,
  disabled,
  layout = 'stacked',
  className,
}: TagsInputProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const options = useMemo(
    () =>
      data.filter(
        (opt) => !value.includes(opt) && opt.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [data, value, query],
  );

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || value.includes(trimmed)) return;
    if (!creatable && !data.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setQuery('');
  };

  const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag));

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (options[0]) addTag(options[0]);
      else if (creatable) addTag(query);
    } else if (e.key === 'Backspace' && query === '' && value.length > 0) {
      removeTag(value[value.length - 1]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div
      className={`lc-tags-input${className ? ` ${className}` : ''}`}
      data-disabled={disabled || undefined}
      data-layout={layout}
      ref={rootRef}
    >
      {(label != null || description != null) && (
        <div className="lc-tags-input__label-col">
          {label != null && (
            <label className="lc-tags-input__label" htmlFor={inputId} title={label}>
              {labelIcon != null && <span className="lc-tags-input__label-icon">{labelIcon}</span>}
              <span className="lc-tags-input__label-text">{label}</span>
            </label>
          )}
          {description != null && <span className="lc-tags-input__description">{description}</span>}
        </div>
      )}

      <div className="lc-tags-input__control">
        <div className="lc-tags-input__field">
          {value.map((tag) => (
            <span className="lc-tags-input__pill" key={tag}>
              {tag}
              {!disabled && (
                <button
                  type="button"
                  className="lc-tags-input__pill-remove"
                  aria-label={`Remove ${tag}`}
                  onClick={() => removeTag(tag)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 6l-12 12" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>
              )}
            </span>
          ))}
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            className="lc-tags-input__input"
            placeholder={value.length === 0 ? placeholder : (searchPlaceholder ?? placeholder)}
            value={query}
            disabled={disabled}
            onChange={(e) => {
              setQuery(e.currentTarget.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 120)}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-controls={`${inputId}-listbox`}
          />
        </div>
        <button
          type="button"
          className="lc-tags-input__chevron"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => {
            inputRef.current?.focus();
            setOpen((o) => !o);
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6l6 -6" />
          </svg>
        </button>

        {open && !disabled && options.length > 0 && (
          <ul className="lc-tags-input__dropdown" role="listbox" id={`${inputId}-listbox`}>
            {options.map((opt) => (
              <li key={opt}>
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  className="lc-tags-input__option"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addTag(opt)}
                >
                  {opt}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default TagsInput;
