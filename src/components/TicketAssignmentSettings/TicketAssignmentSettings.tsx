/**
 * TicketAssignmentSettings — Settings → Ticket Assignment, HelpDesk product.
 *
 * Two panels side by side: inboxes whose tickets are assigned automatically (Load Balance or
 * Round Robin) and inboxes assigned manually. Clicking an inbox card moves it to the other panel.
 * Below, an opt-in to keep auto-assigning to offline agents, limited to chosen inboxes.
 *
 *   <TicketAssignmentSettings
 *     inboxes={inboxes}
 *     strategy={strategy}
 *     onStrategyChange={setStrategy}
 *     manualIds={manualIds}
 *     onManualChange={(id, manual) => ...}
 *     offlineEnabled={offlineEnabled}
 *     onOfflineEnabledChange={setOfflineEnabled}
 *     offlineInboxIds={offlineInboxIds}
 *     onOfflineInboxToggle={(id) => ...}
 *   />
 */
import { useId } from 'react';
import { Button } from '../Button';
import { CheckboxPill } from '../CheckboxPill';
import { Icon } from '../icons';
import { INBOX_TYPE_LABEL, type InboxRowData } from '../InboxesTable';
import { Menu } from '../Menu';
import { Tooltip } from '../Tooltip';
import './TicketAssignmentSettings.css';

export type AssignmentStrategy = 'load-balance' | 'round-robin';

export interface TicketAssignmentSettingsProps {
  inboxes: InboxRowData[];
  strategy: AssignmentStrategy;
  onStrategyChange: (strategy: AssignmentStrategy) => void;
  /** Inboxes assigned by hand; every other inbox is assigned automatically. */
  manualIds: string[];
  onManualChange: (id: string, manual: boolean) => void;
  offlineEnabled: boolean;
  onOfflineEnabledChange: (enabled: boolean) => void;
  /** Inboxes that keep auto-assigning while agents are offline. */
  offlineInboxIds: string[];
  onOfflineInboxToggle: (id: string) => void;
}

const STRATEGIES: { id: AssignmentStrategy; label: string; info: string }[] = [
  {
    id: 'load-balance',
    label: 'Load Balance',
    info: 'Assign each new ticket to the available agent with the fewest open tickets.',
  },
  {
    id: 'round-robin',
    label: 'Round Robin',
    info: 'Assign new tickets to available agents one after another, in turn.',
  },
];

function InfoTip({ label }: { label: string }) {
  return (
    <Tooltip label={label} position="top">
      <span className="lc-ta__info" tabIndex={0} role="img" aria-label={label}>
        <Icon name="info-circle" width={14} height={14} />
      </span>
    </Tooltip>
  );
}

function InboxCard({ inbox, moveTo, onMove }: { inbox: InboxRowData; moveTo: string; onMove: () => void }) {
  const channel = INBOX_TYPE_LABEL[inbox.type];
  return (
    <button
      type="button"
      className="lc-ta__card"
      data-type={inbox.type}
      title={`Move to ${moveTo} assignment`}
      aria-label={`${inbox.name}, ${channel}. Move to ${moveTo} assignment`}
      onClick={onMove}
    >
      <span className="lc-ta__card-channel">
        <Icon name={inbox.type} width={16} height={16} />
        {channel}
      </span>
      <span className="lc-ta__card-name">{inbox.name}</span>
    </button>
  );
}

function CardGrid({ inboxes, empty, ...card }: { inboxes: InboxRowData[]; empty: string; moveTo: string; onMove: (id: string) => void }) {
  if (inboxes.length === 0) return <p className="lc-ta__empty">{empty}</p>;
  return (
    <div className="lc-ta__grid lc-scrollbar-thin">
      {inboxes.map((inbox) => (
        <InboxCard key={inbox.id} inbox={inbox} moveTo={card.moveTo} onMove={() => card.onMove(inbox.id)} />
      ))}
    </div>
  );
}

export function TicketAssignmentSettings({
  inboxes,
  strategy,
  onStrategyChange,
  manualIds,
  onManualChange,
  offlineEnabled,
  onOfflineEnabledChange,
  offlineInboxIds,
  onOfflineInboxToggle,
}: TicketAssignmentSettingsProps) {
  const manualTitleId = useId();
  const automatic = inboxes.filter((i) => !manualIds.includes(i.id));
  const manual = inboxes.filter((i) => manualIds.includes(i.id));
  // Moving an inbox to manual drops it from the offline list's menu, so count only automatic ones.
  const offlineCount = automatic.filter((i) => offlineInboxIds.includes(i.id)).length;

  return (
    <div className="lc-ta">
      <div className="lc-ta__panels">
        <section className="lc-ta__panel" aria-label="Automatic assignment">
          <div className="lc-ta__radio-group" role="radiogroup" aria-label="Assignment method">
            {STRATEGIES.map((s) => (
              <span key={s.id} className="lc-ta__radio-wrap">
                <label className="lc-ta__radio">
                  <input
                    type="radio"
                    name="lc-ta-strategy"
                    checked={strategy === s.id}
                    onChange={() => onStrategyChange(s.id)}
                  />
                  <span className="lc-ta__radio-dot" data-checked={strategy === s.id} />
                  <span className="lc-ta__radio-label" data-checked={strategy === s.id}>{s.label}</span>
                </label>
                <InfoTip label={s.info} />
              </span>
            ))}
          </div>
          <CardGrid
            inboxes={automatic}
            empty="Every inbox is assigned manually."
            moveTo="manual"
            onMove={(id) => onManualChange(id, true)}
          />
        </section>

        <section className="lc-ta__panel" aria-labelledby={manualTitleId}>
          <div className="lc-ta__panel-heading">
            <h2 id={manualTitleId} className="lc-ta__panel-title">Manual Assignment</h2>
            <InfoTip label="Tickets in these inboxes stay unassigned until an agent picks them up or someone assigns them." />
          </div>
          <span className="lc-ta__subhead">Active Inboxes</span>
          <CardGrid
            inboxes={manual}
            empty="Click an inbox on the left to assign its tickets manually."
            moveTo="automatic"
            onMove={(id) => onManualChange(id, false)}
          />
        </section>
      </div>

      <div className="lc-ta__offline">
        <CheckboxPill
          checked={offlineEnabled}
          onChange={onOfflineEnabledChange}
          label="Allow Tickets to be assigned automatically when agents are offline"
        />
        <Menu
          ariaLabel="Inboxes assigned while agents are offline"
          align="start"
          width={260}
          closeOnItemClick={false}
          emptyState={<p className="lc-ta__empty">No inboxes use automatic assignment.</p>}
          items={automatic.map((inbox) => ({
            key: inbox.id,
            label: inbox.name,
            selected: offlineInboxIds.includes(inbox.id),
            trailingIcon: offlineInboxIds.includes(inbox.id) ? <Icon name="check" width={16} height={16} /> : undefined,
            onClick: () => onOfflineInboxToggle(inbox.id),
          }))}
          trigger={({ ref, onClick }) => (
            <Button
              ref={ref}
              variant="default"
              size="sm"
              disabled={!offlineEnabled}
              rightSection={<Icon name="chevron-down" width={16} height={16} />}
              onClick={onClick}
            >
              {offlineCount ? `${offlineCount} inbox${offlineCount === 1 ? '' : 'es'} selected` : 'Select Inboxes'}
            </Button>
          )}
        />
      </div>
    </div>
  );
}

export default TicketAssignmentSettings;
