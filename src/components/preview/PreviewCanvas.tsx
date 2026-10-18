import { AnimatePresence, motion } from 'motion/react';
import { useUiStore } from '@/store/useUiStore';
import { useElementSize } from '@/hooks/useElementSize';
import { DesktopFrame, DeviceFrame, FRAME_SIZE } from './DeviceFrame';
import { SiteRenderer } from './SiteRenderer';

const DEVICE_LABEL = { mobile: 'móvil', tablet: 'tablet', desktop: 'escritorio' } as const;

/** Por debajo de este ancho el estudio corre en un teléfono: el sitio ocupa todo el lienzo. */
const COMPACT_BREAKPOINT = 560;

export function PreviewCanvas() {
  const device = useUiStore((s) => s.deviceMode);
  const [ref, size] = useElementSize<HTMLElement>();
  const compact = size.width > 0 && size.width < COMPACT_BREAKPOINT;
  const padding = compact ? 10 : 28;

  const scaleFor = (kind: 'mobile' | 'tablet') =>
    Math.max(0.2, Math.min(1, (size.width - padding * 2) / FRAME_SIZE[kind].width, (size.height - padding * 2) / FRAME_SIZE[kind].height));

  // En un teléfono real, la vista "móvil" muestra el sitio a tamaño completo (sin marco en miniatura).
  const edgeToEdge = compact && device === 'mobile';

  return (
    <section
      ref={ref}
      aria-label={`Vista previa en ${DEVICE_LABEL[device]}`}
      className="canvas-grid relative flex h-full items-center justify-center overflow-hidden"
      style={{ padding }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${device}-${edgeToEdge}`}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className={device === 'desktop' || edgeToEdge ? 'h-full w-full' : ''}
        >
          {size.width === 0 ? null : edgeToEdge ? (
            <div className="relative h-full w-full overflow-hidden rounded-2xl border border-ui-border shadow-[0_20px_50px_-20px_rgb(0_0_0/0.6),0_0_40px_-20px_color-mix(in_oklab,var(--ui-accent)_50%,transparent)]">
              <SiteRenderer />
            </div>
          ) : device === 'desktop' ? (
            <DesktopFrame>
              <SiteRenderer />
            </DesktopFrame>
          ) : (
            <DeviceFrame kind={device} scale={scaleFor(device)}>
              <SiteRenderer />
            </DeviceFrame>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
