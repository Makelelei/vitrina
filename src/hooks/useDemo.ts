import { useSiteBuilderStore } from '@/store/useSiteBuilderStore';
import { DEMOS } from '@/data/demos';
import type { ConversionMode } from '@/types';

/** Definición del demo activo (vocabulario, campos, secciones…). */
export function useDemo() {
  const demoId = useSiteBuilderStore((s) => s.demoId);
  return DEMOS[demoId];
}

/**
 * Modo de conversión efectivo: si el rubro es de turnos pero el dueño apagó
 * las reservas online, los servicios pasan a "consultar".
 */
export function useConversionMode(): ConversionMode {
  const demo = useDemo();
  const bookingsEnabled = useSiteBuilderStore((s) => s.conversion.bookingsEnabled);
  return demo.mode === 'booking' && !bookingsEnabled ? 'inquiry' : demo.mode;
}
