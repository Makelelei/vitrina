import type { LucideIcon } from 'lucide-react';

/* ============================================================
 * Rubros, demos y plantillas
 * ============================================================ */

export type BusinessCategory = 'gastronomy' | 'fashion' | 'beauty_services' | 'retail' | 'tech_services' | 'real_estate';

/** Sitio de ejemplo precargado dentro de un rubro. */
export type DemoId =
  | 'gastro-burgers'
  | 'fashion-atelier'
  | 'beauty-studio'
  | 'retail-petshop'
  | 'retail-florist'
  | 'retail-books'
  | 'tech-repair'
  | 'realestate-agency';

export type LayoutTemplate = 'catalog-grid' | 'interactive-menu' | 'services-booking' | 'minimal-landing';

export type FontFamilyId = 'sans-modern' | 'serif-elegant' | 'mono-tech' | 'display-bold';

export type PresetStyleId =
  | 'cyberpunk-neon'
  | 'minimal-dark'
  | 'warm-pastel'
  | 'corporate-clean'
  | 'organic-green'
  | 'ember'
  | 'paper'
  | 'dusty-rose'
  | 'ocean';

/* ============================================================
 * Conversión
 * ============================================================ */

/** Cómo cobra el sitio: solo WhatsApp, link de pago o ambos. */
export type CheckoutMode = 'whatsapp_only' | 'payment_link' | 'hybrid';

export type PaymentProvider = 'mercadopago' | 'stripe';

/**
 * Cómo convierte cada demo:
 * - order: carrito con total (comida, ropa, comercio)
 * - booking: reserva de turno con día y horario (servicios)
 * - inquiry: consulta sobre un ítem puntual (propiedades)
 */
export type ConversionMode = 'order' | 'booking' | 'inquiry';

export interface ConversionSettings {
  paymentProvider: PaymentProvider;
  /** Permite reservar turnos online (si está apagado, los servicios se consultan). */
  bookingsEnabled: boolean;
  /** Ofrece envío a domicilio en el carrito. */
  deliveryEnabled: boolean;
  /** Seña que se cobra al reservar con link de pago (porcentaje). */
  depositPercent: number;
}

/* ============================================================
 * Catálogo
 * ============================================================ */

export type Currency = 'ARS' | 'USD';

export type VariantKind = 'size' | 'color' | 'extra' | 'option';

export interface VariantOption {
  id: string;
  label: string;
  /** Suma (o resta) al precio base. */
  priceDelta?: number;
  /** Muestra de color para variantes de tipo `color`. */
  swatch?: string;
}

export interface VariantGroup {
  id: string;
  name: string;
  kind: VariantKind;
  /** Se pueden elegir varias opciones (p. ej. extras). */
  multiple: boolean;
  required: boolean;
  options: VariantOption[];
}

export interface CatalogCategory {
  id: string;
  label: string;
  emoji?: string;
}

export interface CatalogItem {
  id: string;
  title: string;
  description: string;
  /** `null` = "Consultar precio". */
  price: number | null;
  /** Precio anterior tachado (promociones). */
  compareAtPrice?: number;
  currency?: Currency;
  /** Ej: "/mes" para alquileres. */
  priceSuffix?: string;
  category: string;
  /** Ilustración de respaldo cuando no hay imagen. */
  emoji: string;
  /** URL o data-URL (subida local). */
  image?: string | null;
  /** Datos cortos: "3 ambientes", "60 min", "Julio Cortázar". */
  details?: string[];
  /** Etiquetas usadas por filtros ("veggie", "picante", "promo"). */
  tags?: string[];
  featured?: boolean;
  variants?: VariantGroup[];
  /** Duración del servicio, para calcular horarios de turnos. */
  durationMin?: number;
}

/** Elección del cliente: groupId → ids de opciones. */
export type VariantSelection = Record<string, string[]>;

export interface CartLine {
  /** itemId + selección serializada: misma combinación = misma línea. */
  key: string;
  itemId: string;
  quantity: number;
  selection: VariantSelection;
}

/* ============================================================
 * Negocio y secciones
 * ============================================================ */

export interface OpeningHours {
  /** 0 = domingo … 6 = sábado (igual que Date#getDay). */
  day: number;
  label: string;
  open: string;
  close: string;
  closed?: boolean;
}

