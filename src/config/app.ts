/** Configuración del negocio Vitrina. Se define en `.env` (ver `.env.example`). */

const clean = (value: string | undefined) => {
  const v = value?.trim();
  return v ? v : null;
};

export const APP_CONFIG = {
  /** Sin endpoint, las solicitudes se guardan solo en el navegador (demo). */
  leadEndpoint: clean(import.meta.env.VITE_LEAD_ENDPOINT),
  ownerWhatsapp: clean(import.meta.env.VITE_OWNER_WHATSAPP)?.replace(/\D/g, '') ?? null,
  /** Los sitios de clientes se publican como `negocio.<sitesDomain>`. */
  sitesDomain: clean(import.meta.env.VITE_SITES_DOMAIN) ?? 'vitrina.app',
  legal: {
    terms: './terminos.html',
    privacy: './privacidad.html',
  },
} as const;

/** El build puede correr como estudio (editor) o como sitio publicado de un cliente. */
export type AppMode = 'studio' | 'published';

let appMode: AppMode = 'studio';

export const setAppMode = (mode: AppMode) => {
  appMode = mode;
};

export const getAppMode = (): AppMode => appMode;
