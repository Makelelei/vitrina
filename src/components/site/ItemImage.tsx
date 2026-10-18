import { useState } from 'react';
import type { CatalogItem } from '@/types';

interface ItemImageProps {
  item: Pick<CatalogItem, 'title' | 'emoji' | 'image'>;
  className?: string;
  emojiClassName?: string;
  /** Las imágenes decorativas (collages) no se anuncian. */
  decorative?: boolean;
}

/** Foto del ítem o, si no hay (o falla), una ilustración sobre la superficie de marca. */
export function ItemImage({ item, className = '', emojiClassName = 'text-5xl', decorative = false }: ItemImageProps) {
  const [failed, setFailed] = useState(false);

  if (item.image && !failed) {
    return (
      <img
        src={item.image}
        alt={decorative ? '' : item.title}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <div
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : item.title}
      aria-hidden={decorative || undefined}
      className={`grid place-items-center overflow-hidden bg-site-secondary ${className}`}
    >
      <span aria-hidden="true" className={`select-none drop-shadow-[0_6px_10px_rgb(0_0_0/0.18)] ${emojiClassName}`}>
        {item.emoji}
      </span>
    </div>
  );
}
