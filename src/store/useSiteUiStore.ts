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

const EMPTY_FILTERS: SiteFilters = { category: ALL, query: '', tag: null, size: null, color: null };

interface SiteUiStore {
  filters: SiteFilters;
  quickViewId: string | null;
  /** Ítem sobre el que se pide turno o consulta. */
  requestItemId: string | null;
  payment: PaymentIntent | null;
  announcementDismissed: boolean;
  setFilter: <K extends keyof SiteFilters>(key: K, value: SiteFilters[K]) => void;
  clearFilters: () => void;
  setQuickView: (id: string | null) => void;
  setRequestItem: (id: string | null) => void;
  startPayment: (intent: PaymentIntent | null) => void;
  setAnnouncementDismissed: (value: boolean) => void;
  reset: () => void;
}

/** Estado efímero del sitio de vista previa (no se persiste). */
export const useSiteUiStore = create<SiteUiStore>()((set) => ({
  filters: EMPTY_FILTERS,
  quickViewId: null,
  requestItemId: null,
  payment: null,
  announcementDismissed: false,
  setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),
  clearFilters: () => set({ filters: EMPTY_FILTERS }),
  setQuickView: (quickViewId) => set({ quickViewId }),
  setRequestItem: (requestItemId) => set({ requestItemId, quickViewId: null }),
  startPayment: (payment) => set({ payment }),
  setAnnouncementDismissed: (announcementDismissed) => set({ announcementDismissed }),
  reset: () => set({ filters: EMPTY_FILTERS, quickViewId: null, requestItemId: null, payment: null, announcementDismissed: false }),
}));
