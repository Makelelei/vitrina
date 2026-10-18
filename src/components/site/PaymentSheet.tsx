import { useEffect, useId, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Check, Loader2, Lock, MessageCircle } from 'lucide-react';
import { useSiteBuilderStore } from '@/store/useSiteBuilderStore';
import { useSiteUiStore } from '@/store/useSiteUiStore';
import { formatPrice } from '@/lib/format';
import { simulatePayment } from '@/lib/leads';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { siteInputClass } from './FieldInput';
import { SiteSheet } from './SiteSheet';
import { PROVIDER_LABEL } from './CheckoutActions';

// Tonos de marca oscurecidos para que el texto blanco cumpla WCAG AA.
const PROVIDER_COLOR = { mercadopago: '#0a68a8', stripe: '#5046e4' } as const;

const formatCard = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
const formatExpiry = (v: string) => v.replace(/\D/g, '').slice(0, 4).replace(/(\d{2})(?=\d)/, '$1/');

/** Simulador de link de pago (Mercado Pago / Stripe). No procesa cobros reales. */
export function PaymentSheet() {
  const intent = useSiteUiStore((s) => s.payment);
  const startPayment = useSiteUiStore((s) => s.startPayment);
  const provider = useSiteBuilderStore((s) => s.conversion.paymentProvider);
  const whatsapp = useSiteBuilderStore((s) => s.brandDetails.whatsapp);
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [status, setStatus] = useState<'form' | 'processing' | 'approved'>('form');
  const [reference, setReference] = useState('');
  const [tried, setTried] = useState(false);
  const ids = { number: useId(), expiry: useId(), cvc: useId(), name: useId(), errors: useId() };

  useEffect(() => {
    if (intent) {
      setStatus('form');
      setTried(false);
    }
  }, [intent]);

  if (!intent) return null;

  const errors = {
    number: card.number.replace(/\s/g, '').length < 15,
    expiry: !/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry),
    cvc: card.cvc.length < 3,
    name: card.name.trim().length < 3,
  };
  const invalid = Object.values(errors).some(Boolean);
  const label = PROVIDER_LABEL[provider];

  const close = () => {
    if (status === 'approved') intent.onPaid?.();
    startPayment(null);
  };

  const pay = async (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (invalid) return;
    setStatus('processing');
    const result = await simulatePayment();
    setReference(result.reference);
    setStatus('approved');
  };

  const field = (key: keyof typeof card) => (tried && errors[key] ? { 'aria-invalid': true as const, 'aria-describedby': ids.errors } : {});

  return (
    <SiteSheet open onOpenChange={(open) => !open && close()} title="Pago seguro" description={`${label} · simulación sin cobro real`}>
      <div className="mb-6 flex items-center justify-between rounded-lg p-4 text-white" style={{ background: PROVIDER_COLOR[provider] }}>
        <div>
          <p className="text-xs opacity-90">{intent.description}</p>
          <p className="text-2xl font-semibold tabular-nums">{formatPrice(intent.amount, intent.currency)}</p>
        </div>
        <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium">{label}</span>
      </div>

      {status === 'approved' ? (
        <div className="text-center">
          <motion.span initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-600 text-white">
            <Check className="size-7" aria-hidden="true" />
          </motion.span>
          <p className="mt-4 text-lg font-semibold" role="status">
            Pago aprobado
          </p>
          <p className="text-sm text-site-muted">Operación #{reference}</p>
          <div className="mt-6 space-y-2">
            <a
              href={buildWhatsAppUrl(whatsapp, intent.buildMessage({ provider: label, reference }))}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-site-fg text-sm font-medium text-site-bg"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Enviar comprobante por WhatsApp
              <span className="sr-only">(abre WhatsApp en una pestaña nueva)</span>
            </a>
            <button type="button" onClick={close} className="h-11 w-full rounded-full border border-site-border text-sm hover:bg-site-surface-2">
              Listo
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={pay} noValidate aria-busy={status === 'processing'} className="space-y-4">
          <button
            type="button"
            onClick={() => setCard({ number: '4509 9535 6623 3704', expiry: '11/30', cvc: '123', name: 'APRO TEST' })}
            className="text-xs text-site-muted underline underline-offset-4 hover:text-site-fg"
          >
            Completar con tarjeta de prueba
          </button>
          <div>
            <label htmlFor={ids.number} className="mb-1.5 block text-sm">Número de tarjeta</label>
            <input id={ids.number} inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" value={card.number} onChange={(e) => setCard((c) => ({ ...c, number: formatCard(e.target.value) }))} className={siteInputClass} {...field('number')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={ids.expiry} className="mb-1.5 block text-sm">Vencimiento</label>
              <input id={ids.expiry} inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" value={card.expiry} onChange={(e) => setCard((c) => ({ ...c, expiry: formatExpiry(e.target.value) }))} className={siteInputClass} {...field('expiry')} />
            </div>
            <div>
              <label htmlFor={ids.cvc} className="mb-1.5 block text-sm">Código de seguridad</label>
              <input id={ids.cvc} inputMode="numeric" autoComplete="cc-csc" placeholder="123" value={card.cvc} onChange={(e) => setCard((c) => ({ ...c, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))} className={siteInputClass} {...field('cvc')} />
            </div>
          </div>
          <div>
            <label htmlFor={ids.name} className="mb-1.5 block text-sm">Nombre como figura en la tarjeta</label>
            <input id={ids.name} autoComplete="cc-name" value={card.name} onChange={(e) => setCard((c) => ({ ...c, name: e.target.value.toUpperCase() }))} className={siteInputClass} {...field('name')} />
          </div>
          {tried && invalid && (
            <p id={ids.errors} role="alert" className="text-xs text-site-accent-ink">
              Revisá los datos de la tarjeta.
            </p>
          )}
          <button type="submit" disabled={status === 'processing'} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-site-fg text-sm font-medium text-site-bg disabled:opacity-70">
            {status === 'processing' ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Lock className="size-4" aria-hidden="true" />}
            {status === 'processing' ? 'Procesando…' : `Pagar ${formatPrice(intent.amount, intent.currency)}`}
          </button>
          <p className="text-center text-[11px] text-site-muted">Demo: no se realiza ningún cobro ni se guardan datos de tarjeta.</p>
        </form>
      )}
    </SiteSheet>
  );
}
