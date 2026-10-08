import { useState } from 'react';
import { beforeAll, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
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
const panelOrNull = (name: string) => document.querySelector<HTMLElement>(`[role=tabpanel][aria-labelledby$="-tab-${name}"]`);
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

describe('TicketDetailsPanel cart to order handoff', () => {
  function CommerceHarness() {
    const [tab, setTab] = useState('Products');
    return <TicketDetailsPanel ticketId="100230" activeTab={tab} onTabChange={setTab} />;
  }

  async function addNikeToCart(user: ReturnType<typeof userEvent.setup>) {
    await user.click(await within(panel('Products')).findByText('Nike Air Zoom Pegasus 41'));
    await user.click(screen.getByRole('button', { name: 'Add to cart' }));
    await user.click(screen.getByRole('tab', { name: /^Cart/ }));
  }

  it('opens Create order pre-filled from the cart, and Back returns to the untouched cart', async () => {
    const user = userEvent.setup();
    render(<CommerceHarness />);
    await addNikeToCart(user);

    await user.click(screen.getByRole('button', { name: 'Create order' }));
    expect(panel('Orders')).not.toHaveAttribute('hidden');
    expect(within(panel('Orders')).getByText('Creating new order')).toBeInTheDocument();
    expect(within(panel('Orders')).getByText('Nike Air Zoom Pegasus 41')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Back to cart' }));
    expect(panel('Cart')).not.toHaveAttribute('hidden');
    expect(within(panel('Cart')).getByText('Nike Air Zoom Pegasus 41')).toBeInTheDocument();
  });

  it('creating the order opens it and empties the cart', async () => {
    const user = userEvent.setup();
    render(<CommerceHarness />);
    await addNikeToCart(user);
    await user.click(screen.getByRole('button', { name: 'Create order' }));

    await user.type(screen.getByLabelText('Full name'), 'Asha Verma');
    await user.type(screen.getByLabelText('Address line 1'), '12 MG Road');
    await user.type(screen.getByLabelText('City'), 'Bengaluru');
    await user.type(screen.getByLabelText('Postal code'), '560001');
    await user.click(screen.getByRole('button', { name: 'Create order' }));

    expect(within(panel('Orders')).queryByText('Creating new order')).not.toBeInTheDocument();
    expect(within(panel('Orders')).getByRole('button', { name: 'Back to orders' })).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /^Cart/ }));
    expect(within(panel('Cart')).queryByText('Nike Air Zoom Pegasus 41')).not.toBeInTheDocument();
  });
});

describe('TicketDetailsPanel saved addresses', () => {
  function CommerceHarness() {
    const [tab, setTab] = useState('Products');
    return <TicketDetailsPanel ticketId="100230" activeTab={tab} onTabChange={setTab} />;
  }

  it('keeps an address saved in Create order for the next time it opens', async () => {
    const user = userEvent.setup();
    render(<CommerceHarness />);
    await user.click(await within(panel('Products')).findByText('Nike Air Zoom Pegasus 41'));
    await user.click(screen.getByRole('button', { name: 'Add to cart' }));
    await user.click(screen.getByRole('tab', { name: /^Cart/ }));
    await user.click(screen.getByRole('button', { name: 'Create order' }));

    await user.type(screen.getByLabelText('Full name'), 'Asha Verma');
    await user.type(screen.getByLabelText('Address line 1'), '12 MG Road');
    await user.type(screen.getByLabelText('City'), 'Bengaluru');
    await user.type(screen.getByLabelText('Postal code'), '560001');
    await user.type(screen.getByPlaceholderText('Save as (e.g. Home, Office)'), 'Studio');
    await user.click(screen.getByRole('button', { name: 'Save address' }));
    expect(within(panel('Orders')).getByText('Studio')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Back to cart' }));
    await user.click(screen.getByRole('button', { name: 'Create order' }));
    expect(within(panel('Orders')).getByText('Studio')).toBeInTheDocument();
  });
});
