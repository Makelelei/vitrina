import { useMemo } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useSiteBuilderStore } from '@/store/useSiteBuilderStore';
import { selectionLabel, unitPrice } from '@/lib/variants';
import type { CartLine, CatalogItem } from '@/types';

export interface ResolvedLine extends CartLine {
  item: CatalogItem;
  unitPrice: number;
  lineTotal: number;
  variantLabel: string;
}

/** Une las líneas del carrito con el catálogo activo y calcula totales. */
export function useCart() {
  const lines = useCartStore((s) => s.lines);
  const items = useSiteBuilderStore((s) => s.productsOrServices);

  return useMemo(() => {
    const resolved: ResolvedLine[] = lines.flatMap((line) => {
      const item = items.find((i) => i.id === line.itemId);
      if (!item) return [];
      const price = unitPrice(item, line.selection);
      return [{ ...line, item, unitPrice: price, lineTotal: price * line.quantity, variantLabel: selectionLabel(item, line.selection) }];
    });
    return {
      lines: resolved,
      subtotal: resolved.reduce((sum, l) => sum + l.lineTotal, 0),
      count: resolved.reduce((sum, l) => sum + l.quantity, 0),
    };
  }, [lines, items]);
}

/** Unidades de un ítem en el carrito (todas sus variantes). */
export function useItemQuantity(itemId: string) {
  return useCartStore((s) => s.lines.reduce((sum, l) => (l.itemId === itemId ? sum + l.quantity : sum), 0));
}
