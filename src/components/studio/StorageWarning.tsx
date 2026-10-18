import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { STORAGE_FULL_EVENT } from '@/store/safeStorage';

/** Aviso cuando el navegador ya no puede guardar más (normalmente por imágenes pesadas). */
export function StorageWarning() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = () => setVisible(true);
    window.addEventListener(STORAGE_FULL_EVENT, show);
    return () => window.removeEventListener(STORAGE_FULL_EVENT, show);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="glass fixed bottom-20 right-4 z-50 flex max-w-sm items-start gap-3 rounded-xl border p-4 text-sm shadow-xl lg:bottom-4"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-ui-danger" aria-hidden="true" />
          <p>
            <span className="font-medium">No se pudo guardar el último cambio.</span>
            <span className="block text-ui-muted">El navegador se quedó sin espacio. Quitá algunas imágenes o exportá tu configuración en JSON.</span>
          </p>
          <button type="button" onClick={() => setVisible(false)} aria-label="Cerrar aviso" className="grid size-6 shrink-0 place-items-center rounded-md hover:bg-ui-hover">
            <X className="size-3.5" aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
