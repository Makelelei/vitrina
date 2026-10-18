import type { LayoutTemplate } from '@/types';

export interface LayoutMeta {
  id: LayoutTemplate;
  name: string;
  description: string;
  bestFor: string;
}

export const LAYOUTS: LayoutMeta[] = [
  { id: 'interactive-menu', name: 'Menú interactivo', description: 'Antojos, promos y categorías fijas arriba.', bestFor: 'Gastronomía' },
  { id: 'catalog-grid', name: 'Catálogo en grilla', description: 'Buscador, filtros por talle y color, vista rápida.', bestFor: 'Moda y comercio' },
  { id: 'services-booking', name: 'Servicios y turnos', description: 'Lista de servicios con reserva en 30 segundos.', bestFor: 'Estética y servicios' },
  { id: 'minimal-landing', name: 'Landing minimal', description: 'Centrada, mucho aire, lista limpia.', bestFor: 'Cualquier rubro' },
];

export const findLayout = (id: LayoutTemplate) => LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0];
