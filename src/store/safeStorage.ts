import { createJSONStorage } from 'zustand/middleware';

export const STORAGE_FULL_EVENT = 'vitrina:storage-full';

/**
 * localStorage que nunca rompe la app: si la cuota se llena (p. ej. por
 * imágenes subidas) avisa con un evento en lugar de lanzar una excepción.
 */
export const safeJSONStorage = createJSONStorage(() => ({
  getItem: (name: string) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      window.dispatchEvent(new CustomEvent(STORAGE_FULL_EVENT));
    }
  },
  removeItem: (name: string) => {
    try {
      localStorage.removeItem(name);
    } catch {
      /* sin acceso al almacenamiento */
    }
  },
}));
