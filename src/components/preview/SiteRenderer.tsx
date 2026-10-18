import { useState } from 'react';
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
