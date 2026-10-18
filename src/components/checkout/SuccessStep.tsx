import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Check, FileJson, Info, MessageCircle } from 'lucide-react';
import { buildExport, downloadJson, type LeadRecord } from '@/lib/leads';
import { siteUrl, slugify, formatPrice } from '@/lib/format';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { APP_CONFIG } from '@/config/app';
import { PLANS } from '@/presets/plans';
import { CATEGORIES } from '@/data/demos';
import { QrCard } from '@/components/panel/QrCard';

export function SuccessStep({ lead, onClose }: { lead: LeadRecord; onClose: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const plan = PLANS.find((p) => p.id === lead.plan)!;
  const brand = lead.config.brandDetails.name;

  // Mueve el foco al encabezado para que los lectores de pantalla anuncien el resultado.
  useEffect(() => headingRef.current?.focus(), []);

  const exportAll = () =>
    downloadJson(
      `vitrina-${slugify(brand)}.json`,
      buildExport(lead.config, { lead: { id: lead.id, createdAt: lead.createdAt, plan: lead.plan, contact: lead.contact } }),
    );

  const ownerMessage = [
    `¡Hola Vitrina! Acabo de enviar mi solicitud *${lead.id}*.`,
    '',
    `Negocio: ${brand} (${CATEGORIES[lead.config.businessCategory].name})`,
    `Plan: ${plan.name} · ${formatPrice(plan.price)}${plan.period}`,
    `Nombre: ${lead.contact.name}`,
    '',
    '¿Cómo seguimos con el pago?',
  ].join('\n');

  return (
    <div className="py-1">
      <motion.span
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-ui-accent to-ui-accent-2"
      >
        <Check className="size-5 text-white" aria-hidden="true" />
      </motion.span>
      <h3 ref={headingRef} tabIndex={-1} className="mt-5 text-xl font-semibold tracking-tight focus:outline-none">
        ¡Listo, {lead.contact.name.split(' ')[0]}! Recibimos tu solicitud.
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ui-muted">
        Te escribimos al WhatsApp <span className="text-ui-fg">+{lead.contact.phone.replace(/\D/g, '')}</span> para confirmar los detalles y coordinar el pago. Tu sitio va a quedar en{' '}
        <span className="text-ui-fg">{siteUrl(brand).replace('https://', '')}</span>.
      </p>
      <p className="mt-3 inline-block rounded-md bg-ui-subtle px-2.5 py-1 font-mono text-xs">Solicitud {lead.id}</p>

      {lead.delivery === 'local' && (
        <p role="note" className="mt-4 flex items-start gap-2 rounded-lg border border-ui-border bg-ui-subtle px-3 py-2 text-xs text-ui-muted">
          <Info className="mt-0.5 size-3.5 shrink-0 text-ui-accent" aria-hidden="true" />
          Modo demostración: la solicitud quedó guardada solo en este navegador.
        </p>
      )}

      {APP_CONFIG.ownerWhatsapp && (
        <a
          href={buildWhatsAppUrl(APP_CONFIG.ownerWhatsapp, ownerMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="ui-btn ui-btn-neon mt-6 h-11 w-full"
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          Coordinar el pago por WhatsApp
          <span className="sr-only">(abre WhatsApp en una pestaña nueva)</span>
        </a>
      )}

      <div className="mt-6 rounded-xl border border-ui-border p-4">
        <p className="mb-3 text-xs font-semibold">Tu código QR</p>
        <QrCard />
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={exportAll} className="ui-btn ui-btn-ghost h-10 flex-1">
          <FileJson className="size-4" aria-hidden="true" />
          Descargar mi configuración
        </button>
        <button type="button" onClick={onClose} className="ui-btn ui-btn-primary h-10 flex-1">
          Seguir editando
        </button>
      </div>
    </div>
  );
}
