import { useId, useState, type DragEvent } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { fileToDataUrl } from '@/lib/image';

interface Props {
  label: string;
  value: string | null | undefined;
  onChange: (dataUrl: string | null) => void;
  /** Lado máximo en píxeles tras comprimir. */
  maxSize?: number;
  hint?: string;
  compact?: boolean;
}

/** Carga local de imagen con arrastrar y soltar, compresión y vista previa. */
export function ImageUpload({ label, value, onChange, maxSize = 640, hint, compact = false }: Props) {
  const id = useId();
  const statusId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  const handle = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      onChange(await fileToDataUrl(file, maxSize));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar la imagen.');
    } finally {
      setBusy(false);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    void handle(e.dataTransfer.files[0]);
  };

  return (
    <div>
      <span className="ui-label">{label}</span>
      <div className="flex items-center gap-3">
        <label
          htmlFor={id}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`relative grid shrink-0 cursor-pointer place-items-center overflow-hidden rounded-lg border border-dashed transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ui-ring ${
            compact ? 'size-14' : 'size-20'
          } ${dragging ? 'border-ui-accent bg-ui-hover' : 'border-ui-border bg-ui-subtle hover:border-ui-muted'}`}
        >
          <input
            id={id}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
            className="sr-only"
            aria-describedby={statusId}
            onChange={(e) => {
              void handle(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          {busy ? (
            <Loader2 className="size-5 animate-spin text-ui-muted" aria-hidden="true" />
          ) : value ? (
            <img src={value} alt="Vista previa" className="h-full w-full object-contain p-1" />
          ) : (
            <ImagePlus className="size-5 text-ui-muted" aria-hidden="true" />
          )}
          <span className="sr-only">{value ? `Cambiar ${label.toLowerCase()}` : `Subir ${label.toLowerCase()}`}</span>
        </label>
        <div className="min-w-0 text-xs">
          <p id={statusId} className={error ? 'text-ui-danger' : 'text-ui-muted'} aria-live="polite">
            {error || hint || 'PNG, JPG, WebP o SVG. Arrastrá o hacé clic.'}
          </p>
          {value && (
            <button type="button" onClick={() => onChange(null)} className="mt-1.5 inline-flex items-center gap-1 text-ui-muted hover:text-ui-danger">
              <Trash2 className="size-3.5" aria-hidden="true" /> Quitar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
