/**
 * BillingSettings — Settings → Billing, HelpDesk product.
 *
 * One plan card: plan + price and Upgrade plan, a big tickets-used figure with what's left,
 * a segmented usage bar spanning the billing cycle, and a footer of other allowances.
 * A note on how payments are collected sits below the card.
 *
 *   <BillingSettings plan={DEMO_BILLING_PLAN} onUpgrade={() => ...} />
 */
import { Button } from '../Button';
import { Icon } from '../icons';
import './BillingSettings.css';

export interface BillingPlan {
  name: string;
  pricePerMonth: number;
  includedTickets: number;
  extraTicketPrice: number;
  includedAgents: number;
  extraAgentPrice: number;
  /** First day of the current billing cycle. */
  startedOn: Date;
  /** First day of the next cycle. */
  renewsOn: Date;
  ticketsUsed: number;
}

export interface BillingSettingsProps {
  plan: BillingPlan;
  onUpgrade: () => void;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const BAR_SEGMENTS = 4;

export const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const renewDate = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const count = new Intl.NumberFormat('en-US');

/** Whole calendar days from `today` to `date`, never negative. */
export function daysUntil(date: Date, today: Date) {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / DAY_MS));
}

export function daysLeftLabel(renewsOn: Date, today: Date) {
  const days = daysUntil(renewsOn, today);
  if (days === 0) return 'Renews today';
  return `${days} ${days === 1 ? 'day' : 'days'} left`;
}

export function BillingSettings({ plan, onUpgrade }: BillingSettingsProps) {
  const { ticketsUsed, includedTickets } = plan;
  const over = ticketsUsed > includedTickets;
  const share = ticketsUsed / includedTickets;

  return (
    <div className="lc-billing">
      <section className="lc-billing__card" aria-label={`${plan.name} plan`}>
        <div className="lc-billing__main">
          <div className="lc-billing__header">
            <div className="lc-billing__plan">
              <span className="lc-billing__plan-label">Current plan</span>
              <p className="lc-billing__plan-line">
                <span className="lc-billing__plan-name">{plan.name}</span>{' '}
                <span className="lc-billing__plan-price">
                  <strong>{usd.format(plan.pricePerMonth)}</strong>/month
                </span>
              </p>
            </div>
            <Button variant="filled" color="primary" size="sm" textTransform="none" onClick={onUpgrade}>
              Upgrade plan
            </Button>
          </div>

          <div className="lc-billing__usage">
            <p className="lc-billing__used">
              <span className="lc-billing__used-count">{count.format(ticketsUsed)}</span>
              <span className="lc-billing__used-of">
                of {count.format(includedTickets)}{' '}
                <span className="lc-billing__used-pct" data-over={over}>
                  ({Math.round(share * 100)}%)
                </span>{' '}
                tickets used
              </span>
            </p>
            <p className="lc-billing__renews">Renews {renewDate.format(plan.renewsOn)}</p>
          </div>

          <div className="lc-billing__cycle-wrap">
            <div
              className="lc-billing__bar"
              data-over={over}
              role="progressbar"
              aria-label="Tickets used this cycle"
              aria-valuemin={0}
              aria-valuemax={includedTickets}
              aria-valuenow={Math.min(ticketsUsed, includedTickets)}
            >
              {Array.from({ length: BAR_SEGMENTS }, (_, i) => {
                const fill = Math.min(Math.max(share * BAR_SEGMENTS - i, 0), 1);
                return (
                  <span key={i} className="lc-billing__segment">
                    <span className="lc-billing__segment-fill" style={{ width: `${fill * 100}%` }} />
                  </span>
                );
              })}
            </div>

            <div className="lc-billing__cycle">
              <span>
                {shortDate.format(plan.startedOn)}
                {' · '}
                <strong className="lc-billing__days-left">{daysLeftLabel(plan.renewsOn, new Date())}</strong>
              </span>
              <span>
                {over ? 'Billed at' : 'Then'} {usd.format(plan.extraTicketPrice)} per ticket
              </span>
            </div>
          </div>
        </div>

        <p className="lc-billing__footer">
          Included: <strong>{plan.includedAgents} agent logins</strong> per month ·{' '}
          {usd.format(plan.extraAgentPrice)} per extra agent
        </p>
      </section>

      <p className="lc-billing__note">
        <Icon name="info-circle" width={16} height={16} />
        LimeChat primarily collects payments via Shopify. Shopify has its own billing cycle for charging
        merchants, and our charges are adjusted with Shopify automatically.
      </p>
    </div>
  );
}

export default BillingSettings;
