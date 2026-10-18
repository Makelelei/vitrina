import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { useUiStore } from '@/store/useUiStore';
import type { LeadContact, LeadRecord } from '@/lib/leads';
import type { PlanId } from '@/types';
import { SummaryStep } from './SummaryStep';
import { LeadFormStep } from './LeadFormStep';
import { SuccessStep } from './SuccessStep';

type Step = 'summary' | 'lead' | 'success';
const STEPS: { id: Step; label: string }[] = [
  { id: 'summary', label: 'Resumen' },
  { id: 'lead', label: 'Tus datos' },
  { id: 'success', label: 'Listo' },
];

export function CheckoutModal() {
  const open = useUiStore((s) => s.checkoutOpen);
  const setOpen = useUiStore((s) => s.setCheckoutOpen);
  const [step, setStep] = useState<Step>('summary');
  const [plan, setPlan] = useState<PlanId>('pro');
  const [contact, setContact] = useState<LeadContact | null>(null);
  const [lead, setLead] = useState<LeadRecord | null>(null);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      // Reinicia el flujo después de la animación de cierre.
      setTimeout(() => {
        setStep('summary');
        setLead(null);
      }, 250);
    }
  };

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            </Dialog.Overlay>
            <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center p-3">
              <Dialog.Content asChild forceMount>
                <motion.div
                  className="glass pointer-events-auto flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border bg-ui-solid/90 text-ui-fg shadow-[0_40px_80px_-20px_rgb(0_0_0/0.6),0_0_60px_-20px_color-mix(in_oklab,var(--ui-accent)_50%,transparent)]"
                  initial={{ opacity: 0, scale: 0.97, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: 8 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  <header className="flex items-start justify-between gap-4 border-b border-ui-border px-6 py-4">
                    <div>
                      <Dialog.Title className="text-base font-semibold">Activar mi sitio</Dialog.Title>
                      <Dialog.Description className="mt-0.5 text-xs text-ui-muted">
                        Paso {stepIndex + 1} de {STEPS.length} · {STEPS[stepIndex].label}
                      </Dialog.Description>
                    </div>
                    <Dialog.Close aria-label="Cerrar" className="grid size-8 shrink-0 place-items-center rounded-md hover:bg-ui-hover">
                      <X className="size-4" aria-hidden="true" />
                    </Dialog.Close>
                  </header>

                  <div aria-hidden="true" className="grid grid-cols-3 gap-1 px-6 pt-4">
                    {STEPS.map((s, i) => (
                      <span key={s.id} className={`h-0.5 rounded-full transition-colors ${i <= stepIndex ? 'bg-gradient-to-r from-ui-accent to-ui-accent-2' : 'bg-ui-border'}`} />
                    ))}
                  </div>

                  <div className="thin-scroll flex-1 overflow-y-auto px-6 py-5">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.15 }}>
                        {step === 'summary' && <SummaryStep plan={plan} onPlanChange={setPlan} onContinue={() => setStep('lead')} />}
                        {step === 'lead' && (
                          <LeadFormStep
                            plan={plan}
                            initial={contact}
                            onBack={() => setStep('summary')}
                            onContactChange={setContact}
                            onSuccess={(record) => {
                              setLead(record);
                              setStep('success');
                            }}
                          />
                        )}
                        {step === 'success' && lead && <SuccessStep lead={lead} onClose={() => handleOpenChange(false)} />}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
