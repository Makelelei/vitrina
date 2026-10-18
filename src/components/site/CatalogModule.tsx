import { useId } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Eye, Search, X } from 'lucide-react';
import { useCatalogFilter } from '@/hooks/useCatalogFilter';
import { useDemo } from '@/hooks/useDemo';
import { ALL, useSiteUiStore } from '@/store/useSiteUiStore';
import type { CatalogItem } from '@/types';
import { ItemImage } from './ItemImage';
import { ItemAction } from './ItemAction';
import { PriceTag, PromoBadge } from './PriceTag';
import { SectionHeading } from './SectionHeading';
import { Carousel } from './Carousel';

export type CatalogVariant = 'menu' | 'grid' | 'list' | 'services';

interface Props {
  variant: CatalogVariant;
  align?: 'left' | 'center';
}

export function CatalogModule({ variant, align = 'left' }: Props) {
  const demo = useDemo();
  const { filters, setFilter, clearFilters, filtered, groups, counts, facets, categories, active } = useCatalogFilter();
  const titleId = useId();
  const searchId = useId();
  const showFacets = variant === 'grid' && (facets.sizes.length > 0 || facets.colors.length > 0);
  const craving = demo.cravings?.find((c) => c.tag === filters.tag);

  const chip = (selected: boolean) =>
    `relative shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors ${selected ? 'text-site-bg' : 'text-site-muted hover:text-site-fg'}`;

  return (
    <section id="site-catalog" aria-labelledby={titleId} className="scroll-mt-14 px-5 py-14 @3xl:px-10 @3xl:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading id={titleId} title={demo.copy.catalogTitle} subtitle={demo.copy.catalogSubtitle} align={align} />

        {/* Barra de filtros fija */}
        <div className="sticky top-14 z-10 -mx-5 mb-8 space-y-3 border-b border-site-border bg-site-bg/95 px-5 py-3 backdrop-blur @3xl:mx-0 @3xl:px-0">
          <div className={`flex flex-col gap-3 @3xl:flex-row @3xl:items-center ${align === 'center' ? '@3xl:justify-center' : '@3xl:justify-between'}`}>
            <Carousel as="div" role="group" label="Filtrar por categoría" free className="-mx-5 gap-1 px-5 @3xl:mx-0 @3xl:px-0">
              {[{ id: ALL, label: 'Todo', emoji: undefined }, ...categories.filter((c) => counts[c.id])].map((c) => {
                const selected = filters.category === c.id;
                return (
                  <button key={c.id} type="button" aria-pressed={selected} onClick={() => setFilter('category', c.id)} className={chip(selected)}>
                    {selected && <motion.span layoutId="catalog-cat" aria-hidden="true" className="absolute inset-0 rounded-full bg-site-fg" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                    <span className="relative">
                      {variant === 'menu' && c.emoji && <span aria-hidden="true">{c.emoji} </span>}
                      {c.label}
                      <span className="ml-1 text-xs opacity-60">{counts[c.id] ?? 0}</span>
                    </span>
                  </button>
                );
              })}
            </Carousel>
            <div className="relative @3xl:w-64">
              <label htmlFor={searchId} className="sr-only">
                Buscar en {demo.copy.catalogTitle.toLowerCase()}
              </label>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-site-muted" aria-hidden="true" />
              <input
                id={searchId}
                type="search"
                value={filters.query}
                onChange={(e) => setFilter('query', e.target.value)}
                placeholder={demo.copy.searchPlaceholder}
                autoComplete="off"
                className="w-full rounded-full border border-site-border bg-site-surface py-2 pl-9 pr-8 text-sm text-site-fg placeholder:text-site-muted [&::-webkit-search-cancel-button]:hidden"
              />
              {filters.query && (
                <button type="button" onClick={() => setFilter('query', '')} aria-label="Limpiar búsqueda" className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-site-muted hover:text-site-fg">
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {showFacets && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {facets.sizes.length > 0 && (
                <Carousel as="div" role="group" label="Filtrar por talle" free className="-mx-5 items-center gap-1 px-5 @3xl:mx-0 @3xl:px-0">
                  <span className="mr-1 text-xs text-site-muted">Talle</span>
                  {facets.sizes.slice(0, 12).map((s) => {
                    const selected = filters.size === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setFilter('size', selected ? null : s)}
                        className={`min-w-8 shrink-0 rounded-md border px-2 py-1 text-xs tabular-nums ${selected ? 'border-site-fg bg-site-fg text-site-bg' : 'border-site-border hover:border-site-fg'}`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </Carousel>
              )}
              {facets.colors.length > 0 && (
                <div role="group" aria-label="Filtrar por color" className="flex items-center gap-1.5">
                  <span className="mr-1 text-xs text-site-muted">Color</span>
                  {facets.colors.map((c) => {
                    const selected = filters.color === c.label;
                    return (
                      <button
                        key={c.label}
                        type="button"
                        aria-pressed={selected}
                        aria-label={c.label}
                        title={c.label}
                        onClick={() => setFilter('color', selected ? null : c.label)}
                        className={`grid size-6 place-items-center rounded-full border-2 ${selected ? 'border-site-fg' : 'border-transparent'}`}
                      >
                        <span aria-hidden="true" className="size-4 rounded-full ring-1 ring-black/15" style={{ background: c.swatch }} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {(craving || (active && filters.category === ALL && (filters.size || filters.color))) && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {craving && (
                <button type="button" onClick={() => setFilter('tag', null)} className="inline-flex items-center gap-1 rounded-full bg-site-primary px-2.5 py-1 text-site-on-primary">
                  {craving.emoji} {craving.label}
                  <X className="size-3" aria-hidden="true" />
                  <span className="sr-only">: quitar filtro</span>
                </button>
              )}
              <button type="button" onClick={clearFilters} className="text-site-muted underline underline-offset-4 hover:text-site-fg">
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        <p className="sr-only" aria-live="polite">
          {filtered.length === 1 ? '1 resultado' : `${filtered.length} resultados`}
        </p>

        {groups.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-site-muted">No encontramos resultados con esos filtros.</p>
            <button type="button" onClick={clearFilters} className="mt-3 text-sm font-medium underline underline-offset-4">
              Ver todo
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {groups.map((group) => (
              <div key={group.category.id} id={`site-cat-${group.category.id}`} className="scroll-mt-44">
                {(filters.category === ALL || groups.length > 1) && (
                  <h3 className={`mb-5 text-xs font-medium uppercase tracking-[0.18em] text-site-muted ${align === 'center' ? 'text-center' : ''}`}>
                    {variant === 'menu' && group.category.emoji && <span aria-hidden="true">{group.category.emoji} </span>}
                    {group.category.label}
                  </h3>
                )}
                <Collection variant={variant} items={group.items} wide={demo.mode === 'inquiry'} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Collection({ variant, items, wide }: { variant: CatalogVariant; items: CatalogItem[]; wide: boolean }) {
  const layout = {
    grid: `grid grid-cols-1 gap-x-5 gap-y-10 @md:grid-cols-2 ${wide ? '@4xl:grid-cols-3' : '@3xl:grid-cols-3 @5xl:grid-cols-4'}`,
    menu: 'grid gap-3 @3xl:grid-cols-2',
    list: 'divide-y divide-site-border border-y border-site-border',
    services: 'divide-y divide-site-border border-y border-site-border',
  }[variant];
  const Item = { grid: GridItem, menu: MenuItem, list: ListItem, services: ServiceItem }[variant];

  return (
    <ul className={layout}>
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.li key={item.id} data-item-id={item.id} layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            <Item item={item} wide={wide} />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

const Details = ({ item, className = '' }: { item: CatalogItem; className?: string }) =>
  item.details?.length ? <p className={`text-xs text-site-muted ${className}`}>{item.details.join(' · ')}</p> : null;

function Swatches({ item }: { item: CatalogItem }) {
  const colors = item.variants?.find((g) => g.kind === 'color')?.options ?? [];
  if (!colors.length) return null;
  return (
    <span className="flex gap-1" aria-label={`Colores: ${colors.map((c) => c.label).join(', ')}`}>
      {colors.map((c) => (
        <span key={c.id} aria-hidden="true" className="size-3 rounded-full ring-1 ring-black/15" style={{ background: c.swatch }} />
      ))}
    </span>
  );
}

function GridItem({ item, wide }: { item: CatalogItem; wide: boolean }) {
  const setQuickView = useSiteUiStore((s) => s.setQuickView);
  return (
    <article className="group flex h-full flex-col">
      <div className="relative overflow-hidden rounded-lg">
        <ItemImage item={item} className={`w-full transition-transform duration-700 group-hover:scale-[1.03] ${wide ? 'aspect-[4/3]' : 'aspect-[4/5]'}`} emojiClassName="text-7xl" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <PromoBadge item={item} />
          {item.tags?.find((t) => t !== 'promo') && <span className="rounded-full bg-site-bg px-2 py-0.5 text-[11px] font-medium">{item.tags.find((t) => t !== 'promo')}</span>}
        </div>
        <button
          type="button"
          onClick={() => setQuickView(item.id)}
          aria-haspopup="dialog"
          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-site-bg/90 px-3 py-1.5 text-xs font-medium opacity-100 backdrop-blur transition-opacity @3xl:opacity-0 @3xl:group-hover:opacity-100 @3xl:focus-visible:opacity-100"
        >
          <Eye className="size-3.5" aria-hidden="true" />
          Vista rápida<span className="sr-only">: {item.title}</span>
        </button>
      </div>
      <div className="mt-3 flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-medium leading-snug">{item.title}</h4>
          <Swatches item={item} />
        </div>
        <Details item={item} />
        <PriceTag item={item} className="text-sm" />
        <div className="mt-2">
          <ItemAction item={item} />
        </div>
      </div>
    </article>
  );
}

function MenuItem({ item }: { item: CatalogItem; wide: boolean }) {
  return (
    <article className="flex h-full items-center gap-3 rounded-xl border border-site-border bg-site-surface p-3">
      <ItemImage item={item} className="size-16 shrink-0 rounded-lg @md:size-20" emojiClassName="text-3xl @md:text-4xl" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate font-medium">{item.title}</h4>
          <PromoBadge item={item} />
        </div>
        <p className="mt-0.5 line-clamp-2 text-sm text-site-muted">{item.description}</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <PriceTag item={item} className="text-sm font-semibold" />
          <ItemAction item={item} />
        </div>
      </div>
    </article>
  );
}

function ListItem({ item }: { item: CatalogItem; wide: boolean }) {
  return (
    <article className="flex items-center gap-4 py-5">
      <ItemImage item={item} className="size-16 shrink-0 rounded-md @3xl:size-20" emojiClassName="text-3xl" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <h4 className="font-medium">{item.title}</h4>
          <Details item={item} />
        </div>
        <p className="mt-0.5 line-clamp-2 text-sm text-site-muted">{item.description}</p>
        <PriceTag item={item} className="mt-1 text-sm @3xl:hidden" />
      </div>
      <span className="hidden w-36 shrink-0 justify-end text-sm @3xl:flex">
        <PriceTag item={item} />
      </span>
      <ItemAction item={item} />
    </article>
  );
}

function ServiceItem({ item }: { item: CatalogItem; wide: boolean }) {
  return (
    <article className="flex items-center gap-3 py-5 @md:gap-4">
      <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-site-secondary text-xl @md:size-12 @md:text-2xl">
        {item.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <h4 className="font-medium">{item.title}</h4>
        <p className="line-clamp-1 text-sm text-site-muted">{item.description}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-site-muted">
          {item.details?.length ? <span>{item.details.join(' · ')}</span> : null}
          <PriceTag item={item} className="text-site-fg @3xl:hidden" />
        </p>
      </div>
      <span className="hidden w-32 shrink-0 justify-end text-sm @3xl:flex">
        <PriceTag item={item} />
      </span>
      <ItemAction item={item} />
    </article>
  );
}
