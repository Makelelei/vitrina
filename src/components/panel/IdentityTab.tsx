import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useSiteBuilderStore } from '@/store/useSiteBuilderStore';
import { STYLE_PRESETS } from '@/presets/styles';
import { FONT_OPTIONS } from '@/presets/fonts';
import { readableOn } from '@/lib/color';
import type { ColorKey } from '@/types';
import { TextArea, TextField } from '@/components/ui/TextField';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { PanelGroup } from './PanelGroup';
import { SPOT } from '@/lib/spotlight';
import { useSiteUiStore } from '@/store/useSiteUiStore';
import { RadioCardGroup } from './RadioCardGroup';
import { ColorField } from './ColorField';

const COLOR_FIELDS: { key: ColorKey; label: string }[] = [
  { key: 'primaryColor', label: 'Primario' },
  { key: 'secondaryColor', label: 'Secundario' },
  { key: 'accentColor', label: 'Acento' },
  { key: 'backgroundColor', label: 'Fondo' },
];

export function IdentityTab() {
  const s = useSiteBuilderStore(
    useShallow((st) => ({
      brand: st.brandDetails,
      theme: st.themeSettings,
      aboutOn: st.sections.about,
      updateBrand: st.updateBrand,
      applyPreset: st.applyPreset,
      setColor: st.setColor,
      setFontFamily: st.setFontFamily,
    })),
  );
  const [customOpen, setCustomOpen] = useState(false);
  const focusPreview = useSiteUiStore((st) => st.focusPreview);
  const customId = useId();

  return (
    <>
      <PanelGroup focus={SPOT.brand} title="Marca">
        <ImageUpload label="Logo" value={s.brand.logoUrl} onChange={(logoUrl) => s.updateBrand({ logoUrl })} maxSize={320} hint="Se muestra en la navegación. Ideal: PNG o SVG con fondo transparente." />
        <TextField label="Nombre del negocio" value={s.brand.name} maxLength={40} onValueChange={(name) => s.updateBrand({ name })} />
        <div onFocusCapture={() => focusPreview(SPOT.hero)}>
          <TextField label="Eslogan" value={s.brand.tagline} maxLength={80} onValueChange={(tagline) => s.updateBrand({ tagline })} />
        </div>
        {s.aboutOn && (
          <div onFocusCapture={() => focusPreview(SPOT.about)}>
            <TextArea label="Sobre nosotros" value={s.brand.about} maxLength={360} rows={4} onValueChange={(about) => s.updateBrand({ about })} />
          </div>
        )}
      </PanelGroup>

      <PanelGroup focus={SPOT.hero} title="Estilo en 1 clic" description="Paleta y tipografía combinadas.">
        <RadioCardGroup
          legend="Estilos predefinidos"
          hideLegend
          value={s.theme.presetStyle}
          onChange={s.applyPreset}
          columns="grid-cols-3"
          options={STYLE_PRESETS.map((p) => ({
            value: p.id,
            ariaLabel: `${p.name}: ${p.description}`,
            content: (
              <span className="block w-full">
                <span aria-hidden="true" className="relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-md p-1.5 ring-1 ring-black/10" style={{ background: p.theme.backgroundColor }}>
                  <span className="text-sm leading-none" style={{ color: readableOn(p.theme.backgroundColor), fontFamily: FONT_OPTIONS.find((f) => f.id === p.theme.fontFamily)?.stack }}>
                    Aa
                  </span>
                  <span className="flex gap-0.5">
                    {[p.theme.primaryColor, p.theme.secondaryColor, p.theme.accentColor].map((c, i) => (
                      <span key={i} className="size-2.5 rounded-full ring-1 ring-black/10" style={{ background: c }} />
                    ))}
                  </span>
                </span>
                <span className="mt-1.5 block truncate text-[11px] font-medium">{p.name}</span>
              </span>
            ),
          }))}
        />
      </PanelGroup>

      <PanelGroup focus={SPOT.hero} title="Colores">
        <button
          type="button"
          onClick={() => setCustomOpen((o) => !o)}
          aria-expanded={customOpen}
          aria-controls={customId}
          className="flex w-full items-center justify-between rounded-md py-1 text-xs text-ui-muted hover:text-ui-fg"
        >
          <span>
            Ajustar colores individualmente
            {s.theme.presetStyle === null && <span className="ml-2 rounded bg-ui-hover px-1.5 py-0.5 text-[10px]">Personalizado</span>}
          </span>
          <ChevronDown className={`size-3.5 transition-transform ${customOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        {customOpen && (
          <div id={customId} className="space-y-2.5">
            {COLOR_FIELDS.map(({ key, label }) => (
              <ColorField
                key={key}
                label={label}
                value={s.theme[key]}
                onChange={(hex) => s.setColor(key, hex)}
                contrastWith={key === 'backgroundColor' ? readableOn(s.theme[key]) : s.theme.backgroundColor}
                contrastLabel={key === 'backgroundColor' ? 'del texto sobre el fondo' : 'contra el fondo'}
              />
            ))}
            <p className="text-[11px] leading-relaxed text-ui-muted">
              El número indica el contraste contra el fondo. Los textos sobre cada color se ajustan solos para cumplir WCAG AA.
            </p>
          </div>
        )}
      </PanelGroup>

      <PanelGroup focus={SPOT.hero} title="Tipografía">
        <RadioCardGroup
          legend="Tipografía"
          hideLegend
          value={s.theme.fontFamily}
          onChange={s.setFontFamily}
          columns="grid-cols-2"
          options={FONT_OPTIONS.map((f) => ({
            value: f.id,
            content: (
              <span className="flex w-full items-center gap-3">
                <span aria-hidden="true" className="text-2xl leading-none" style={{ fontFamily: f.stack, fontWeight: f.headingWeight }}>
                  Aa
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-medium">{f.label}</span>
                  <span className="block truncate text-[11px] text-ui-muted">{f.family}</span>
                </span>
              </span>
            ),
          }))}
        />
      </PanelGroup>
    </>
  );
}
