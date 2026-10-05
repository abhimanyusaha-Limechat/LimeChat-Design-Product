import { useState } from 'react';
import { beforeAll, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketDetailsPanel } from './TicketDetailsPanel';

// jsdom has no ResizeObserver; the panel only uses it to re-measure the tab indicator.
beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

function Harness() {
  const [tab, setTab] = useState('Orders');
  return <TicketDetailsPanel ticketId="100230" activeTab={tab} onTabChange={setTab} />;
}

// Looked up by its tab id: a hidden panel's accessible name isn't computed, so getByRole can't match it.
const panelOrNull = (name: string) => document.querySelector(`[role=tabpanel][aria-labelledby$="-tab-${name}"]`);
const panel = (name: string) => panelOrNull(name)!;

describe('TicketDetailsPanel commerce tabs', () => {
  it('keep their state when you switch away and back', async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness />);
    const search = () => container.querySelector<HTMLInputElement>('.lc-op__search-input')!;

    await user.type(search(), 'nike');
    await user.click(screen.getByRole('tab', { name: 'Products' }));
    await user.click(screen.getByRole('tab', { name: 'Orders' }));

    expect(search()).toHaveValue('nike');
  });

  it('hides inactive commerce panels instead of unmounting them', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(panel('Orders')).not.toHaveAttribute('hidden');
    expect(panel('Products')).toHaveAttribute('hidden');
    expect(panel('Cart')).toHaveAttribute('hidden');

    await user.click(screen.getByRole('tab', { name: 'Products' }));
    expect(panel('Products')).not.toHaveAttribute('hidden');
    expect(panel('Orders')).toHaveAttribute('hidden');
  });

  it('only mounts the commerce panels for tabs that are listed', () => {
    render(<TicketDetailsPanel tabs={['Overview', 'Cart']} ticketId="1" activeTab="Overview" />);
    expect(panelOrNull('Orders')).toBeNull();
    expect(panelOrNull('Products')).toBeNull();
    expect(panel('Cart')).toHaveAttribute('hidden');
  });
});
