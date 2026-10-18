import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Announcement,
  BrandDetails,
  BusinessCategory,
  CatalogItem,
  CheckoutMode,
  ColorKey,
  ConversionSettings,
  DemoId,
  FontFamilyId,
  LayoutTemplate,
  PresetStyleId,
  SectionKey,
  SiteConfig,
} from '@/types';
import { CATEGORIES, DEMOS } from '@/data/demos';
import { DEFAULT_LOCATION, DEFAULT_SECTIONS } from '@/data/business';
import { findPreset } from '@/presets/styles';
import { isValidHex, normalizeHex } from '@/lib/color';
import { uid } from '@/lib/format';
import { safeJSONStorage } from './safeStorage';
import { useCartStore } from './useCartStore';
import { useSiteUiStore } from './useSiteUiStore';

interface SiteBuilderActions {
  /** Cambia de rubro y carga su demo principal. */
  setBusinessCategory: (category: BusinessCategory) => void;
  /** Carga un sitio de ejemplo respetando lo que el usuario personalizó. */
  loadDemo: (demoId: DemoId) => void;
  updateBrand: (patch: Partial<BrandDetails>) => void;
  setColor: (key: ColorKey, hex: string) => void;
  applyPreset: (id: PresetStyleId) => void;
  setFontFamily: (font: FontFamilyId) => void;
  setLayoutTemplate: (layout: LayoutTemplate) => void;
  setCheckoutMode: (mode: CheckoutMode) => void;
  updateConversion: (patch: Partial<ConversionSettings>) => void;
  updateAnnouncement: (patch: Partial<Announcement>) => void;
  setSection: (key: SectionKey, visible: boolean) => void;
  addItem: (categoryId: string) => string;
  updateItem: (id: string, patch: Partial<CatalogItem>) => void;
  removeItem: (id: string) => void;
  addCategory: (label: string) => void;
  resetDemo: () => void;
}

export type SiteBuilderStore = SiteConfig & SiteBuilderActions;

function themeFor(presetId: PresetStyleId) {
  const preset = findPreset(presetId)!;
  return { ...preset.theme, presetStyle: preset.id };
}

export function buildDemoConfig(demoId: DemoId = 'gastro-burgers'): SiteConfig {
  const demo = DEMOS[demoId];
  return {
    businessCategory: demo.category,
    demoId,
    brandDetails: {
      name: demo.defaults.brandName,
      logoUrl: null,
      tagline: demo.defaults.tagline,
      about: demo.defaults.about,
      whatsapp: '5491122334455',
      address: DEFAULT_LOCATION.address,
      city: DEFAULT_LOCATION.city,
    },
    themeSettings: themeFor(demo.defaults.preset),
    layoutTemplate: demo.defaults.layout,
    categories: demo.categories,
    productsOrServices: demo.items,
    checkoutMode: demo.defaults.checkoutMode,
    conversion: { paymentProvider: 'mercadopago', bookingsEnabled: true, deliveryEnabled: demo.deliveryZones.length > 0, depositPercent: 30 },
    announcement: { enabled: true, text: demo.defaults.announcement },
    sections: { ...DEFAULT_SECTIONS },
    business: { lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lng, hours: demo.hours, deliveryZones: demo.deliveryZones },
  };
}

/** Solo los datos serializables, sin acciones. */
export function selectConfig(s: SiteBuilderStore): SiteConfig {
  return {
    businessCategory: s.businessCategory,
    demoId: s.demoId,
    brandDetails: s.brandDetails,
    themeSettings: s.themeSettings,
    layoutTemplate: s.layoutTemplate,
    categories: s.categories,
    productsOrServices: s.productsOrServices,
    checkoutMode: s.checkoutMode,
    conversion: s.conversion,
    announcement: s.announcement,
    sections: s.sections,
    business: s.business,
  };
}

const resetSiteSession = () => {
  useCartStore.getState().clear();
  useSiteUiStore.getState().reset();
};

