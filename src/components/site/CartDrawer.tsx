import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useCartStore } from '@/store/useCartStore';
import { useSiteBuilderStore } from '@/store/useSiteBuilderStore';
import { useCart } from '@/hooks/useCart';
import { useDemo } from '@/hooks/useDemo';
import { formatPrice } from '@/lib/format';
import { buildOrderMessage } from '@/lib/whatsapp';
import { ItemImage } from './ItemImage';
import { FieldInput, readableValue, siteInputClass } from './FieldInput';
import { SiteSheet } from './SiteSheet';
import { CheckoutActions } from './CheckoutActions';

/** Botón flotante con el resumen del pedido. */
export function CartFab() {
  const { count, subtotal } = useCart();
  const setOpen = useCartStore((s) => s.setOpen);
  const announcement = useCartStore((s) => s.announcement);
  const demo = useDemo();

  return (
    <>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement ? `${announcement}. Total: ${formatPrice(subtotal)}` : ''}
      </p>
      <AnimatePresence>
        {count > 0 && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-label={`Ver ${demo.copy.cartTitle.toLowerCase()}: ${count} ${count === 1 ? 'producto' : 'productos'}, ${formatPrice(subtotal)}`}
            className="absolute bottom-4 left-4 right-4 z-20 flex h-12 items-center justify-between gap-3 rounded-full bg-site-fg pl-5 pr-2 text-sm text-site-bg shadow-[0_10px_30px_-8px_rgb(0_0_0/0.5)] @2xl:left-auto @2xl:w-72"
          >
            <span className="flex items-center gap-2 font-medium">
              <ShoppingBag className="size-4" aria-hidden="true" />
              {demo.copy.cartTitle}
            </span>
            <span className="flex items-center gap-3" aria-hidden="true">
              <span className="tabular-nums">{formatPrice(subtotal)}</span>
              <motion.span key={count} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="grid size-8 place-items-center rounded-full bg-site-bg text-xs font-semibold text-site-fg">
                {count}
              </motion.span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const setOpen = useCartStore((s) => s.setOpen);
  const { increment, decrement, removeLine, clear } = useCartStore(
    useShallow((s) => ({ increment: s.increment, decrement: s.decrement, removeLine: s.removeLine, clear: s.clear })),
  );
  const { lines, subtotal } = useCart();
  const demo = useDemo();
  const { brandName, zones, deliveryEnabled } = useSiteBuilderStore(
    useShallow((s) => ({ brandName: s.brandDetails.name, zones: s.business.deliveryZones, deliveryEnabled: s.conversion.deliveryEnabled })),
  );

  const canDeliver = deliveryEnabled && zones.length > 0;
  const [customerName, setCustomerName] = useState('');
  const [wantsDelivery, setWantsDelivery] = useState(true);
  const [address, setAddress] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [extras, setExtras] = useState<Record<string, string>>({});
  const ids = { name: useId(), address: useId(), zone: useId() };

  const delivering = canDeliver && wantsDelivery;
  const zone = zones.find((z) => z.id === zoneId) ?? zones[0];
  const shipping = delivering ? (zone?.cost ?? 0) : 0;
  const total = subtotal + shipping;
  const fields = demo.orderFields ?? [];

  const problems: string[] = [];
  if (lines.length === 0) problems.push('Agregá al menos un producto.');
  if (delivering && !address.trim()) problems.push('Indicá la dirección de entrega.');
  for (const f of fields) if (f.required && !extras[f.id]?.trim()) problems.push(`Completá “${f.label}”.`);

  const buildMessage = (payment?: { provider: string; reference: string }) =>
    buildOrderMessage({
      brandName,
      intro: demo.copy.messageIntro,
      lines: lines.map((l) => ({ title: l.item.title, variant: l.variantLabel, quantity: l.quantity, unitPrice: l.unitPrice, currency: l.item.currency })),
      shipping: delivering ? { label: demo.copy.deliveryLabel, zone: zone?.name, cost: zone?.cost ?? 0 } : null,
      fields: [
        { label: 'Nombre', value: customerName },
        { label: 'Entrega', value: canDeliver ? (delivering ? demo.copy.deliveryLabel : demo.copy.pickupLabel) : '' },
        { label: 'Dirección', value: delivering ? address : '' },
        ...fields.map((f) => ({ label: f.label, value: readableValue(f, extras[f.id] ?? '') })),
      ],
      payment,
    });

  const footer =
    lines.length > 0 ? (
      <>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between text-site-muted">
            <dt>Subtotal</dt>
            <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
          </div>
          {delivering && (
            <div className="flex justify-between text-site-muted">
              <dt>{demo.copy.deliveryLabel}</dt>
              <dd className="tabular-nums">{shipping === 0 ? 'Sin cargo' : formatPrice(shipping)}</dd>
            </div>
          )}
          <div className="flex justify-between pt-1 text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatPrice(total)}</dd>
          </div>
        </dl>
        <CheckoutActions
          problems={problems}
          buildMessage={buildMessage}
          amount={total}
          description={`Pedido en ${brandName}`}
          kind="order"
          waLabel="Enviar pedido por WhatsApp"
          payLabel="Pagar"
          onBeforePay={() => setOpen(false)}
          onPaid={clear}
        />
      </>
    ) : undefined;

  return (
    <SiteSheet open={isOpen} onOpenChange={setOpen} title={demo.copy.cartTitle} footer={footer}>
      {lines.length === 0 ? (
        <p className="py-12 text-center text-sm text-site-muted">{demo.copy.emptyCart}</p>
      ) : (
        <div className="space-y-8">
          <ul className="divide-y divide-site-border" aria-label="Productos">
            {lines.map((l) => (
              <li key={l.key} className="flex gap-3 py-3 first:pt-0">
                <ItemImage item={l.item} className="size-14 shrink-0 rounded-md" emojiClassName="text-2xl" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{l.item.title}</p>
                    <p className="shrink-0 text-sm tabular-nums">{formatPrice(l.lineTotal)}</p>
                  </div>
                  {l.variantLabel && <p className="text-xs text-site-muted">{l.variantLabel}</p>}
                  <div className="mt-2 flex items-center justify-between">
                    <div role="group" aria-label={`Cantidad de ${l.item.title}`} className="inline-flex h-7 items-center rounded-full border border-site-border">
                      <button type="button" onClick={() => decrement(l.key, l.item.title)} aria-label={`Quitar una unidad de ${l.item.title}`} className="grid h-full w-7 place-items-center rounded-l-full hover:bg-site-surface-2">
                        <Minus className="size-3" aria-hidden="true" />
                      </button>
                      <span className="min-w-5 text-center text-xs tabular-nums">{l.quantity}</span>
                      <button type="button" onClick={() => increment(l.key)} aria-label={`Agregar otra unidad de ${l.item.title}`} className="grid h-full w-7 place-items-center rounded-r-full hover:bg-site-surface-2">
                        <Plus className="size-3" aria-hidden="true" />
                      </button>
                    </div>
                    <button type="button" onClick={() => removeLine(l.key, l.item.title)} aria-label={`Eliminar ${l.item.title}`} className="grid size-7 place-items-center rounded-full text-site-muted hover:bg-site-surface-2 hover:text-site-fg">
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()} aria-label="Datos del pedido">
            <div>
              <label htmlFor={ids.name} className="mb-1.5 block text-sm">
                Tu nombre <span className="text-site-muted">(opcional)</span>
              </label>
              <input id={ids.name} className={siteInputClass} value={customerName} onChange={(e) => setCustomerName(e.target.value)} autoComplete="name" />
            </div>

            {canDeliver && (
              <fieldset>
                <legend className="mb-1.5 text-sm">Entrega</legend>
                <div className="grid grid-cols-2 gap-1 rounded-full border border-site-border p-1">
                  {[
                    { value: true, label: demo.copy.deliveryLabel },
                    { value: false, label: demo.copy.pickupLabel },
                  ].map((opt) => (
                    <label
                      key={String(opt.value)}
                      className={`flex cursor-pointer items-center justify-center truncate rounded-full px-3 py-2 text-xs font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-site-focus ${
                        wantsDelivery === opt.value ? 'bg-site-fg text-site-bg' : 'text-site-muted hover:text-site-fg'
                      }`}
                    >
                      <input type="radio" name="delivery-mode" checked={wantsDelivery === opt.value} onChange={() => setWantsDelivery(opt.value)} className="sr-only" />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {delivering && (
              <>
                <div>
                  <label htmlFor={ids.address} className="mb-1.5 block text-sm">Dirección</label>
                  <input id={ids.address} className={siteInputClass} value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" placeholder="Calle, número, piso" required />
                </div>
                <div>
                  <label htmlFor={ids.zone} className="mb-1.5 block text-sm">Zona</label>
                  <select id={ids.zone} className={siteInputClass} value={zone?.id} onChange={(e) => setZoneId(e.target.value)}>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} — {z.cost === 0 ? 'sin cargo' : formatPrice(z.cost)} · {z.eta}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {fields.map((f) => (
              <FieldInput key={f.id} field={f} value={extras[f.id] ?? ''} onChange={(v) => setExtras((e) => ({ ...e, [f.id]: v }))} />
            ))}
          </form>

          <details className="text-sm">
            <summary className="text-site-muted">Ver el mensaje que se enviará</summary>
            <pre className="mt-2 whitespace-pre-wrap rounded-md bg-site-surface p-3 font-sans text-xs text-site-muted">{buildMessage()}</pre>
          </details>
        </div>
      )}
    </SiteSheet>
  );
}
