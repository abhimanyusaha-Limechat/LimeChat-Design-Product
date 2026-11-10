/**
 * Stepper — a horizontal numbered progress strip for multi-step flows. Steps before the
 * current one show a check and can be clicked to go back; later steps are disabled until
 * the flow reaches them.
 *
 *   <Stepper label="Widget setup" steps={[{ id: 'a', label: 'General' }]} current={0} onStepClick={setStep} />
 */
import { Icon } from '../icons';
import './Stepper.css';

export interface StepperStep {
  id: string;
  label: string;
}

export interface StepperProps {
  /** Accessible name of the list. */
  label: string;
  steps: StepperStep[];
  /** Index of the open step. */
  current: number;
  /** Called with the index of a completed step the user clicks to revisit. */
  onStepClick?: (index: number) => void;
}

export function Stepper({ label, steps, current, onStepClick }: StepperProps) {
  return (
    <ol className="lc-stepper" aria-label={label}>
      {steps.map((step, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'todo';
        return (
          <li key={step.id} className="lc-stepper__item" data-state={state}>
            <button
              type="button"
              className="lc-stepper__step"
              disabled={state === 'todo'}
              aria-current={state === 'current' ? 'step' : undefined}
              onClick={() => onStepClick?.(i)}
            >
              <span className="lc-stepper__marker" aria-hidden="true">
                {state === 'done' ? <Icon name="check" size={11} /> : i + 1}
              </span>
              <span className="lc-stepper__label">{step.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export default Stepper;
