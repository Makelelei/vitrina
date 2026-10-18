import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion, useDragControls } from 'motion/react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useUiStore } from '@/store/useUiStore';
import { ControlPanel } from './ControlPanel';

/** En pantallas chicas el panel se abre como hoja inferior que se cierra arrastrando hacia abajo. */
export function MobilePanelSheet() {
  const open = useUiStore((s) => s.mobilePanelOpen);
  const setOpen = useUiStore((s) => s.setMobilePanelOpen);
  const controls = useDragControls();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="ui-btn ui-btn-neon fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-30 h-11 -translate-x-1/2 rounded-full px-6 text-sm lg:hidden">
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        Personalizar
      </Dialog.Trigger>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                className="glass fixed inset-x-0 bottom-0 z-50 flex h-[88dvh] flex-col overflow-hidden rounded-t-3xl border-t bg-ui-solid/95 text-ui-fg shadow-[0_-20px_60px_-20px_rgb(0_0_0/0.6)] lg:hidden"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                drag="y"
                dragControls={controls}
                dragListener={false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.6 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 120 || info.velocity.y > 600) setOpen(false);
                }}
              >
                <div
                  onPointerDown={(e) => controls.start(e)}
                  className="flex shrink-0 cursor-grab touch-none items-center justify-between px-4 pb-1 pt-2 active:cursor-grabbing"
                >
                  <span className="w-8" />
                  <span aria-hidden="true" className="h-1.5 w-11 rounded-full bg-ui-muted/50" />
                  <Dialog.Close aria-label="Cerrar panel" className="grid size-8 place-items-center rounded-full bg-ui-subtle hover:bg-ui-hover">
                    <X className="size-4" aria-hidden="true" />
                  </Dialog.Close>
                </div>
                <Dialog.Title className="sr-only">Personalizar sitio</Dialog.Title>
                <div className="min-h-0 flex-1">
                  <ControlPanel />
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
