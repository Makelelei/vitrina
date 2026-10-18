import { useId } from 'react';
import type { RequestField } from '@/types';

export const siteInputClass =
  'w-full rounded-md border border-site-border bg-site-bg px-3 py-2.5 text-sm text-site-fg placeholder:text-site-muted';

interface Props {
  field: RequestField;
  value: string;
  onChange: (value: string) => void;
}

/** Campo del sitio generado desde la definición del rubro. */
export function FieldInput({ field, value, onChange }: Props) {
  const id = useId();
  const today = new Date().toISOString().slice(0, 10);
  const autoComplete = field.id === 'name' ? 'name' : field.type === 'tel' ? 'tel' : undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm">
        {field.label}
        {!field.required && <span className="text-site-muted"> (opcional)</span>}
      </label>
      {field.type === 'textarea' ? (
        <textarea id={id} rows={2} value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} required={field.required} className={siteInputClass} />
      ) : (
        <input
          id={id}
          type={field.type}
          inputMode={field.type === 'tel' ? 'tel' : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          min={field.type === 'date' ? today : undefined}
          autoComplete={autoComplete}
          className={siteInputClass}
        />
      )}
    </div>
  );
}

/** Formatea fechas ISO para el mensaje ("2026-10-24" → "sábado, 24 de octubre"). */
export function readableValue(field: RequestField, value: string) {
  if (field.type === 'date' && value) return new Date(`${value}T12:00:00`).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  if (field.type === 'time' && value) return `${value} h`;
  return value;
}