export interface DeliveryZone {
  id: string;
  name: string;
  cost: number;
  eta: string;
}

export interface BusinessInfo {
  lat: number;
  lng: number;
  hours: OpeningHours[];
  deliveryZones: DeliveryZone[];
}

export interface BrandDetails {
  name: string;
  /** data-URL de la imagen subida o URL externa. */
  logoUrl: string | null;
  tagline: string;
  about: string;
  whatsapp: string;
  address: string;
  city: string;
}

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  fontFamily: FontFamilyId;
  /** `null` cuando el usuario ajustó colores a mano. */
  presetStyle: PresetStyleId | null;
}

export interface Announcement {
  enabled: boolean;
  text: string;
}

export interface SectionVisibility {
  highlights: boolean;
  featured: boolean;
  cravings: boolean;
  lookbook: boolean;
  categoryTiles: boolean;
  about: boolean;
  testimonials: boolean;
  hours: boolean;
  delivery: boolean;
  map: boolean;
  contact: boolean;
}

export type SectionKey = keyof SectionVisibility;

export type ColorKey = 'primaryColor' | 'secondaryColor' | 'accentColor' | 'backgroundColor';

/** Configuración serializable completa del sitio (lo que se persiste y exporta). */
export interface SiteConfig {
  businessCategory: BusinessCategory;
  demoId: DemoId;
  brandDetails: BrandDetails;
  themeSettings: ThemeSettings;
  layoutTemplate: LayoutTemplate;
  categories: CatalogCategory[];
  productsOrServices: CatalogItem[];
  checkoutMode: CheckoutMode;
  conversion: ConversionSettings;
  announcement: Announcement;
  sections: SectionVisibility;
  business: BusinessInfo;
}

/* ============================================================
 * Definiciones de rubro / demo
 * ============================================================ */

export interface Highlight {
  icon: LucideIcon;
  title: string;
  text: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  detail: string;
}

/** Botón de "antojo": filtra el menú por etiqueta. */
export interface Craving {
  tag: string;
  label: string;
  emoji: string;
}

export interface RequestField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'time' | 'number' | 'tel';
  placeholder?: string;
  required?: boolean;
}

/** Vocabulario del rubro: el mismo diseño habla distinto según el negocio. */
export interface DemoCopy {
  heroKicker: string;
  heroCta: string;
  navCatalog: string;
  catalogTitle: string;
  catalogSubtitle: string;
  searchPlaceholder: string;
  itemCta: string;
  featuredTitle: string;
  aboutTitle: string;
  testimonialsTitle: string;
  deliveryLabel: string;
  pickupLabel: string;
  contactTitle: string;
  contactText: string;
  contactCta: string;
  cartTitle: string;
  emptyCart: string;
  /** Primera línea del mensaje de WhatsApp. */
  messageIntro: string;
}

export interface DemoDefinition {
  id: DemoId;
  category: BusinessCategory;
  name: string;
  examples: string;
  icon: LucideIcon;
  mode: ConversionMode;
  defaults: {
    brandName: string;
    tagline: string;
    about: string;
    announcement: string;
    preset: PresetStyleId;
    layout: LayoutTemplate;
    checkoutMode: CheckoutMode;
  };
  copy: DemoCopy;
  categories: CatalogCategory[];
  items: CatalogItem[];
  cravings?: Craving[];
  highlights: Highlight[];
  testimonials: Testimonial[];
  hours: OpeningHours[];
  deliveryZones: DeliveryZone[];
  /** Campos extra del carrito (modo order). */
  orderFields?: RequestField[];
  /** Campos de turno / consulta. */
  requestFields?: RequestField[];
  /** Secciones disponibles en este rubro. */
  supports: SectionKey[];
}

export interface CategoryMeta {
  id: BusinessCategory;
  name: string;
  description: string;
  icon: LucideIcon;
  demos: DemoId[];
}

/* ============================================================
 * Estudio
 * ============================================================ */

export type DeviceMode = 'mobile' | 'tablet' | 'desktop';
export type StudioTheme = 'light' | 'dark';

export type PlanId = 'basico' | 'pro';

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  period: string;
  features: string[];
  highlighted?: boolean;
}
