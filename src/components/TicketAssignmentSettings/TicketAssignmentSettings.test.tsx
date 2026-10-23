import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketAssignmentSettings, type AssignmentStrategy } from './TicketAssignmentSettings';
import type { InboxRowData } from '../InboxesTable';

const inboxes: InboxRowData[] = [
  { id: 'a', name: 'Support', type: 'whatsapp', detail: '+91-6205127441' },
  { id: 'b', name: 'Billing', type: 'email', detail: 'billing@example.com' },
];

function Harness() {
  const [strategy, setStrategy] = useState<AssignmentStrategy>('round-robin');
  const [manualIds, setManualIds] = useState<string[]>([]);
  const [offlineEnabled, setOfflineEnabled] = useState(false);
  const [offlineIds, setOfflineIds] = useState<string[]>([]);
  return (
    <TicketAssignmentSettings
      inboxes={inboxes}
      strategy={strategy}
      onStrategyChange={setStrategy}
      manualIds={manualIds}
      onManualChange={(id, manual) => setManualIds((p) => (manual ? [...p, id] : p.filter((x) => x !== id)))}
      offlineEnabled={offlineEnabled}
      onOfflineEnabledChange={setOfflineEnabled}
      offlineInboxIds={offlineIds}
      onOfflineInboxToggle={(id) => setOfflineIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))}
    />
  );
}

describe('TicketAssignmentSettings', () => {
  it('moves an inbox between panels and switches the method', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    expect(screen.getByRole('radio', { name: 'Round Robin' })).toBeChecked();
    await user.click(screen.getByRole('radio', { name: 'Load Balance' }));
    expect(screen.getByRole('radio', { name: 'Load Balance' })).toBeChecked();

    await user.click(screen.getByRole('button', { name: /Support.*Move to manual/ }));
    expect(screen.getByRole('button', { name: /Support.*Move to automatic/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Billing.*Move to manual/ })).toBeInTheDocument();
  });

  it('only lets offline inboxes be picked once the option is on', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const trigger = screen.getByRole('button', { name: 'Select Inboxes' });
    expect(trigger).toBeDisabled();

    await user.click(screen.getByRole('checkbox'));
    await user.click(trigger);
    await user.click(screen.getByRole('menuitem', { name: 'Billing' }));
    expect(screen.getByRole('button', { name: '1 inbox selected' })).toBeInTheDocument();
  });
});
