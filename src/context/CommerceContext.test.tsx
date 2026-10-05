import { describe, expect, it, vi } from 'vitest';
import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { DEFAULT_SAVED_ADDRESSES, MOCK_ORDERS } from '../data/mockOrders';
import { CommerceProvider, useCommerce } from './CommerceContext';

const PRODUCT = { productId: 'p1', name: 'Nike Air Zoom Pegasus 41', sku: 'NK-PG41-BLK', unitPrice: 4799 };

/** Minimal consumer used to drive/observe a CommerceProvider from tests. */
function CartProbe({ label }: { label: string }) {
  const { items, addItem } = useCommerce();
  return (
    <div>
      <button type="button" onClick={() => addItem(PRODUCT)}>
        Add to {label}
      </button>
      <span data-testid={`count-${label}`}>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
    </div>
  );
}

describe('CommerceProvider isolation', () => {
  it('does not share cart state between separate provider instances', async () => {
    const user = userEvent.setup();
    render(
      <>
        <CommerceProvider>
          <CartProbe label="A" />
        </CommerceProvider>
        <CommerceProvider>
          <CartProbe label="B" />
        </CommerceProvider>
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Add to A' }));

    expect(screen.getByTestId('count-A')).toHaveTextContent('1');
    expect(screen.getByTestId('count-B')).toHaveTextContent('0');
  });

  it('resets cart items when the provider remounts under a new key', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <CommerceProvider key="ticket-1">
        <CartProbe label="cart" />
      </CommerceProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Add to cart' }));
    expect(screen.getByTestId('count-cart')).toHaveTextContent('1');

    // Mirrors TicketDetailsPanel keying CommerceProvider by ticketId: switching
    // tickets remounts the provider instead of carrying items over.
    rerender(
      <CommerceProvider key="ticket-2">
        <CartProbe label="cart" />
      </CommerceProvider>,
    );

    expect(screen.getByTestId('count-cart')).toHaveTextContent('0');
  });
});

function setup(showTab = vi.fn()) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <CommerceProvider showTab={showTab}>{children}</CommerceProvider>
  );
  return { showTab, ...renderHook(() => useCommerce(), { wrapper }) };
}

describe('Commerce session: order from cart', () => {
  it('does nothing on an empty cart', () => {
    const { result, showTab } = setup();
    act(() => result.current.startOrderFromCart());
    expect(result.current.orderView).toEqual({ kind: 'list' });
    expect(showTab).not.toHaveBeenCalled();
  });

  it('opens Create order with the cart items and switches to the Orders tab', () => {
    const { result, showTab } = setup();
    act(() => result.current.addItem(PRODUCT, 2));
    act(() => result.current.startOrderFromCart());

    expect(result.current.orderView).toMatchObject({ kind: 'create', items: [{ productId: 'p1', quantity: 2 }] });
    expect(showTab).toHaveBeenCalledWith('Orders');
  });

  it('cancelling returns to the list and the Cart tab, and keeps the cart', () => {
    const { result, showTab } = setup();
    act(() => result.current.addItem(PRODUCT));
    act(() => result.current.startOrderFromCart());
    act(() => result.current.cancelCreate());

    expect(result.current.orderView).toEqual({ kind: 'list' });
    expect(showTab).toHaveBeenLastCalledWith('Cart');
    expect(result.current.items).toHaveLength(1);
  });

  it('creating adds the order, opens it and empties the cart', () => {
    const { result } = setup();
    act(() => result.current.addItem(PRODUCT));
    act(() => result.current.startOrderFromCart());
    const order = { ...MOCK_ORDERS[0], id: 'ORD-99999' };
    act(() => result.current.createOrder(order));

    expect(result.current.orders[0].id).toBe('ORD-99999');
    expect(result.current.orderView).toEqual({ kind: 'detail', orderId: 'ORD-99999' });
    expect(result.current.items).toHaveLength(0);
  });

  it('opens an order and goes back to the list', () => {
    const { result } = setup();
    act(() => result.current.openOrder(MOCK_ORDERS[0].id));
    expect(result.current.orderView).toEqual({ kind: 'detail', orderId: MOCK_ORDERS[0].id });
    act(() => result.current.backToList());
    expect(result.current.orderView).toEqual({ kind: 'list' });
  });
});

describe('Commerce session: saved addresses', () => {
  const address = { ...DEFAULT_SAVED_ADDRESSES[0].address, line1: '5 Brigade Road' };

  it('starts with the default saved addresses', () => {
    const { result } = setup();
    expect(result.current.savedAddresses).toEqual(DEFAULT_SAVED_ADDRESSES);
  });

  it('saves a new address with its label', () => {
    const { result } = setup();
    act(() => result.current.saveAddress('Studio', address));
    const saved = result.current.savedAddresses[result.current.savedAddresses.length - 1];
    expect(saved).toMatchObject({ label: 'Studio', address });
    expect(result.current.savedAddresses).toHaveLength(DEFAULT_SAVED_ADDRESSES.length + 1);
  });

  it('updates one address in place and leaves the others alone', () => {
    const { result } = setup();
    act(() => result.current.updateAddress('home', address));
    expect(result.current.savedAddresses.find((s) => s.id === 'home')?.address).toEqual(address);
    expect(result.current.savedAddresses.find((s) => s.id === 'office')?.address).toEqual(
      DEFAULT_SAVED_ADDRESSES[1].address,
    );
  });
});
