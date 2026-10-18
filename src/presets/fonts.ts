import type { FontFamilyId } from '@/types';

export interface FontOption {
  id: FontFamilyId;
  label: string;
  family: string;
  stack: string;
  /** Peso de títulos que mejor luce con cada familia. */
  headingWeight: number;
  headingTracking: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { id: 'sans-modern', label: 'Sans moderna', family: 'Inter', stack: "'Inter', ui-sans-serif, system-ui, sans-serif", headingWeight: 600, headingTracking: '-0.025em' },
  { id: 'serif-elegant', label: 'Serif elegante', family: 'Fraunces', stack: "'Fraunces', ui-serif, Georgia, serif", headingWeight: 400, headingTracking: '-0.02em' },
  { id: 'mono-tech', label: 'Mono técnica', family: 'JetBrains Mono', stack: "'JetBrains Mono', ui-monospace, monospace", headingWeight: 600, headingTracking: '-0.04em' },
  { id: 'display-bold', label: 'Display bold', family: 'Space Grotesk', stack: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif", headingWeight: 700, headingTracking: '-0.035em' },
];

export const findFont = (id: FontFamilyId) => FONT_OPTIONS.find((f) => f.id === id) ?? FONT_OPTIONS[0];
