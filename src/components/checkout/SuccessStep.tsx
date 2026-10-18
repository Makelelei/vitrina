import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Check, FileJson } from 'lucide-react';
import { buildExport, downloadJson, type LeadRecord } from '@/lib/leads';
import { siteUrl, slugify } from '@/lib/format';
import { QrCard } from '@/components/panel/QrCard';

export function SuccessStep({ lead, onClose }: { lead: LeadRecord; onClose: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Mueve el foco al encabezado para que los lectores de pantalla anuncien el resultado.
  useEffect(() => headingRef.current?.focus(), []);

  const exportAll = () =>
    downloadJson(
      `vitrina-${slugify(lead.config.brandDetails.name)}.json`,
      buildExport(lead.config, { lead: { id: lead.id, createdAt: lead.createdAt, plan: lead.plan, contact: lead.contact, subscription: lead.subscription } }),
    );

  return (
    <div className="py-1">
      <motion.span
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-ui-accent to-ui-accent-2 text-ui-on-strong"
      >
        <Check className="size-5 text-white" aria-hidden="true" />
      </motion.span>
      <h3 ref={headingRef} tabIndex={-1} className="mt-5 text-xl font-semibold tracking-tight focus:outline-none">
        Listo, {lead.contact.name.split(' ')[0]}. Tu sitio está en camino.
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ui-muted">
        Suscripción aprobada con {lead.subscription?.provider}. Te escribimos a <span className="text-ui-fg">{lead.contact.email}</span> cuando{' '}
        <span className="text-ui-fg">{siteUrl(lead.config.brandDetails.name).replace('https://', '')}</span> esté online.
      </p>
      <p className="mt-3 inline-block rounded-md bg-ui-subtle px-2.5 py-1 font-mono text-xs">Solicitud {lead.id}</p>

      <div className="mt-6 rounded-xl border border-ui-border p-4">
        <p className="mb-3 text-xs font-semibold">Tu código QR</p>
        <QrCard />
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={exportAll} className="ui-btn ui-btn-ghost h-10 flex-1">
          <FileJson className="size-4" aria-hidden="true" />
          Exportar configuración (JSON)
        </button>
        <button type="button" onClick={onClose} className="ui-btn ui-btn-primary h-10 flex-1">
          Seguir editando
        </button>
      </div>
    </div>
  );
}
