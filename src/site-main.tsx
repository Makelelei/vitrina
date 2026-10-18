import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import { setAppMode } from '@/config/app';
import { useSiteBuilderStore, buildDemoConfig } from '@/store/useSiteBuilderStore';
import { isRecord, readDemoId, sanitizeConfig } from '@/lib/schema';
import { PublishedSite, SiteUnavailable } from '@/components/published/PublishedSite';
import type { SiteConfig } from '@/types';
import './index.css';

/**
 * Punto de entrada del sitio publicado de un cliente: lee `site.json` (que
 * genera `npm run client`), lo valida y muestra solo el sitio, sin el editor.
 */
setAppMode('published');

// Clave propia: el sitio publicado nunca comparte datos guardados con el estudio.
useSiteBuilderStore.persist.setOptions({ name: 'vitrina-published-site' });

function applyHead(config: SiteConfig) {
  const { brandDetails, themeSettings } = config;
  document.title = brandDetails.tagline ? `${brandDetails.name} · ${brandDetails.tagline}` : brandDetails.name;
  document.querySelector('meta[name="description"]')?.setAttribute('content', brandDetails.about || brandDetails.tagline);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeSettings.backgroundColor);
  if (brandDetails.logoUrl) document.querySelector('link[rel="icon"]')?.setAttribute('href', brandDetails.logoUrl);
}

async function loadSite(): Promise<SiteConfig> {
  const response = await fetch('./site.json', { cache: 'no-cache' });
  if (!response.ok) throw new Error(`site.json respondió ${response.status}`);
  const raw: unknown = await response.json();
  // Acepta el formato de exportación ({ schema, site }) o la configuración directa.
  const site = isRecord(raw) && isRecord(raw.site) ? raw.site : raw;
  const { config, repaired } = sanitizeConfig(site, buildDemoConfig(readDemoId(site)));
  if (repaired.length) console.warn('[vitrina] site.json con campos inválidos; se usaron valores de ejemplo para:', repaired.join(', '));
  return config;
}

const root = createRoot(document.getElementById('root')!);

loadSite()
  .then((config) => {
    useSiteBuilderStore.setState(config);
    applyHead(config);
    root.render(
      <StrictMode>
        <MotionConfig reducedMotion="user">
          <PublishedSite />
        </MotionConfig>
      </StrictMode>,
    );
  })
  .catch((error: unknown) => {
    console.error('[vitrina] No se pudo cargar el sitio:', error);
    document.title = 'Sitio no disponible';
    root.render(<SiteUnavailable />);
  });
