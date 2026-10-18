import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { useSiteBuilderStore } from '@/store/useSiteBuilderStore';
import { useSiteUiStore } from '@/store/useSiteUiStore';
import { useCartStore } from '@/store/useCartStore';
import { useConversionMode, useDemo } from '@/hooks/useDemo';
import { defaultSelection, missingGroups, unitPrice } from '@/lib/variants';
import { formatPrice } from '@/lib/format';
import type { VariantSelection } from '@/types';
import { ItemImage } from './ItemImage';
import { PriceTag, PromoBadge } from './PriceTag';
import { VariantPicker } from './VariantPicker';
import { SiteSheet } from './SiteSheet';

/** Vista rápida del producto: fotos, variantes, cantidad y agregar al pedido. */
export function QuickView() {
  const itemId = useSiteUiStore((s) => s.quickViewId);
  const setQuickView = useSiteUiStore((s) => s.setQuickView);
  const setRequestItem = useSiteUiStore((s) => s.setRequestItem);
  const item = useSiteBuilderStore((s) => s.productsOrServices.find((i) => i.id === itemId));
  const add = useCartStore((s) => s.add);
  const demo = useDemo();
  const mode = useConversionMode();

  const [selection, setSelection] = useState<VariantSelection>({});
  const [quantity, setQuantity] = useState(1);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (item) setSelection(defaultSelection(item));
    setQuantity(1);
    setTried(false);
    // Solo al abrir otro ítem: editar el catálogo no reinicia la elección.
  }, [itemId]);

  if (!item) return null;

  const missing = missingGroups(item, selection);
  const price = unitPrice(item, selection);

  const submit = () => {
    if (missing.length) {
      setTried(true);
      return;
    }
    add(item.id, item.title, selection, quantity);
    setQuickView(null);
  };

  const footer =
    mode === 'order' ? (
      <div className="flex items-center gap-3">
        <div role="group" aria-label="Cantidad" className="inline-flex h-12 items-center rounded-full border border-site-border">
          <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Restar uno" className="grid h-full w-11 place-items-center rounded-l-full hover:bg-site-surface-2">
            <Minus className="size-4" aria-hidden="true" />
          </button>
          <span className="min-w-6 text-center tabular-nums" aria-live="polite">{quantity}</span>
          <button type="button" onClick={() => setQuantity((q) => q + 1)} aria-label="Sumar uno" className="grid h-full w-11 place-items-center rounded-r-full hover:bg-site-surface-2">
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </div>
        <button type="button" onClick={submit} className="flex h-12 flex-1 items-center justify-center rounded-full bg-site-fg text-sm font-medium text-site-bg hover:opacity-90">
          {demo.copy.itemCta} · {formatPrice(price * quantity, item.currency)}
        </button>
      </div>
    ) : (
      <button type="button" onClick={() => setRequestItem(item.id)} className="flex h-12 w-full items-center justify-center rounded-full bg-site-fg text-sm font-medium text-site-bg hover:opacity-90">
        {mode === 'booking' ? demo.copy.itemCta : 'Consultar'}
      </button>
    );

  return (
    <SiteSheet open onOpenChange={(open) => !open && setQuickView(null)} title={item.title} description="Vista rápida" footer={footer}>
      <div className="space-y-5">
        <ItemImage item={item} className="aspect-[4/3] w-full rounded-lg" emojiClassName="text-8xl" />
        <div>
          <div className="flex items-center gap-2">
            <PriceTag item={item} className="text-lg" />
            <PromoBadge item={item} />
          </div>
          {item.details?.length ? <p className="mt-1 text-xs text-site-muted">{item.details.join(' · ')}</p> : null}
          {item.description && <p className="mt-3 text-sm leading-relaxed text-site-muted">{item.description}</p>}
        </div>
        {item.variants?.length ? <VariantPicker item={item} selection={selection} onChange={setSelection} showErrors={tried} /> : null}
      </div>
    </SiteSheet>
  );
}
