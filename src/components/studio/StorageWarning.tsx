import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { STORAGE_FULL_EVENT, STORAGE_REPAIRED_EVENT, takePendingRepair } from '@/store/safeStorage';

type Notice = 'full' | 'repaired' | null;

const MESSAGES = {
  full: {
    Icon: AlertTriangle,
    title: 'No se pudo guardar el último cambio.',
    text: 'El navegador se quedó sin espacio. Quitá algunas imágenes o exportá tu configuración en JSON.',
  },
  repaired: {
    Icon: RefreshCw,
    title: 'Recuperamos tu configuración.',
    text: 'Algunos datos guardados estaban dañados y se restauraron con los valores de ejemplo. El resto quedó como lo dejaste.',
  },
} as const;

/** Avisos de almacenamiento: cuota llena o configuración reparada al cargar. */
export function StorageWarning() {
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    if (takePendingRepair()) setNotice('repaired');
    const onFull = () => setNotice('full');
    const onRepaired = () => takePendingRepair() && setNotice('repaired');
    window.addEventListener(STORAGE_FULL_EVENT, onFull);
    window.addEventListener(STORAGE_REPAIRED_EVENT, onRepaired);
    return () => {
      window.removeEventListener(STORAGE_FULL_EVENT, onFull);
      window.removeEventListener(STORAGE_REPAIRED_EVENT, onRepaired);
    };
  }, []);

  const message = notice ? MESSAGES[notice] : null;

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          role={notice === 'full' ? 'alert' : 'status'}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="glass fixed bottom-20 right-4 z-50 flex max-w-sm items-start gap-3 rounded-xl border p-4 text-sm shadow-xl lg:bottom-4"
        >
          <message.Icon className={`mt-0.5 size-4 shrink-0 ${notice === 'full' ? 'text-ui-danger' : 'text-ui-accent'}`} aria-hidden="true" />
          <p>
            <span className="font-medium">{message.title}</span>
            <span className="block text-ui-muted">{message.text}</span>
          </p>
          <button type="button" onClick={() => setNotice(null)} aria-label="Cerrar aviso" className="grid size-6 shrink-0 place-items-center rounded-md hover:bg-ui-hover">
            <X className="size-3.5" aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
