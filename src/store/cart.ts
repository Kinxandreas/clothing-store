import { create } from 'zustand';
import { CartItem } from '@/types/database';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) => {
    const existing = get().items.find(i => i.variantId === item.variantId);
    if (existing) {
      set(state => ({
        items: state.items.map(i =>
          i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        ),
      }));
    } else {
      set(state => ({ items: [...state.items, item] }));
    }
  },
  removeItem: (variantId) =>
    set(state => ({ items: state.items.filter(i => i.variantId !== variantId) })),
  updateQuantity: (variantId, quantity) =>
    set(state => ({
      items: quantity <= 0
        ? state.items.filter(i => i.variantId !== variantId)
        : state.items.map(i => i.variantId === variantId ? { ...i, quantity } : i),
    })),
  clearCart: () => set({ items: [] }),
  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));
