import { useEffect, useId, useMemo } from 'react';
import { ArrowRight, ArrowUpRight, ShoppingBag, X } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useSiteBuilderStore } from '@/store/useSiteBuilderStore';
import { useSiteUiStore } from '@/store/useSiteUiStore';
import { useCartStore } from '@/store/useCartStore';
import { useDemo } from '@/hooks/useDemo';
import { useCart } from '@/hooks/useCart';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { isOpenNow, weekFromMonday } from '@/lib/schedule';
import { formatPrice } from '@/lib/format';
import type { SectionKey } from '@/types';
import { ItemImage } from './ItemImage';
import { ItemAction } from './ItemAction';
import { PriceTag, PromoBadge } from './PriceTag';
import { SectionHeading, SiteSection } from './SectionHeading';
import { scrollToSection } from './SitePortalContext';
import { Carousel } from './Carousel';

const NEW_TAB = <span className="sr-only">(abre en una pestaña nueva)</span>;

/** ¿La sección está activa y el rubro la soporta? */
export function useSectionOn(key: SectionKey) {
  const visible = useSiteBuilderStore((s) => s.sections[key]);
  const demo = useDemo();
  return visible && demo.supports.includes(key);
}

/* ---------- Anuncio superior (descartable) ---------- */
export function AnnouncementBar() {
  const { enabled, text } = useSiteBuilderStore((s) => s.announcement);
  const dismissed = useSiteUiStore((s) => s.announcementDismissed);
  const setDismissed = useSiteUiStore((s) => s.setAnnouncementDismissed);

  // Al editar el texto vuelve a mostrarse.
  useEffect(() => setDismissed(false), [text, setDismissed]);

  if (!enabled || dismissed || !text.trim()) return null;
  return (
    <aside aria-label="Anuncio" className="relative bg-site-primary px-10 py-2 text-center text-xs font-medium tracking-wide text-site-on-primary">
      {text}
      <button type="button" onClick={() => setDismissed(true)} aria-label="Cerrar anuncio" className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full hover:bg-black/15">
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </aside>
  );
}

/* ---------- Marca: logo o nombre ---------- */
export function BrandMark({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const { name, logoUrl } = useSiteBuilderStore(useShallow((s) => ({ name: s.brandDetails.name, logoUrl: s.brandDetails.logoUrl })));
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      {logoUrl && <img src={logoUrl} alt="" className={`${size === 'lg' ? 'size-14' : 'size-8'} shrink-0 rounded-md object-contain`} />}
      <span className={`truncate font-semibold tracking-tight ${size === 'lg' ? 'text-2xl' : 'text-base'}`}>{name}</span>
    </span>
  );
}

