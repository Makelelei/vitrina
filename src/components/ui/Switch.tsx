import { useId } from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';

interface SwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Switch({ label, description, checked, onCheckedChange, disabled }: SwitchProps) {
  const id = useId();
  const descId = useId();
  return (
    <div className={`flex items-center justify-between gap-4 py-2.5 ${disabled ? 'opacity-45' : ''}`}>
      <label htmlFor={id} className="min-w-0">
        <span className="block text-sm">{label}</span>
        {description && (
          <span id={descId} className="block text-xs text-ui-muted">
            {description}
          </span>
        )}
      </label>
      <SwitchPrimitive.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-describedby={description ? descId : undefined}
        className="relative h-5 w-9 shrink-0 rounded-full bg-ui-hover ring-1 ring-ui-border transition-colors data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-ui-accent data-[state=checked]:to-ui-accent-2 data-[state=checked]:ring-0 disabled:cursor-not-allowed"
      >
        <SwitchPrimitive.Thumb className="block size-4 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-[18px]" />
      </SwitchPrimitive.Root>
    </div>
  );
}
