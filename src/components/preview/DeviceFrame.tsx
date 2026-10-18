import type { ReactNode } from 'react';
import { slugify } from '@/lib/format';
import { useSiteBuilderStore } from '@/store/useSiteBuilderStore';
import { useElementSize } from '@/hooks/useElementSize';

/** Medidas del marco completo (pantalla + bisel). */
export const FRAME_SIZE = {
  mobile: { width: 406, height: 836 },
  tablet: { width: 852, height: 1140 },
} as const;

/** Ancho mínimo con el que se renderiza la vista de escritorio (se escala si no entra). */
const DESKTOP_MIN_WIDTH = 1280;

/** Teléfono o tablet escalados para entrar en el lienzo. */
export function DeviceFrame({ kind, scale, children }: { kind: 'mobile' | 'tablet'; scale: number; children: ReactNode }) {
  const size = FRAME_SIZE[kind];
  const phone = kind === 'mobile';
  return (
    <div style={{ width: size.width * scale, height: size.height * scale }}>
      <div
        className={`relative origin-top-left bg-[#141418] shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_40px_80px_-24px_rgb(0_0_0/0.6),0_0_60px_-20px_color-mix(in_oklab,var(--ui-accent)_40%,transparent)] ${phone ? 'rounded-[3rem] p-2' : 'rounded-[2.25rem] p-4'}`}
        style={{ width: size.width, height: size.height, transform: `scale(${scale})` }}
      >
        <div className={`relative flex h-full flex-col overflow-hidden bg-black ${phone ? 'rounded-[2.5rem]' : 'rounded-[1.4rem]'}`}>
          <StatusBar phone={phone} />
          <div className="relative min-h-0 flex-1">{children}</div>
        </div>
        {!phone && <span aria-hidden="true" className="absolute left-1/2 top-1.5 size-1.5 -translate-x-1/2 rounded-full bg-white/15" />}
      </div>
    </div>
  );
}

function StatusBar({ phone }: { phone: boolean }) {
  return (
    <div aria-hidden="true" className={`relative z-30 flex shrink-0 items-center justify-between bg-black text-[11px] font-semibold text-white ${phone ? 'h-10 px-8' : 'h-7 px-6'}`}>
      <span>9:41</span>
      {phone && <span className="absolute left-1/2 top-2 h-6 w-24 -translate-x-1/2 rounded-full bg-[#0a0a0a]" />}
      <span className="flex items-center gap-1">
        <span className="h-2 w-3 rounded-[2px] bg-white/90" />
        <span className="h-2.5 w-5 rounded-[3px] border border-white/80 p-px">
          <span className="block h-full w-3/4 rounded-[1px] bg-white" />
        </span>
      </span>
    </div>
  );
}

/**
 * Ventana de navegador. Si el lienzo es más angosto que un escritorio real,
 * el sitio se renderiza a 1280 px y se escala, para mostrar el diseño de verdad.
 */
export function DesktopFrame({ children }: { children: ReactNode }) {
  const brandName = useSiteBuilderStore((s) => s.brandDetails.name);
  const [ref, size] = useElementSize<HTMLDivElement>();
  const scale = size.width > 0 && size.width < DESKTOP_MIN_WIDTH ? size.width / DESKTOP_MIN_WIDTH : 1;

  return (
    <div className="glass flex h-full w-full flex-col overflow-hidden rounded-xl border shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)]">
      <div aria-hidden="true" className="flex h-9 shrink-0 items-center gap-3 border-b border-ui-border px-3">
        <div className="flex shrink-0 gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-auto min-w-0 max-w-sm flex-1 truncate rounded-md bg-ui-subtle px-3 py-1 text-center text-[11px] text-ui-muted">
          {slugify(brandName)}.vitrina.app
        </div>
        <span className="hidden w-10 sm:block" />
      </div>
      <div ref={ref} className="relative min-h-0 flex-1 overflow-hidden">
        {size.width > 0 &&
          (scale === 1 ? (
            children
          ) : (
            <div
              className="absolute left-0 top-0 origin-top-left"
              style={{ width: DESKTOP_MIN_WIDTH, height: size.height / scale, transform: `scale(${scale})` }}
            >
              {children}
            </div>
          ))}
      </div>
    </div>
  );
}
