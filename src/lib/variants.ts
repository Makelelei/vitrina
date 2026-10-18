import type { CatalogItem, VariantSelection } from '@/types';

/** Selección inicial: primera opción de cada grupo obligatorio de elección única. */
export function defaultSelection(item: CatalogItem): VariantSelection {
  const sel: VariantSelection = {};
  for (const g of item.variants ?? []) sel[g.id] = g.required && !g.multiple && g.options[0] ? [g.options[0].id] : [];
  return sel;
}

export function unitPrice(item: CatalogItem, selection: VariantSelection): number {
  let total = item.price ?? 0;
  for (const g of item.variants ?? []) {
    for (const optId of selection[g.id] ?? []) total += g.options.find((o) => o.id === optId)?.priceDelta ?? 0;
  }
  return total;
}

/** "Doble · Cheddar extra, Bacon" */
export function selectionLabel(item: CatalogItem, selection: VariantSelection): string {
  return (item.variants ?? [])
    .map((g) => (selection[g.id] ?? []).map((id) => g.options.find((o) => o.id === id)?.label).filter(Boolean).join(', '))
    .filter(Boolean)
    .join(' · ');
}

/** Grupos obligatorios sin elegir. */
export function missingGroups(item: CatalogItem, selection: VariantSelection): string[] {
  return (item.variants ?? []).filter((g) => g.required && !(selection[g.id]?.length)).map((g) => g.name);
}

/** Clave estable: mismo ítem con la misma selección = misma línea del carrito. */
export function lineKey(itemId: string, selection: VariantSelection): string {
  const parts = Object.keys(selection)
    .sort()
    .filter((k) => selection[k].length)
    .map((k) => `${k}=${[...selection[k]].sort().join('+')}`);
  return [itemId, ...parts].join('|');
}

/** Valores únicos de talle y color del catálogo, para los filtros. */
export function collectFacets(items: CatalogItem[]) {
  const sizes = new Set<string>();
  const colors = new Map<string, string>();
  for (const item of items) {
    for (const g of item.variants ?? []) {
      if (g.kind === 'size') g.options.forEach((o) => sizes.add(o.label));
      if (g.kind === 'color') g.options.forEach((o) => colors.set(o.label, o.swatch ?? '#999'));
    }
  }
  return { sizes: [...sizes], colors: [...colors].map(([label, swatch]) => ({ label, swatch })) };
}

export const hasOption = (item: CatalogItem, kind: 'size' | 'color', label: string) =>
  (item.variants ?? []).some((g) => g.kind === kind && g.options.some((o) => o.label === label));
