import { create } from 'zustand';
import type { Currency } from '@/types';

export const ALL = 'all';

export interface SiteFilters {
  category: string;
  query: string;
  tag: string | null;
  size: string | null;
  color: string | null;
}

/** Cobro pendiente en el simulador de link de pago. */
export interface PaymentIntent {
  amount: number;
  currency: Currency;
  description: string;
  kind: 'order' | 'deposit';
  /** Mensaje de WhatsApp con el comprobante, una vez aprobado. */
  buildMessage: (payment: { provider: string; reference: string }) => string;
  onPaid?: () => void;
}

/**
 * Foco en vivo: el editor pide mostrar una parte del sitio.
 * `target` es 'top', un selector CSS dentro del sitio o 'item:<id>'.
 */
export interface Spotlight {
  target: string;
  highlight: boolean;
  nonce: number;
}

const EMPTY_FILTERS: SiteFilters = { category: ALL, query: '', tag: null, size: null, color: null };

/** Evita volver a desplazar la vista previa en cada tecla mientras se edita el mismo bloque. */
let lastSpotlight = { target: '', at: 0 };

interface SiteUiStore {
  filters: SiteFilters;
  quickViewId: string | null;
  /** Ítem sobre el que se pide turno o consulta. */
  requestItemId: string | null;
  payment: PaymentIntent | null;
  announcementDismissed: boolean;
  spotlight: Spotlight | null;
  setFilter: <K extends keyof SiteFilters>(key: K, value: SiteFilters[K]) => void;
  clearFilters: () => void;
  setQuickView: (id: string | null) => void;
  setRequestItem: (id: string | null) => void;
  startPayment: (intent: PaymentIntent | null) => void;
  setAnnouncementDismissed: (value: boolean) => void;
  /** Lleva la vista previa a una sección o ítem y, opcionalmente, lo resalta. */
  focusPreview: (target: string, highlight?: boolean) => void;
  reset: () => void;
}

/** Estado efímero del sitio de vista previa (no se persiste). */
export const useSiteUiStore = create<SiteUiStore>()((set) => ({
  filters: EMPTY_FILTERS,
  quickViewId: null,
  requestItemId: null,
  payment: null,
  announcementDismissed: false,
  spotlight: null,
  setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),
  clearFilters: () => set({ filters: EMPTY_FILTERS }),
  setQuickView: (quickViewId) => set({ quickViewId }),
  setRequestItem: (requestItemId) => set({ requestItemId, quickViewId: null }),
  startPayment: (payment) => set({ payment }),
  setAnnouncementDismissed: (announcementDismissed) => set({ announcementDismissed }),
  focusPreview: (target, highlight = true) => {
    const now = Date.now();
    if (lastSpotlight.target === target && now - lastSpotlight.at < 2500) return;
    lastSpotlight = { target, at: now };
    set((s) => ({ spotlight: { target, highlight, nonce: (s.spotlight?.nonce ?? 0) + 1 } }));
  },
  reset: () => set({ filters: EMPTY_FILTERS, quickViewId: null, requestItemId: null, payment: null, announcementDismissed: false }),
}));
