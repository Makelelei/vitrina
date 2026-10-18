import { formatItemPrice, formatPrice } from '@/lib/format';
import type { CatalogItem } from '@/types';

/** Precio con precio anterior tachado cuando hay promoción. */
export function PriceTag({ item, className = '' }: { item: CatalogItem; className?: string }) {
  const promo = item.compareAtPrice && item.price !== null && item.compareAtPrice > item.price;
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-1.5 tabular-nums ${className}`}>
      <span className={`whitespace-nowrap ${promo ? 'text-site-primary-ink' : ''}`}>{formatItemPrice(item)}</span>
      {promo && (
        <s className="whitespace-nowrap text-xs text-site-muted">
          <span className="sr-only">Antes </span>
          {formatPrice(item.compareAtPrice!, item.currency)}
        </s>
      )}
    </span>
  );
}

export function PromoBadge({ item }: { item: CatalogItem }) {
  if (!item.compareAtPrice || item.price === null || item.compareAtPrice <= item.price) return null;
  const off = Math.round((1 - item.price / item.compareAtPrice) * 100);
  return <span className="rounded-full bg-site-accent px-2 py-0.5 text-[11px] font-semibold text-site-on-accent">-{off}%</span>;
}
