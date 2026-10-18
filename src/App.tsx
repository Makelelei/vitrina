import { useEffect } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useUiStore } from '@/store/useUiStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { AppHeader, SIDEBAR_ID } from '@/components/studio/AppHeader';
import { StorageWarning } from '@/components/studio/StorageWarning';
import { ControlPanel } from '@/components/panel/ControlPanel';
import { MobilePanelSheet } from '@/components/panel/MobilePanelSheet';
import { PreviewCanvas } from '@/components/preview/PreviewCanvas';
import { CheckoutModal } from '@/components/checkout/CheckoutModal';
import { Welcome } from '@/components/onboarding/Welcome';

export default function App() {
  const theme = useUiStore((s) => s.theme);
  const onboarded = useUiStore((s) => s.onboarded);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  // En pantallas chicas el panel vive en la hoja inferior; no se monta dos veces.
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait" initial={false}>
        {!onboarded ? (
          <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <Welcome />
          </motion.div>
        ) : (
          <motion.div
            key="studio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="studio-bg flex h-dvh flex-col overflow-hidden text-ui-fg"
          >
            <a href="#preview" className="skip-link">
              Saltar a la vista previa
            </a>
            <AppHeader />
            <div className="flex min-h-0 flex-1">
              {isDesktop && (
                <motion.aside
                  id={SIDEBAR_ID}
                  aria-label="Panel de edición"
                  initial={false}
                  animate={{ width: collapsed ? 0 : 360, opacity: collapsed ? 0 : 1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 40 }}
                  inert={collapsed}
                  className="glass shrink-0 overflow-hidden border-r"
                >
                  <div className="h-full w-[360px]">
                    <ControlPanel />
                  </div>
                </motion.aside>
              )}
              <main id="preview" tabIndex={-1} className="min-w-0 flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] focus:outline-none lg:pb-0">
                <PreviewCanvas />
              </main>
            </div>
            {!isDesktop && <MobilePanelSheet />}
            <CheckoutModal />
            <StorageWarning />
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
