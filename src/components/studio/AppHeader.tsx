import { ChevronDown, PanelLeftClose, PanelLeftOpen, Rocket } from 'lucide-react';
import { DeviceToggle } from '@/components/preview/DeviceToggle';
import { Logo } from '@/components/ui/Logo';
import { useUiStore } from '@/store/useUiStore';
import { useSiteBuilderStore } from '@/store/useSiteBuilderStore';
import { CATEGORIES } from '@/data/demos';
import { ThemeToggle } from './ThemeToggle';

export const SIDEBAR_ID = 'studio-sidebar';

export function AppHeader() {
  const setCheckoutOpen = useUiStore((s) => s.setCheckoutOpen);
  const setOnboarded = useUiStore((s) => s.setOnboarded);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const category = CATEGORIES[useSiteBuilderStore((s) => s.businessCategory)];

  return (
    <header className="glass relative z-20 grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 border-b px-3 lg:px-4">
      <div className="flex min-w-0 items-center gap-2 overflow-hidden">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-expanded={!collapsed}
          aria-controls={SIDEBAR_ID}
          aria-label={collapsed ? 'Mostrar panel de edición' : 'Ocultar panel de edición'}
          className="hidden size-8 place-items-center rounded-md text-ui-muted hover:bg-ui-hover hover:text-ui-fg lg:grid"
        >
          {collapsed ? <PanelLeftOpen className="size-4" aria-hidden="true" /> : <PanelLeftClose className="size-4" aria-hidden="true" />}
        </button>
        <span className="hidden sm:inline-flex">
          <Logo />
        </span>
        <span className="sm:hidden">
          <Logo showText={false} />
        </span>
        <span aria-hidden="true" className="hidden h-5 w-px bg-ui-border lg:block" />
        <button
          type="button"
          onClick={() => setOnboarded(false)}
          className="hidden min-w-0 items-center gap-1.5 rounded-md px-2 py-1 text-sm text-ui-muted transition-colors hover:bg-ui-hover hover:text-ui-fg lg:inline-flex"
        >
          <category.icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
          <span className="truncate">{category.name}</span>
          <ChevronDown className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="sr-only">: cambiar rubro</span>
        </button>
      </div>

      <DeviceToggle />

      <div className="flex min-w-0 items-center justify-end gap-1.5">
        <ThemeToggle />
        <button type="button" onClick={() => setCheckoutOpen(true)} aria-label="Aprobar este diseño y activar mi sitio" className="ui-btn ui-btn-neon h-8 px-3">
          <Rocket className="size-3.5" aria-hidden="true" />
          <span className="hidden xl:inline">Aprobar este diseño y Activar Mi Sitio</span>
          <span className="xl:hidden">Activar</span>
        </button>
      </div>
    </header>
  );
}
