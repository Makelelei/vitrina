import { useId, useState } from 'react';
import { ChevronRight, Plus, Star, Trash2 } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useSiteBuilderStore } from '@/store/useSiteBuilderStore';
import { useDemo } from '@/hooks/useDemo';
import { formatItemPrice, uid } from '@/lib/format';
import { isValidWhatsApp } from '@/lib/whatsapp';
import type { CatalogItem, VariantGroup, VariantKind, VariantOption } from '@/types';
import { TextArea, TextField } from '@/components/ui/TextField';
import { Switch } from '@/components/ui/Switch';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { PanelGroup } from './PanelGroup';

export function ContentTab() {
  const s = useSiteBuilderStore(
    useShallow((st) => ({
      brand: st.brandDetails,
      announcement: st.announcement,
      categories: st.categories,
      items: st.productsOrServices,
      updateBrand: st.updateBrand,
      updateAnnouncement: st.updateAnnouncement,
      addItem: st.addItem,
      addCategory: st.addCategory,
    })),
  );
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const whatsappError = s.brand.whatsapp && !isValidWhatsApp(s.brand.whatsapp) ? 'Entre 8 y 15 dígitos, con código de país.' : undefined;

  return (
    <>
      <PanelGroup title="Contacto">
        <TextField
          label="WhatsApp del negocio"
          type="tel"
          inputMode="tel"
          value={s.brand.whatsapp}
          onValueChange={(whatsapp) => s.updateBrand({ whatsapp })}
          placeholder="5491122334455"
          hint="Código de país + área + número, sin 0 ni 15."
          error={whatsappError}
        />
        <div className="grid gap-3">
          <TextField label="Dirección" value={s.brand.address} autoComplete="street-address" onValueChange={(address) => s.updateBrand({ address })} />
          <TextField label="Ciudad" value={s.brand.city} onValueChange={(city) => s.updateBrand({ city })} />
        </div>
      </PanelGroup>

      <PanelGroup title="Anuncio superior">
        <Switch label="Mostrar barra de anuncio" checked={s.announcement.enabled} onCheckedChange={(enabled) => s.updateAnnouncement({ enabled })} />
        {s.announcement.enabled && <TextField label="Texto del anuncio" value={s.announcement.text} maxLength={90} onValueChange={(text) => s.updateAnnouncement({ text })} />}
      </PanelGroup>

      <div className="border-t border-ui-border px-4 pt-5">
        <h3 className="text-xs font-semibold">Productos y servicios</h3>
        <p className="mt-0.5 text-xs text-ui-muted">
          {s.items.length} ítems · <Star className="inline size-3 align-[-1px]" aria-hidden="true" /> = destacado
        </p>
      </div>

      {s.categories.map((cat) => {
        const items = s.items.filter((i) => i.category === cat.id);
        return (
          <PanelGroup
            key={cat.id}
            title={`${cat.emoji ? `${cat.emoji} ` : ''}${cat.label} · ${items.length}`}
            action={
              <button
                type="button"
                onClick={() => setExpanded(s.addItem(cat.id))}
                aria-label={`Agregar ítem en ${cat.label}`}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-ui-muted hover:bg-ui-hover hover:text-ui-fg"
              >
                <Plus className="size-3.5" aria-hidden="true" /> Agregar
              </button>
            }
          >
            {items.length === 0 ? (
              <p className="text-xs text-ui-muted">Sin ítems en esta categoría.</p>
            ) : (
              <ul className="-mx-1 space-y-0.5">
                {items.map((item) => (
                  <ItemRow key={item.id} item={item} expanded={expanded === item.id} onToggle={() => setExpanded((e) => (e === item.id ? null : item.id))} />
                ))}
              </ul>
            )}
          </PanelGroup>
        );
      })}

      <PanelGroup title="Nueva categoría">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            s.addCategory(newCategory);
            setNewCategory('');
          }}
        >
          <TextField label="Nombre de la categoría" value={newCategory} onValueChange={setNewCategory} placeholder="Ej: Combos" className="flex-1" />
          <button type="submit" disabled={!newCategory.trim()} className="ui-btn ui-btn-ghost mt-[22px] h-9">
            Crear
          </button>
        </form>
      </PanelGroup>
    </>
  );
}

