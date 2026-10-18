import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DeviceMode, StudioTheme } from '@/types';
import { safeJSONStorage } from './safeStorage';

interface UiStore {
  theme: StudioTheme;
  onboarded: boolean;
  /** Ya armó un sitio alguna vez (permite volver desde la bienvenida). */
  hasStarted: boolean;
  deviceMode: DeviceMode;
  sidebarCollapsed: boolean;
  checkoutOpen: boolean;
  mobilePanelOpen: boolean;
  setTheme: (theme: StudioTheme) => void;
  setOnboarded: (value: boolean) => void;
  setDeviceMode: (mode: DeviceMode) => void;
  toggleSidebar: () => void;
  setCheckoutOpen: (open: boolean) => void;
  setMobilePanelOpen: (open: boolean) => void;
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
      setTheme: (theme) => set({ theme }),
      setOnboarded: (onboarded) => set((s) => ({ onboarded, hasStarted: s.hasStarted || onboarded })),
      setDeviceMode: (deviceMode) => set({ deviceMode }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setCheckoutOpen: (checkoutOpen) => set({ checkoutOpen }),
      setMobilePanelOpen: (mobilePanelOpen) => set({ mobilePanelOpen }),
    }),
    {
      name: 'vitrina-ui',
      version: 1,
      storage: safeJSONStorage,
      partialize: ({ theme, onboarded, hasStarted, deviceMode, sidebarCollapsed }) => ({ theme, onboarded, hasStarted, deviceMode, sidebarCollapsed }),
    },
  ),
);
