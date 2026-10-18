export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** h: 0–360, s/l: 0–100 */
export interface Hsl {
  h: number;
  s: number;
  l: number;
}

export const INK_DARK = '#0b0b10';
export const INK_LIGHT = '#ffffff';

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export const isValidHex = (value: string) => HEX_RE.test(value.trim());

export function normalizeHex(value: string): string {
  let hex = value.trim().toLowerCase();
  if (!hex.startsWith('#')) hex = `#${hex}`;
  if (hex.length === 4) {
    hex = `#${[...hex.slice(1)].map((c) => c + c).join('')}`;
  }
  return hex;
}

export function hexToRgb(hex: string): Rgb {
  const h = normalizeHex(hex).slice(1);
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b]
    .map((n) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, '0'))
    .join('')}`;
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
    }
    h *= 60;
  }

  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const sn = clamp(s, 0, 100) / 100;
  const ln = clamp(l, 0, 100) / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => ln - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return { r: f(0) * 255, g: f(8) * 255, b: f(4) * 255 };
}

export const hexToHsl = (hex: string) => rgbToHsl(hexToRgb(hex));
export const hslToHex = (hsl: Hsl) => rgbToHex(hslToRgb(hsl));

function channel(c: number) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

/** Luminancia relativa según WCAG 2.1. */
export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Devuelve el color de texto (oscuro o claro) con mayor contraste sobre `bg`. */
export function readableOn(bg: string): string {
  return contrastRatio(INK_DARK, bg) >= contrastRatio(INK_LIGHT, bg) ? INK_DARK : INK_LIGHT;
}

/**
 * Ajusta la luminosidad de `fg` hasta alcanzar el contraste mínimo sobre `bg`,
 * preservando el tono. Si no es posible, cae al texto legible por defecto.
 */
export function ensureContrast(fg: string, bg: string, min = 4.5): string {
  if (contrastRatio(fg, bg) >= min) return normalizeHex(fg);
  const goDarker = readableOn(bg) === INK_DARK;
  const { h, s } = hexToHsl(fg);
  let { l } = hexToHsl(fg);
  while (l > 0 && l < 100) {
    l += goDarker ? -1 : 1;
    const candidate = hslToHex({ h, s, l });
    if (contrastRatio(candidate, bg) >= min) return candidate;
  }
  return readableOn(bg);
}

export type WcagLevel = 'AAA' | 'AA' | 'AA grande' | 'No cumple';

export function wcagLevel(ratio: number): WcagLevel {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA grande';
  return 'No cumple';
}
