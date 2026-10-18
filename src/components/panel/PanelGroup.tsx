import type { ReactNode } from 'react';
import { useSiteUiStore } from '@/store/useSiteUiStore';

interface Props {
  title: string;
  description?: string;
  action?: ReactNode;
  /** Parte del sitio que se muestra en la vista previa al interactuar con el grupo. */
  focus?: string;
  children: ReactNode;
}

/** Bloque del panel con título discreto y separador superior. */
export function PanelGroup({ title, description, action, focus, children }: Props) {
  const focusPreview = useSiteUiStore((s) => s.focusPreview);
  const show = focus ? () => focusPreview(focus) : undefined;

  return (
    <section onFocusCapture={show} onPointerDownCapture={show} className="border-t border-ui-border px-4 py-5 first:border-t-0">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xs font-semibold text-ui-fg">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-ui-muted">{description}</p>}
        </div>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
