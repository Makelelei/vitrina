import { useId, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useSiteBuilderStore } from '@/store/useSiteBuilderStore';
import { isValidWhatsApp } from '@/lib/whatsapp';
import type { LeadContact } from '@/lib/leads';
import { TextField } from '@/components/ui/TextField';

interface Props {
  initial: LeadContact | null;
  onBack: () => void;
  onContinue: (contact: LeadContact) => void;
}

type Errors = Partial<Record<keyof LeadContact | 'consent', string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function LeadFormStep({ initial, onBack, onContinue }: Props) {
  const defaultPhone = useSiteBuilderStore((s) => s.brandDetails.whatsapp);
  const [contact, setContact] = useState<LeadContact>(initial ?? { name: '', email: '', phone: defaultPhone });
  const [consent, setConsent] = useState(!!initial);
  const [errors, setErrors] = useState<Errors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const consentId = useId();
  const consentErrId = useId();

  const submit = (event: FormEvent) => {
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
    onContinue({ name: contact.name.trim(), email: contact.email.trim(), phone: contact.phone });
  };

  const update = (key: keyof LeadContact) => (value: string) => setContact((c) => ({ ...c, [key]: value }));

  return (
    <form ref={formRef} noValidate onSubmit={submit} className="space-y-4">
      <p className="text-sm text-ui-muted">Con estos datos creamos tu cuenta y te avisamos cuando el sitio esté online.</p>
      <TextField label="Nombre y apellido" value={contact.name} onValueChange={update('name')} autoComplete="name" required error={errors.name} />
      <TextField label="Email" type="email" value={contact.email} onValueChange={update('email')} autoComplete="email" required error={errors.email} />
      <TextField label="Teléfono" type="tel" inputMode="tel" value={contact.phone} onValueChange={update('phone')} autoComplete="tel" required error={errors.phone} />
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
            Acepto los términos del servicio y que Vitrina me contacte para activar mi sitio.
          </label>
        </div>
        {errors.consent && (
          <p id={consentErrId} className="mt-1 pl-6 text-xs text-ui-danger">
            {errors.consent}
          </p>
        )}
      </div>
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row">
        <button type="button" onClick={onBack} className="ui-btn ui-btn-ghost h-10">
          <ArrowLeft className="size-4" aria-hidden="true" /> Volver
        </button>
        <button type="submit" className="ui-btn ui-btn-neon h-10 flex-1">
          Ir al pago <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
