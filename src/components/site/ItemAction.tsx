import { ArrowUpRight, Minus, Plus, SlidersHorizontal } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useSiteUiStore } from '@/store/useSiteUiStore';
import { useConversionMode, useDemo } from '@/hooks/useDemo';
import { useItemQuantity } from '@/hooks/useCart';
import type { CatalogItem } from '@/types';

const pill = 'inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-3 text-xs font-medium transition-opacity';

/**
 * Acción principal del ítem según el rubro:
 * agregar (o elegir variantes), reservar turno o consultar.
 */
export function ItemAction({ item }: { item: CatalogItem }) {
  const demo = useDemo();
  const mode = useConversionMode();
  const setQuickView = useSiteUiStore((s) => s.setQuickView);
  const setRequestItem = useSiteUiStore((s) => s.setRequestItem);

  if (mode === 'order') {
    if (item.variants?.length) {
      return <VariantButton item={item} label={demo.copy.itemCta} onOpen={() => setQuickView(item.id)} />;
    }
    return <QuantityControl item={item} label={demo.copy.itemCta} />;
  }

  const label = mode === 'booking' ? demo.copy.itemCta : 'Consultar';
  return (
    <button
      type="button"
      onClick={() => setRequestItem(item.id)}
      aria-label={`${label} ${item.title}`}
      aria-haspopup="dialog"
      className={`${pill} border border-site-fg hover:bg-site-fg hover:text-site-bg`}
    >
      {label}
      <ArrowUpRight className="size-3.5" aria-hidden="true" />
    </button>
  );
}

function VariantButton({ item, label, onOpen }: { item: CatalogItem; label: string; onOpen: () => void }) {
  const qty = useItemQuantity(item.id);
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-label={`${label} ${item.title}: elegir opciones${qty ? `, ${qty} en el pedido` : ''}`}
      className={`${pill} bg-site-primary text-site-on-primary hover:opacity-85`}
    >
      <SlidersHorizontal className="size-3.5" aria-hidden="true" />
      {label}
      {qty > 0 && <span className="ml-0.5 grid size-4 place-items-center rounded-full bg-site-on-primary text-[10px] text-site-primary">{qty}</span>}
    </button>
  );
}

function QuantityControl({ item, label }: { item: CatalogItem; label: string }) {
  const line = useCartStore((s) => s.lines.find((l) => l.key === item.id));
  const add = useCartStore((s) => s.add);
  const decrement = useCartStore((s) => s.decrement);

  if (!line) {
    return (
      <button type="button" onClick={() => add(item.id, item.title)} aria-label={`${label} ${item.title}`} className={`${pill} bg-site-primary text-site-on-primary hover:opacity-85`}>
        <Plus className="size-3.5" aria-hidden="true" />
        {label}
      </button>
    );
  }

  return (
    <div role="group" aria-label={`Cantidad de ${item.title}`} className="inline-flex h-8 shrink-0 items-center rounded-full border border-site-border">
      <button type="button" onClick={() => decrement(line.key, item.title)} aria-label={`Quitar una unidad de ${item.title}`} className="grid h-full w-8 place-items-center rounded-l-full hover:bg-site-surface-2">
        <Minus className="size-3.5" aria-hidden="true" />
      </button>
      <span className="min-w-5 text-center text-xs font-medium tabular-nums">
        <span className="sr-only">Cantidad: </span>
        {line.quantity}
      </span>
      <button type="button" onClick={() => add(item.id, item.title)} aria-label={`Agregar otra unidad de ${item.title}`} className="grid h-full w-8 place-items-center rounded-r-full hover:bg-site-surface-2">
        <Plus className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
