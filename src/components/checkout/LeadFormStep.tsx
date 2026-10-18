import { useId, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { useSiteBuilderStore, selectConfig } from '@/store/useSiteBuilderStore';
import { isValidWhatsApp } from '@/lib/whatsapp';
import { LeadSubmitError, submitLead, type LeadContact, type LeadRecord } from '@/lib/leads';
import { APP_CONFIG } from '@/config/app';
import { PLANS } from '@/presets/plans';
import { formatPrice } from '@/lib/format';
import type { PlanId } from '@/types';
import { TextField } from '@/components/ui/TextField';

interface Props {
  plan: PlanId;
  initial: LeadContact | null;
  onBack: () => void;
  /** Conserva lo escrito si el usuario vuelve al resumen. */
  onContactChange: (contact: LeadContact) => void;
  onSuccess: (record: LeadRecord) => void;
}

type Errors = Partial<Record<keyof LeadContact | 'consent' | 'form', string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function LeadFormStep({ plan, initial, onBack, onContactChange, onSuccess }: Props) {
  const defaultPhone = useSiteBuilderStore((s) => s.brandDetails.whatsapp);
  const [contact, setContact] = useState<LeadContact>(initial ?? { name: '', email: '', phone: defaultPhone });
  const [consent, setConsent] = useState(!!initial);
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const consentId = useId();
  const consentErrId = useId();
  const selectedPlan = PLANS.find((p) => p.id === plan)!;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const e: Errors = {};
    if (contact.name.trim().length < 2) e.name = 'Ingresá tu nombre.';
    if (!EMAIL_RE.test(contact.email.trim())) e.email = 'Ingresá un email válido.';
    if (!isValidWhatsApp(contact.phone)) e.phone = 'Ingresá un teléfono con código de país.';
    if (!consent) e.consent = 'Necesitamos tu autorización para contactarte.';
    setErrors(e);
    if (Object.keys(e).length) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }

    const clean = { name: contact.name.trim(), email: contact.email.trim(), phone: contact.phone };
    onContactChange(clean);
    setSending(true);
    try {
      const record = await submitLead({ plan, contact: clean, config: selectConfig(useSiteBuilderStore.getState()), website: honeypot });
      onSuccess(record);
    } catch (error) {
      setErrors({ form: error instanceof LeadSubmitError ? error.message : 'Ocurrió un error inesperado. Probá de nuevo.' });
      if (!(error instanceof LeadSubmitError)) console.error('[vitrina] Error al enviar la solicitud:', error);
    } finally {
      setSending(false);
    }
  };

  const update = (key: keyof LeadContact) => (value: string) => setContact((c) => ({ ...c, [key]: value }));

  return (
    <form ref={formRef} noValidate onSubmit={submit} aria-busy={sending} className="space-y-4">
      <p className="text-sm text-ui-muted">
        Te contactamos por WhatsApp para confirmar los detalles y coordinar el pago. Tu sitio queda online en 48–72 h.
      </p>
      <TextField label="Nombre y apellido" value={contact.name} onValueChange={update('name')} autoComplete="name" required error={errors.name} />
      <TextField label="Email" type="email" value={contact.email} onValueChange={update('email')} autoComplete="email" required error={errors.email} />
      <TextField label="WhatsApp" type="tel" inputMode="tel" value={contact.phone} onValueChange={update('phone')} autoComplete="tel" required error={errors.phone} hint="Con código de país, ej: 5491122334455" />

      {/* Campo trampa anti-bots: invisible para personas y lectores de pantalla. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Sitio web
          <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </label>
      </div>

      <div>
        <div className="flex items-start gap-2.5">
          <input
            id={consentId}
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? consentErrId : undefined}
            className="mt-0.5 size-4 shrink-0 accent-[var(--ui-accent)]"
          />
          <label htmlFor={consentId} className="text-sm text-ui-muted">
            Acepto los{' '}
            <a href={APP_CONFIG.legal.terms} target="_blank" rel="noopener noreferrer" className="text-ui-fg underline underline-offset-4">
              términos del servicio
            </a>{' '}
            y la{' '}
            <a href={APP_CONFIG.legal.privacy} target="_blank" rel="noopener noreferrer" className="text-ui-fg underline underline-offset-4">
              política de privacidad
            </a>
            , y que Vitrina me contacte para activar mi sitio.
          </label>
        </div>
        {errors.consent && (
          <p id={consentErrId} className="mt-1 pl-6 text-xs text-ui-danger">
            {errors.consent}
          </p>
        )}
      </div>

      <dl className="divide-y divide-ui-border rounded-lg border border-ui-border text-sm">
        <div className="flex justify-between px-4 py-2.5">
          <dt className="text-ui-muted">Plan {selectedPlan.name}</dt>
          <dd>
            {formatPrice(selectedPlan.price)}
            {selectedPlan.period}
          </dd>
        </div>
        <div className="flex justify-between px-4 py-2.5">
          <dt className="text-ui-muted">Hoy pagás</dt>
          <dd className="text-ui-success">Nada — lo coordinamos por WhatsApp</dd>
        </div>
      </dl>

      {errors.form && (
        <p role="alert" className="rounded-md border border-ui-danger/40 px-3 py-2 text-sm text-ui-danger">
          {errors.form}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row">
        <button type="button" onClick={onBack} disabled={sending} className="ui-btn ui-btn-ghost h-10">
          <ArrowLeft className="size-4" aria-hidden="true" /> Volver
        </button>
        <button type="submit" disabled={sending} className="ui-btn ui-btn-neon h-10 flex-1">
          {sending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
          {sending ? 'Enviando…' : 'Enviar solicitud'}
        </button>
      </div>
    </form>
  );
}
