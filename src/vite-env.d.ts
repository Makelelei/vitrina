/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL del endpoint PHP que recibe las solicitudes (vacío = modo demo local). */
  readonly VITE_LEAD_ENDPOINT?: string;
  /** WhatsApp de ventas de Vitrina, con código de país (ej: 5491122334455). */
  readonly VITE_OWNER_WHATSAPP?: string;
  /** Dominio donde se publican los sitios de clientes como subdominios (ej: vitrinastudio.online). */
  readonly VITE_SITES_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
