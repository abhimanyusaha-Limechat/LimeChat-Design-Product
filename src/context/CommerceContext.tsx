/**
 * CommerceContext: the Commerce session of one ticket. It holds the cart, the orders created
 * while that ticket is open, and which Orders view is showing, so the Products, Cart and Orders
 * tabs share one source of truth instead of passing signals through their parent.
 *
 * Keyed by ticket (see TicketDetailsPanel), so switching tickets starts a fresh session. The saved
 * addresses belong to that ticket's customer, so they last as long as the session does.
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_SAVED_ADDRESSES, MOCK_ORDERS, type Address, type Order, type OrderLineItem, type SavedAddress } from '../data/mockOrders';

export interface CartLineItem {
  productId: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  size?: string;
  color?: string;
}

/** A Cart line's identity: one product in one size and color. */
export type Variant = Pick<CartLineItem, 'productId' | 'size' | 'color'>;

/** A stable key for a Cart line, e.g. for React lists. */
export const variantKey = (v: Variant) => [v.productId, v.size ?? '', v.color ?? ''].join('|');

/** Which view the Orders tab shows. `create` carries the Order draft's line items. */
export type OrderView =
  | { kind: 'list' }
  | { kind: 'detail'; orderId: string }
  | { kind: 'create'; items: OrderLineItem[] };

interface CommerceContextValue {
  items: CartLineItem[];
  /** Adds to the variant's line, or starts one. */
  addItem: (item: Omit<CartLineItem, 'quantity'>, quantity?: number) => void;
  /** How many of this variant are in the cart; 0 when none. */
  quantityOf: (variant: Variant) => number;
  setQuantity: (variant: Variant, quantity: number) => void;
  /** Changes a line's size or color. If that variant already has a line, the two merge in this line's place. */
  changeVariant: (variant: Variant, change: Pick<CartLineItem, 'size' | 'color'>) => void;
  removeItem: (variant: Variant) => void;
  clearCart: () => void;

  orders: Order[];
  orderView: OrderView;
  /** Opens Create order pre-filled from the cart and asks to show Orders. Does nothing on an empty cart. */
  startOrderFromCart: () => void;
  /** Adds the order, opens its detail and empties the cart it came from. */
  createOrder: (order: Order) => void;
  /** Discards the draft and asks to show the Cart, leaving the cart as it was. */
  cancelCreate: () => void;
  openOrder: (orderId: string) => void;
  backToList: () => void;

  savedAddresses: SavedAddress[];
  saveAddress: (label: string, address: Address) => void;
  updateAddress: (id: string, address: Address) => void;
}

const CommerceContext = createContext<CommerceContextValue | null>(null);

const sameVariant = (a: Variant, b: Variant) => a.productId === b.productId && a.size === b.size && a.color === b.color;

/** Applies `change` to the line for `variant`, merging it with any other line that ends up the same variant. */
function changeLine(lines: CartLineItem[], variant: Variant, change: Partial<CartLineItem>): CartLineItem[] {
  const i = lines.findIndex((line) => sameVariant(line, variant));
  if (i === -1) return lines;
  const changed = { ...lines[i], ...change };
  const twin = lines.findIndex((line, j) => j !== i && sameVariant(line, changed));
  if (twin === -1) return lines.map((line, j) => (j === i ? changed : line));
  const merged = { ...changed, quantity: changed.quantity + lines[twin].quantity };
  return lines.flatMap((line, j) => (j === i ? [merged] : j === twin ? [] : [line]));
}

/** The commerce views the session can ask its host to show; the host maps them to its own tabs. */
export type CommerceView = 'orders' | 'cart';

export function CommerceProvider({ children, onShow }: { children: ReactNode; onShow?: (view: CommerceView) => void }) {
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [orderView, setOrderView] = useState<OrderView>({ kind: 'list' });
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(DEFAULT_SAVED_ADDRESSES);

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
      quantityOf: (variant) => items.find((line) => sameVariant(line, variant))?.quantity ?? 0,
      setQuantity: (variant, quantity) => setItems((prev) => changeLine(prev, variant, { quantity })),
      changeVariant: (variant, change) => setItems((prev) => changeLine(prev, variant, change)),
      removeItem: (variant) => setItems((prev) => prev.filter((line) => !sameVariant(line, variant))),
      clearCart: () => setItems([]),

      orders,
      orderView,
      startOrderFromCart: () => {
        if (items.length === 0) return;
        setOrderView({ kind: 'create', items });
        onShow?.('orders');
      },
      createOrder: (order) => {
        setOrders((prev) => [order, ...prev]);
        setOrderView({ kind: 'detail', orderId: order.id });
        setItems([]);
      },
      cancelCreate: () => {
        setOrderView({ kind: 'list' });
        onShow?.('cart');
      },
      openOrder: (orderId) => setOrderView({ kind: 'detail', orderId }),
      backToList: () => setOrderView({ kind: 'list' }),

      savedAddresses,
      saveAddress: (label, address) =>
        setSavedAddresses((prev) => [...prev, { id: `addr-${Date.now()}`, label, address }]),
      updateAddress: (id, address) =>
        setSavedAddresses((prev) => prev.map((saved) => (saved.id === id ? { ...saved, address } : saved))),
    }),
    [items, orders, orderView, savedAddresses, onShow],
  );

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce(): CommerceContextValue {
  const ctx = useContext(CommerceContext);
  if (!ctx) throw new Error('useCommerce must be used within a CommerceProvider');
  return ctx;
}
