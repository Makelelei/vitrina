import { useShallow } from 'zustand/react/shallow';
import { useSiteBuilderStore } from '@/store/useSiteBuilderStore';
import { CATEGORIES, DEMOS, MODE_LABEL } from '@/data/demos';
import { ALL_SECTIONS } from '@/data/business';
import { LAYOUTS, findLayout } from '@/presets/layouts';
import type { BusinessCategory, DemoId, LayoutTemplate, SectionKey } from '@/types';
import { Switch } from '@/components/ui/Switch';
import { PanelGroup } from './PanelGroup';
import { RadioCardGroup } from './RadioCardGroup';
import { CategoryGrid } from './CategoryGrid';

const SECTION_LABELS: Record<SectionKey, [string, string]> = {
  highlights: ['Beneficios', 'Tres motivos para elegirte'],
  featured: ['Destacados y promos', 'Ítems marcados con estrella'],
  cravings: ['Botones de antojo', 'Filtran el menú con un toque'],
  lookbook: ['Lookbook', 'Galería editorial de productos'],
  categoryTiles: ['Categorías en rejilla', 'Accesos rápidos al catálogo'],
  about: ['Sobre nosotros', 'Tu historia en un párrafo'],
  testimonials: ['Testimonios', 'Opiniones de clientes'],
  hours: ['Horarios', 'Con estado abierto/cerrado'],
  delivery: ['Zonas de envío', 'Costos y demoras'],
  map: ['Mapa', 'Ubicación y “Cómo llegar”'],
  contact: ['Bloque de contacto', 'Llamada a la acción final'],
};

/** Miniatura esquemática de cada plantilla. */
function LayoutThumb({ id }: { id: LayoutTemplate }) {
  const bar = 'rounded-[1px] bg-ui-muted/45';
  const block = 'rounded-[2px] bg-ui-muted/25';
  return (
    <span aria-hidden="true" className="flex h-16 w-full flex-col gap-1 rounded-md bg-ui-subtle p-1.5">
      {id === 'interactive-menu' && (
        <>
          <span className={`h-4 ${block}`} />
          <span className="flex gap-0.5">{[0, 1, 2, 3].map((i) => <span key={i} className="size-2.5 rounded-full bg-ui-muted/35" />)}</span>
          <span className="grid flex-1 grid-cols-2 gap-0.5">{[0, 1, 2, 3].map((i) => <span key={i} className={block} />)}</span>
        </>
      )}
      {id === 'catalog-grid' && (
        <>
          <span className="flex h-5 gap-0.5 rounded-[2px] bg-ui-muted/20 p-0.5">
            <span className={`my-auto h-1 w-1/3 ${bar}`} />
            <span className="ml-auto grid w-1/3 grid-cols-2 gap-px">{[0, 1, 2, 3].map((i) => <span key={i} className="rounded-[1px] bg-ui-muted/30" />)}</span>
          </span>
          <span className="grid flex-1 grid-cols-4 gap-0.5">{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <span key={i} className={block} />)}</span>
        </>
      )}
      {id === 'services-booking' && (
        <>
          <span className={`mt-0.5 h-1.5 w-2/3 ${bar}`} />
          {[0, 1, 2].map((i) => (
            <span key={i} className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-ui-muted/35" />
              <span className={`h-1 flex-1 ${bar}`} />
              <span className="h-1.5 w-3 rounded-full bg-ui-accent/60" />
            </span>
          ))}
        </>
      )}
      {id === 'minimal-landing' && (
        <>
          <span className={`mx-auto mt-1 h-1 w-3/4 ${bar}`} />
          <span className={`mx-auto h-1 w-1/2 ${bar}`} />
          <span className="mt-auto grid grid-cols-3 gap-0.5">{[0, 1, 2].map((i) => <span key={i} className={`h-4 ${block}`} />)}</span>
        </>
      )}
    </span>
  );
}

export function CategoryTab() {
  const s = useSiteBuilderStore(
    useShallow((st) => ({
      category: st.businessCategory,
      demoId: st.demoId,
      layout: st.layoutTemplate,
      sections: st.sections,
      items: st.productsOrServices,
      setBusinessCategory: st.setBusinessCategory,
      loadDemo: st.loadDemo,
      setLayoutTemplate: st.setLayoutTemplate,
      setSection: st.setSection,
    })),
  );
  const demo = DEMOS[s.demoId];
  const demos = CATEGORIES[s.category].demos;

  const confirmSwitch = () => s.items === demo.items || window.confirm('Se reemplazará el catálogo que editaste por el del nuevo rubro. ¿Continuar?');
  const changeCategory = (id: BusinessCategory) => confirmSwitch() && s.setBusinessCategory(id);
  const changeDemo = (id: DemoId) => confirmSwitch() && s.loadDemo(id);

  return (
    <>
      <PanelGroup title="Rubro" description="Cambia la demo, los textos y el catálogo de ejemplo.">
        <CategoryGrid value={s.category} onSelect={changeCategory} compact />
      </PanelGroup>

      {demos.length > 1 && (
        <PanelGroup title="Demo del rubro">
          <RadioCardGroup
            legend="Demo"
            hideLegend
            value={s.demoId}
            onChange={changeDemo}
            columns="grid-cols-3"
            options={demos.map((id) => {
              const d = DEMOS[id];
              return {
                value: id,
                content: (
                  <span className="flex w-full flex-col items-center gap-1.5 py-1 text-center">
                    <d.icon className="size-4" strokeWidth={1.5} aria-hidden="true" />
                    <span className="text-xs font-medium">{d.name}</span>
                  </span>
                ),
              };
            })}
          />
        </PanelGroup>
      )}

      <PanelGroup title="Plantilla" description={`Recomendada para ${demo.name.toLowerCase()}: ${findLayout(demo.defaults.layout).name}`}>
        <RadioCardGroup
          legend="Plantilla del sitio"
          hideLegend
          value={s.layout}
          onChange={s.setLayoutTemplate}
          columns="grid-cols-2"
          options={LAYOUTS.map((l) => ({
            value: l.id,
            ariaLabel: `${l.name}: ${l.description}`,
            content: (
              <span className="block w-full">
                <LayoutThumb id={l.id} />
                <span className="mt-2 flex items-center justify-between gap-1">
                  <span className="text-xs font-medium">{l.name}</span>
                  {l.id === demo.defaults.layout && <span className="rounded bg-ui-accent/15 px-1 text-[9px] font-semibold uppercase text-ui-accent">Sugerida</span>}
                </span>
                <span className="block text-[11px] leading-tight text-ui-muted">{l.bestFor}</span>
              </span>
            ),
          }))}
        />
        <p className="text-xs text-ui-muted">{findLayout(s.layout).description}</p>
      </PanelGroup>

      <PanelGroup title="Secciones" description={`Modo de conversión: ${MODE_LABEL[demo.mode].toLowerCase()}.`}>
        <div className="-my-1 divide-y divide-ui-border">
          {ALL_SECTIONS.map((key) => {
            const supported = demo.supports.includes(key);
            if (!supported && (key === 'cravings' || key === 'lookbook')) return null;
            return (
              <Switch
                key={key}
                label={SECTION_LABELS[key][0]}
                description={supported ? SECTION_LABELS[key][1] : 'No aplica a este rubro'}
                checked={supported && s.sections[key]}
                disabled={!supported}
                onCheckedChange={(v) => s.setSection(key, v)}
              />
            );
          })}
        </div>
      </PanelGroup>
    </>
  );
}
