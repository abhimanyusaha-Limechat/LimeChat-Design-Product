import { describe, expect, it } from 'vitest';
import { addressesEqual, DEFAULT_TAX_RATE, draftToOrder, emptyDraft, formatAddressForCopy, isDraftValid, orderTotals } from './orderDraft';
import { DEFAULT_SAVED_ADDRESSES, MOCK_ORDERS, type Order, type OrderLineItem } from './mockOrders';

const item = (quantity: number, unitPrice: number): OrderLineItem => ({
  name: 'Runner',
  sku: 'SKU-1',
  quantity,
  unitPrice,
});

const validDraft = () => {
  const draft = emptyDraft([item(2, 1000), item(1, 500)]);
  draft.shippingAddress = { ...draft.shippingAddress, name: ' Ananya ', line1: '1 MG Road', city: 'Pune', postalCode: '411006' };
  return draft;
};

describe('orderTotals', () => {
  it('applies the discount before tax and adds shipping and extra charges', () => {
    const totals = orderTotals([item(2, 1000), item(1, 500)], {
      discountAmount: 100,
      taxRate: 12,
      shippingCost: 50,
      extraChargeAmount: 30,
    });
    expect(totals).toEqual({ subtotal: 2500, taxAmount: 288, total: 2768 });
  });

  it('rounds tax to the nearest rupee', () => {
    expect(orderTotals([item(1, 105)], { taxRate: 12 }).taxAmount).toBe(13);
  });

  it('is zero for no items', () => {
    expect(orderTotals([], { taxRate: DEFAULT_TAX_RATE })).toEqual({ subtotal: 0, taxAmount: 0, total: 0 });
  });

  it('keeps the seeded mock orders internally consistent', () => {
    for (const order of MOCK_ORDERS) {
      expect(order.total).toBe(order.subtotal - order.discountAmount + order.taxAmount + order.shippingCost);
    }
  });
});

describe('isDraftValid', () => {
  it('needs items and a shipping name, line 1, city and postal code', () => {
    expect(isDraftValid(validDraft())).toBe(true);
    expect(isDraftValid(emptyDraft())).toBe(false);
    expect(isDraftValid({ ...validDraft(), items: [] })).toBe(false);
    const draft = validDraft();
    draft.shippingAddress.postalCode = '  ';
    expect(isDraftValid(draft)).toBe(false);
  });
});

describe('draftToOrder', () => {
  it('parses form strings, ignoring junk as zero', () => {
    const draft = { ...validDraft(), discountAmount: '100', shippingCost: 'abc', extraChargeAmount: '' };
    const order = draftToOrder(draft);
    expect(order).toMatchObject({ discountAmount: 100, shippingCost: 0, extraChargeAmount: 0, taxRate: 12, total: 2688 });
  });

  it('turns blank code, label and notes into undefined and trims them', () => {
    const blank = draftToOrder(validDraft());
    expect(blank.discountCode).toBeUndefined();
    expect(blank.extraChargeLabel).toBeUndefined();
    expect(blank.notes).toBeUndefined();
    const filled = draftToOrder({ ...validDraft(), discountCode: ' SAVE10 ', notes: ' gift ' });
    expect(filled.discountCode).toBe('SAVE10');
    expect(filled.notes).toBe('gift');
  });

  it('derives the invoice name from the shipping name unless one is given', () => {
    expect(draftToOrder(validDraft()).invoiceName).toBe('Invoice - Ananya');
    expect(draftToOrder({ ...validDraft(), invoiceName: ' Acme ' }).invoiceName).toBe('Acme');
  });

  it('uses the shipping address for billing unless billing differs', () => {
    const draft = validDraft();
    draft.billingAddress = { ...draft.billingAddress, name: 'Someone else' };
    expect(draftToOrder(draft).billingAddress).toBe(draft.shippingAddress);
    const separate = draftToOrder({ ...draft, billingSameAsShipping: false });
    expect(separate.billingAddress.name).toBe('Someone else');
  });

  it('numbers the order after the highest existing ORD- id, ignoring malformed ids', () => {
    expect(draftToOrder(validDraft()).id).toBe('ORD-10001');
    const existing = [{ id: 'ORD-10241' }, { id: 'ORD-10300' }, { id: 'legacy' }] as Order[];
    expect(draftToOrder(validDraft(), existing).id).toBe('ORD-10301');
  });
});

describe('addressesEqual', () => {
  const [home, office] = DEFAULT_SAVED_ADDRESSES.map((s) => s.address);

  it('matches an address with itself and tells different addresses apart', () => {
    expect(addressesEqual(home, { ...home })).toBe(true);
    expect(addressesEqual(home, office)).toBe(false);
  });

  it('treats a missing line 2 or phone the same as an empty one', () => {
    expect(addressesEqual({ ...office, line2: undefined }, { ...office, line2: '' })).toBe(true);
    expect(addressesEqual({ ...office, phone: undefined }, { ...office, phone: '' })).toBe(true);
  });

  it('notices a change in any field', () => {
    expect(addressesEqual(home, { ...home, postalCode: '560001' })).toBe(false);
    expect(addressesEqual(home, { ...home, phone: '+91 90000 00000' })).toBe(false);
  });
});

describe('formatAddressForCopy', () => {
  it('writes one line per part and skips the ones that are empty', () => {
    const [home, office] = DEFAULT_SAVED_ADDRESSES.map((s) => s.address);
    expect(formatAddressForCopy(home).split('\n')).toEqual([
      'Ananya Rao',
      '221 Indiranagar 12th Main',
      'Near Chinnaswamy Stadium',
      'Bengaluru, Karnataka 560038',
      'India',
      '+91 98450 11223',
    ]);
    expect(formatAddressForCopy(office).split('\n')).not.toContain('undefined');
    expect(formatAddressForCopy(office).split('\n')).toHaveLength(5);
  });
});
