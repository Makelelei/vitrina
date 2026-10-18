import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DeviceMode, StudioTheme } from '@/types';
import { safeJSONStorage } from './safeStorage';

/** Altura del editor en móvil: compacta (se ve la vista previa) o expandida. */
export type MobilePanelSize = 'compact' | 'full';

interface UiStore {
  theme: StudioTheme;
  onboarded: boolean;
  /** Ya armó un sitio alguna vez (permite volver desde la bienvenida). */
  hasStarted: boolean;
  deviceMode: DeviceMode;
  sidebarCollapsed: boolean;
  checkoutOpen: boolean;
  mobilePanelOpen: boolean;
  mobilePanelSize: MobilePanelSize;
  setTheme: (theme: StudioTheme) => void;
  setOnboarded: (value: boolean) => void;
  setDeviceMode: (mode: DeviceMode) => void;
  toggleSidebar: () => void;
  setCheckoutOpen: (open: boolean) => void;
  setMobilePanelOpen: (open: boolean) => void;
  setMobilePanelSize: (size: MobilePanelSize) => void;
}

/** El script de index.html fija data-theme antes del primer pintado. */
const initialTheme = (): StudioTheme =>
  typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      theme: initialTheme(),
      onboarded: false,
      hasStarted: false,
      deviceMode: 'mobile',
      sidebarCollapsed: false,
      checkoutOpen: false,
      mobilePanelOpen: false,
      mobilePanelSize: 'compact',
      setTheme: (theme) => set({ theme }),
      setOnboarded: (onboarded) => set((s) => ({ onboarded, hasStarted: s.hasStarted || onboarded })),
      setDeviceMode: (deviceMode) => set({ deviceMode }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setCheckoutOpen: (checkoutOpen) => set({ checkoutOpen }),
      // Al abrir, siempre en modo compacto: primero se ve el cambio, después el detalle.
      setMobilePanelOpen: (mobilePanelOpen) => set(mobilePanelOpen ? { mobilePanelOpen, mobilePanelSize: 'compact' } : { mobilePanelOpen }),
      setMobilePanelSize: (mobilePanelSize) => set({ mobilePanelSize }),
    }),
    {
      name: 'vitrina-ui',
      version: 1,
      storage: safeJSONStorage,
      partialize: ({ theme, onboarded, hasStarted, deviceMode, sidebarCollapsed }) => ({ theme, onboarded, hasStarted, deviceMode, sidebarCollapsed }),
    },
  ),
);
