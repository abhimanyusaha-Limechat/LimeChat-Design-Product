import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ShopifyActionsPermissions, type ShopifyPermissions } from './ShopifyActionsPermissions';

const on: ShopifyPermissions = { createOrder: true, prepaid: false, cod: true, mandatoryField: 'Email' };
const SELECT_LABEL = 'Mandatory fields';

describe('ShopifyActionsPermissions', () => {
  it('reports switch, checkbox and select changes', () => {
    const onChange = vi.fn();
    render(<ShopifyActionsPermissions values={on} onChange={onChange} />);

    fireEvent.click(screen.getByRole('switch', { name: 'Create Order' }));
    expect(onChange).toHaveBeenLastCalledWith({ ...on, createOrder: false });

    fireEvent.click(screen.getByRole('checkbox', { name: 'Prepaid Order' }));
    expect(onChange).toHaveBeenLastCalledWith({ ...on, prepaid: true });

    fireEvent.change(screen.getByLabelText(SELECT_LABEL), { target: { value: 'Phone number' } });
    expect(onChange).toHaveBeenLastCalledWith({ ...on, mandatoryField: 'Phone number' });
  });

  it('disables everything under the switch while it is off', () => {
    render(<ShopifyActionsPermissions values={{ ...on, createOrder: false }} onChange={() => {}} />);
    expect(screen.getByRole('checkbox', { name: 'COD Order' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Prepaid Order' })).toBeDisabled();
    expect(screen.getByLabelText(SELECT_LABEL)).toBeDisabled();
  });

  it('disables Prepaid with a warning when Razorpay is not connected', () => {
    render(<ShopifyActionsPermissions values={{ ...on, prepaid: true }} onChange={() => {}} prepaidAvailable={false} />);
    const prepaid = screen.getByRole('checkbox', { name: /Prepaid Order/ });
    expect(prepaid).toBeDisabled();
    expect(prepaid).not.toBeChecked();
    expect(screen.getByRole('img', { name: /Connect Razorpay/ })).toBeInTheDocument();
  });
});
