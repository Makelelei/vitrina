import { useDeferredValue, useMemo } from 'react';
import { useSiteBuilderStore } from '@/store/useSiteBuilderStore';
import { ALL, useSiteUiStore } from '@/store/useSiteUiStore';
import { normalizeText } from '@/lib/format';
import { collectFacets, hasOption } from '@/lib/variants';

/** Filtros del catálogo compartidos entre módulos (antojos, buscador, talles…). */
export function useCatalogFilter() {
  const items = useSiteBuilderStore((s) => s.productsOrServices);
  const categories = useSiteBuilderStore((s) => s.categories);
  const filters = useSiteUiStore((s) => s.filters);
  const setFilter = useSiteUiStore((s) => s.setFilter);
  const clearFilters = useSiteUiStore((s) => s.clearFilters);
  const query = useDeferredValue(filters.query);

  const filtered = useMemo(() => {
    const q = normalizeText(query.trim());
    return items.filter((item) => {
      if (filters.category !== ALL && item.category !== filters.category) return false;
      if (filters.tag && !item.tags?.includes(filters.tag)) return false;
      if (filters.size && !hasOption(item, 'size', filters.size)) return false;
      if (filters.color && !hasOption(item, 'color', filters.color)) return false;
      if (!q) return true;
      return normalizeText([item.title, item.description, ...(item.details ?? []), ...(item.tags ?? [])].join(' ')).includes(q);
    });
  }, [items, filters.category, filters.tag, filters.size, filters.color, query]);

  const groups = useMemo(
    () =>
      categories
        .map((c) => ({ category: c, items: filtered.filter((i) => i.category === c.id) }))
        .filter((g) => g.items.length > 0),
    [categories, filtered],
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = { [ALL]: items.length };
    for (const item of items) map[item.category] = (map[item.category] ?? 0) + 1;
    return map;
  }, [items]);

  const facets = useMemo(() => collectFacets(items), [items]);
  const active = filters.category !== ALL || !!filters.tag || !!filters.size || !!filters.color || !!filters.query;

  return { filters, setFilter, clearFilters, filtered, groups, counts, facets, categories, active };
}
