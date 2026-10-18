import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { CreditCard, LayoutTemplate, Palette, QrCode } from 'lucide-react';
import { useSiteBuilderStore } from '@/store/useSiteBuilderStore';
import { useUiStore } from '@/store/useUiStore';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/studio/ThemeToggle';
import { CategoryGrid } from '@/components/panel/CategoryGrid';
import type { BusinessCategory } from '@/types';

const FEATURES = [
  { Icon: LayoutTemplate, title: '4 plantillas', text: 'Menú, catálogo, turnos o landing.' },
  { Icon: Palette, title: 'Tu marca', text: 'Logo, colores y tipografía en vivo.' },
  { Icon: CreditCard, title: 'Cobrá como quieras', text: 'WhatsApp, link de pago o ambos.' },
  { Icon: QrCode, title: 'QR listo', text: 'Para imprimir en mesas y vidrieras.' },
];

export function Welcome() {
  const setBusinessCategory = useSiteBuilderStore((s) => s.setBusinessCategory);
  const current = useSiteBuilderStore((s) => s.businessCategory);
  const setOnboarded = useUiStore((s) => s.setOnboarded);
  const hasStarted = useUiStore((s) => s.hasStarted);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => headingRef.current?.focus(), []);

  const choose = (id: BusinessCategory) => {
    if (id !== current || !hasStarted) setBusinessCategory(id);
    setOnboarded(true);
  };

  return (
    <div className="studio-bg flex min-h-dvh flex-col">
      <header className="flex h-14 items-center justify-between px-5 lg:px-8">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-16 pt-10 lg:px-8 lg:pt-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
          <p className="inline-flex items-center gap-2 rounded-full border border-ui-border bg-ui-subtle px-3 py-1 text-xs text-ui-muted">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-ui-accent shadow-[0_0_8px_var(--ui-accent)]" />
            Try before you buy · Sin tarjeta
          </p>
          <h1 ref={headingRef} tabIndex={-1} className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-balance focus:outline-none sm:text-6xl">
            Tu sitio web, <span className="neon-text">en vivo</span> antes de pagar.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ui-muted sm:text-lg">
            Elegí tu rubro, cargá tu marca y probá el carrito, los turnos y los cobros como si fueras tu cliente. Lo activás solo si te convence.
          </p>
        </motion.div>

        <motion.section aria-labelledby="category-title" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }} className="mt-12">
          <h2 id="category-title" className="mb-4 text-sm font-medium">
            ¿Qué tipo de negocio tenés?
          </h2>
          <CategoryGrid value={null} onSelect={choose} />
          <p className="mt-4 text-xs text-ui-muted">
            ¿No ves tu rubro? Elegí el más parecido: textos, productos y variantes se editan.
            {hasStarted && (
              <>
                {' '}
                <button type="button" onClick={() => setOnboarded(true)} className="font-medium text-ui-fg underline underline-offset-4">
                  Volver a mi sitio
                </button>
              </>
            )}
          </p>
        </motion.section>

        <ul className="mt-16 grid gap-6 border-t border-ui-border pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ Icon, title, text }) => (
            <li key={title}>
              <Icon className="size-4 text-ui-accent" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium">{title}</p>
              <p className="mt-1 text-sm text-ui-muted">{text}</p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
