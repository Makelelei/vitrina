import { useEffect, useState } from 'react';
import { useSiteUiStore } from '@/store/useSiteUiStore';
import { AnimatePresence, motion } from 'motion/react';
import { useSiteBuilderStore } from '@/store/useSiteBuilderStore';
import { useSiteThemeVars } from '@/hooks/useSiteTheme';
import { useConversionMode, useDemo } from '@/hooks/useDemo';
import { TEMPLATE_COMPONENTS } from '@/templates';
import { SitePortalContext } from '@/components/site/SitePortalContext';
import { CartDrawer, CartFab } from '@/components/site/CartDrawer';
import { QuickView } from '@/components/site/QuickView';
import { BookingDialog } from '@/components/site/BookingDialog';
import { InquiryDialog } from '@/components/site/InquiryDialog';
import { PaymentSheet } from '@/components/site/PaymentSheet';

/**
 * Raíz del sitio del cliente: inyecta las variables CSS del tema y define un
 * contenedor (`@container`) para que las plantillas respondan al tamaño del
 * marco (teléfono, tablet o escritorio) y no a la ventana del estudio.
 */
export function SiteRenderer() {
  const layout = useSiteBuilderStore((s) => s.layoutTemplate);
  const demo = useDemo();
  const mode = useConversionMode();
  const vars = useSiteThemeVars();
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const Template = TEMPLATE_COMPONENTS[layout];
  const spotlight = useSiteUiStore((s) => s.spotlight);

  // Foco en vivo: lleva la vista previa a lo que se está editando y lo resalta.
  useEffect(() => {
    if (!root || !spotlight) return;
    let timer = 0;
    // Espera un cuadro para que exista lo recién activado (una sección que se acaba de encender).
    const raf = requestAnimationFrame(() => {
      const scroller = root.querySelector<HTMLElement>('.site-scroll');
      if (!scroller) return;
      if (spotlight.target === 'top') {
        scroller.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const el = spotlight.target.startsWith('item:')
        ? root.querySelector<HTMLElement>(`[data-item-id="${CSS.escape(spotlight.target.slice(5))}"]`)
        : root.querySelector<HTMLElement>(spotlight.target);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (spotlight.highlight) {
        el.classList.remove('preview-spotlight');
        void el.offsetWidth; // reinicia la animación si se repite sobre el mismo elemento
        el.classList.add('preview-spotlight');
        timer = window.setTimeout(() => el.classList.remove('preview-spotlight'), 1800);
      }
    });
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [root, spotlight]);

  return (
    <SitePortalContext.Provider value={root}>
      <div ref={setRoot} style={vars} lang="es" role="region" aria-label="Sitio de ejemplo" className="site-root @container absolute inset-0 overflow-hidden">
        <div className="site-scroll h-full overflow-y-auto overscroll-contain">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={`${layout}-${demo.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <Template />
            </motion.div>
          </AnimatePresence>
        </div>
        {mode === 'order' && (
          <>
            <CartFab />
            <CartDrawer />
          </>
        )}
        <QuickView />
        {mode === 'booking' && <BookingDialog />}
        {mode === 'inquiry' && <InquiryDialog />}
        <PaymentSheet />
      </div>
    </SitePortalContext.Provider>
  );
}
