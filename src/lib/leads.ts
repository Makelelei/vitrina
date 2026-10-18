import type { PlanId, SiteConfig } from '@/types';
import { isRecord } from './schema';

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...readLeads(), record]));
  } catch (error) {
    // Almacenamiento no disponible o lleno: el lead se devuelve igual y el flujo continúa.
    console.warn('[vitrina] No se pudo guardar el lead localmente:', error);
  }
  return record;
}

const isLeadRecord = (v: unknown): v is LeadRecord =>
  isRecord(v) &&
  typeof v.id === 'string' &&
  typeof v.createdAt === 'string' &&
  (v.plan === 'basico' || v.plan === 'pro') &&
  isRecord(v.contact) &&
  ['name', 'email', 'phone'].every((k) => typeof (v.contact as Record<string, unknown>)[k] === 'string') &&
  isRecord(v.config);

/** Lee los leads guardados descartando entradas inválidas (JSON dañado o editado a mano). */
export function readLeads(): LeadRecord[] {
  let raw: unknown;
  try {
    raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch (error) {
    console.warn('[vitrina] Leads guardados ilegibles; se descartan:', error);
    return [];
  }
  if (!Array.isArray(raw)) return [];
  const valid = raw.filter(isLeadRecord);
  if (valid.length !== raw.length) console.warn(`[vitrina] Se descartaron ${raw.length - valid.length} leads inválidos.`);
  return valid;
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
