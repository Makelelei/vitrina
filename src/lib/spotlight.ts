import type { SectionKey } from '@/types';

/** Destinos del foco en vivo: qué parte de la vista previa mostrar al editar cada cosa. */
export const SPOT = {
  top: 'top',
  brand: '[data-spotlight="brand"]',
  announcement: '[data-spotlight="announcement"]',
  hero: '#hero-title',
  catalog: '#site-catalog',
  about: '#site-about',
  info: '#site-info',
  contact: '#site-contact',
  item: (id: string) => `item:${id}`,
} as const;

export const SECTION_SPOT: Record<SectionKey, string> = {
  highlights: '[data-spotlight="highlights"]',
  featured: '[data-spotlight="featured"]',
  cravings: '[data-spotlight="cravings"]',
  lookbook: '[data-spotlight="lookbook"]',
  categoryTiles: '[data-spotlight="categoryTiles"]',
  about: SPOT.about,
  testimonials: '[data-spotlight="testimonials"]',
  hours: SPOT.info,
  delivery: SPOT.info,
  map: SPOT.info,
  contact: SPOT.contact,
};
