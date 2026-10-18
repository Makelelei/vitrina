import { useId, type ReactNode } from 'react';

interface Option<T extends string> {
  value: T;
  content: ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
}

interface RadioCardGroupProps<T extends string> {
  legend: string;
  hideLegend?: boolean;
  value: T | null;
  options: Option<T>[];
  onChange: (value: T) => void;
  columns?: string;
}

/** Radios nativos con apariencia de tarjeta: las flechas del teclado funcionan de serie. */
export function RadioCardGroup<T extends string>({ legend, hideLegend, value, options, onChange, columns = 'grid-cols-1' }: RadioCardGroupProps<T>) {
  const name = useId();
  return (
    <fieldset>
      <legend className={hideLegend ? 'sr-only' : 'ui-label'}>{legend}</legend>
      <div className={`grid gap-2 ${columns}`}>
        {options.map((opt) => {
          const checked = opt.value === value;
          return (
            <label
              key={opt.value}
              className={`relative flex rounded-lg border p-2.5 transition-all has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ui-ring ${
                opt.disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer'
              } ${
                checked
                  ? 'border-transparent bg-ui-hover shadow-[0_0_0_1.5px_var(--ui-accent),0_0_20px_-6px_color-mix(in_oklab,var(--ui-accent)_70%,transparent)]'
                  : 'border-ui-border bg-ui-subtle hover:border-ui-muted'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={checked}
                disabled={opt.disabled}
                onChange={() => onChange(opt.value)}
                aria-label={opt.ariaLabel}
                className="sr-only"
              />
              {opt.content}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
