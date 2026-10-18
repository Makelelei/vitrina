import { useEffect, useId, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useSiteBuilderStore } from '@/store/useSiteBuilderStore';
import { useSiteUiStore } from '@/store/useSiteUiStore';
import { useDemo } from '@/hooks/useDemo';
import { formatItemPrice } from '@/lib/format';
import { buildRequestMessage, buildWhatsAppUrl, isValidWhatsApp } from '@/lib/whatsapp';
import { ItemImage } from './ItemImage';
import { FieldInput, readableValue } from './FieldInput';
import { SiteSheet } from './SiteSheet';

/** Consulta sobre un ítem puntual (propiedades, o servicios con reservas apagadas). */
export function InquiryDialog() {
  const itemId = useSiteUiStore((s) => s.requestItemId);
  const setRequestItem = useSiteUiStore((s) => s.setRequestItem);
  const item = useSiteBuilderStore((s) => s.productsOrServices.find((i) => i.id === itemId));
  const brandName = useSiteBuilderStore((s) => s.brandDetails.name);
  const whatsapp = useSiteBuilderStore((s) => s.brandDetails.whatsapp);
  const demo = useDemo();
  const fields = demo.requestFields ?? [{ id: 'name', label: 'Tu nombre', type: 'text' as const, required: true }];
  const [values, setValues] = useState<Record<string, string>>({});
  const problemsId = useId();

  // Conserva el nombre entre consultas; limpia lo demás al cambiar de ítem.
  useEffect(() => setValues((v): Record<string, string> => (v.name ? { name: v.name } : {})), [itemId]);

  if (!item) return null;

  const problems: string[] = [];
  if (!isValidWhatsApp(whatsapp)) problems.push('El negocio no tiene un WhatsApp válido configurado.');
  for (const f of fields) if (f.required && !values[f.id]?.trim()) problems.push(`Completá “${f.label}”.`);

  const intro = demo.mode === 'inquiry' ? demo.copy.messageIntro : 'Quería consultar por este servicio:';
  const subject = `${item.title}${item.details?.length ? ` (${item.details.join(' · ')})` : ''} — ${formatItemPrice(item)}`;
  const message = buildRequestMessage(brandName, intro, subject, fields.map((f) => ({ label: f.label, value: readableValue(f, values[f.id] ?? '') })));
  const button = 'flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-medium';

  return (
    <SiteSheet
      open
      onOpenChange={(open) => !open && setRequestItem(null)}
      title={demo.mode === 'inquiry' ? demo.copy.cartTitle : 'Consulta'}
      footer={
        <>
          {problems.length > 0 && (
            <ul id={problemsId} className="space-y-0.5 text-xs text-site-muted">
              {problems.map((p) => <li key={p}>· {p}</li>)}
            </ul>
          )}
          {problems.length === 0 ? (
            <a href={buildWhatsAppUrl(whatsapp, message)} target="_blank" rel="noopener noreferrer" className={`${button} bg-site-fg text-site-bg hover:opacity-90`}>
              <MessageCircle className="size-4" aria-hidden="true" />
              Enviar consulta por WhatsApp
              <span className="sr-only">(abre WhatsApp en una pestaña nueva)</span>
            </a>
          ) : (
            <button type="button" disabled aria-describedby={problemsId} className={`${button} cursor-not-allowed bg-site-surface-2 text-site-muted`}>
              <MessageCircle className="size-4" aria-hidden="true" />
              Enviar consulta por WhatsApp
            </button>
          )}
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex gap-4">
          <ItemImage item={item} className="size-20 shrink-0 rounded-md" emojiClassName="text-4xl" />
          <div className="min-w-0">
            <p className="font-medium">{item.title}</p>
            {item.details?.length ? <p className="text-xs text-site-muted">{item.details.join(' · ')}</p> : null}
            <p className="mt-1 text-sm tabular-nums">{formatItemPrice(item)}</p>
          </div>
        </div>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()} aria-label="Tus datos">
          {fields.map((f) => (
            <FieldInput key={f.id} field={f} value={values[f.id] ?? ''} onChange={(v) => setValues((s) => ({ ...s, [f.id]: v }))} />
          ))}
        </form>
      </div>
    </SiteSheet>
  );
}
