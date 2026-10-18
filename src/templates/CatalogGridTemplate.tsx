import { useId } from 'react';
import { Search } from 'lucide-react';
import { useSiteBuilderStore } from '@/store/useSiteBuilderStore';
import { useSiteUiStore } from '@/store/useSiteUiStore';
import { useDemo } from '@/hooks/useDemo';
import { ItemImage } from '@/components/site/ItemImage';
import { CatalogModule } from '@/components/site/CatalogModule';
import { scrollToSection } from '@/components/site/SitePortalContext';
import {
  AboutSection,
  AnnouncementBar,
  CategoryTiles,
  ContactSection,
  FeaturedItems,
  Highlights,
  InfoModule,
  Lookbook,
  SiteFooter,
  SiteNav,
  Testimonials,
} from '@/components/site/SiteSections';

/** Catálogo en grilla: buscador al frente, categorías, filtros de talle/color y vista rápida. */
export function CatalogGridTemplate() {
  const tagline = useSiteBuilderStore((s) => s.brandDetails.tagline);
  const items = useSiteBuilderStore((s) => s.productsOrServices);
  const query = useSiteUiStore((s) => s.filters.query);
  const setFilter = useSiteUiStore((s) => s.setFilter);
  const demo = useDemo();
  const searchId = useId();
  const collage = [...items.filter((i) => i.featured), ...items.filter((i) => !i.featured)].slice(0, 4);

  return (
    <div className="min-h-full">
      <AnnouncementBar />
      <SiteNav />

      <section aria-labelledby="hero-title" className="px-3 pt-3 @3xl:px-5 @3xl:pt-5">
        <div className="mx-auto grid max-w-[1400px] overflow-hidden rounded-2xl bg-site-secondary text-site-on-secondary @3xl:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-12 @3xl:px-14 @3xl:py-20">
            <p className="text-xs font-medium uppercase tracking-[0.18em] opacity-75">{demo.copy.heroKicker}</p>
            <h1 id="hero-title" className="mt-5 text-4xl leading-[1.04] text-balance @md:text-5xl @5xl:text-6xl">
              {tagline}
            </h1>
            <form
              role="search"
              className="relative mt-8 max-w-md"
              onSubmit={(e) => {
                e.preventDefault();
                scrollToSection('site-catalog');
              }}
            >
              <label htmlFor={searchId} className="sr-only">
                Buscar productos
              </label>
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-site-muted" aria-hidden="true" />
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(e) => setFilter('query', e.target.value)}
                placeholder={demo.copy.searchPlaceholder}
                className="h-12 w-full rounded-full border-0 bg-site-bg pl-11 pr-28 text-sm text-site-fg placeholder:text-site-muted"
              />
              <button type="submit" className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 rounded-full bg-site-primary px-4 text-xs font-medium text-site-on-primary">
                Buscar
              </button>
            </form>
          </div>
          <ul aria-hidden="true" className="grid grid-cols-2 gap-1.5 p-1.5 @3xl:gap-2 @3xl:p-2">
            {collage.map((item) => (
              <li key={item.id}>
                <ItemImage item={item} decorative className="aspect-square h-full w-full rounded-xl bg-site-bg!" emojiClassName="text-6xl @3xl:text-8xl" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CategoryTiles />
      <Lookbook />
      <FeaturedItems />
      <CatalogModule variant="grid" />
      <Highlights />
      <Testimonials />
      <AboutSection />
      <InfoModule />
      <ContactSection />
      <SiteFooter />
    </div>
  );
}
