import type { PlanId, SiteConfig } from '@/types';
import { APP_CONFIG } from '@/config/app';
import { isRecord } from './schema';

const STORAGE_KEY = 'vitrina-leads';
const REQUEST_TIMEOUT_MS = 15_000;

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
  /** `server`: llegó al backend. `local`: modo demo, solo quedó en este navegador. */
  delivery: 'server' | 'local';
}

export type LeadInput = Pick<LeadRecord, 'plan' | 'contact' | 'config'> & {
  /** Campo trampa anti-bots: las personas lo dejan vacío. */
  website?: string;
};

/** Error con mensaje listo para mostrar al usuario. */
export class LeadSubmitError extends Error {}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isServerResponse = (v: unknown): v is { ok: true; id: string; createdAt: string } =>
  isRecord(v) && v.ok === true && typeof v.id === 'string' && typeof v.createdAt === 'string';

async function postToServer(endpoint: string, input: LeadInput): Promise<{ id: string; createdAt: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
  } catch (error) {
    throw new LeadSubmitError(
      error instanceof DOMException && error.name === 'AbortError'
        ? 'El servidor tardó demasiado en responder. Probá de nuevo.'
        : 'No pudimos conectarnos. Revisá tu conexión e intentá otra vez.',
    );
  } finally {
    clearTimeout(timer);
  }

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    /* respuesta sin JSON: se informa abajo */
  }
  if (!response.ok || !isServerResponse(body)) {
    const message = isRecord(body) && typeof body.error === 'string' ? body.error : 'No pudimos registrar tu solicitud. Probá de nuevo en unos minutos.';
    throw new LeadSubmitError(response.status === 429 ? 'Demasiados intentos seguidos. Esperá unos minutos.' : message);
  }
  return { id: body.id, createdAt: body.createdAt };
}

/**
 * Envía la solicitud al backend (si hay `VITE_LEAD_ENDPOINT`) y guarda una
 * copia local. Sin backend funciona en modo demo, solo en este navegador.
 */
export async function submitLead(input: LeadInput): Promise<LeadRecord> {
  const lead = { plan: input.plan, contact: input.contact, config: input.config };
  let record: LeadRecord;
  if (APP_CONFIG.leadEndpoint) {
    const saved = await postToServer(APP_CONFIG.leadEndpoint, input);
    record = { ...lead, ...saved, delivery: 'server' };
  } else {
    await delay(600);
    record = { ...lead, id: `VT-${Date.now().toString(36).toUpperCase()}`, createdAt: new Date().toISOString(), delivery: 'local' };
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...readLeads(), record]));
  } catch (error) {
    // Almacenamiento no disponible o lleno: la solicitud ya se registró igual.
    console.warn('[vitrina] No se pudo guardar la copia local del lead:', error);
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
  isRecord(v.config) &&
  (v.delivery === undefined || v.delivery === 'server' || v.delivery === 'local');

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
