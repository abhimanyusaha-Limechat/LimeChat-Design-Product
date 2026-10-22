/**
 * ChangePlan — Settings → Billing → Change plan, HelpDesk product.
 *
 * Plan cards side by side (the current one highlighted) and a feature-by-plan comparison
 * table. Tiers are ordered cheapest first; each adds
 * to the one before, so cards after the first open with "Everything in <previous>, plus".
 *
 *   <ChangePlan tiers={PLAN_TIERS} features={PLAN_FEATURES} currentId="advanced-plus" onSwitch={(tier) => ...} />
 */
import { useId } from 'react';
import { Button } from '../Button';
import { DataTable, DataTableHead, DataTableRow } from '../DataTable';
import { CheckIcon } from '../icons';
import { usd } from './BillingSettings';
import './ChangePlan.css';

export interface PlanTier {
  id: string;
  name: string;
  pricePerMonth: number;
  extraTicketPrice: number;
  includedAgents: number;
  /** Card bullets after the agent-logins line. */
  highlights: string[];
}

export interface PlanFeature {
  label: string;
  /** Ids of the tiers that include it. */
  tierIds: string[];
}

export interface ChangePlanProps {
  /** Cheapest first. */
  tiers: PlanTier[];
  features: PlanFeature[];
  currentId: string;
  onSwitch: (tier: PlanTier) => void;
}

/** "3 agent logins", or "5 agent logins (up from 3)" when the previous tier had fewer. */
export function agentLoginsLine(tier: PlanTier, previous?: PlanTier) {
  const line = `${tier.includedAgents} agent logins`;
  return previous && previous.includedAgents < tier.includedAgents
    ? `${line} (up from ${previous.includedAgents})`
    : line;
}

export function ChangePlan({ tiers, features, currentId, onSwitch }: ChangePlanProps) {
  const tableId = useId();
  const current = tiers.find((t) => t.id === currentId);

  return (
    <div className="lc-plans">
      <ul className="lc-plans__grid" aria-label="Plans">
        {tiers.map((tier, i) => {
          const isCurrent = tier.id === currentId;
          const previous = tiers[i - 1];
          return (
            <li key={tier.id} className="lc-plans__card" data-current={isCurrent}>
              <div className="lc-plans__card-head">
                <h2 className="lc-plans__name">{tier.name}</h2>
                {isCurrent && <span className="lc-plans__badge">Your plan</span>}
              </div>
              <p className="lc-plans__price">
                <span className="lc-plans__amount">{usd.format(tier.pricePerMonth)}</span>
                <span className="lc-plans__per">/month</span>
              </p>
              <p className="lc-plans__extra">Plus {usd.format(tier.extraTicketPrice)} per additional ticket</p>

              <div className="lc-plans__features">
                {previous && <p className="lc-plans__inherits">Everything in {previous.name}, plus</p>}
                <ul className="lc-plans__list">
                  <li>{agentLoginsLine(tier, previous)}</li>
                  {tier.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <Button
                variant="default"
                size="md"
                textTransform="none"
                fullWidth
                disabled={isCurrent}
                onClick={() => onSwitch(tier)}
              >
                {isCurrent
                  ? 'Current plan'
                  : `${current && tier.pricePerMonth > current.pricePerMonth ? 'Upgrade' : 'Switch'} to ${tier.name}`}
              </Button>
            </li>
          );
        })}
      </ul>

      <section className="lc-plans__section" aria-labelledby={tableId}>
        <h2 id={tableId} className="lc-plans__heading">Feature comparison</h2>
        <DataTable aria-labelledby={tableId} className="lc-plans__table">
          <DataTableHead>
            <div role="columnheader" className="lc-plans__cell lc-plans__cell--feature">Feature</div>
            {tiers.map((tier) => (
              <div
                key={tier.id}
                role="columnheader"
                className="lc-plans__cell"
                data-current={tier.id === currentId}
              >
                {tier.name}
                {tier.id === currentId && ' (you)'}
              </div>
            ))}
          </DataTableHead>
          <DataTableRow>
            <div role="rowheader" className="lc-plans__cell lc-plans__cell--feature">Agent logins</div>
            {tiers.map((tier) => (
              <div key={tier.id} role="cell" className="lc-plans__cell">{tier.includedAgents}</div>
            ))}
          </DataTableRow>
          {features.map((feature) => (
            <DataTableRow key={feature.label}>
              <div role="rowheader" className="lc-plans__cell lc-plans__cell--feature">{feature.label}</div>
              {tiers.map((tier) => (
                <div key={tier.id} role="cell" className="lc-plans__cell">
                  {feature.tierIds.includes(tier.id) ? (
                    <CheckIcon className="lc-plans__check" width={18} height={18} strokeWidth={2.5} aria-hidden="true" />
                  ) : (
                    <span aria-hidden="true">—</span>
                  )}
                  <span className="lc-dt__sr-only">{feature.tierIds.includes(tier.id) ? 'Included' : 'Not included'}</span>
                </div>
              ))}
            </DataTableRow>
          ))}
        </DataTable>
      </section>
    </div>
  );
}
