import { createContext, useContext } from 'react';

/** Nodo raíz del sitio: los overlays se montan aquí para quedar dentro del marco. */
export const SitePortalContext = createContext<HTMLElement | null>(null);

export const useSitePortal = () => useContext(SitePortalContext);

/** Desplaza el contenedor del sitio (no la página del estudio) hasta una sección. */
export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
