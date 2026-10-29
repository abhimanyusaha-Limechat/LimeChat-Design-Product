/**
 * SLA rules tab details panel body: a summary of the policy, one section per question —
 * what it matches (Conditions, as chips), the time allowed (SLA Rule), who is reminded
 * (Reminders), and who is notified or assigned when it's breached (Escalation, as numbered levels).
 */
import type { ReactNode } from 'react';
import type { SlaPolicy } from '../../data/slaPolicyDemo';
import './SlaPolicyDetails.css';

/** 61 → "1 h 1 min", 120 → "2 h", 30 → "30 min". One format for every time in the panel. */
const duration = (total: number) => {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return [h && `${h} h`, (m || !h) && `${m} min`].filter(Boolean).join(' ');
};
/** "after 5 min", or "immediately" at 0. */
const after = (total: number) => (total === 0 ? 'immediately' : `after ${duration(total)}`);

/** A titled block of the panel; also used by RuleDetails. */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="lc-sla__section" aria-label={title}>
      <h3 className="lc-sla__heading">{title}</h3>
      {children}
    </section>
  );
}

export function Chips({ values }: { values: string[] }) {
  return (
    <span className="lc-sla__chips">
      {values.map((value) => (
        <span key={value} className="lc-sla__chip">
          {value}
        </span>
      ))}
    </span>
  );
}

export function SlaPolicyDetails({ policy }: { policy: SlaPolicy }) {
  const { conditions, targets, reminders, escalation } = policy;
  return (
    <div className="lc-sla">
      <Section title="Conditions">
        <ul className="lc-sla__list lc-sla__conditions">
          {conditions.map((c) => (
            <li key={c.field} className="lc-sla__condition">
              <span className="lc-sla__label">When {c.field} is</span>
              <Chips values={c.values} />
            </li>
          ))}
        </ul>
      </Section>

      <Section title="SLA Rule">
        <ul className="lc-sla__list">
          {targets.map((t) => (
            <li key={t.metric} className="lc-sla__target">
              <span>{t.metric}</span>
              <strong className="lc-sla__time">{duration(t.minutes)}</strong>
            </li>
          ))}
        </ul>
      </Section>

      {reminders.length > 0 && (
        <Section title="Reminders">
          <ul className="lc-sla__list">
            {reminders.map((r) => (
              <li key={`${r.metric}-${r.to}`} className="lc-sla__sentence">
                <strong>{r.metric}</strong> reminder sent to <strong>{r.to}</strong> {duration(r.minutesBefore)} before SLA breach
              </li>
            ))}
          </ul>
        </Section>
      )}

      {escalation.steps.length > 0 && (
        <Section title="Escalation">
          <p className="lc-sla__label">
            When <strong>{escalation.metric}</strong> SLA is <strong>Breached</strong>
          </p>
          <ol className="lc-sla__steps">
            {escalation.steps.map((step, i) => (
              <li key={i} className="lc-sla__step">
                <span className="lc-sla__step-number" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="lc-sla__step-text">
                  <span className="lc-sla__sr-only">Level {i + 1} escalation: </span>
                  Notify <strong>{step.notify}</strong>
                  <span className="lc-sla__label">
                    {after(step.afterMinutes)}
                    {step.assign && (
                      <>
                        , then assign <strong>{step.assign.to}</strong> {after(step.assign.afterMinutes)}
                      </>
                    )}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </Section>
      )}
    </div>
  );
}
