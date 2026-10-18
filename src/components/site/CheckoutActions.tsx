import { CreditCard, MessageCircle } from 'lucide-react';
import { useId } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useSiteBuilderStore } from '@/store/useSiteBuilderStore';
import { useSiteUiStore, type PaymentIntent } from '@/store/useSiteUiStore';
import { formatPrice } from '@/lib/format';
import { buildWhatsAppUrl, isValidWhatsApp } from '@/lib/whatsapp';
import type { Currency } from '@/types';

export const PROVIDER_LABEL = { mercadopago: 'Mercado Pago', stripe: 'Stripe' } as const;

interface Props {
  problems: string[];
  /** Mensaje de WhatsApp; recibe el comprobante si se pagó online. */
  buildMessage: (payment?: { provider: string; reference: string }) => string;
  amount: number;
  currency?: Currency;
  description: string;
  kind: PaymentIntent['kind'];
  waLabel: string;
  payLabel: string;
  /** Se llama antes de abrir el simulador de pago (p. ej. para cerrar el carrito). */
  onBeforePay?: () => void;
  onPaid?: () => void;
}

/**
 * Botones de conversión según el modo de checkout configurado:
 * solo WhatsApp, solo link de pago, o ambos (híbrido).
 */
export function CheckoutActions({ problems, buildMessage, amount, currency = 'ARS', description, kind, waLabel, payLabel, onBeforePay, onPaid }: Props) {
  const { checkoutMode, provider, whatsapp } = useSiteBuilderStore(
    useShallow((s) => ({ checkoutMode: s.checkoutMode, provider: s.conversion.paymentProvider, whatsapp: s.brandDetails.whatsapp })),
  );
  const startPayment = useSiteUiStore((s) => s.startPayment);
  const problemsId = useId();

  const canPay = amount > 0 && checkoutMode !== 'whatsapp_only';
  const showWhatsApp = checkoutMode !== 'payment_link' || amount <= 0;
  const allProblems = [...problems];
  if (showWhatsApp && !isValidWhatsApp(whatsapp)) allProblems.push('El negocio no tiene un WhatsApp válido configurado.');
  const blocked = allProblems.length > 0;

  const pay = () => {
    onBeforePay?.();
    startPayment({ amount, currency, description, kind, buildMessage: (p) => buildMessage(p), onPaid });
  };

  const primary = 'flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-medium transition-opacity';

  return (
    <>
      {blocked && (
        <ul id={problemsId} className="space-y-0.5 text-xs text-site-muted">
          {allProblems.map((p) => (
            <li key={p}>· {p}</li>
          ))}
        </ul>
      )}

      {canPay && (
        <button
          type="button"
          onClick={pay}
          disabled={blocked}
          aria-describedby={blocked ? problemsId : undefined}
          className={`${primary} bg-site-fg text-site-bg hover:opacity-90 disabled:cursor-not-allowed disabled:bg-site-surface-2 disabled:text-site-muted`}
        >
          <CreditCard className="size-4" aria-hidden="true" />
          {payLabel} · {formatPrice(amount, currency)}
        </button>
      )}

      {showWhatsApp &&
        (blocked ? (
          <button type="button" disabled aria-describedby={problemsId} className={`${primary} cursor-not-allowed bg-site-surface-2 text-site-muted`}>
            <MessageCircle className="size-4" aria-hidden="true" />
            {waLabel}
          </button>
        ) : (
          <a
            href={buildWhatsAppUrl(whatsapp, buildMessage())}
            target="_blank"
            rel="noopener noreferrer"
            className={`${primary} ${canPay ? 'border border-site-border hover:bg-site-surface-2' : 'bg-site-fg text-site-bg hover:opacity-90'}`}
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            {waLabel}
            <span className="sr-only">(abre WhatsApp en una pestaña nueva)</span>
          </a>
        ))}

      {canPay && (
        <p className="text-center text-[11px] text-site-muted">
          Pago seguro con {PROVIDER_LABEL[provider]} {checkoutMode === 'hybrid' && '· o coordiná por WhatsApp'}
        </p>
      )}
    </>
  );
}
