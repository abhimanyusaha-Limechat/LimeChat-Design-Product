import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import { CommerceProvider, useCommerce } from '../../context/CommerceContext';
import { CartPanel } from './CartPanel';

const PEGASUS = { productId: 'prod_001', name: 'Nike Air Zoom Pegasus 41', sku: 'NK-PG41-BLK', unitPrice: 4799, color: 'Black' };

/** Starts the cart with Pegasus UK 8 ×1 and UK 9 ×2. */
function Seed() {
  const { addItem } = useCommerce();
  useEffect(() => {
    addItem({ ...PEGASUS, size: 'UK 8' });
    addItem({ ...PEGASUS, size: 'UK 9' }, 2);
  }, []); // once, on mount
  return null;
}

describe('CartPanel', () => {
  it('merges two lines when one is changed to the other’s size', async () => {
    const user = userEvent.setup();
    render(
      <CommerceProvider>
        <Seed />
        <CartPanel />
      </CommerceProvider>,
    );
    expect(screen.getByText('2 products in cart')).toBeInTheDocument();

    const [, second] = screen.getAllByRole('combobox', { name: `Size for ${PEGASUS.name}` });
    await user.selectOptions(second, 'UK 8');

    expect(screen.getByText('1 product in cart')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: `Size for ${PEGASUS.name}` })).toHaveValue('UK 8');
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
