import { Bike, Clock, Store } from 'lucide-react';
import { useSiteBuilderStore } from '@/store/useSiteBuilderStore';
import { useDemo } from '@/hooks/useDemo';
import { formatPrice } from '@/lib/format';
import { CatalogModule } from '@/components/site/CatalogModule';
import {
  AnnouncementBar,
  BrandMark,
  ContactSection,
  Cravings,
  FeaturedItems,
  HeroActions,
  InfoModule,
  OpenStatus,
  SiteFooter,
  SiteNav,
  Testimonials,
} from '@/components/site/SiteSections';

/** Menú interactivo: pensado para gastronomía (antojos, promos, categorías fijas). */
export function InteractiveMenuTemplate() {
  const tagline = useSiteBuilderStore((s) => s.brandDetails.tagline);
  const zones = useSiteBuilderStore((s) => s.business.deliveryZones);
  const deliveryEnabled = useSiteBuilderStore((s) => s.conversion.deliveryEnabled);
  const demo = useDemo();
  const cheapest = zones.length ? Math.min(...zones.map((z) => z.cost)) : null;

  return (
    <div className="min-h-full">
      <AnnouncementBar />
      <SiteNav />

      <section aria-labelledby="hero-title" className="px-5 pt-8 @3xl:px-10 @3xl:pt-12">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-site-secondary p-6 text-site-on-secondary @3xl:p-12">
          <div className="flex flex-wrap items-center gap-3">
            <BrandMark size="lg" />
            <span className="rounded-full bg-site-bg px-2.5 py-1 text-site-fg">
              <OpenStatus />
            </span>
          </div>
          <h1 id="hero-title" className="mt-6 max-w-2xl text-4xl leading-[1.05] text-balance @3xl:text-6xl">
            {tagline}
          </h1>
          <ul className="mt-6 flex flex-wrap gap-2 text-xs font-medium">
            <li className="inline-flex items-center gap-1.5 rounded-full bg-black/10 px-3 py-1.5">
              <Clock className="size-3.5" aria-hidden="true" /> 20–35 min
            </li>
            {deliveryEnabled && cheapest !== null && (
              <li className="inline-flex items-center gap-1.5 rounded-full bg-black/10 px-3 py-1.5">
                <Bike className="size-3.5" aria-hidden="true" /> {cheapest === 0 ? 'Envío sin cargo en zona centro' : `Envío desde ${formatPrice(cheapest)}`}
              </li>
            )}
            <li className="inline-flex items-center gap-1.5 rounded-full bg-black/10 px-3 py-1.5">
              <Store className="size-3.5" aria-hidden="true" /> {demo.copy.pickupLabel || 'Retiro'} en el local
            </li>
          </ul>
          <div className="mt-8">
            <HeroActions inverted />
          </div>
        </div>
      </section>

      <Cravings />
      <FeaturedItems layout="promo" />
      <CatalogModule variant="menu" />
      <Testimonials />
      <InfoModule />
      <ContactSection />
      <SiteFooter />
    </div>
  );
}
