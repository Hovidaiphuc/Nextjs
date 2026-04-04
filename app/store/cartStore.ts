import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  stock?: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  decrementItem: (id: string) => void;
  clearCart: () => void;
  getTotal: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = get().items;
        const existing = items.find((i) => i.id === item.id);
        const qty = item.quantity ?? 1;
        if (existing) {
          // Don't exceed stock if stock is known
          const maxQty = item.stock != null ? Math.min(existing.quantity + qty, item.stock) : existing.quantity + qty;
          set({
            items: items.map((i) =>
              i.id === item.id ? { ...i, quantity: maxQty } : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, quantity: qty }] });
        }
      },

      removeItem: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.id !== id) });
          return;
        }
        const items = get().items;
        const item = items.find((i) => i.id === id);
        if (item && item.stock != null && quantity > item.stock) {
          quantity = item.stock;
        }
        set({ items: items.map((i) => i.id === id ? { ...i, quantity } : i) });
      },

      decrementItem: (id) => {
        const items = get().items;
        const item = items.find((i) => i.id === id);
        if (!item) return;
        if (item.quantity <= 1) {
          set({ items: items.filter((i) => i.id !== id) });
        } else {
          set({ items: items.map((i) => i.id === id ? { ...i, quantity: i.quantity - 1 } : i) });
        }
      },

      clearCart: () => set({ items: [] }),
      getTotal: () => get().items.reduce((total, i) => total + i.price * i.quantity, 0),
    }),
    {
      name: 'lux-derma-cart',
    }
  )
);
