import type { PresetStyleId, ThemeSettings } from '@/types';

export interface StylePreset {
  id: PresetStyleId;
  name: string;
  description: string;
  theme: Omit<ThemeSettings, 'presetStyle'>;
}

/** Estilos en 1 clic: paleta + tipografía. */
export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    description: 'Magenta y cian sobre noche',
    theme: { primaryColor: '#ff2bd6', secondaryColor: '#1b1030', accentColor: '#00e5ff', backgroundColor: '#0a0614', fontFamily: 'mono-tech' },
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    description: 'Grafito y blanco, sin ruido',
    theme: { primaryColor: '#f4f4f5', secondaryColor: '#1c1c1f', accentColor: '#a1a1aa', backgroundColor: '#0c0c0e', fontFamily: 'sans-modern' },
  },
  {
    id: 'warm-pastel',
    name: 'Warm Pastel',
    description: 'Durazno, crema y salvia',
    theme: { primaryColor: '#d9694b', secondaryColor: '#f9e4d4', accentColor: '#6e9c86', backgroundColor: '#fffaf5', fontFamily: 'serif-elegant' },
  },
  {
    id: 'corporate-clean',
    name: 'Corporate Clean',
    description: 'Azul confiable, blanco puro',
    theme: { primaryColor: '#1d4ed8', secondaryColor: '#e8eefc', accentColor: '#0f172a', backgroundColor: '#ffffff', fontFamily: 'sans-modern' },
  },
  {
    id: 'organic-green',
    name: 'Organic Green',
    description: 'Verde huerta y madera',
    theme: { primaryColor: '#3f6b3a', secondaryColor: '#e6eedf', accentColor: '#b07a43', backgroundColor: '#f7f8f2', fontFamily: 'serif-elegant' },
  },
  {
    id: 'ember',
    name: 'Brasa',
    description: 'Fuego y carbón',
    theme: { primaryColor: '#f05a28', secondaryColor: '#1f1714', accentColor: '#ffc145', backgroundColor: '#110c0a', fontFamily: 'display-bold' },
  },
  {
    id: 'paper',
    name: 'Papel',
    description: 'Tinta negra sobre crudo',
    theme: { primaryColor: '#141414', secondaryColor: '#efece6', accentColor: '#8a6a4f', backgroundColor: '#faf9f6', fontFamily: 'display-bold' },
  },
  {
    id: 'dusty-rose',
    name: 'Rosa seco',
    description: 'Romántico y suave',
    theme: { primaryColor: '#a8475f', secondaryColor: '#f5e3e6', accentColor: '#5f7552', backgroundColor: '#fdf8f8', fontFamily: 'serif-elegant' },
  },
  {
    id: 'ocean',
    name: 'Océano',
    description: 'Azul profundo y arena',
    theme: { primaryColor: '#1e3a5f', secondaryColor: '#e4eaf0', accentColor: '#b07d34', backgroundColor: '#f8fafb', fontFamily: 'sans-modern' },
  },
];

export const findPreset = (id: PresetStyleId | null) => STYLE_PRESETS.find((p) => p.id === id);
