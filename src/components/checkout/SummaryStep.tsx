import type { ReactNode } from 'react';
import { ArrowRight, Check, FileJson } from 'lucide-react';
import { useSiteBuilderStore, selectConfig } from '@/store/useSiteBuilderStore';
import { findPreset } from '@/presets/styles';
import { findFont } from '@/presets/fonts';
import { PLANS } from '@/presets/plans';
import { findLayout } from '@/presets/layouts';
import { CATEGORIES, DEMOS, MODE_LABEL } from '@/data/demos';
import { formatPrice, siteUrl, slugify } from '@/lib/format';
import { buildExport, downloadJson } from '@/lib/leads';
import type { PlanId } from '@/types';
import { RadioCardGroup } from '@/components/panel/RadioCardGroup';

const CHECKOUT_LABEL = { whatsapp_only: 'Solo WhatsApp', payment_link: 'Link de pago', hybrid: 'Híbrido (pago + WhatsApp)' } as const;

interface Props {
  plan: PlanId;
  onPlanChange: (plan: PlanId) => void;
  onContinue: () => void;
}

export function SummaryStep({ plan, onPlanChange, onContinue }: Props) {
  const c = useSiteBuilderStore((s) => s);
  const demo = DEMOS[c.demoId];
  const t = c.themeSettings;
  const variants = c.productsOrServices.filter((i) => i.variants?.length).length;

  const rows: [string, ReactNode][] = [
    ['Rubro', `${CATEGORIES[c.businessCategory].name} · ${demo.name}`],
    ['Plantilla', findLayout(c.layoutTemplate).name],
    [
      'Estilo',
      <span key="p" className="inline-flex items-center gap-2">
        <span aria-hidden="true" className="flex -space-x-1">
          {[t.backgroundColor, t.primaryColor, t.secondaryColor, t.accentColor].map((col, i) => (
            <span key={i} className="size-3.5 rounded-full ring-2 ring-ui-solid" style={{ background: col }} />
          ))}
        </span>
        {findPreset(t.presetStyle)?.name ?? 'Personalizado'} · {findFont(t.fontFamily).family}
      </span>,
    ],
    ['Catálogo', `${c.productsOrServices.length} ítems${variants ? ` · ${variants} con variantes` : ''}`],
    ['Conversión', demo.mode === 'inquiry' ? 'Consultas por WhatsApp' : `${MODE_LABEL[demo.mode]} · ${CHECKOUT_LABEL[c.checkoutMode]}`],
    ['Logo', c.brandDetails.logoUrl ? 'Cargado' : 'Sin logo'],
    ['Dirección web', siteUrl(c.brandDetails.name).replace('https://', '')],
  ];

  return (
    <div className="space-y-6">
      <section aria-labelledby="summary-title">
        <div className="flex items-center gap-3">
          {c.brandDetails.logoUrl && <img src={c.brandDetails.logoUrl} alt="" className="size-10 rounded-md object-contain" />}
          <h3 id="summary-title" className="text-xl font-semibold tracking-tight">{c.brandDetails.name}</h3>
        </div>
        <dl className="mt-4 divide-y divide-ui-border border-y border-ui-border text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-2.5">
              <dt className="text-ui-muted">{label}</dt>
              <dd className="text-right">{value}</dd>
            </div>
          ))}
        </dl>
        <button
          type="button"
          onClick={() => downloadJson(`vitrina-${slugify(c.brandDetails.name)}.json`, buildExport(selectConfig(c)))}
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-ui-muted underline-offset-4 hover:text-ui-fg hover:underline"
        >
          <FileJson className="size-3.5" aria-hidden="true" />
          Exportar configuración (JSON)
        </button>
      </section>

      <RadioCardGroup
        legend="Plan"
        value={plan}
        onChange={onPlanChange}
        columns="sm:grid-cols-2"
        options={PLANS.map((p) => ({
          value: p.id,
          content: (
            <span className="block w-full p-1">
              <span className="flex items-center justify-between">
                <span className="text-sm font-semibold">{p.name}</span>
                {p.highlighted && <span className="neon-text text-[10px] font-semibold uppercase tracking-wider">Recomendado</span>}
              </span>
              <span className="mt-1 block text-2xl font-semibold tracking-tight">
                {formatPrice(p.price)}
                <span className="text-xs font-normal text-ui-muted">{p.period}</span>
              </span>
              <span className="mt-3 block space-y-1.5">
                {p.features.map((f) => (
                  <span key={f} className="flex items-start gap-1.5 text-xs text-ui-muted">
                    <Check className="mt-0.5 size-3 shrink-0 text-ui-accent" aria-hidden="true" />
                    {f}
                  </span>
                ))}
              </span>
            </span>
          ),
        }))}
      />
      {plan === 'basico' && c.checkoutMode !== 'whatsapp_only' && demo.mode !== 'inquiry' && (
        <p className="text-xs text-ui-muted">Nota: los cobros con link de pago están incluidos en el plan Pro.</p>
      )}

      <button type="button" onClick={onContinue} className="ui-btn ui-btn-neon h-10 w-full">
        Continuar
        <ArrowRight className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
