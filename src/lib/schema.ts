import type {
  Announcement,
  BrandDetails,
  BusinessCategory,
  BusinessInfo,
  CatalogCategory,
  CatalogItem,
  CheckoutMode,
  ConversionSettings,
  DemoId,
  LayoutTemplate,
  SectionVisibility,
  SiteConfig,
  ThemeSettings,
  VariantGroup,
} from '@/types';
import { CATEGORIES, DEMOS } from '@/data/demos';
import { DEFAULT_SECTIONS } from '@/data/business';
import { FONT_OPTIONS } from '@/presets/fonts';
import { LAYOUTS } from '@/presets/layouts';
import { STYLE_PRESETS } from '@/presets/styles';
import { isValidHex } from './color';

/* ---------- Primitivas ---------- */

export const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isString = (v: unknown): v is string => typeof v === 'string';
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isBoolean = (v: unknown): v is boolean => typeof v === 'boolean';
const isOneOf = <T extends string>(values: readonly T[]) => (v: unknown): v is T => isString(v) && (values as readonly string[]).includes(v);
const isArrayOf = <T>(guard: (v: unknown) => v is T) => (v: unknown): v is T[] => Array.isArray(v) && v.every(guard);
const hasStrings = (v: Record<string, unknown>, keys: string[]) => keys.every((k) => isString(v[k]));

/* ---------- Enumeraciones ---------- */

const isCategory = isOneOf(Object.keys(CATEGORIES) as BusinessCategory[]);
const isDemoId = isOneOf(Object.keys(DEMOS) as DemoId[]);
const isLayout = isOneOf(LAYOUTS.map((l) => l.id) as LayoutTemplate[]);
const isCheckoutMode = isOneOf<CheckoutMode>(['whatsapp_only', 'payment_link', 'hybrid']);
const isFont = isOneOf(FONT_OPTIONS.map((f) => f.id));
const isPreset = isOneOf(STYLE_PRESETS.map((p) => p.id));

/* ---------- Estructuras ---------- */

const isBrand = (v: unknown): v is BrandDetails =>
  isRecord(v) && hasStrings(v, ['name', 'tagline', 'about', 'whatsapp', 'address', 'city']) && (v.logoUrl === null || isString(v.logoUrl));

const isTheme = (v: unknown): v is ThemeSettings =>
  isRecord(v) &&
  (['primaryColor', 'secondaryColor', 'accentColor', 'backgroundColor'] as const).every((k) => isString(v[k]) && isValidHex(v[k])) &&
  isFont(v.fontFamily) &&
  (v.presetStyle === null || isPreset(v.presetStyle));

const isVariantGroup = (v: unknown): v is VariantGroup =>
  isRecord(v) &&
  hasStrings(v, ['id', 'name', 'kind']) &&
  isBoolean(v.multiple) &&
  isBoolean(v.required) &&
  isArrayOf((o: unknown): o is VariantGroup['options'][number] => isRecord(o) && hasStrings(o, ['id', 'label']))(v.options);

const isItem = (v: unknown): v is CatalogItem =>
  isRecord(v) &&
  hasStrings(v, ['id', 'title', 'description', 'category', 'emoji']) &&
  (v.price === null || isNumber(v.price)) &&
  (v.variants === undefined || isArrayOf(isVariantGroup)(v.variants));

const isCatalogCategory = (v: unknown): v is CatalogCategory => isRecord(v) && hasStrings(v, ['id', 'label']);

const isConversion = (v: unknown): v is ConversionSettings =>
  isRecord(v) &&
  isOneOf(['mercadopago', 'stripe'] as const)(v.paymentProvider) &&
  isBoolean(v.bookingsEnabled) &&
  isBoolean(v.deliveryEnabled) &&
  isNumber(v.depositPercent) &&
  (v.paymentLinkUrl === undefined || isString(v.paymentLinkUrl));

const isAnnouncement = (v: unknown): v is Announcement => isRecord(v) && isBoolean(v.enabled) && isString(v.text);

const isSections = (v: unknown): v is SectionVisibility => isRecord(v) && Object.keys(DEFAULT_SECTIONS).every((k) => isBoolean(v[k]));

const isBusiness = (v: unknown): v is BusinessInfo =>
  isRecord(v) &&
  isNumber(v.lat) &&
  isNumber(v.lng) &&
  isArrayOf((h: unknown): h is BusinessInfo['hours'][number] => isRecord(h) && isNumber(h.day) && hasStrings(h, ['label', 'open', 'close']))(v.hours) &&
  isArrayOf((z: unknown): z is BusinessInfo['deliveryZones'][number] => isRecord(z) && hasStrings(z, ['id', 'name', 'eta']) && isNumber(z.cost))(v.deliveryZones);

/** Guard por campo: lo que no pasa se reemplaza por el valor de respaldo. */
const FIELD_GUARDS: { [K in keyof SiteConfig]: (v: unknown) => v is SiteConfig[K] } = {
  businessCategory: isCategory,
  demoId: isDemoId,
  brandDetails: isBrand,
  themeSettings: isTheme,
  layoutTemplate: isLayout,
  categories: isArrayOf(isCatalogCategory),
  productsOrServices: isArrayOf(isItem),
  checkoutMode: isCheckoutMode,
  conversion: isConversion,
  announcement: isAnnouncement,
  sections: isSections,
  business: isBusiness,
};

export interface SanitizeResult {
  config: SiteConfig;
  /** Campos que estaban dañados y se restauraron. */
  repaired: (keyof SiteConfig)[];
}

/**
 * Valida una configuración persistida campo por campo. Conserva todo lo
 * válido y repone desde `fallback` solo lo que esté dañado o falte.
 */
export function sanitizeConfig(raw: unknown, fallback: SiteConfig): SanitizeResult {
  if (!isRecord(raw)) return { config: fallback, repaired: raw === undefined ? [] : (Object.keys(FIELD_GUARDS) as (keyof SiteConfig)[]) };
  const config = { ...fallback };
  const repaired: (keyof SiteConfig)[] = [];
  for (const key of Object.keys(FIELD_GUARDS) as (keyof SiteConfig)[]) {
    const guard = FIELD_GUARDS[key] as (v: unknown) => boolean;
    if (guard(raw[key])) (config as Record<keyof SiteConfig, unknown>)[key] = raw[key];
    else repaired.push(key);
  }
  // El rubro siempre debe corresponder a la demo cargada.
  if (DEMOS[config.demoId].category !== config.businessCategory) config.businessCategory = DEMOS[config.demoId].category;
  return { config, repaired };
}

export const readDemoId = (raw: unknown): DemoId | undefined => (isRecord(raw) && isDemoId(raw.demoId) ? raw.demoId : undefined);
