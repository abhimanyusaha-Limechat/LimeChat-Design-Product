/**
 * Modal — LimeChat design system dialog shell (Figma nodes 135:8061 / 195:59804).
 *
 * A centred white card on a scrim: header (title + optional description + ✕),
 * a body slot, and a right-aligned actions slot. Portalled to `document.body`;
 * closes on the ✕, the scrim, or Escape.
 *
 *   <Modal open={open} onClose={close} title="Publish flow" description="…"
 *     footer={<Button onClick={submit}>Publish</Button>}>
 *     …fields…
 *   </Modal>
 *
 * The small form controls the design-system modals use — `ModalSwitch`,
 * `ModalTextField`, `ModalTextarea`, `ModalStepper` — live alongside it.
 */
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

const Icon = ({ d }: { d: string | string[] }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {(Array.isArray(d) ? d : [d]).map((p) => (
      <path key={p} d={p} />
    ))}
  </svg>
);
const CLOSE = ['M18 6l-12 12', 'M6 6l12 12'];
const CHEV_UP = ['M6 15l6 -6l6 6'];
const CHEV_DOWN = ['M6 9l6 6l6 -6'];

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  /** Right-aligned actions row (usually one or two `<Button>`s). */
  footer?: ReactNode;
  children?: ReactNode;
  /** Card width in px. Default `500`. */
  width?: number;
  className?: string;
  style?: CSSProperties;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  footer,
  children,
  width = 500,
  className,
  style,
}: ModalProps) {
  const labelId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  // Kept mounted through the close transition — unmounting on `open: false`
  // immediately would skip the exit animation entirely.
  const [rendered, setRendered] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setRendered(true);
      setClosing(false);
    } else if (rendered) {
      setClosing(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!closing) return;
    const overlay = overlayRef.current;
    const finish = () => {
      setRendered(false);
      setClosing(false);
    };
    if (!overlay) {
      finish();
      return;
    }
    const onEnd = (e: TransitionEvent) => {
      if (e.target === overlay && e.propertyName === 'opacity') finish();
    };
    overlay.addEventListener('transitionend', onEnd);
    // Safety net in case the transition never fires (e.g. display:none ancestor).
    const fallback = window.setTimeout(finish, 220);
    return () => {
      overlay.removeEventListener('transitionend', onEnd);
      window.clearTimeout(fallback);
    };
  }, [closing]);

  useEffect(() => {
    if (!open) return;
    cardRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!rendered || typeof document === 'undefined') return null;

  const state = closing ? 'closing' : 'open';

  return createPortal(
    <div
      ref={overlayRef}
      className="lc-modal__overlay"
      data-state={state}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={cardRef}
        className={`lc-modal${className ? ` ${className}` : ''}`}
        data-state={state}
        style={{ width, ...style }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        tabIndex={-1}
      >
        <div className="lc-modal__header">
          <div className="lc-modal__heading">
            <p className="lc-modal__title" id={labelId}>
              {title}
            </p>
            {description != null && <p className="lc-modal__description">{description}</p>}
          </div>
          <button type="button" className="lc-modal__close" aria-label="Close" onClick={onClose}>
            <Icon d={CLOSE} />
          </button>
        </div>

        <div className="lc-modal__body">{children}</div>

        {footer != null && <div className="lc-modal__actions">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

/* -------------------------------------------------------------------------- */
/* Form controls used by the design-system modals                            */
/* -------------------------------------------------------------------------- */

export function ModalSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: ReactNode;
}) {
  const id = useId();
  return (
    <div className="lc-modal__switch">
      <label className="lc-modal__switch-label" htmlFor={id}>
        {label}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        className="lc-modal__switch-track"
        onClick={() => onChange(!checked)}
      >
        <span className="lc-modal__switch-thumb" />
      </button>
    </div>
  );
}

export function ModalCheckbox({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
}) {
  const id = useId();
  return (
    <div className="lc-modal__checkbox-block">
      <label className="lc-modal__checkbox-row" data-checked={checked || undefined} htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          className="lc-modal__checkbox-input"
          checked={checked}
          onChange={(e) => onChange(e.currentTarget.checked)}
        />
        <span className="lc-modal__checkbox-label">{label}</span>
      </label>
      {description != null && <p className="lc-modal__checkbox-description">{description}</p>}
    </div>
  );
}

/**
 * One row in a radio-card group — a bordered option with a label + description,
 * accenting when selected. `children` (e.g. inline date/time fields) render only
 * while selected, after a vertical divider (Figma node 267:19001).
 */
export function ModalRadioOption({
  name,
  checked,
  onChange,
  label,
  description,
  children,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  const id = useId();
  return (
    <label className="lc-modal__radio-option" data-checked={checked || undefined} htmlFor={id}>
      <span className="lc-modal__radio-main">
        <span className="lc-modal__radio-row">
          <input
            id={id}
            type="radio"
            name={name}
            className="lc-modal__radio-input"
            checked={checked}
            onChange={onChange}
          />
          <span className="lc-modal__radio-label">{label}</span>
        </span>
        {description != null && <span className="lc-modal__radio-description">{description}</span>}
      </span>
      {children != null && (
        <>
          <span className="lc-modal__radio-divider" aria-hidden="true" />
          <span className="lc-modal__radio-extra">{children}</span>
        </>
      )}
    </label>
  );
}

interface FieldShellProps {
  label: ReactNode;
  htmlFor: string;
  required?: boolean;
  children: ReactNode;
}
function FieldShell({ label, htmlFor, required, children }: FieldShellProps) {
  return (
    <div className="lc-modal__field">
      <label className="lc-modal__field-label" htmlFor={htmlFor}>
        {label}
        {required && (
          <span className="lc-modal__field-asterisk" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

export function ModalTextField({
  label,
  value,
  onChange,
  required,
  disabled,
  placeholder,
}: {
  label: ReactNode;
  value: string;
  onChange?: (next: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <FieldShell label={label} htmlFor={id} required={required}>
      <input
        id={id}
        className="lc-modal__input"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.currentTarget.value)}
      />
    </FieldShell>
  );
}

export function ModalTextarea({
  label,
  required,
  ...rest
}: {
  label: ReactNode;
  required?: boolean;
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <FieldShell label={label} htmlFor={id} required={required}>
      <textarea id={id} className="lc-modal__textarea" rows={3} {...rest} />
    </FieldShell>
  );
}

export function ModalStepper({
  label,
  value,
  onChange,
  onStep,
  inputMode = 'text',
  disabled = false,
}: {
  label: ReactNode;
  value: string;
  onChange: (next: string) => void;
  onStep: (dir: 1 | -1) => void;
  inputMode?: 'text' | 'numeric';
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <FieldShell label={label} htmlFor={id}>
      <div className="lc-modal__stepper" data-disabled={disabled || undefined}>
        <input
          id={id}
          className="lc-modal__input lc-modal__stepper-input"
          value={value}
          inputMode={inputMode}
          disabled={disabled}
          onChange={(e) => onChange(e.currentTarget.value)}
        />
        <span className="lc-modal__stepper-buttons">
          <button type="button" aria-label="Increase" disabled={disabled} onClick={() => onStep(1)}>
            <Icon d={CHEV_UP} />
          </button>
          <button type="button" aria-label="Decrease" disabled={disabled} onClick={() => onStep(-1)}>
            <Icon d={CHEV_DOWN} />
          </button>
        </span>
      </div>
    </FieldShell>
  );
}

export default Modal;
