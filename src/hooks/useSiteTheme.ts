import { useMemo, type CSSProperties } from 'react';
import { useSiteBuilderStore } from '@/store/useSiteBuilderStore';
import { ensureContrast, readableOn, INK_DARK } from '@/lib/color';
import { findFont } from '@/presets/fonts';
import type { ThemeSettings } from '@/types';

/**
 * Traduce el tema a variables CSS garantizando contraste WCAG AA:
 * - `on-*`: texto legible sobre cada color de marca.
 * - `*-ink`: color de marca ajustado para usarse como texto sobre el fondo.
 */
export function buildSiteThemeVars(t: ThemeSettings): CSSProperties {
  const bg = t.backgroundColor;
  const font = findFont(t.fontFamily);
  const fgCandidate = readableOn(bg) === INK_DARK ? '#16141a' : '#f3f1ee';
  return {
    '--site-bg': bg,
    '--site-fg': ensureContrast(fgCandidate, bg, 7),
    '--site-primary': t.primaryColor,
    '--site-on-primary': readableOn(t.primaryColor),
    '--site-primary-ink': ensureContrast(t.primaryColor, bg, 4.5),
    '--site-secondary': t.secondaryColor,
    '--site-on-secondary': readableOn(t.secondaryColor),
    '--site-accent': t.accentColor,
    '--site-on-accent': readableOn(t.accentColor),
    '--site-accent-ink': ensureContrast(t.accentColor, bg, 4.5),
    '--site-focus': ensureContrast(t.accentColor, bg, 3),
    '--site-font': font.stack,
    '--site-heading-weight': font.headingWeight,
    '--site-heading-tracking': font.headingTracking,
  } as CSSProperties;
}

export function useSiteThemeVars(): CSSProperties {
  const theme = useSiteBuilderStore((s) => s.themeSettings);
  return useMemo(() => buildSiteThemeVars(theme), [theme]);
}
