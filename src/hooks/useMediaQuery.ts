import { useSyncExternalStore } from 'react';

/** Suscripción reactiva a una media query (p. ej. para montar el panel lateral solo en escritorio). */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
