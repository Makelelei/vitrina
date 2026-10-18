import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { useSitePortal } from './SitePortalContext';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Panel modal del sitio del cliente: hoja inferior en pantallas chicas y
 * lateral en anchas. Se monta dentro del marco de vista previa.
 */
export function SiteSheet({ open, onOpenChange, title, description, children, footer }: Props) {
  const portal = useSitePortal();
  if (!portal) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal container={portal} forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div className="absolute inset-0 z-40 bg-black/45" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount {...(description ? {} : { 'aria-describedby': undefined })}>
              <motion.div
                className="absolute inset-x-0 bottom-0 z-50 flex max-h-[92%] flex-col rounded-t-2xl bg-site-bg text-site-fg shadow-2xl @2xl:inset-y-0 @2xl:left-auto @2xl:right-0 @2xl:max-h-none @2xl:w-[440px] @2xl:rounded-none"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 38 }}
              >
                <header className="flex items-start justify-between gap-3 border-b border-site-border px-5 py-4">
                  <div className="min-w-0">
                    <Dialog.Title className="truncate text-base font-semibold">{title}</Dialog.Title>
                    {description && <Dialog.Description className="text-xs text-site-muted">{description}</Dialog.Description>}
                  </div>
                  <Dialog.Close aria-label="Cerrar" className="grid size-8 shrink-0 place-items-center rounded-full hover:bg-site-surface-2">
                    <X className="size-4" aria-hidden="true" />
                  </Dialog.Close>
                </header>
                <div className="site-scroll flex-1 overflow-y-auto px-5 py-5">{children}</div>
                {footer && <footer className="space-y-2.5 border-t border-site-border px-5 py-4">{footer}</footer>}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
