import './QtyStepper.css';

/** Quantity −/+ control, never below 1. `field` is the taller variant that sits beside form inputs. */
export function QtyStepper({
  value,
  onChange,
  variant = 'compact',
}: {
  value: number;
  onChange: (next: number) => void;
  variant?: 'compact' | 'field';
}) {
  return (
    <span className={`lc-qty-stepper${variant === 'field' ? ' lc-qty-stepper--field' : ''}`}>
      <button type="button" aria-label="Decrease quantity" onClick={() => onChange(Math.max(1, value - 1))}>
        −
      </button>
      <span className="lc-qty-stepper__value">{value}</span>
      <button type="button" aria-label="Increase quantity" onClick={() => onChange(value + 1)}>
        +
      </button>
    </span>
  );
}
