/**
 * Automation rules tab details panel body: when the rule runs (Event), what it checks
 * (Conditions, as chips) and what it does (Actions, as numbered steps, in order).
 * Shares its look with SlaPolicyDetails: the same `Section` and `Chips`, and its `lc-sla__*` styles.
 */
import type { AutomationRule } from '../../data/ruleDemo';
import { Chips, Section } from './SlaPolicyDetails';

export function RuleDetails({ rule }: { rule: AutomationRule }) {
  const { event, conditions, actions } = rule;
  return (
    <div className="lc-sla">
      <Section title="Event">
        <div className="lc-sla__condition">
          <span className="lc-sla__label">When a {event.subject} is</span>
          <Chips values={[event.state]} />
        </div>
      </Section>

      <Section title="Conditions">
        {conditions.length === 0 ? (
          <p className="lc-sla__label">No conditions. The rule runs every time.</p>
        ) : (
          <ul className="lc-sla__list lc-sla__conditions">
            {conditions.map((c) => (
              <li key={c.field} className="lc-sla__condition">
                <span className="lc-sla__label">If {c.field} is{c.not ? ' not' : ''}</span>
                <Chips values={c.values} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Actions">
        <ol className="lc-sla__steps">
          {actions.map((action, i) => (
            <li key={i} className="lc-sla__step">
              <span className="lc-sla__step-number" aria-hidden="true">
                {i + 1}
              </span>
              <span className="lc-sla__step-text">
                <strong>{action.name}</strong>
                {action.values.length > 0 && <Chips values={action.values} />}
              </span>
            </li>
          ))}
        </ol>
      </Section>
    </div>
  );
}
