import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { motion } from 'motion/react';
import { useUiStore } from '@/store/useUiStore';
import type { DeviceMode } from '@/types';

const OPTIONS: { id: DeviceMode; label: string; Icon: typeof Monitor }[] = [
  { id: 'mobile', label: 'Móvil', Icon: Smartphone },
  { id: 'tablet', label: 'Tablet', Icon: Tablet },
  { id: 'desktop', label: 'Escritorio', Icon: Monitor },
];

export function DeviceToggle() {
  const deviceMode = useUiStore((s) => s.deviceMode);
  const setDeviceMode = useUiStore((s) => s.setDeviceMode);

  return (
    <div role="group" aria-label="Dispositivo de vista previa" className="flex rounded-lg border border-ui-border bg-ui-subtle p-0.5">
      {OPTIONS.map(({ id, label, Icon }) => {
        const active = deviceMode === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            onClick={() => setDeviceMode(id)}
            className={`relative flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors ${active ? 'text-ui-fg' : 'text-ui-muted hover:text-ui-fg'}`}
          >
            {active && (
              <motion.span
                layoutId="device-pill"
                aria-hidden="true"
                className="absolute inset-0 rounded-md bg-ui-hover shadow-[0_0_0_1px_color-mix(in_oklab,var(--ui-accent)_55%,transparent),0_0_16px_-4px_color-mix(in_oklab,var(--ui-accent)_60%,transparent)]"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <Icon className="relative size-3.5" aria-hidden="true" />
            <span className="relative hidden md:inline">{label}</span>
            <span className="sr-only md:hidden">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
