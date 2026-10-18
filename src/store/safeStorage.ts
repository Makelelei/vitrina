import { createJSONStorage } from 'zustand/middleware';

export const STORAGE_FULL_EVENT = 'vitrina:storage-full';
export const STORAGE_REPAIRED_EVENT = 'vitrina:storage-repaired';

/**
 * La hidratación ocurre antes de que React monte los avisos, así que la
 * reparación queda pendiente hasta que alguien la consuma.
 */
let pendingRepair: string[] | null = null;

export function reportRepaired(fields: string[]) {
  pendingRepair = fields;
  console.warn('[vitrina] Configuración guardada inválida; se restauraron:', fields.join(', '));
  window.dispatchEvent(new CustomEvent(STORAGE_REPAIRED_EVENT));
}

export function takePendingRepair(): string[] | null {
  const fields = pendingRepair;
  pendingRepair = null;
  return fields;
}

/**
 * localStorage que nunca rompe la app: si la cuota se llena (p. ej. por
 * imágenes subidas) avisa con un evento en lugar de lanzar una excepción.
 */
export const safeJSONStorage = createJSONStorage(() => ({
  getItem: (name: string) => {
    try {
      const value = localStorage.getItem(name);
      if (value !== null) JSON.parse(value);
      return value;
    } catch (error) {
      // JSON ilegible: se descarta para arrancar limpio en vez de fallar en cada carga.
      if (error instanceof SyntaxError) {
        try {
          localStorage.removeItem(name);
        } catch {
          /* sin acceso al almacenamiento */
        }
        reportRepaired(['todo (JSON ilegible)']);
      }
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
