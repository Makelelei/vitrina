import { useState } from 'react';
import { ArrowLeft, Loader2, Lock } from 'lucide-react';
import { useSiteBuilderStore, selectConfig } from '@/store/useSiteBuilderStore';
import { PLANS } from '@/presets/plans';
import { formatPrice } from '@/lib/format';
import { simulatePayment, submitLead, type LeadContact, type LeadRecord } from '@/lib/leads';
import type { PaymentProvider, PlanId } from '@/types';
import { RadioCardGroup } from '@/components/panel/RadioCardGroup';

const PROVIDERS: { id: PaymentProvider; label: string; detail: string; color: string }[] = [
  { id: 'mercadopago', label: 'Mercado Pago', detail: 'Tarjeta, débito o dinero en cuenta', color: '#009ee3' },
  { id: 'stripe', label: 'Stripe', detail: 'Tarjeta internacional', color: '#635bff' },
];

interface Props {
  plan: PlanId;
  contact: LeadContact;
  onBack: () => void;
  onSuccess: (record: LeadRecord) => void;
}

/** Simulación de suscripción: elige procesador, "cobra" y registra el lead. */
export function SubscriptionStep({ plan, contact, onBack, onSuccess }: Props) {
  const [provider, setProvider] = useState<PaymentProvider>('mercadopago');
  const [status, setStatus] = useState<'idle' | 'processing' | 'error'>('idle');
  const selected = PLANS.find((p) => p.id === plan)!;

  const subscribe = async () => {
    setStatus('processing');
    try {
      const { reference } = await simulatePayment();
      const record = await submitLead({
        plan,
        contact,
        config: selectConfig(useSiteBuilderStore.getState()),
        subscription: { provider: PROVIDERS.find((p) => p.id === provider)!.label, reference, status: 'approved' },
      });
      onSuccess(record);
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="space-y-5" aria-busy={status === 'processing'}>
      <dl className="divide-y divide-ui-border rounded-lg border border-ui-border text-sm">
        <div className="flex justify-between px-4 py-3">
          <dt className="text-ui-muted">Plan {selected.name}</dt>
          <dd>{formatPrice(selected.price)}{selected.period}</dd>
        </div>
        <div className="flex justify-between px-4 py-3">
          <dt className="text-ui-muted">Primer mes</dt>
          <dd className="text-ui-success">Bonificado</dd>
        </div>
        <div className="flex justify-between px-4 py-3 font-semibold">
          <dt>Hoy pagás</dt>
          <dd>{formatPrice(0)}</dd>
        </div>
      </dl>

      <RadioCardGroup
        legend="Medio de pago para la suscripción"
        value={provider}
        onChange={setProvider}
        columns="sm:grid-cols-2"
        options={PROVIDERS.map((p) => ({
          value: p.id,
          content: (
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-3 rounded-full" style={{ background: p.color }} />
              <span>
                <span className="block text-sm font-medium">{p.label}</span>
                <span className="block text-xs text-ui-muted">{p.detail}</span>
              </span>
            </span>
          ),
        }))}
      />

      {status === 'error' && (
        <p role="alert" className="rounded-md border border-ui-danger/40 px-3 py-2 text-sm text-ui-danger">
          No pudimos procesar la suscripción. Probá de nuevo.
        </p>
      )}

      <p className="text-xs text-ui-muted">
        Simulación: no se realiza ningún cobro. En producción, este paso redirige al checkout de {PROVIDERS.find((p) => p.id === provider)!.label}.
      </p>

      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        <button type="button" onClick={onBack} disabled={status === 'processing'} className="ui-btn ui-btn-ghost h-10">
          <ArrowLeft className="size-4" aria-hidden="true" /> Volver
        </button>
        <button type="button" onClick={subscribe} disabled={status === 'processing'} className="ui-btn ui-btn-neon h-10 flex-1">
          {status === 'processing' ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Lock className="size-4" aria-hidden="true" />}
          {status === 'processing' ? 'Procesando…' : 'Confirmar suscripción'}
        </button>
      </div>
    </div>
  );
}
