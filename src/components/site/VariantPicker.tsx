import { useId } from 'react';
import { Check } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import type { CatalogItem, VariantGroup, VariantSelection } from '@/types';

interface Props {
  item: CatalogItem;
  selection: VariantSelection;
  onChange: (selection: VariantSelection) => void;
  /** Grupos obligatorios marcados como faltantes (tras intentar agregar). */
  showErrors?: boolean;
}

/** Selector de variantes: talles, colores (con muestra), extras y opciones. Radios/checkbox nativos. */
export function VariantPicker({ item, selection, onChange, showErrors }: Props) {
  return (
    <div className="space-y-5">
      {(item.variants ?? []).map((group) => (
        <Group
          key={group.id}
          group={group}
          currency={item.currency}
          value={selection[group.id] ?? []}
          error={showErrors && group.required && !(selection[group.id]?.length)}
          onChange={(ids) => onChange({ ...selection, [group.id]: ids })}
        />
      ))}
    </div>
  );
}

function Group({ group, value, onChange, error, currency }: { group: VariantGroup; value: string[]; onChange: (ids: string[]) => void; error?: boolean; currency?: CatalogItem['currency'] }) {
  const name = useId();
  const errorId = useId();
  const selectedLabel = group.options.find((o) => o.id === value[0])?.label;

  const toggle = (id: string) => {
    if (group.multiple) onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
    else onChange([id]);
  };

  const delta = (d?: number) => (d ? ` ${d > 0 ? '+' : '−'}${formatPrice(Math.abs(d), currency)}` : '');

  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className="mb-2 flex w-full items-baseline justify-between text-sm">
        <span className="font-medium">
          {group.name}
          {group.kind === 'color' && selectedLabel && <span className="font-normal text-site-muted">: {selectedLabel}</span>}
        </span>
        <span className="text-xs text-site-muted">{group.required ? 'Obligatorio' : group.multiple ? 'Opcional · podés elegir varios' : 'Opcional'}</span>
      </legend>

      {group.kind === 'extra' ? (
        <div className="divide-y divide-site-border rounded-md border border-site-border">
          {group.options.map((o) => {
            const checked = value.includes(o.id);
            return (
              <label key={o.id} className="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-site-focus">
                <input type="checkbox" name={name} checked={checked} onChange={() => toggle(o.id)} className="sr-only" />
                <span aria-hidden="true" className={`grid size-4 shrink-0 place-items-center rounded border ${checked ? 'border-site-primary bg-site-primary text-site-on-primary' : 'border-site-border'}`}>
                  {checked && <Check className="size-3" strokeWidth={3} />}
                </span>
                <span className="flex-1">{o.label}</span>
                <span className="text-site-muted tabular-nums">{delta(o.priceDelta)}</span>
              </label>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {group.options.map((o) => {
            const checked = value.includes(o.id);
            if (group.kind === 'color') {
              return (
                <label key={o.id} title={o.label} className={`grid size-9 cursor-pointer place-items-center rounded-full border-2 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-site-focus ${checked ? 'border-site-fg' : 'border-transparent'}`}>
                  <input type="radio" name={name} checked={checked} onChange={() => toggle(o.id)} aria-label={o.label} className="sr-only" />
                  <span aria-hidden="true" className="size-7 rounded-full ring-1 ring-black/10" style={{ background: o.swatch }} />
                </label>
              );
            }
            return (
              <label
                key={o.id}
                className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-site-focus ${
                  checked ? 'border-site-fg bg-site-fg text-site-bg' : 'border-site-border hover:border-site-fg'
                }`}
              >
                <input type="radio" name={name} checked={checked} onChange={() => toggle(o.id)} className="sr-only" />
                {o.label}
                {o.priceDelta ? <span className="opacity-70">{delta(o.priceDelta)}</span> : null}
              </label>
            );
          })}
        </div>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-site-accent-ink">
          Elegí una opción de {group.name.toLowerCase()}.
        </p>
      )}
    </fieldset>
  );
}
