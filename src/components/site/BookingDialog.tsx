import { useEffect, useMemo, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useSiteBuilderStore } from '@/store/useSiteBuilderStore';
import { useSiteUiStore } from '@/store/useSiteUiStore';
import { useDemo } from '@/hooks/useDemo';
import { daySlots, isoDate, nextOpenDays, relativeDay } from '@/lib/schedule';
import { defaultSelection, missingGroups, selectionLabel, unitPrice } from '@/lib/variants';
import { formatPrice } from '@/lib/format';
import { buildRequestMessage } from '@/lib/whatsapp';
import type { VariantSelection } from '@/types';
import { ItemImage } from './ItemImage';
import { FieldInput, readableValue } from './FieldInput';
import { VariantPicker } from './VariantPicker';
import { SiteSheet } from './SiteSheet';
import { CheckoutActions } from './CheckoutActions';
import { Carousel } from './Carousel';

/** Simulador de reserva: día, horario libre, datos y confirmación (WhatsApp o seña online). */
export function BookingDialog() {
  const itemId = useSiteUiStore((s) => s.requestItemId);
  const setRequestItem = useSiteUiStore((s) => s.setRequestItem);
  const item = useSiteBuilderStore((s) => s.productsOrServices.find((i) => i.id === itemId));
  const { brandName, hours, depositPercent } = useSiteBuilderStore(
    useShallow((s) => ({ brandName: s.brandDetails.name, hours: s.business.hours, depositPercent: s.conversion.depositPercent })),
  );
  const demo = useDemo();
  const fields = demo.requestFields ?? [];

  const days = useMemo(() => nextOpenDays(hours, 10), [hours]);
  const [day, setDay] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [values, setValues] = useState<Record<string, string>>({});
  const [selection, setSelection] = useState<VariantSelection>({});

  useEffect(() => {
    if (!item) return;
    setSelection(defaultSelection(item));
    setDay(days[0] ? isoDate(days[0]) : '');
    setTime('');
    setValues((v): Record<string, string> => (v.name ? { name: v.name, phone: v.phone ?? '' } : {}));
    // Solo al abrir otro servicio: editar el catálogo no reinicia la reserva.
  }, [itemId]);

  if (!item) return null;

  const selectedDay = days.find((d) => isoDate(d) === day);
  const slots = selectedDay ? daySlots(hours, selectedDay, item.durationMin ?? 30) : [];
  const price = unitPrice(item, selection);
  const deposit = item.price === null ? 0 : Math.round((price * depositPercent) / 100 / 100) * 100;
  const variantText = selectionLabel(item, selection);

  const problems: string[] = [];
  if (missingGroups(item, selection).length) problems.push('Elegí las opciones del servicio.');
  if (!time) problems.push('Elegí un horario.');
  for (const f of fields) if (f.required && !values[f.id]?.trim()) problems.push(`Completá “${f.label}”.`);

  const when = selectedDay && time ? `${selectedDay.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })} · ${time} h` : '';
  const buildMessage = (payment?: { provider: string; reference: string }) =>
    buildRequestMessage(
      brandName,
      demo.copy.messageIntro,
      `${item.title}${variantText ? ` (${variantText})` : ''} — ${item.price === null ? 'a cotizar' : formatPrice(price, item.currency)}`,
      [{ label: 'Turno', value: when }, ...fields.map((f) => ({ label: f.label, value: readableValue(f, values[f.id] ?? '') }))],
      payment,
    );

  return (
    <SiteSheet
      open
      onOpenChange={(open) => !open && setRequestItem(null)}
      title={demo.copy.cartTitle}
      description={item.title}
      footer={
        <>
          {when && (
            <p className="flex items-center gap-2 text-sm">
              <CalendarClock className="size-4 text-site-primary-ink" aria-hidden="true" />
              <span className="first-letter:uppercase">{when}</span>
            </p>
          )}
          <CheckoutActions
            problems={problems}
            buildMessage={buildMessage}
            amount={deposit}
            currency={item.currency}
            description={`Seña ${depositPercent}% · ${item.title}`}
            kind="deposit"
            waLabel="Reservar por WhatsApp"
            payLabel={`Pagar seña ${depositPercent}%`}
            onBeforePay={() => setRequestItem(null)}
          />
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex gap-4">
          <ItemImage item={item} className="size-16 shrink-0 rounded-md" emojiClassName="text-3xl" />
          <div className="min-w-0">
            <p className="font-medium">{item.title}</p>
            <p className="text-xs text-site-muted">{[...(item.details ?? []), item.durationMin ? `${item.durationMin} min de agenda` : ''].filter(Boolean).join(' · ')}</p>
            <p className="mt-1 text-sm tabular-nums">{item.price === null ? 'A cotizar' : formatPrice(price, item.currency)}</p>
          </div>
        </div>

        {item.variants?.length ? <VariantPicker item={item} selection={selection} onChange={setSelection} /> : null}

        <fieldset>
          <legend className="mb-2 text-sm font-medium">Día</legend>
          {days.length === 0 ? (
            <p className="text-sm text-site-muted">No hay días disponibles.</p>
          ) : (
            <Carousel as="div" label="Días disponibles" className="-mx-5 scroll-px-5 gap-2 px-5 pb-1">
              {days.map((d) => {
                const id = isoDate(d);
                const checked = id === day;
                return (
                  <label
                    key={id}
                    className={`flex w-16 shrink-0 snap-start cursor-pointer flex-col items-center rounded-lg border py-2 text-center transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-site-focus ${
                      checked ? 'border-site-fg bg-site-fg text-site-bg' : 'border-site-border hover:border-site-fg'
                    }`}
                  >
                    <input
                      type="radio"
                      name="booking-day"
                      checked={checked}
                      onChange={() => {
                        setDay(id);
                        setTime('');
                      }}
                      aria-label={d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      className="sr-only"
                    />
                    <span className="text-[10px] uppercase tracking-wide opacity-75">{relativeDay(d).length <= 6 ? relativeDay(d) : d.toLocaleDateString('es-AR', { weekday: 'short' })}</span>
                    <span className="text-lg font-semibold tabular-nums">{d.getDate()}</span>
                  </label>
                );
              })}
            </Carousel>
          )}
        </fieldset>

        <fieldset>
          <legend className="mb-2 flex w-full justify-between text-sm">
            <span className="font-medium">Horario</span>
            <span className="text-xs text-site-muted">{slots.filter((s) => s.available).length} libres</span>
          </legend>
          {slots.length === 0 ? (
            <p className="text-sm text-site-muted">Sin horarios para este día.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map((s) => {
                const checked = s.time === time;
                return (
                  <label
                    key={s.time}
                    className={`rounded-md border py-2 text-center text-sm tabular-nums transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-site-focus ${
                      !s.available
                        ? 'cursor-not-allowed border-transparent bg-site-surface text-site-muted line-through'
                        : checked
                          ? 'cursor-pointer border-site-primary bg-site-primary text-site-on-primary'
                          : 'cursor-pointer border-site-border hover:border-site-fg'
                    }`}
                  >
                    <input type="radio" name="booking-time" disabled={!s.available} checked={checked} onChange={() => setTime(s.time)} aria-label={`${s.time}${s.available ? '' : ', ocupado'}`} className="sr-only" />
                    {s.time}
                  </label>
                );
              })}
            </div>
          )}
        </fieldset>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()} aria-label="Tus datos">
          {fields.map((f) => (
            <FieldInput key={f.id} field={f} value={values[f.id] ?? ''} onChange={(v) => setValues((s) => ({ ...s, [f.id]: v }))} />
          ))}
        </form>
      </div>
    </SiteSheet>
  );
}
