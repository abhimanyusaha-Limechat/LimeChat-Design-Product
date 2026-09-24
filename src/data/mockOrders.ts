/**
 * Mock order history — powers the agent-facing Orders tab in
 * TicketDetailsPanel (src/components/OrdersPanel).
 */
export type OrderStatus = 'placed' | 'processing' | 'shipped' | 'delivered' | 'returned' | 'cancelled' | 'refunded';

/** An order stops being editable once it has shipped, delivered, or reached a terminal state. */
export const EDITABLE_STATUSES: OrderStatus[] = ['placed', 'processing'];
/** Order can be cancelled any time before it ships. */
export const CANCELLABLE_STATUSES: OrderStatus[] = ['placed', 'processing'];
/** A delivered order can be marked returned; a returned order can then be refunded. */
export const RETURNABLE_STATUSES: OrderStatus[] = ['delivered'];
export const REFUNDABLE_STATUSES: OrderStatus[] = ['delivered', 'returned'];

export interface OrderLineItem {
  productId?: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  /** The specific variant ordered, e.g. shoe size / apparel size, garment color — free text, editable per line item. */
  size?: string;
  color?: string;
}

export interface Address {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  id: string;
  invoiceName: string;
  placedAt: string;
  status: OrderStatus;
  items: OrderLineItem[];
  subtotal: number;
  discountAmount: number;
  discountCode?: string;
  taxRate: number;
  taxAmount: number;
  shippingCost: number;
  extraChargeLabel?: string;
  extraChargeAmount?: number;
  total: number;
  trackingLink?: string;
  shippingAddress: Address;
  billingAddress: Address;
  billingSameAsShipping: boolean;
  notes?: string;
}

const BLR_ADDRESS: Address = {
  name: 'Ananya Rao',
  line1: '221 Indiranagar 12th Main',
  line2: 'Near Chinnaswamy Stadium',
  city: 'Bengaluru',
  state: 'Karnataka',
  postalCode: '560038',
  country: 'India',
  phone: '+91 98450 11223',
};

const MUM_ADDRESS: Address = {
  name: 'Ananya Rao',
  line1: 'B-402, Sunrise Heights, Andheri West',
  city: 'Mumbai',
  state: 'Maharashtra',
  postalCode: '400058',
  country: 'India',
  phone: '+91 90040 55667',
};

const DEL_ADDRESS: Address = {
  name: 'Ananya Rao',
  line1: '14/6 Hauz Khas Enclave',
  city: 'New Delhi',
  state: 'Delhi',
  postalCode: '110016',
  country: 'India',
  phone: '+91 98110 33445',
};

const PUN_ADDRESS: Address = {
  name: 'Ananya Rao',
  line1: '7, Kalyani Nagar Society',
  line2: 'Opposite City Pride Mall',
  city: 'Pune',
  state: 'Maharashtra',
  postalCode: '411006',
  country: 'India',
  phone: '+91 99870 22110',
};

function computeTotals(
  items: OrderLineItem[],
  discountAmount: number,
  taxRate: number,
  shippingCost: number,
): { subtotal: number; taxAmount: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = Math.round(((subtotal - discountAmount) * taxRate) / 100);
  const total = subtotal - discountAmount + taxAmount + shippingCost;
  return { subtotal, taxAmount, total };
}

function buildOrder(
  base: Omit<Order, 'subtotal' | 'taxAmount' | 'total'>,
): Order {
  const { subtotal, taxAmount, total } = computeTotals(
    base.items,
    base.discountAmount,
    base.taxRate,
    base.shippingCost,
  );
  return { ...base, subtotal, taxAmount, total };
}