export const useSiteBuilderStore = create<SiteBuilderStore>()(
  persist(
    (set, get) => ({
      ...buildDemoConfig(),

      setBusinessCategory: (category) => get().loadDemo(CATEGORIES[category].demos[0]),

      loadDemo: (demoId) => {
        const s = get();
        if (s.demoId === demoId) return;
        const prev = DEMOS[s.demoId];
        const next = DEMOS[demoId];
        const brand = { ...s.brandDetails };
        // Los textos que el usuario no tocó se reemplazan por los del nuevo rubro.
        if (brand.name === prev.defaults.brandName) brand.name = next.defaults.brandName;
        if (brand.tagline === prev.defaults.tagline) brand.tagline = next.defaults.tagline;
        if (brand.about === prev.defaults.about) brand.about = next.defaults.about;

        resetSiteSession();
        set({
          businessCategory: next.category,
          demoId,
          brandDetails: brand,
          categories: next.categories,
          productsOrServices: next.items,
          business: { ...s.business, hours: next.hours, deliveryZones: next.deliveryZones },
          conversion: { ...s.conversion, deliveryEnabled: next.deliveryZones.length > 0 },
          announcement: s.announcement.text === prev.defaults.announcement ? { ...s.announcement, text: next.defaults.announcement } : s.announcement,
          ...(s.themeSettings.presetStyle === prev.defaults.preset ? { themeSettings: themeFor(next.defaults.preset) } : {}),
          ...(s.layoutTemplate === prev.defaults.layout ? { layoutTemplate: next.defaults.layout } : {}),
          ...(s.checkoutMode === prev.defaults.checkoutMode ? { checkoutMode: next.defaults.checkoutMode } : {}),
        });
      },

      updateBrand: (patch) => set((s) => ({ brandDetails: { ...s.brandDetails, ...patch } })),

      setColor: (key, hex) => {
        if (!isValidHex(hex)) return;
        set((s) => ({ themeSettings: { ...s.themeSettings, [key]: normalizeHex(hex), presetStyle: null } }));
      },

      applyPreset: (id) => {
        if (findPreset(id)) set({ themeSettings: themeFor(id) });
      },

      setFontFamily: (fontFamily) => set((s) => ({ themeSettings: { ...s.themeSettings, fontFamily } })),
      setLayoutTemplate: (layoutTemplate) => set({ layoutTemplate }),
      setCheckoutMode: (checkoutMode) => set({ checkoutMode }),
      updateConversion: (patch) => set((s) => ({ conversion: { ...s.conversion, ...patch } })),

      updateAnnouncement: (patch) => {
        if (patch.enabled) useSiteUiStore.getState().setAnnouncementDismissed(false);
        set((s) => ({ announcement: { ...s.announcement, ...patch } }));
      },

      setSection: (key, visible) => set((s) => ({ sections: { ...s.sections, [key]: visible } })),

      addItem: (categoryId) => {
        const sample = get().productsOrServices.find((i) => i.category === categoryId);
        const item: CatalogItem = {
          id: uid('item'),
          title: 'Nuevo producto',
          description: '',
          price: 0,
          currency: sample?.currency,
          priceSuffix: sample?.priceSuffix,
          category: categoryId,
          emoji: get().categories.find((c) => c.id === categoryId)?.emoji ?? '✨',
          durationMin: sample?.durationMin,
        };
        set((s) => ({ productsOrServices: [...s.productsOrServices, item] }));
        return item.id;
      },

      updateItem: (id, patch) =>
        set((s) => ({ productsOrServices: s.productsOrServices.map((i) => (i.id === id ? { ...i, ...patch } : i)) })),

      removeItem: (id) => {
        useCartStore.getState().purgeItem(id);
        set((s) => ({ productsOrServices: s.productsOrServices.filter((i) => i.id !== id) }));
      },

      addCategory: (label) => {
        const clean = label.trim();
        if (!clean) return;
        set((s) => ({ categories: [...s.categories, { id: uid('cat'), label: clean }] }));
      },

      resetDemo: () => {
        resetSiteSession();
        set(buildDemoConfig(get().demoId));
      },
    }),
    {
      name: 'vitrina-builder',
      version: 1,
      storage: safeJSONStorage,
      partialize: (state) => selectConfig(state),
      // Esquema desconocido: se arranca con la demo por defecto.
      migrate: () => buildDemoConfig() as unknown as SiteBuilderStore,
    },
  ),
);
