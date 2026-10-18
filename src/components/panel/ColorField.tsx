import { useEffect, useId, useState } from 'react';
import { contrastRatio, hexToHsl, hslToHex, isValidHex, normalizeHex, wcagLevel } from '@/lib/color';

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  /** Color contra el cual se mide el contraste mostrado. */
  contrastWith: string;
  contrastLabel: string;
}

export function ColorField({ label, value, onChange, contrastWith, contrastLabel }: ColorFieldProps) {
  const [text, setText] = useState(value);
  const [showHsl, setShowHsl] = useState(false);
  const id = useId();
  const errorId = useId();
  const hslId = useId();

  // Sincroniza el texto cuando el color cambia desde fuera (preset, selector).
  useEffect(() => setText(value), [value]);

  const valid = isValidHex(text);
  const hsl = hexToHsl(value);
  const ratio = contrastRatio(value, contrastWith);
  const level = wcagLevel(ratio);
  const ok = level === 'AAA' || level === 'AA';

  const commit = (raw: string) => {
    setText(raw);
    if (isValidHex(raw)) onChange(normalizeHex(raw));
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => commit(e.target.value)}
          aria-label={`Selector visual: ${label}`}
          className="size-8 shrink-0 cursor-pointer rounded-md border border-ui-border bg-transparent p-0 [&::-webkit-color-swatch]:rounded-[5px] [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:p-0.5"
        />
        <label htmlFor={id} className="w-20 shrink-0 text-xs text-ui-muted">
          {label}
        </label>
        <input
          id={id}
          type="text"
          value={text}
          onChange={(e) => commit(e.target.value)}
          onBlur={() => !valid && setText(value)}
          spellCheck={false}
          maxLength={7}
          aria-invalid={!valid || undefined}
          aria-describedby={!valid ? errorId : undefined}
          className="ui-input min-w-0 flex-1 py-1.5 font-mono text-xs uppercase"
        />
        <span title={`Contraste ${contrastLabel}`} className={`w-12 shrink-0 text-right font-mono text-[11px] ${ok ? 'text-ui-muted' : 'text-ui-danger'}`}>
          {ratio.toFixed(1)}:1
          <span className="sr-only">
            {' '}
            de contraste {contrastLabel}, {level}
          </span>
        </span>
        <button
          type="button"
          onClick={() => setShowHsl((s) => !s)}
          aria-expanded={showHsl}
          aria-controls={hslId}
          aria-label={`Ajustar ${label} en HSL`}
          className={`rounded-md px-1.5 py-1 font-mono text-[10px] ${showHsl ? 'bg-ui-strong text-ui-on-strong' : 'text-ui-muted hover:bg-ui-hover'}`}
        >
          HSL
        </button>
      </div>
      {!valid && (
        <p id={errorId} className="mt-1 pl-10 text-xs text-ui-danger">
          HEX inválido, ej: #1E3A5F
        </p>
      )}
      {showHsl && (
        <div id={hslId} className="mt-2 space-y-1.5 pl-10">
          {(
            [
              { key: 'h', label: 'Tono', max: 360, unit: '°' },
              { key: 's', label: 'Saturación', max: 100, unit: '%' },
              { key: 'l', label: 'Luz', max: 100, unit: '%' },
            ] as const
          ).map((ch) => (
            <label key={ch.key} className="flex items-center gap-2 text-[11px] text-ui-muted">
              <span className="w-16 shrink-0">{ch.label}</span>
              <input
                type="range"
                min={0}
                max={ch.max}
                value={hsl[ch.key]}
                onChange={(e) => commit(hslToHex({ ...hsl, [ch.key]: Number(e.target.value) }))}
                aria-valuetext={`${hsl[ch.key]}${ch.unit}`}
                className="h-1 flex-1 cursor-pointer accent-[var(--ui-accent)]"
              />
              <span className="w-9 text-right font-mono tabular-nums">
                {hsl[ch.key]}
                {ch.unit}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
