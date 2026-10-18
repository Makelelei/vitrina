import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  /** Clases extra aplicadas solo en pantallas anchas (p. ej. convertir en grilla). */
  label?: string;
  as?: ElementType;
  role?: string;
  /** Desactiva el snap (útil para chips de filtros). */
  free?: boolean;
}

/**
 * Carrusel horizontal: deslizamiento nativo con el dedo (scroll-snap), arrastre
 * con el mouse, bordes difuminados que indican que hay más contenido y
 * contención del gesto para que no dispare el "atrás" del navegador.
 */
export function Carousel({ children, className = '', label, as: Tag = 'ul', role, free = false }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setEdges({ start: el.scrollLeft > 4, end: el.scrollLeft < max - 4 });
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);

    // Arrastre con mouse (en táctil el navegador ya desplaza de forma nativa).
    let startX = 0;
    let startScroll = 0;
    let dragging = false;
    let moved = false;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) {
        moved = true;
        el.style.scrollSnapType = 'none';
        el.style.cursor = 'grabbing';
        el.scrollLeft = startScroll - dx;
      }
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      el.style.scrollSnapType = '';
      el.style.cursor = '';
    };
    // Si hubo arrastre, el clic final no debe activar el ítem.
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };

    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    el.addEventListener('click', onClick, true);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      el.removeEventListener('click', onClick, true);
    };
  }, []);

  const fade = `linear-gradient(to right, ${edges.start ? 'transparent' : 'black'}, black 24px, black calc(100% - 32px), ${edges.end ? 'transparent' : 'black'})`;

  return (
    <Tag
      ref={ref}
      role={role}
      aria-label={label}
      data-carousel=""
      className={`no-scrollbar flex touch-pan-x touch-pan-y overflow-x-auto overscroll-x-contain ${free ? '' : 'snap-x snap-mandatory'} ${className}`}
      style={{ WebkitMaskImage: fade, maskImage: fade }}
    >
      {children}
    </Tag>
  );
}
