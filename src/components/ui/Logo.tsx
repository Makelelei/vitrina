import { useId } from 'react';

/** Isotipo + logotipo de Vitrina. */
export function Logo({ showText = true }: { showText?: boolean }) {
  // Id único por instancia: si dos logos comparten id y uno está oculto, el degradado no se pinta.
  const gradientId = useId();
  return (
    <span className="inline-flex shrink-0 items-center gap-2">
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--ui-accent)" />
            <stop offset="1" stopColor="var(--ui-accent-2)" />
          </linearGradient>
        </defs>
        <rect x="3" y="4" width="18" height="16" rx="3" fill="none" stroke={`url(#${gradientId})`} strokeWidth="1.8" />
        <path d="M3 9.5h18M9 9.5V20" stroke={`url(#${gradientId})`} strokeWidth="1.8" />
      </svg>
      {showText ? (
        <span className="text-[15px] font-semibold tracking-tight">
          vitrina<span className="font-normal text-ui-muted"> studio</span>
        </span>
      ) : (
        <span className="sr-only">Vitrina Studio</span>
      )}
    </span>
  );
}
