import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

interface BaseProps {
  label: string;
  hint?: string;
  error?: string;
  onValueChange: (value: string) => void;
}

type TextFieldProps = BaseProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'>;

export function TextField({ label, hint, error, onValueChange, className = '', ...props }: TextFieldProps) {
  const id = useId();
  const hintId = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="ui-label">
        {label}
      </label>
      <input
        id={id}
        {...props}
        onChange={(e) => onValueChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={hint || error ? hintId : undefined}
        className="ui-input"
      />
      {(hint || error) && (
        <p id={hintId} className={`mt-1.5 text-xs ${error ? 'text-ui-danger' : 'text-ui-muted'}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

type TextAreaProps = BaseProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'>;

export function TextArea({ label, hint, error, onValueChange, className = '', rows = 3, ...props }: TextAreaProps) {
  const id = useId();
  const hintId = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="ui-label">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        {...props}
        onChange={(e) => onValueChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={hint || error ? hintId : undefined}
        className="ui-input resize-none"
      />
      {(hint || error) && (
        <p id={hintId} className={`mt-1.5 text-xs ${error ? 'text-ui-danger' : 'text-ui-muted'}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
