import type { DeliveryZone, OpeningHours, SectionKey, SectionVisibility } from '@/types';

export const DEFAULT_LOCATION = { lat: -34.6037, lng: -58.3816, address: 'Av. Corrientes 1234', city: 'CABA, Buenos Aires' };

const LABELS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const week = (spec: Record<number, [string, string] | null>): OpeningHours[] =>
  [1, 2, 3, 4, 5, 6, 0].map((day) => {
    const range = spec[day];
    return range
      ? { day, label: LABELS[day], open: range[0], close: range[1] }
      : { day, label: LABELS[day], open: '00:00', close: '00:00', closed: true };
  });

export const HOURS = {
  food: week({ 1: null, 2: ['11:30', '23:00'], 3: ['11:30', '23:00'], 4: ['11:30', '23:30'], 5: ['11:30', '00:30'], 6: ['12:00', '01:00'], 0: ['12:00', '23:00'] }),
  retail: week({ 1: ['10:00', '20:00'], 2: ['10:00', '20:00'], 3: ['10:00', '20:00'], 4: ['10:00', '20:00'], 5: ['10:00', '20:00'], 6: ['10:00', '14:00'], 0: null }),
  office: week({ 1: ['09:00', '18:00'], 2: ['09:00', '18:00'], 3: ['09:00', '18:00'], 4: ['09:00', '18:00'], 5: ['09:00', '18:00'], 6: ['10:00', '13:00'], 0: null }),
  salon: week({ 1: null, 2: ['10:00', '20:00'], 3: ['10:00', '20:00'], 4: ['10:00', '20:00'], 5: ['10:00', '20:00'], 6: ['09:00', '18:00'], 0: null }),
};

export const ZONES: Record<'food' | 'shipping', DeliveryZone[]> = {
  food: [
    { id: 'centro', name: 'Centro (hasta 2 km)', cost: 0, eta: '20–30 min' },
    { id: 'palermo', name: 'Palermo / Almagro', cost: 1500, eta: '30–45 min' },
    { id: 'belgrano', name: 'Belgrano / Núñez', cost: 2500, eta: '40–55 min' },
  ],
  shipping: [
    { id: 'caba', name: 'CABA', cost: 3500, eta: 'En el día' },
    { id: 'gba', name: 'GBA', cost: 5500, eta: '24–48 h' },
    { id: 'interior', name: 'Resto del país', cost: 8900, eta: '3–5 días' },
  ],
};

export const DEFAULT_SECTIONS: SectionVisibility = {
  highlights: true,
  featured: true,
  cravings: true,
  lookbook: true,
  categoryTiles: true,
  about: true,
  testimonials: true,
  hours: true,
  delivery: true,
  map: true,
  contact: true,
};

export const ALL_SECTIONS = Object.keys(DEFAULT_SECTIONS) as SectionKey[];

/** Secciones comunes a todos los rubros. */
export const BASE_SECTIONS: SectionKey[] = ['highlights', 'featured', 'about', 'testimonials', 'hours', 'map', 'contact'];
