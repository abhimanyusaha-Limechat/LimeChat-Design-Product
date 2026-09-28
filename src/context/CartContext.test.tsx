import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from './CartContext';

const PRODUCT = { productId: 'p1', name: 'Nike Air Zoom Pegasus 41', sku: 'NK-PG41-BLK', unitPrice: 4799 };

/** Minimal consumer used to drive/observe a CartProvider from tests. */
function CartProbe({ label }: { label: string }) {
  const { items, addItem } = useCart();
  return (
    <div>
      <button type="button" onClick={() => addItem(PRODUCT)}>
        Add to {label}
      </button>
      <span data-testid={`count-${label}`}>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
    </div>
  );
}

describe('CartProvider isolation', () => {
  it('does not share cart state between separate provider instances', async () => {
    const user = userEvent.setup();
    render(
      <>
        <CartProvider>
          <CartProbe label="A" />
        </CartProvider>
        <CartProvider>
          <CartProbe label="B" />
        </CartProvider>
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Add to A' }));

    expect(screen.getByTestId('count-A')).toHaveTextContent('1');
    expect(screen.getByTestId('count-B')).toHaveTextContent('0');
  });

  it('resets cart items when the provider remounts under a new key', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <CartProvider key="ticket-1">
        <CartProbe label="cart" />
      </CartProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Add to cart' }));
    expect(screen.getByTestId('count-cart')).toHaveTextContent('1');

    // Mirrors TicketDetailsPanel keying CartProvider by ticketId: switching
    // tickets remounts the provider instead of carrying items over.
    rerender(
      <CartProvider key="ticket-2">
        <CartProbe label="cart" />
      </CartProvider>,
    );

    expect(screen.getByTestId('count-cart')).toHaveTextContent('0');
  });
});
