import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LayoutTemplate, Package, Palette, RotateCcw, Zap } from 'lucide-react';
import { useSiteBuilderStore } from '@/store/useSiteBuilderStore';
import { useSwipe } from '@/hooks/useSwipe';
import { CategoryTab } from './CategoryTab';
import { IdentityTab } from './IdentityTab';
import { ContentTab } from './ContentTab';
import { ConversionTab } from './ConversionTab';

const TABS = [
  { id: 'category', label: 'Rubro', full: 'Rubro y plantilla', Icon: LayoutTemplate, Panel: CategoryTab },
  { id: 'identity', label: 'Identidad', full: 'Identidad y colores', Icon: Palette, Panel: IdentityTab },
  { id: 'content', label: 'Contenido', full: 'Contenido y productos', Icon: Package, Panel: ContentTab },
  { id: 'conversion', label: 'Conversión', full: 'Ajustes de conversión', Icon: Zap, Panel: ConversionTab },
] as const;

export function ControlPanel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const resetDemo = useSiteBuilderStore((s) => s.resetDemo);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const go = (next: number, focus = false) => {
    if (next === index || next < 0 || next >= TABS.length) return;
    setDirection(next > index ? 1 : -1);
    setIndex(next);
    scrollRef.current?.scrollTo({ top: 0 });
    if (focus) tabRefs.current[next]?.focus();
  };

  const { offset, handlers } = useSwipe({
    onSwipeLeft: () => go(index + 1),
    onSwipeRight: () => go(index - 1),
    canLeft: index < TABS.length - 1,
    canRight: index > 0,
  });

  // Patrón de pestañas WAI-ARIA: flechas, Inicio y Fin mueven el foco y activan.
  const onKeyDown = (e: KeyboardEvent) => {
    const last = TABS.length - 1;
    const keys: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    if (!(e.key in keys)) return;
    e.preventDefault();
    go(keys[e.key], true);
  };

  const current = TABS[index];

  return (
    <div className="flex h-full flex-col">
      <div role="tablist" aria-label="Opciones de personalización" className="grid shrink-0 grid-cols-4 border-b border-ui-border px-2">
        {TABS.map((tab, i) => {
          const selected = i === index;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={`${baseId}-tab-${tab.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              title={tab.full}
              tabIndex={selected ? 0 : -1}
              onClick={() => go(i)}
              onKeyDown={onKeyDown}
              className={`relative flex min-h-14 flex-col items-center justify-center gap-1 px-1 pb-2.5 pt-3 text-[11px] font-medium transition-colors ${selected ? 'text-ui-fg' : 'text-ui-muted hover:text-ui-fg'}`}
            >
              <tab.Icon className={`size-4 transition-colors ${selected ? 'text-ui-accent' : ''}`} aria-hidden="true" />
              {tab.label}
              {selected && (
                <motion.span
                  layoutId={`${baseId}-tab-indicator`}
                  aria-hidden="true"
                  className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-ui-accent to-ui-accent-2 shadow-[0_0_10px_var(--ui-accent)]"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div
        ref={scrollRef}
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${current.id}`}
        tabIndex={0}
        {...handlers}
        className="thin-scroll relative min-h-0 flex-1 touch-pan-y overflow-y-auto overflow-x-hidden overscroll-contain focus-visible:outline-offset-[-2px]"
      >
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={current.id}
            custom={direction}
            variants={{
              enter: (d: number) => ({ x: d * 48, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: d * -48, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 420, damping: 40, opacity: { duration: 0.15 } }}
          >
            <div style={{ transform: offset ? `translateX(${offset}px)` : undefined, transition: offset ? 'none' : 'transform 0.25s ease' }}>
              <div className="flex items-center justify-between px-4 pt-4">
                <h2 className="text-sm font-semibold">{current.full}</h2>
                <span aria-hidden="true" className="flex gap-1 lg:hidden">
                  {TABS.map((t, i) => (
                    <span key={t.id} className={`h-1 rounded-full transition-all ${i === index ? 'w-4 bg-ui-accent' : 'w-1 bg-ui-border'}`} />
                  ))}
                </span>
              </div>
              <current.Panel />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="shrink-0 border-t border-ui-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => window.confirm('¿Volver al ejemplo original de este rubro? Se pierden tus cambios.') && resetDemo()}
          className="ui-btn w-full text-xs text-ui-muted hover:bg-ui-hover hover:text-ui-fg"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Restablecer ejemplo
        </button>
      </div>
    </div>
  );
}
