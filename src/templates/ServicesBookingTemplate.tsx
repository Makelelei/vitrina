import { useMemo } from 'react';
import { CalendarClock } from 'lucide-react';
import { useSiteBuilderStore } from '@/store/useSiteBuilderStore';
import { useConversionMode, useDemo } from '@/hooks/useDemo';
import { nextAvailable, relativeDay } from '@/lib/schedule';
import { CatalogModule } from '@/components/site/CatalogModule';
import { SiteSection } from '@/components/site/SectionHeading';
import {
  AboutSection,
  AnnouncementBar,
  ContactSection,
  FeaturedItems,
  Highlights,
  HeroActions,
  InfoModule,
  SiteFooter,
  SiteNav,
  Testimonials,
} from '@/components/site/SiteSections';

/** Servicios y turnos: lista de servicios con reserva en pocos pasos. */
export function ServicesBookingTemplate() {
  const tagline = useSiteBuilderStore((s) => s.brandDetails.tagline);
  const hours = useSiteBuilderStore((s) => s.business.hours);
  const demo = useDemo();
  const mode = useConversionMode();
  const next = useMemo(() => (mode === 'booking' ? nextAvailable(hours) : null), [hours, mode]);

  const steps = [
    ['01', 'Elegí el servicio', 'Precios y duración a la vista.'],
    ['02', mode === 'booking' ? 'Reservá día y horario' : 'Escribinos', mode === 'booking' ? 'Solo ves los horarios libres.' : 'Te respondemos en minutos.'],
    ['03', 'Confirmamos por WhatsApp', 'Te recordamos el turno el día anterior.'],
  ];

  return (
    <div className="min-h-full">
      <AnnouncementBar />
      <SiteNav />

      <section aria-labelledby="hero-title" className="px-5 pb-12 pt-16 @3xl:px-10 @3xl:pb-16 @3xl:pt-24">
        <div className="mx-auto grid max-w-6xl gap-10 @3xl:grid-cols-[1.3fr_1fr] @3xl:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-site-muted">{demo.copy.heroKicker}</p>
            <h1 id="hero-title" className="mt-5 text-5xl leading-[1] text-balance @3xl:text-7xl">
              {tagline}
            </h1>
            <div className="mt-10">
              <HeroActions />
            </div>
          </div>
          {next && (
            <div className="rounded-2xl border border-site-border bg-site-surface p-6">
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-site-muted">
                <CalendarClock className="size-4 text-site-primary-ink" aria-hidden="true" />
                Próximo turno libre
              </p>
              <p className="mt-3 text-3xl first-letter:uppercase">
                {relativeDay(next.date)} · <span className="tabular-nums">{next.time}</span>
              </p>
              <p className="mt-1 text-sm text-site-muted">Reservá online en menos de un minuto.</p>
            </div>
          )}
        </div>
      </section>

      <Highlights />
      <FeaturedItems />
      <CatalogModule variant="services" />

      <SiteSection label="Cómo funciona">
        <ol className="grid gap-8 border-t border-site-border pt-10 @3xl:grid-cols-3">
          {steps.map(([n, title, text]) => (
            <li key={n}>
              <span className="font-mono text-sm text-site-primary-ink">{n}</span>
              <p className="mt-2 text-lg font-medium">{title}</p>
              <p className="mt-1 text-sm text-site-muted">{text}</p>
            </li>
          ))}
        </ol>
      </SiteSection>

      <Testimonials />
      <AboutSection variant="statement" />
      <InfoModule />
      <ContactSection />
      <SiteFooter />
    </div>
  );
}
