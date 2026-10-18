import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'motion/react';
import { ChevronDown, Maximize2, Minimize2, SlidersHorizontal } from 'lucide-react';
import { useUiStore } from '@/store/useUiStore';
import { ControlPanel } from './ControlPanel';

/** Alturas del editor como fracción de la pantalla. */
const SNAP = { compact: 0.46, full: 0.84 } as const;
const MIN_HEIGHT = 140;

function useViewportHeight() {
  const [vh, setVh] = useState(() => window.innerHeight);
  useEffect(() => {
    const update = () => setVh(window.visualViewport?.height ?? window.innerHeight);
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('resize', update);
    };
  }, []);
  return vh;
}

/**
 * Editor móvil acoplado (pantalla dividida): ocupa la parte inferior y la
 * vista previa queda visible y viva arriba. La manija se arrastra para pasar
 * de compacto a expandido, o hacia abajo para cerrar.
 */
export function MobileEditorDock() {
  const open = useUiStore((s) => s.mobilePanelOpen);
  const setOpen = useUiStore((s) => s.setMobilePanelOpen);
  const size = useUiStore((s) => s.mobilePanelSize);
  const setSize = useUiStore((s) => s.setMobilePanelSize);
  const vh = useViewportHeight();
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  const heights = { compact: Math.round(vh * SNAP.compact), full: Math.round(vh * SNAP.full) };
  const height = dragHeight ?? heights[size];

  // Foco: al abrir va al editor; al cerrar vuelve al botón que lo abrió.
  useEffect(() => {
    if (open) panelRef.current?.focus({ preventScroll: true });
    else if (wasOpen.current) requestAnimationFrame(() => fabRef.current?.focus({ preventScroll: true }));
    wasOpen.current = open;
  }, [open]);

  // Escape: primero contrae, después cierra (salvo que haya un diálogo del sitio abierto).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || document.querySelector('[role="dialog"]')) return;
      if (size === 'full') setSize('compact');
      else setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, size, setOpen, setSize]);

  const onPan = (_: PointerEvent, info: PanInfo) => {
    setDragHeight(Math.min(heights.full + 24, Math.max(MIN_HEIGHT * 0.6, heights[size] - info.offset.y)));
  };

  const onPanEnd = (_: PointerEvent, info: PanInfo) => {
    const down = info.offset.y > 70 || info.velocity.y > 500;
    const up = info.offset.y < -70 || info.velocity.y < -500;
    if (down) {
      if (size === 'full' && (dragHeight ?? 0) > heights.compact * 0.7) setSize('compact');
      else setOpen(false);
    } else if (up) {
      setSize('full');
    }
    setDragHeight(null);
  };

  const expanded = size === 'full';

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            ref={fabRef}
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            onClick={() => setOpen(true)}
            aria-expanded={false}
            className="ui-btn ui-btn-neon fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-30 h-11 -translate-x-1/2 rounded-full px-6 text-sm"
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Personalizar
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.section
            ref={panelRef}
            tabIndex={-1}
            role="region"
            aria-label="Editor del sitio"
            initial={{ height: 0 }}
            animate={{ height }}
            exit={{ height: 0 }}
            transition={dragHeight !== null ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 38 }}
            className="glass relative z-20 flex shrink-0 flex-col overflow-hidden rounded-t-3xl border-t bg-ui-solid/90 shadow-[0_-16px_40px_-16px_rgb(0_0_0/0.55),0_-1px_0_color-mix(in_oklab,var(--ui-accent)_35%,transparent)] focus:outline-none"
          >
            <motion.div onPan={onPan} onPanEnd={onPanEnd} className="grid shrink-0 cursor-grab touch-none grid-cols-[1fr_auto_1fr] items-center px-3 pb-0.5 pt-1.5 active:cursor-grabbing">
              <span className="inline-flex items-center gap-1.5 justify-self-start rounded-full bg-ui-subtle px-2.5 py-1 text-[11px] font-medium text-ui-muted">
                <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-ui-accent shadow-[0_0_8px_var(--ui-accent)]" />
                Vista en vivo
              </span>
              <button
                type="button"
                onClick={() => setSize(expanded ? 'compact' : 'full')}
                aria-label={expanded ? 'Achicar el editor para ver más del sitio' : 'Agrandar el editor'}
                className="grid h-7 w-14 place-items-center rounded-full"
              >
                <span aria-hidden="true" className="h-1.5 w-10 rounded-full bg-ui-muted/50" />
              </button>
              <span className="flex items-center gap-1 justify-self-end">
                <button
                  type="button"
                  onClick={() => setSize(expanded ? 'compact' : 'full')}
                  aria-label={expanded ? 'Achicar editor' : 'Agrandar editor'}
                  className="grid size-8 place-items-center rounded-full text-ui-muted hover:bg-ui-hover hover:text-ui-fg"
                >
                  {expanded ? <Minimize2 className="size-4" aria-hidden="true" /> : <Maximize2 className="size-4" aria-hidden="true" />}
                </button>
                <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar editor" className="grid size-8 place-items-center rounded-full bg-ui-subtle text-ui-fg hover:bg-ui-hover">
                  <ChevronDown className="size-4" aria-hidden="true" />
                </button>
              </span>
            </motion.div>
            <div className="min-h-0 flex-1">
              <ControlPanel />
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
