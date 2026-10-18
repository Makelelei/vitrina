import type { ReactNode } from 'react';

interface Props {
  id: string;
  title: string;
  kicker?: string;
  subtitle?: string;
  align?: 'left' | 'center';
  children?: ReactNode;
}

export function SectionHeading({ id, title, kicker, subtitle, align = 'left', children }: Props) {
  const centered = align === 'center';
  return (
    <header className={`mb-8 flex flex-col gap-4 ${centered ? 'items-center text-center' : '@3xl:flex-row @3xl:items-end @3xl:justify-between'}`}>
      <div className="max-w-2xl">
        {kicker && <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-site-muted">{kicker}</p>}
        <h2 id={id} className="text-3xl text-balance @3xl:text-4xl">
          {title}
        </h2>
        {subtitle && <p className="mt-2 text-site-muted">{subtitle}</p>}
      </div>
      {children}
    </header>
  );
}

/** Contenedor estándar de sección del sitio. */
export function SiteSection({ id, labelledBy, label, spot, className = '', children }: { id?: string; labelledBy?: string; label?: string; /** Nombre para el foco en vivo del editor. */ spot?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} data-spotlight={spot} aria-labelledby={labelledBy} aria-label={label} className={`scroll-mt-14 px-5 py-14 @3xl:px-10 @3xl:py-20 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}
