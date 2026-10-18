import { create } from 'zustand';
import type { CartLine, VariantSelection } from '@/types';
import { lineKey } from '@/lib/variants';

interface CartStore {
  lines: CartLine[];
  isOpen: boolean;
  /** Último cambio, anunciado a lectores de pantalla. */
  announcement: string;
  add: (itemId: string, title: string, selection?: VariantSelection, quantity?: number) => void;
  increment: (key: string) => void;
  decrement: (key: string, title: string) => void;
  removeLine: (key: string, title: string) => void;
  purgeItem: (itemId: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
}

export const useCartStore = create<CartStore>()((set) => ({
  lines: [],
  isOpen: false,
  announcement: '',

  add: (itemId, title, selection = {}, quantity = 1) =>
    set((s) => {
      const key = lineKey(itemId, selection);
      const exists = s.lines.some((l) => l.key === key);
      return {
        lines: exists
          ? s.lines.map((l) => (l.key === key ? { ...l, quantity: l.quantity + quantity } : l))
          : [...s.lines, { key, itemId, selection, quantity }],
        announcement: `${title} agregado`,
      };
    }),

  increment: (key) => set((s) => ({ lines: s.lines.map((l) => (l.key === key ? { ...l, quantity: l.quantity + 1 } : l)) })),

  decrement: (key, title) =>
    set((s) => ({
      lines: s.lines.flatMap((l) => (l.key !== key ? [l] : l.quantity > 1 ? [{ ...l, quantity: l.quantity - 1 }] : [])),
      announcement: `Se quitó una unidad de ${title}`,
    })),

  removeLine: (key, title) => set((s) => ({ lines: s.lines.filter((l) => l.key !== key), announcement: `${title} eliminado` })),
  purgeItem: (itemId) => set((s) => ({ lines: s.lines.filter((l) => l.itemId !== itemId) })),
  clear: () => set({ lines: [], isOpen: false, announcement: '' }),
  setOpen: (isOpen) => set({ isOpen }),
}));
