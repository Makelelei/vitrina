import type { PlanId, SiteConfig } from '@/types';

const STORAGE_KEY = 'vitrina-leads';

export interface LeadContact {
  name: string;
  email: string;
  phone: string;
}

export interface LeadRecord {
  id: string;
  createdAt: string;
  plan: PlanId;
  contact: LeadContact;
  config: SiteConfig;
  subscription?: { provider: string; reference: string; status: 'approved' };
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * API mock: simula latencia de red y persiste el lead en localStorage.
 * Reemplazar por `fetch('/api/leads', …)` o Firebase cuando exista backend.
 */
export async function submitLead(input: Omit<LeadRecord, 'id' | 'createdAt'>): Promise<LeadRecord> {
  await delay(700);
  const record: LeadRecord = { ...input, id: `VT-${Date.now().toString(36).toUpperCase()}`, createdAt: new Date().toISOString() };
  try {
    const list: LeadRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    list.push(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Almacenamiento no disponible o lleno: el flujo continúa igual.
  }
  return record;
}

/** Simula la aprobación de un pago con tarjeta / link de pago. */
export async function simulatePayment(): Promise<{ reference: string }> {
  await delay(1200);
  return { reference: String(Math.floor(10_000_000 + Math.random() * 89_999_999)) };
}

/** Estructura de exportación versionada para poder importarla en el backend. */
export function buildExport(config: SiteConfig, extra: Record<string, unknown> = {}) {
  return { schema: 'vitrina.site-config', version: 1, exportedAt: new Date().toISOString(), site: config, ...extra };
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(filename, blob);
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
