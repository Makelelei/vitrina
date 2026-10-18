import type { ReactNode } from 'react';

interface Props {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

/** Bloque del panel con título discreto y separador superior. */
export function PanelGroup({ title, description, action, children }: Props) {
  return (
    <section className="border-t border-ui-border px-4 py-5 first:border-t-0">
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
