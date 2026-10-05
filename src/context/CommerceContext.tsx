/**
 * CommerceContext: the Commerce session of one ticket. It holds the cart, the orders created
 * while that ticket is open, and which Orders view is showing, so the Products, Cart and Orders
 * tabs share one source of truth instead of passing signals through their parent.
 *
 * Keyed by ticket (see TicketDetailsPanel), so switching tickets starts a fresh session.
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { MOCK_ORDERS, type Order, type OrderLineItem } from '../data/mockOrders';

export interface CartLineItem {
  productId: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  size?: string;
  color?: string;
}

/** Which view the Orders tab shows. `create` carries the Order draft's line items. */
export type OrderView =
  | { kind: 'list' }
  | { kind: 'detail'; orderId: string }
  | { kind: 'create'; items: OrderLineItem[] };

interface CommerceContextValue {
  items: CartLineItem[];
  addItem: (item: Omit<CartLineItem, 'quantity'>, quantity?: number) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  setQuantity: (index: number, quantity: number) => void;
  setSize: (index: number, size: string) => void;
  setColor: (index: number, color: string) => void;

  orders: Order[];
  orderView: OrderView;
  /** Opens Create order pre-filled from the cart and switches to the Orders tab. Does nothing on an empty cart. */
  startOrderFromCart: () => void;
  /** Adds the order, opens its detail and empties the cart it came from. */
  createOrder: (order: Order) => void;
  /** Discards the draft and returns to the Cart tab, leaving the cart as it was. */
  cancelCreate: () => void;
  openOrder: (orderId: string) => void;
  backToList: () => void;
}

const CommerceContext = createContext<CommerceContextValue | null>(null);

/** Matches on productId + size + color: adding the same variant again bumps quantity instead of duplicating the row. */
function sameVariant(a: CartLineItem, b: Omit<CartLineItem, 'quantity'>): boolean {
  return a.productId === b.productId && a.size === b.size && a.color === b.color;
}

export function CommerceProvider({ children, showTab }: { children: ReactNode; showTab?: (tab: string) => void }) {
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [orderView, setOrderView] = useState<OrderView>({ kind: 'list' });

  const value = useMemo<CommerceContextValue>(
    () => ({
      items,
      addItem: (item, quantity = 1) =>
        setItems((prev) => {
          const existingIndex = prev.findIndex((i) => sameVariant(i, item));
          if (existingIndex !== -1) {
            return prev.map((i, idx) => (idx === existingIndex ? { ...i, quantity: i.quantity + quantity } : i));
          }
          return [...prev, { ...item, quantity }];
        }),
      removeItem: (index) => setItems((prev) => prev.filter((_, i) => i !== index)),
      clearCart: () => setItems([]),
      setQuantity: (index, quantity) =>
        setItems((prev) => prev.map((item, i) => (i === index ? { ...item, quantity } : item))),
      setSize: (index, size) => setItems((prev) => prev.map((item, i) => (i === index ? { ...item, size } : item))),
      setColor: (index, color) =>
        setItems((prev) => prev.map((item, i) => (i === index ? { ...item, color } : item))),

      orders,
      orderView,
      startOrderFromCart: () => {
        if (items.length === 0) return;
        setOrderView({ kind: 'create', items });
        showTab?.('Orders');
      },
      createOrder: (order) => {
        setOrders((prev) => [order, ...prev]);
        setOrderView({ kind: 'detail', orderId: order.id });
        setItems([]);
      },
      cancelCreate: () => {
        setOrderView({ kind: 'list' });
        showTab?.('Cart');
      },
      openOrder: (orderId) => setOrderView({ kind: 'detail', orderId }),
      backToList: () => setOrderView({ kind: 'list' }),
    }),
    [items, orders, orderView, showTab],
  );

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce(): CommerceContextValue {
  const ctx = useContext(CommerceContext);
  if (!ctx) throw new Error('useCommerce must be used within a CommerceProvider');
  return ctx;
}