export const MOCK_ORDERS: Order[] = [
  buildOrder({
    id: 'ORD-10241',
    invoiceName: 'Ananya Rao',
    placedAt: '2026-09-18',
    status: 'placed',
    items: [
      {
        productId: 'prod_001',
        name: 'Nike Air Zoom Pegasus 41',
        sku: 'NK-PG41-BLK',
        quantity: 1,
        unitPrice: 4799,
        size: 'UK 9',
        color: 'Black',
      },
      { productId: 'prod_010', name: 'Puma Cushioned Crew Socks (3-Pack)', sku: 'PM-SOCK-3PK', quantity: 1, unitPrice: 799 },
      { productId: 'prod_014', name: 'Adidas Essentials Training Shorts', sku: 'AD-SHORT-GRY', quantity: 1, unitPrice: 1599, size: 'M', color: 'Grey' },
      { productId: 'prod_006', name: 'Reebok Classic Leather', sku: 'RB-CL-CHK', quantity: 1, unitPrice: 4549, size: 'UK 10', color: 'Chalk' },
      { productId: 'prod_012', name: 'Decathlon Cast Iron Kettlebell 16kg', sku: 'DB-KB-16KG', quantity: 1, unitPrice: 2999 },
    ],
    discountAmount: 0,
    taxRate: 12,
    shippingCost: 99,
    shippingAddress: BLR_ADDRESS,
    billingAddress: BLR_ADDRESS,
    billingSameAsShipping: true,
    notes: 'Customer requested gift wrap.',
  }),
  buildOrder({
    id: 'ORD-10238',
    invoiceName: 'Ananya Rao',
    placedAt: '2026-09-17',
    status: 'processing',
    items: [
      { productId: 'prod_002', name: 'Adidas Ultraboost 22', sku: 'AD-UB22-WHT', quantity: 1, unitPrice: 16999, size: 'UK 8', color: 'White' },
      { productId: 'prod_010', name: 'Puma Cushioned Crew Socks (3-Pack)', sku: 'PM-SOCK-3PK', quantity: 2, unitPrice: 799 },
    ],
    discountAmount: 1000,
    discountCode: 'WELCOME10',
    taxRate: 12,
    shippingCost: 0,
    shippingAddress: MUM_ADDRESS,
    billingAddress: MUM_ADDRESS,
    billingSameAsShipping: true,
  }),
  buildOrder({
    id: 'ORD-10231',
    invoiceName: 'Ananya Rao',
    placedAt: '2026-09-15',
    status: 'shipped',
    items: [{ productId: 'prod_006', name: 'Reebok Classic Leather', sku: 'RB-CL-CHK', quantity: 1, unitPrice: 4549, size: 'UK 10', color: 'Chalk' }],
    discountAmount: 0,
    taxRate: 12,
    shippingCost: 99,
    trackingLink: 'https://track.shiprocket.in/tracking/SR8891234',
    shippingAddress: DEL_ADDRESS,
    billingAddress: DEL_ADDRESS,
    billingSameAsShipping: true,
  }),
  buildOrder({
    id: 'ORD-10226',
    invoiceName: 'Ananya Rao',
    placedAt: '2026-09-12',
    status: 'delivered',
    items: [
      { productId: 'prod_004', name: 'Nike Dri-FIT Academy Jacket', sku: 'NK-DFDG-NVY', quantity: 1, unitPrice: 2799, size: 'L', color: 'Navy' },
      { productId: 'prod_014', name: 'Adidas Essentials Training Shorts', sku: 'AD-SHORT-GRY', quantity: 1, unitPrice: 1599, size: 'M', color: 'Grey' },
    ],
    discountAmount: 0,
    taxRate: 12,
    shippingCost: 99,
    trackingLink: 'https://track.delhivery.com/p/DL77213890',
    shippingAddress: PUN_ADDRESS,
    billingAddress: { ...PUN_ADDRESS, name: 'Deshmukh Enterprises', line1: '12, MG Road Business Park' },
    billingSameAsShipping: false,
    notes: 'Delivered to office reception; customer confirmed receipt via chat.',
  }),
  buildOrder({
    id: 'ORD-10212',
    invoiceName: 'Ananya Rao',
    placedAt: '2026-09-06',
    status: 'cancelled',
    items: [{ productId: 'prod_012', name: 'Decathlon Cast Iron Kettlebell 16kg', sku: 'DB-KB-16KG', quantity: 1, unitPrice: 2999 }],
    discountAmount: 0,
    taxRate: 12,
    shippingCost: 149,
    shippingAddress: BLR_ADDRESS,
    billingAddress: BLR_ADDRESS,
    billingSameAsShipping: true,
    notes: 'Customer cancelled — found a better price elsewhere.',
  }),
  buildOrder({
    id: 'ORD-10205',
    invoiceName: 'Rohan Mehta',
    placedAt: '2026-09-02',
    status: 'refunded',
    items: [{ productId: 'prod_003', name: 'Puma RS-X Efekt', sku: 'PM-RSX-GRY', quantity: 1, unitPrice: 6299, size: 'UK 9', color: 'Grey' }],
    discountAmount: 0,
    taxRate: 12,
    shippingCost: 99,
    trackingLink: 'https://track.shiprocket.in/tracking/SR8801122',
    shippingAddress: MUM_ADDRESS,
    billingAddress: MUM_ADDRESS,
    billingSameAsShipping: true,
    notes: 'Size issue — refund processed after return pickup.',
  }),
];
