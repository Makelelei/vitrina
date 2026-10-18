import { useSiteBuilderStore } from '@/store/useSiteBuilderStore';
import { useDemo } from '@/hooks/useDemo';
import { ItemImage } from '@/components/site/ItemImage';
import { CatalogModule } from '@/components/site/CatalogModule';
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

/** Landing minimal: centrada, mucho aire, catálogo en lista. Sirve para cualquier rubro. */
export function MinimalLandingTemplate() {
  const tagline = useSiteBuilderStore((s) => s.brandDetails.tagline);
  const items = useSiteBuilderStore((s) => s.productsOrServices);
  const demo = useDemo();
  const featured = items.filter((i) => i.featured);
  const strip = (featured.length >= 3 ? featured : items).slice(0, 3);

  return (
    <div className="min-h-full">
      <AnnouncementBar />
      <SiteNav centered />

      <section aria-labelledby="hero-title" className="px-5 pb-14 pt-20 text-center @3xl:px-10 @3xl:pb-20 @3xl:pt-28">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-site-muted">{demo.copy.heroKicker}</p>
          <h1 id="hero-title" className="mt-6 text-4xl leading-[1.05] text-balance @md:text-5xl @3xl:text-7xl">
            {tagline}
          </h1>
          <div className="mt-10">
            <HeroActions centered />
          </div>
        </div>
        <ul aria-hidden="true" className="mx-auto mt-16 grid max-w-5xl grid-cols-3 gap-3 @3xl:mt-20 @3xl:gap-5">
          {strip.map((item, i) => (
            <li key={item.id} className={i === 1 ? '-translate-y-4 @3xl:-translate-y-8' : ''}>
              <ItemImage item={item} decorative className="aspect-[3/4] w-full rounded-xl" emojiClassName="text-5xl @3xl:text-8xl" />
            </li>
          ))}
        </ul>
      </section>

      <Highlights />
      <FeaturedItems />
      <CatalogModule variant="list" />
      <AboutSection variant="statement" />
      <Testimonials />
      <InfoModule />
      <ContactSection />
      <SiteFooter />
    </div>
  );
}
