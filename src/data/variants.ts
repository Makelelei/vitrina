import type { VariantGroup } from '@/types';

const slug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Talles: una opción obligatoria. */
export const sizes = (labels: string[], name = 'Talle'): VariantGroup => ({
  id: slug(name),
  name,
  kind: 'size',
  multiple: false,
  required: true,
  options: labels.map((label) => ({ id: slug(label), label })),
});

/** Colores con muestra: una opción obligatoria. */
export const colors = (list: [label: string, swatch: string][]): VariantGroup => ({
  id: 'color',
  name: 'Color',
  kind: 'color',
  multiple: false,
  required: true,
  options: list.map(([label, swatch]) => ({ id: slug(label), label, swatch })),
});

/** Extras opcionales que suman al precio (toppings, envoltorio…). */
export const extras = (name: string, list: [label: string, delta: number][]): VariantGroup => ({
  id: slug(name),
  name,
  kind: 'extra',
  multiple: true,
  required: false,
  options: list.map(([label, priceDelta]) => ({ id: slug(label), label, priceDelta })),
});

/** Elección única obligatoria con diferencias de precio (tamaño, formato, modelo). */
export const choice = (name: string, list: [label: string, delta?: number][]): VariantGroup => ({
  id: slug(name),
  name,
  kind: 'option',
  multiple: false,
  required: true,
  options: list.map(([label, priceDelta]) => ({ id: slug(label), label, priceDelta })),
});
