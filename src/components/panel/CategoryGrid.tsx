import { CATEGORY_LIST, DEMOS, MODE_LABEL } from '@/data/demos';
import type { BusinessCategory } from '@/types';

interface Props {
  value: BusinessCategory | null;
  onSelect: (id: BusinessCategory) => void;
  compact?: boolean;
}

/** Selector de rubro: radios nativos (navegables con flechas) con apariencia de tarjeta. */
export function CategoryGrid({ value, onSelect, compact = false }: Props) {
  return (
    <fieldset>
      <legend className="sr-only">Rubro del negocio</legend>
      <div className={`grid gap-2 ${compact ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:gap-3'}`}>
        {CATEGORY_LIST.map((cat) => {
          const checked = cat.id === value;
          const modes = [...new Set(cat.demos.map((d) => MODE_LABEL[DEMOS[d].mode]))].join(' · ');
          return (
            <label
              key={cat.id}
              className={`group relative flex cursor-pointer flex-col rounded-xl border transition-all has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ui-ring ${
                compact ? 'gap-2 p-3' : 'glass gap-4 p-4 hover:-translate-y-0.5 sm:gap-6 sm:p-5'
              } ${
                checked
                  ? 'border-transparent bg-ui-hover shadow-[0_0_0_1.5px_var(--ui-accent),0_0_24px_-6px_color-mix(in_oklab,var(--ui-accent)_70%,transparent)]'
                  : 'border-ui-border hover:border-ui-muted'
              }`}
            >
              <input type="radio" name="business-category" value={cat.id} checked={checked} onChange={() => onSelect(cat.id)} className="sr-only" />
              <span className="flex items-start justify-between gap-2">
                <cat.icon className={compact ? 'size-4' : 'size-5 text-ui-accent'} strokeWidth={1.5} aria-hidden="true" />
                {!compact && <span className="rounded-full bg-ui-subtle px-2 py-0.5 text-[11px] text-ui-muted">{modes}</span>}
              </span>
              <span>
                <span className={`block font-medium ${compact ? 'text-xs' : 'text-sm'}`}>{cat.name}</span>
                {!compact && <span className="mt-0.5 block text-xs text-ui-muted">{cat.description}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
