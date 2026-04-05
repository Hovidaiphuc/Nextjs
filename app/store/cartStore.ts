import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  stock?: number;
  variantId?: string;
  variantName?: string;
};

type CartState = {
  items: CartItem[];
  _hasSynced: boolean;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  decrementItem: (id: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  syncToServer: () => Promise<void>;
  mergeFromServer: (serverCart: any) => void;
  setHasSynced: (v: boolean) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      _hasSynced: false,

      addItem: (item) => {
        const items = get().items;
        const existing = items.find((i) => i.id === item.id);
        const qty = item.quantity ?? 1;
        if (existing) {
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

      clearCart: () => set({ items: [], _hasSynced: false }),

      getTotal: () => get().items.reduce((total, i) => total + i.price * i.quantity, 0),

      // Push localStorage cart → server
      syncToServer: async () => {
        try {
          const items = get().items;
          if (items.length === 0) return;
          await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: items.map(i => ({ variantId: i.variantId, quantity: i.quantity })) })
          });
          set({ _hasSynced: true });
        } catch (e) {
          console.error("Cart sync to server failed:", e);
        }
      },

      // Pull server cart → merge with local
      mergeFromServer: (serverCart: any) => {
        if (!serverCart || !serverCart.items || serverCart.items.length === 0) return;

        const serverItems = serverCart.items
          .map((ci: any) => {
            const variant = ci.variant;
            const product = variant?.product;
            if (!product) return null;
            return {
              id: product.id,
              name: product.name,
              price: variant.price,
              imageUrl: variant.imageUrl ?? product.imageUrl ?? product.images?.[0]?.url ?? null,
              quantity: ci.quantity,
              stock: variant.stock,
              variantId: variant.id,
              variantName: variant.name
            };
          })
          .filter(Boolean);

        const localItems = get().items;
        const merged = [...localItems];

        for (const si of serverItems) {
          const existing = merged.find(m => m.id === si.id && m.variantId === si.variantId);
          if (existing) {
            merged.splice(merged.indexOf(existing), 1, {
              ...existing,
              quantity: Math.max(existing.quantity, si.quantity)
            });
          } else {
            merged.push(si);
          }
        }

        set({ items: merged, _hasSynced: true });
      },

      setHasSynced: (v) => set({ _hasSynced: v })
    }),
    {
      name: 'lux-derma-cart',
    }
  )
);