/**
 * CartContext — shared cart state between ProductsPanel's "Add to cart" CTA
 * and CartPanel's line-item list, since both are rendered as sibling tabs
 * under TicketDetailsPanel with no other shared parent state.
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export interface CartLineItem {
  productId: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartContextValue {
  items: CartLineItem[];
  addItem: (item: Omit<CartLineItem, 'quantity'>, quantity?: number) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  setQuantity: (index: number, quantity: number) => void;
  setSize: (index: number, size: string) => void;
  setColor: (index: number, color: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/** Matches on productId + size + color: adding the same variant again bumps quantity instead of duplicating the row. */
function sameVariant(a: CartLineItem, b: Omit<CartLineItem, 'quantity'>): boolean {
  return a.productId === b.productId && a.size === b.size && a.color === b.color;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLineItem[]>([]);

  const value = useMemo<CartContextValue>(
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
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