/* ---------- Fila editable de un ítem ---------- */
function ItemRow({ item, expanded, onToggle }: { item: CatalogItem; expanded: boolean; onToggle: () => void }) {
  const { updateItem, removeItem, categories } = useSiteBuilderStore(
    useShallow((s) => ({ updateItem: s.updateItem, removeItem: s.removeItem, categories: s.categories })),
  );
  const demo = useDemo();
  const [detailsText, setDetailsText] = useState((item.details ?? []).join(', '));
  const regionId = useId();
  const categoryId = useId();
  const update = (patch: Partial<CatalogItem>) => updateItem(item.id, patch);
  const num = (v: string) => (v === '' ? null : Math.max(0, Number(v)));

  return (
    <li className={`rounded-md ${expanded ? 'bg-ui-subtle ring-1 ring-ui-border' : ''}`}>
      <div className="flex items-center gap-1">
        <button type="button" onClick={onToggle} aria-expanded={expanded} aria-controls={regionId} className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1.5 text-left hover:bg-ui-hover">
          <ChevronRight className={`size-3.5 shrink-0 text-ui-muted transition-transform ${expanded ? 'rotate-90' : ''}`} aria-hidden="true" />
          {item.image ? <img src={item.image} alt="" className="size-5 rounded object-cover" /> : <span aria-hidden="true" className="text-base leading-none">{item.emoji}</span>}
          <span className="min-w-0 flex-1 truncate text-sm">{item.title || 'Sin nombre'}</span>
          {item.variants?.length ? <span className="rounded bg-ui-hover px-1 text-[10px] text-ui-muted">{item.variants.length} var.</span> : null}
          <span className="shrink-0 text-xs text-ui-muted tabular-nums">{formatItemPrice(item)}</span>
        </button>
        <button type="button" onClick={() => update({ featured: !item.featured })} aria-pressed={!!item.featured} aria-label={`Destacar ${item.title}`} className="grid size-7 shrink-0 place-items-center rounded-md hover:bg-ui-hover">
          <Star className={`size-3.5 ${item.featured ? 'fill-ui-accent text-ui-accent' : 'text-ui-muted'}`} aria-hidden="true" />
        </button>
      </div>

      {expanded && (
        <div id={regionId} className="space-y-3 px-2 pb-3 pt-1">
          <ImageUpload label="Imagen" value={item.image} onChange={(image) => update({ image })} compact hint="Se comprime automáticamente." />
          <div className="grid grid-cols-[3.5rem_1fr] gap-2">
            <TextField label="Ícono" value={item.emoji} maxLength={4} onValueChange={(v) => update({ emoji: v || '✨' })} />
            <TextField label="Título" value={item.title} maxLength={60} onValueChange={(title) => update({ title })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <TextField
              label={`Precio${item.currency === 'USD' ? ' (USD)' : ''}${item.priceSuffix ? ` ${item.priceSuffix}` : ''}`}
              type="number"
              inputMode="numeric"
              min={0}
              value={item.price ?? ''}
              placeholder="Consultar"
              onValueChange={(v) => update({ price: num(v) })}
            />
            <TextField label="Precio anterior" type="number" inputMode="numeric" min={0} value={item.compareAtPrice ?? ''} placeholder="Sin promo" onValueChange={(v) => update({ compareAtPrice: num(v) ?? undefined })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor={categoryId} className="ui-label">Categoría</label>
              <select id={categoryId} value={item.category} onChange={(e) => update({ category: e.target.value })} className="ui-input">
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            {demo.mode === 'booking' ? (
              <TextField label="Duración (min)" type="number" min={15} step={15} value={item.durationMin ?? ''} onValueChange={(v) => update({ durationMin: num(v) ?? undefined })} />
            ) : (
              <TextField
                label="Datos cortos"
                value={detailsText}
                placeholder="Ej: 3 amb, 78 m²"
                onValueChange={(v) => {
                  setDetailsText(v);
                  update({ details: v.split(',').map((d) => d.trim()).filter(Boolean) });
                }}
              />
            )}
          </div>
          <TextArea label="Descripción" value={item.description} rows={2} maxLength={160} onValueChange={(description) => update({ description })} />
          <VariantsEditor item={item} onChange={(variants) => update({ variants })} />
          <button type="button" onClick={() => removeItem(item.id)} className="inline-flex items-center gap-1.5 text-xs text-ui-danger hover:underline">
            <Trash2 className="size-3.5" aria-hidden="true" /> Eliminar ítem
          </button>
        </div>
      )}
    </li>
  );
}

/* ---------- Editor de variantes ---------- */
const KIND_LABEL: Record<VariantKind, string> = { size: 'Talle', color: 'Color', option: 'Opción única', extra: 'Extras (varios)' };

/** "Doble +2500, Triple +4500" ⇄ opciones. Para colores: "Negro #1a1a1a". */
function parseOptions(text: string, kind: VariantKind): VariantOption[] {
  return text
    .split(',')
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((raw, i) => {
      const swatch = kind === 'color' ? raw.match(/#[0-9a-f]{3,6}\b/i)?.[0] : undefined;
      const deltaMatch = raw.match(/([+-])\s*\$?\s*([\d.]+)\s*$/);
      const label = raw.replace(/#[0-9a-f]{3,6}\b/i, '').replace(/([+-])\s*\$?\s*([\d.]+)\s*$/, '').trim() || `Opción ${i + 1}`;
      const priceDelta = deltaMatch ? Number(deltaMatch[2].replace(/\./g, '')) * (deltaMatch[1] === '-' ? -1 : 1) : undefined;
      return { id: `${label.toLowerCase().replace(/\s+/g, '-')}-${i}`, label, priceDelta, swatch: swatch ?? (kind === 'color' ? '#999999' : undefined) };
    });
}

const formatOptions = (g: VariantGroup) =>
  g.options.map((o) => [o.label, o.swatch && g.kind === 'color' ? o.swatch : '', o.priceDelta ? `${o.priceDelta > 0 ? '+' : '-'}${Math.abs(o.priceDelta)}` : ''].filter(Boolean).join(' ')).join(', ');

function VariantsEditor({ item, onChange }: { item: CatalogItem; onChange: (variants: VariantGroup[]) => void }) {
  const groups = item.variants ?? [];
  const update = (i: number, patch: Partial<VariantGroup>) => onChange(groups.map((g, j) => (j === i ? { ...g, ...patch } : g)));

  return (
    <fieldset className="space-y-2 rounded-md border border-ui-border p-2.5">
      <legend className="px-1 text-xs font-medium text-ui-muted">Variantes</legend>
      {groups.length === 0 && <p className="text-xs text-ui-muted">Talles, colores, tamaños o extras con precio.</p>}
      {groups.map((g, i) => (
        <VariantGroupRow key={g.id} group={g} onChange={(patch) => update(i, patch)} onRemove={() => onChange(groups.filter((_, j) => j !== i))} />
      ))}
      <button
        type="button"
        onClick={() => onChange([...groups, { id: uid('var'), name: 'Tamaño', kind: 'option', multiple: false, required: true, options: parseOptions('Chico, Grande +2000', 'option') }])}
        className="inline-flex items-center gap-1 text-xs text-ui-muted hover:text-ui-fg"
      >
        <Plus className="size-3.5" aria-hidden="true" /> Agregar grupo de variantes
      </button>
    </fieldset>
  );
}

function VariantGroupRow({ group, onChange, onRemove }: { group: VariantGroup; onChange: (patch: Partial<VariantGroup>) => void; onRemove: () => void }) {
  const [text, setText] = useState(formatOptions(group));
  const kindId = useId();

  return (
    <div className="space-y-2 rounded-md bg-ui-subtle p-2">
      <div className="flex items-end gap-2">
        <TextField label="Grupo" value={group.name} onValueChange={(name) => onChange({ name })} className="min-w-0 flex-1" />
        <button type="button" onClick={onRemove} aria-label={`Eliminar grupo ${group.name}`} className="grid size-10 shrink-0 place-items-center rounded-md text-ui-muted hover:bg-ui-hover hover:text-ui-danger">
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div>
        <div>
          <label htmlFor={kindId} className="ui-label">Tipo</label>
          <select
            id={kindId}
            value={group.kind}
            onChange={(e) => {
              const kind = e.target.value as VariantKind;
              onChange({ kind, multiple: kind === 'extra', required: kind !== 'extra', options: parseOptions(text, kind) });
            }}
            className="ui-input"
          >
            {(Object.keys(KIND_LABEL) as VariantKind[]).map((k) => (
              <option key={k} value={k}>{KIND_LABEL[k]}</option>
            ))}
          </select>
        </div>
      </div>
      <TextField
        label="Opciones"
        value={text}
        hint={group.kind === 'color' ? 'Separadas por coma. Ej: Negro #111111, Crudo #e8e0d0' : 'Separadas por coma. Ej: Doble +2500, Triple +4500'}
        onValueChange={(v) => {
          setText(v);
          onChange({ options: parseOptions(v, group.kind) });
        }}
      />
    </div>
  );
}
