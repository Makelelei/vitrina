import type { CatalogItem, Currency } from '@/types';

const formatters: Record<Currency, Intl.NumberFormat> = {
  ARS: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }),
  USD: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', currencyDisplay: 'code', maximumFractionDigits: 0 }),
};

export const formatPrice = (value: number, currency: Currency = 'ARS') => formatters[currency].format(value);

/** Precio para mostrar, contemplando "Consultar", "Desde" y sufijos como "/mes". */
export function formatItemPrice(item: Pick<CatalogItem, 'price' | 'currency' | 'priceSuffix' | 'variants'>) {
  if (item.price === null) return 'Consultar';
  const hasPriceVariants = item.variants?.some((g) => g.required && g.options.some((o) => o.priceDelta));
  const minDelta = hasPriceVariants
    ? item.variants!.filter((g) => g.required).reduce((sum, g) => sum + Math.min(0, ...g.options.map((o) => o.priceDelta ?? 0)), 0)
    : 0;
  return `${hasPriceVariants ? 'Desde ' : ''}${formatPrice(item.price + minDelta, item.currency)}${item.priceSuffix ?? ''}`;
}

/** Minúsculas y sin tildes, para búsquedas tolerantes. */
export const normalizeText = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const slugify = (value: string) =>
  normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'mi-negocio';

export const siteUrl = (brandName: string) => `https://${slugify(brandName)}.vitrina.app`;

export const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
