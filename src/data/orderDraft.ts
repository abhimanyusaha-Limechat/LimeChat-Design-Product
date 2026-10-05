/**
 * Order maths and the create-order draft, shared by the cart, the Orders panel and the mock data.
 * The draft keeps form values as strings (what the inputs hold); `draftToOrder` is the one place
 * they are parsed into an Order.
 */
import type { Address, Order, OrderLineItem, OrderStatus } from './mockOrders';

export const DEFAULT_TAX_RATE = 12;

export interface OrderCharges {
  discountAmount?: number;
  /** Percent, applied after the discount and rounded to the nearest rupee. */
  taxRate: number;
  shippingCost?: number;
  extraChargeAmount?: number;
}

export function orderTotals(
  items: Pick<OrderLineItem, 'quantity' | 'unitPrice'>[],
  { discountAmount = 0, taxRate, shippingCost = 0, extraChargeAmount = 0 }: OrderCharges,
): { subtotal: number; taxAmount: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = Math.round(((subtotal - discountAmount) * taxRate) / 100);
  const total = subtotal - discountAmount + taxAmount + shippingCost + extraChargeAmount;
  return { subtotal, taxAmount, total };
}

export interface OrderDraft {
  invoiceName: string;
  status: OrderStatus;
  placedAt: string;
  items: OrderLineItem[];
  discountAmount: string;
  discountCode: string;
  taxRate: string;
  shippingCost: string;
  extraChargeLabel: string;
  extraChargeAmount: string;
  shippingAddress: Address;
  billingAddress: Address;
  billingSameAsShipping: boolean;
  notes: string;
}

function emptyAddress(): Address {
  return { name: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India', phone: '' };
}

export function emptyDraft(items: OrderLineItem[] = []): OrderDraft {
  return {
    invoiceName: '',
    status: 'placed',
    placedAt: new Date().toISOString().slice(0, 10),
    items,
    discountAmount: '0',
    discountCode: '',
    taxRate: String(DEFAULT_TAX_RATE),
    shippingCost: '0',
    extraChargeLabel: '',
    extraChargeAmount: '0',
    shippingAddress: emptyAddress(),
    billingAddress: emptyAddress(),
    billingSameAsShipping: true,
    notes: '',
  };
}

export function isDraftValid(draft: OrderDraft): boolean {
  return (
    draft.items.length > 0 &&
    draft.shippingAddress.name.trim() !== '' &&
    draft.shippingAddress.line1.trim() !== '' &&
    draft.shippingAddress.city.trim() !== '' &&
    draft.shippingAddress.postalCode.trim() !== ''
  );
}

function nextOrderId(existing: Order[]): string {
  const max = existing.reduce((m, o) => {
    const n = Number(o.id.replace('ORD-', ''));
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 10000);
  return `ORD-${max + 1}`;
}

/**
 * Parses the draft's form strings into an Order. Works on an incomplete draft too (the cost
 * summary previews it), so callers check `isDraftValid` before saving.
 */
export function draftToOrder(draft: OrderDraft, existingOrders: Order[] = []): Order {
  const discountAmount = Number(draft.discountAmount) || 0;
  const taxRate = Number(draft.taxRate) || 0;
  const shippingCost = Number(draft.shippingCost) || 0;
  const extraChargeAmount = Number(draft.extraChargeAmount) || 0;
  const { subtotal, taxAmount, total } = orderTotals(draft.items, {
    discountAmount,
    taxRate,
    shippingCost,
    extraChargeAmount,
  });
  return {
    id: nextOrderId(existingOrders),
    // No invoice-name field exists in the form: derive one from the shipping name so it's never blank.
    invoiceName: draft.invoiceName.trim() || `Invoice - ${draft.shippingAddress.name.trim()}`,
    placedAt: draft.placedAt,
    status: draft.status,
    items: draft.items,
    subtotal,
    discountAmount,
    discountCode: draft.discountCode.trim() || undefined,
    taxRate,
    taxAmount,
    shippingCost,
    extraChargeLabel: draft.extraChargeLabel.trim() || undefined,
    extraChargeAmount,
    total,
    shippingAddress: draft.shippingAddress,
    billingAddress: draft.billingSameAsShipping ? draft.shippingAddress : draft.billingAddress,
    billingSameAsShipping: draft.billingSameAsShipping,
    notes: draft.notes.trim() || undefined,
  };
}

export function addressesEqual(a: Address, b: Address): boolean {
  return (
    a.name === b.name &&
    a.line1 === b.line1 &&
    (a.line2 ?? '') === (b.line2 ?? '') &&
    a.city === b.city &&
    a.state === b.state &&
    a.postalCode === b.postalCode &&
    a.country === b.country &&
    (a.phone ?? '') === (b.phone ?? '')
  );
}

export function formatAddressForCopy(address: Address): string {
  return [
    address.name,
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.postalCode}`,
    address.country,
    address.phone,
  ]
    .filter(Boolean)
    .join('\n');
}