/* ---------- Navegación ---------- */
export function SiteNav({ centered = false }: { centered?: boolean }) {
  const sections = useSiteBuilderStore((s) => s.sections);
  const demo = useDemo();
  const { count } = useCart();
  const openCart = useCartStore((s) => s.setOpen);
  const links = [
    { id: 'site-catalog', label: demo.copy.navCatalog, show: true },
    { id: 'site-about', label: 'Nosotros', show: sections.about },
    { id: 'site-info', label: 'Visitanos', show: sections.hours || sections.map },
    { id: 'site-contact', label: 'Contacto', show: sections.contact },
  ].filter((l) => l.show);

  return (
    <header className="sticky top-0 z-20 border-b border-site-border bg-site-bg/90 backdrop-blur">
      <nav aria-label="Principal" className={`mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 @3xl:px-10 ${centered ? '@3xl:grid @3xl:grid-cols-[1fr_auto_1fr]' : ''}`}>
        {centered && <NavLinks links={links} />}
        <BrandMark />
        <div className="flex items-center justify-end gap-4">
          {!centered && <NavLinks links={links} />}
          {demo.mode === 'order' ? (
            <button type="button" onClick={() => openCart(true)} aria-label={`Abrir ${demo.copy.cartTitle.toLowerCase()}, ${count} productos`} className="relative grid size-9 place-items-center rounded-full border border-site-border hover:bg-site-surface-2">
              <ShoppingBag className="size-4" aria-hidden="true" />
              {count > 0 && <span aria-hidden="true" className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-site-primary text-[10px] font-semibold text-site-on-primary">{count}</span>}
            </button>
          ) : (
            <button type="button" onClick={() => scrollToSection('site-catalog')} className="inline-flex h-8 shrink-0 items-center rounded-full bg-site-fg px-4 text-xs font-medium text-site-bg">
              {demo.copy.heroCta}
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}

function NavLinks({ links }: { links: { id: string; label: string }[] }) {
  return (
    <ul className="hidden items-center gap-6 text-sm @3xl:flex">
      {links.map((l) => (
        <li key={l.id}>
          <button type="button" onClick={() => scrollToSection(l.id)} className="text-site-muted transition-colors hover:text-site-fg">
            {l.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Botones del hero ---------- */
export function HeroActions({ centered = false, inverted = false }: { centered?: boolean; inverted?: boolean }) {
  const { name, whatsapp } = useSiteBuilderStore(useShallow((s) => ({ name: s.brandDetails.name, whatsapp: s.brandDetails.whatsapp })));
  const demo = useDemo();
  return (
    <div className={`flex flex-wrap items-center gap-x-6 gap-y-3 ${centered ? 'justify-center' : ''}`}>
      <button
        type="button"
        onClick={() => scrollToSection('site-catalog')}
        className={`inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-medium transition-opacity hover:opacity-90 ${inverted ? 'bg-site-on-secondary text-site-secondary' : 'bg-site-primary text-site-on-primary'}`}
      >
        {demo.copy.heroCta}
        <ArrowRight className="size-4" aria-hidden="true" />
      </button>
      <a href={buildWhatsAppUrl(whatsapp, `¡Hola ${name}! Quería hacerles una consulta.`)} target="_blank" rel="noopener noreferrer" className="text-sm font-medium underline decoration-1 underline-offset-[6px] hover:decoration-2">
        Escribinos por WhatsApp
        {NEW_TAB}
      </a>
    </div>
  );
}

/* ---------- Estado abierto / cerrado ---------- */
export function OpenStatus() {
  const hours = useSiteBuilderStore((s) => s.business.hours);
  const open = useMemo(() => isOpenNow(hours), [hours]);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span aria-hidden="true" className={`size-1.5 rounded-full ${open ? 'bg-emerald-500' : 'bg-site-muted'}`} />
      {open ? 'Abierto ahora' : 'Cerrado ahora'}
    </span>
  );
}

/* ---------- Beneficios ---------- */
export function Highlights() {
  const on = useSectionOn('highlights');
  const demo = useDemo();
  if (!on) return null;
  return (
    <section aria-label="Por qué elegirnos" className="px-5 @3xl:px-10">
      <ul className="mx-auto grid max-w-6xl divide-y divide-site-border border-y border-site-border @3xl:grid-cols-3 @3xl:divide-x @3xl:divide-y-0">
        {demo.highlights.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-4 py-6 @3xl:px-8 @3xl:first:pl-0">
            <Icon className="mt-0.5 size-5 shrink-0 text-site-primary-ink" strokeWidth={1.5} aria-hidden="true" />
            <div>
              <p className="font-medium">{title}</p>
              <p className="mt-0.5 text-sm text-site-muted">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- Destacados / promos ---------- */
const COLS: Record<number, string> = { 1: '@3xl:grid-cols-2', 2: '@3xl:grid-cols-2', 3: '@3xl:grid-cols-3', 4: '@3xl:grid-cols-4' };

export function FeaturedItems({ layout = 'row' }: { layout?: 'row' | 'promo' }) {
  const on = useSectionOn('featured');
  const items = useSiteBuilderStore((s) => s.productsOrServices);
  const demo = useDemo();
  const titleId = useId();
  const featured = items.filter((i) => i.featured).slice(0, 4);
  if (!on || featured.length === 0) return null;

  return (
    <SiteSection labelledBy={titleId}>
      <SectionHeading id={titleId} title={demo.copy.featuredTitle}>
        <button type="button" onClick={() => scrollToSection('site-catalog')} className="inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline">
          Ver todo <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </SectionHeading>
      {layout === 'promo' ? (
        <Carousel label={demo.copy.featuredTitle} className="-mx-5 scroll-px-5 gap-4 px-5 pb-1 @3xl:mx-0 @3xl:grid @3xl:grid-cols-3 @3xl:px-0">
          {featured.slice(0, 3).map((item) => (
            <li key={item.id} className="w-[80%] max-w-80 shrink-0 snap-start @3xl:w-auto @3xl:max-w-none">
              <article className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-site-secondary text-site-on-secondary">
                <ItemImage item={item} className="aspect-[16/10] w-full" emojiClassName="text-8xl" />
                <div className="absolute left-3 top-3"><PromoBadge item={item} /></div>
                <div className="flex flex-1 flex-col gap-1 p-5">
                  <h3 className="text-xl">{item.title}</h3>
                  <p className="text-sm opacity-80">{item.description}</p>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <PriceTag item={item} className="text-lg font-semibold" />
                    <ItemAction item={item} />
                  </div>
                </div>
              </article>
            </li>
          ))}
        </Carousel>
      ) : (
        <Carousel label={demo.copy.featuredTitle} className={`-mx-5 scroll-px-5 gap-4 px-5 pb-1 @3xl:mx-0 @3xl:grid @3xl:px-0 ${COLS[featured.length]}`}>
          {featured.map((item) => (
            <li key={item.id} className="w-[62%] max-w-64 shrink-0 snap-start @3xl:w-auto @3xl:max-w-none">
              <article className="group">
                <div className="overflow-hidden rounded-lg">
                  <ItemImage item={item} className="aspect-square w-full transition-transform duration-700 group-hover:scale-[1.03]" emojiClassName="text-6xl" />
                </div>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base">{item.title}</h3>
                    <PriceTag item={item} className="text-sm text-site-muted" />
                  </div>
                  <ItemAction item={item} />
                </div>
              </article>
            </li>
          ))}
        </Carousel>
      )}
    </SiteSection>
  );
}

/* ---------- Antojos (gastronomía) ---------- */
export function Cravings() {
  const on = useSectionOn('cravings');
  const demo = useDemo();
  const tag = useSiteUiStore((s) => s.filters.tag);
  const setFilter = useSiteUiStore((s) => s.setFilter);
  const titleId = useId();
  if (!on || !demo.cravings?.length) return null;

  return (
    <section aria-labelledby={titleId} className="px-5 pb-4 pt-12 @3xl:px-10">
      <div className="mx-auto max-w-6xl">
        <h2 id={titleId} className="mb-4 text-xl">¿Qué se te antoja?</h2>
        <Carousel as="div" role="group" label="Filtrar por antojo" className="-mx-5 scroll-px-5 gap-3 px-5 pb-1">
          {demo.cravings.map((c) => {
            const selected = tag === c.tag;
            return (
              <button
                key={c.tag}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setFilter('tag', selected ? null : c.tag);
                  if (!selected) setTimeout(() => scrollToSection('site-catalog'), 50);
                }}
                className={`flex w-28 shrink-0 snap-start flex-col items-center gap-2 rounded-2xl border p-4 transition-all hover:-translate-y-0.5 ${
                  selected ? 'border-site-primary bg-site-primary text-site-on-primary' : 'border-site-border bg-site-surface hover:border-site-fg'
                }`}
              >
                <span aria-hidden="true" className="text-4xl">{c.emoji}</span>
                <span className="text-xs font-medium">{c.label}</span>
              </button>
            );
          })}
        </Carousel>
      </div>
    </section>
  );
}

/* ---------- Categorías en rejilla (comercio) ---------- */
export function CategoryTiles() {
  const on = useSectionOn('categoryTiles');
  const { categories, items } = useSiteBuilderStore(useShallow((s) => ({ categories: s.categories, items: s.productsOrServices })));
  const setFilter = useSiteUiStore((s) => s.setFilter);
  const titleId = useId();
  if (!on) return null;

  return (
    <SiteSection labelledBy={titleId} className="pb-0!">
      <h2 id={titleId} className="sr-only">Categorías</h2>
      <ul className="grid grid-cols-2 gap-3 @3xl:grid-cols-4">
        {categories.map((c) => {
          const count = items.filter((i) => i.category === c.id).length;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => {
                  setFilter('category', c.id);
                  scrollToSection('site-catalog');
                }}
                className="group flex w-full items-center justify-between gap-2 rounded-xl bg-site-secondary p-3.5 text-left text-site-on-secondary transition-transform hover:-translate-y-0.5 @md:p-4"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{c.label}</span>
                  <span className="text-xs opacity-75">{count} {count === 1 ? 'ítem' : 'ítems'}</span>
                </span>
                <span aria-hidden="true" className="shrink-0 text-2xl transition-transform group-hover:scale-110 @md:text-3xl">{c.emoji ?? '✨'}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </SiteSection>
  );
}

/* ---------- Lookbook (moda) ---------- */
export function Lookbook() {
  const on = useSectionOn('lookbook');
  const items = useSiteBuilderStore((s) => s.productsOrServices);
  const setQuickView = useSiteUiStore((s) => s.setQuickView);
  const titleId = useId();
  const looks = items.filter((i) => i.featured).slice(0, 3);
  if (!on || looks.length < 2) return null;

  return (
    <SiteSection labelledBy={titleId}>
      <SectionHeading id={titleId} kicker="Lookbook" title="Cómo lo usamos" />
      <ul className="grid gap-3 @3xl:grid-cols-[1.4fr_1fr] @3xl:grid-rows-2">
        {looks.map((item, i) => (
          <li key={item.id} className={i === 0 ? '@3xl:row-span-2' : ''}>
            <button type="button" onClick={() => setQuickView(item.id)} aria-haspopup="dialog" className="group relative block h-full w-full overflow-hidden rounded-xl text-left">
              <ItemImage item={item} decorative className={`w-full transition-transform duration-700 group-hover:scale-[1.03] ${i === 0 ? 'aspect-[4/5] @3xl:h-full @3xl:aspect-auto' : 'aspect-[16/10]'}`} emojiClassName={i === 0 ? 'text-9xl' : 'text-7xl'} />
              <span className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-lg bg-site-bg/90 px-3 py-2 text-sm backdrop-blur">
                <span className="font-medium">{item.title}</span>
                <span className="inline-flex items-center gap-1 text-xs text-site-muted">Ver producto <ArrowUpRight className="size-3.5" aria-hidden="true" /></span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </SiteSection>
  );
}

/* ---------- Nosotros ---------- */
export function AboutSection({ variant = 'split' }: { variant?: 'split' | 'statement' }) {
  const on = useSectionOn('about');
  const about = useSiteBuilderStore((s) => s.brandDetails.about);
  const items = useSiteBuilderStore((s) => s.productsOrServices);
  const demo = useDemo();
  const titleId = useId();
  if (!on || !about.trim()) return null;

  if (variant === 'statement') {
    return (
      <section id="site-about" aria-labelledby={titleId} className="scroll-mt-14 bg-site-surface px-5 py-20 @3xl:px-10 @3xl:py-28">
        <div className="mx-auto max-w-4xl">
          <h2 id={titleId} className="mb-6 text-xs font-medium! uppercase tracking-[0.18em]! text-site-muted">{demo.copy.aboutTitle}</h2>
          <p className="text-2xl font-light leading-snug tracking-tight text-balance @3xl:text-4xl">{about}</p>
        </div>
      </section>
    );
  }

  const visual = items[1] ?? items[0];
  return (
    <SiteSection id="site-about" labelledBy={titleId}>
      <div className="grid items-center gap-10 @3xl:grid-cols-2 @3xl:gap-16">
        {visual && <ItemImage item={visual} decorative className="aspect-[5/4] w-full rounded-xl" emojiClassName="text-9xl" />}
        <div>
          <SectionHeading id={titleId} title={demo.copy.aboutTitle} />
          <p className="-mt-2 text-lg leading-relaxed text-site-muted">{about}</p>
        </div>
      </div>
    </SiteSection>
  );
}

/* ---------- Testimonios ---------- */
export function Testimonials() {
  const on = useSectionOn('testimonials');
  const demo = useDemo();
  const titleId = useId();
  if (!on) return null;
  return (
    <SiteSection labelledBy={titleId}>
      <SectionHeading id={titleId} title={demo.copy.testimonialsTitle} />
      <ul className="grid gap-px overflow-hidden rounded-xl border border-site-border bg-site-border @3xl:grid-cols-3">
        {demo.testimonials.map((t) => (
          <li key={t.author} className="bg-site-bg p-6 @3xl:p-8">
            <figure className="flex h-full flex-col justify-between gap-6">
              <blockquote className="text-pretty leading-relaxed">“{t.quote}”</blockquote>
              <figcaption className="text-sm">
                <span className="font-medium">{t.author}</span>
                <span className="text-site-muted"> · {t.detail}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </SiteSection>
  );
}

/* ---------- Horarios, envíos y ubicación ---------- */
export function InfoModule() {
  const { sections, business, brand, deliveryEnabled } = useSiteBuilderStore(
    useShallow((s) => ({ sections: s.sections, business: s.business, brand: s.brandDetails, deliveryEnabled: s.conversion.deliveryEnabled })),
  );
  const demo = useDemo();
  const titleId = useId();
  const today = new Date().getDay();
  const showHours = sections.hours;
  const showDelivery = sections.delivery && deliveryEnabled && demo.supports.includes('delivery') && business.deliveryZones.length > 0;
  if (!showHours && !showDelivery && !sections.map) return null;

  const { lat, lng } = business;
  const d = 0.006;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d}%2C${lat - d}%2C${lng + d}%2C${lat + d}&layer=mapnik&marker=${lat}%2C${lng}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${brand.address}, ${brand.city}`)}`;

  return (
    <SiteSection id="site-info" labelledBy={titleId}>
      <SectionHeading id={titleId} title="Visitanos" />
      <div className="grid gap-10 @3xl:grid-cols-2 @3xl:gap-16">
        <div className="space-y-10">
          {showHours && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-medium! uppercase tracking-[0.18em]! text-site-muted">Horarios</h3>
                <OpenStatus />
              </div>
              <dl className="divide-y divide-site-border border-y border-site-border text-sm">
                {weekFromMonday(business.hours).map((h) => (
                  <div key={h.day} className={`flex justify-between py-2.5 ${h.day === today ? 'font-medium' : ''}`}>
                    <dt>
                      {h.label}
                      {h.day === today && <span className="sr-only"> (hoy)</span>}
                    </dt>
                    <dd className={h.closed ? 'text-site-muted' : 'tabular-nums'}>{h.closed ? 'Cerrado' : `${h.open} – ${h.close}`}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {showDelivery && (
            <div>
              <h3 className="mb-3 text-xs font-medium! uppercase tracking-[0.18em]! text-site-muted">{demo.copy.deliveryLabel}</h3>
              <ul className="divide-y divide-site-border border-y border-site-border text-sm">
                {business.deliveryZones.map((z) => (
                  <li key={z.id} className="flex items-center justify-between gap-3 py-2.5">
                    <span>
                      {z.name}
                      <span className="text-site-muted"> · {z.eta}</span>
                    </span>
                    <span className="tabular-nums">{z.cost === 0 ? 'Sin cargo' : formatPrice(z.cost)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {sections.map && (
          <div>
            <div className="overflow-hidden rounded-xl border border-site-border">
              <iframe title={`Mapa de ubicación de ${brand.name}`} src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-72 w-full border-0 grayscale transition-[filter] duration-500 hover:grayscale-0" />
            </div>
            <div className="mt-4 flex items-start justify-between gap-4 text-sm">
              <p>
                {brand.address}
                <br />
                <span className="text-site-muted">{brand.city}</span>
              </p>
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1 font-medium underline-offset-4 hover:underline">
                Cómo llegar <ArrowUpRight className="size-4" aria-hidden="true" />
                {NEW_TAB}
              </a>
            </div>
          </div>
        )}
      </div>
    </SiteSection>
  );
}

/* ---------- Contacto ---------- */
export function ContactSection() {
  const on = useSectionOn('contact');
  const { name, whatsapp } = useSiteBuilderStore(useShallow((s) => ({ name: s.brandDetails.name, whatsapp: s.brandDetails.whatsapp })));
  const demo = useDemo();
  const titleId = useId();
  if (!on) return null;

  return (
    <section id="site-contact" aria-labelledby={titleId} className="scroll-mt-14 px-5 pb-14 @3xl:px-10 @3xl:pb-20">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 rounded-2xl bg-site-primary px-6 py-10 text-site-on-primary @3xl:flex-row @3xl:items-center @3xl:justify-between @3xl:px-12 @3xl:py-14">
        <div className="max-w-xl">
          <h2 id={titleId} className="text-2xl @3xl:text-3xl">{demo.copy.contactTitle}</h2>
          <p className="mt-2 opacity-85">{demo.copy.contactText}</p>
        </div>
        <a href={buildWhatsAppUrl(whatsapp, `¡Hola ${name}! ${demo.copy.contactTitle}`)} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-site-on-primary px-6 text-sm font-medium text-site-primary">
          {demo.copy.contactCta}
          <ArrowUpRight className="size-4" aria-hidden="true" />
          {NEW_TAB}
        </a>
      </div>
    </section>
  );
}

/* ---------- Pie ---------- */
export function SiteFooter() {
  const brand = useSiteBuilderStore((s) => s.brandDetails);
  return (
    <footer className="border-t border-site-border px-5 pb-28 pt-12 @3xl:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 text-sm @3xl:flex-row @3xl:justify-between">
        <div>
          <BrandMark />
          <p className="mt-2 max-w-xs text-site-muted">{brand.tagline}</p>
        </div>
        <p className="text-site-muted @3xl:text-right">
          {brand.address}
          <br />
          {brand.city}
        </p>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-xs text-site-muted">
        © {new Date().getFullYear()} {brand.name} · Hecho con Vitrina
      </p>
    </footer>
  );
}
