import { useRef, useState, type TouchEvent } from 'react';

interface Options {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  /** Hay pestaña siguiente / anterior (si no, el arrastre ofrece resistencia). */
  canLeft: boolean;
  canRight: boolean;
}

/** Elementos donde el gesto horizontal pertenece al control, no al cambio de pestaña. */
const IGNORE = 'input[type="range"], input:focus, textarea:focus, select, [role="slider"], [data-carousel], [data-no-swipe]';

const THRESHOLD = 64;

/**
 * Gesto de deslizar horizontal para cambiar de pestaña. Decide la dirección
 * en los primeros píxeles: si el movimiento es vertical, deja hacer scroll.
 */
export function useSwipe({ onSwipeLeft, onSwipeRight, canLeft, canRight }: Options) {
  const start = useRef<{ x: number; y: number; t: number } | null>(null);
  const axis = useRef<'x' | 'y' | null>(null);
  const [offset, setOffset] = useState(0);

  const onTouchStart = (e: TouchEvent) => {
    if ((e.target as HTMLElement).closest(IGNORE)) return;
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY, t: performance.now() };
    axis.current = null;
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!start.current) return;
    const t = e.touches[0];
    const dx = t.clientX - start.current.x;
    const dy = t.clientY - start.current.y;
    if (!axis.current) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.3) axis.current = 'x';
      else if (Math.abs(dy) > 10) axis.current = 'y';
    }
    if (axis.current === 'x') {
      const blocked = (dx < 0 && !canLeft) || (dx > 0 && !canRight);
      setOffset(blocked ? dx * 0.15 : dx * 0.6);
    }
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (start.current && axis.current === 'x') {
      const dx = e.changedTouches[0].clientX - start.current.x;
      const velocity = Math.abs(dx) / (performance.now() - start.current.t);
      if ((Math.abs(dx) > THRESHOLD || velocity > 0.5) && Math.abs(dx) > 24) {
        if (dx < 0 && canLeft) onSwipeLeft();
        if (dx > 0 && canRight) onSwipeRight();
      }
    }
    start.current = null;
    axis.current = null;
    setOffset(0);
  };

  return { offset, handlers: { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel: onTouchEnd } };
}
