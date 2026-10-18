import { formatPrice } from './format';
import type { Currency } from '@/types';

export const sanitizePhone = (raw: string) => raw.replace(/\D/g, '');

/** E.164 admite hasta 15 dígitos; exigimos al menos 8 para descartar números incompletos. */
export function isValidWhatsApp(raw: string) {
  const digits = sanitizePhone(raw);
  return digits.length >= 8 && digits.length <= 15;
}

export interface MessageLine {
  title: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
  currency?: Currency;
}

export interface LabeledValue {
  label: string;
  value: string;
}

export interface OrderMessage {
  brandName: string;
  intro: string;
  lines: MessageLine[];
  shipping?: { label: string; zone?: string; cost: number } | null;
  fields?: LabeledValue[];
  /** Comprobante cuando se pagó con link de pago. */
  payment?: { provider: string; reference: string } | null;
}

const filled = (fields: LabeledValue[] = []) => fields.filter((f) => f.value.trim());

export function buildOrderMessage({ brandName, intro, lines, shipping, fields, payment }: OrderMessage) {
  const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
  const shippingCost = shipping?.cost ?? 0;
  const parts = [`¡Hola ${brandName}! ${intro}`, ''];

  for (const l of lines) {
    parts.push(`• ${l.quantity} × ${l.title} — ${formatPrice(l.quantity * l.unitPrice, l.currency)}`);
    if (l.variant) parts.push(`   ${l.variant}`);
  }
  parts.push('', `Subtotal: ${formatPrice(subtotal)}`);
  if (shipping) parts.push(`${shipping.label}${shipping.zone ? ` · ${shipping.zone}` : ''}: ${shippingCost === 0 ? 'sin cargo' : formatPrice(shippingCost)}`);
  parts.push(`*Total: ${formatPrice(subtotal + shippingCost)}*`);

  const extra = filled(fields);
  if (extra.length) parts.push('', ...extra.map((f) => `${f.label}: ${f.value.trim()}`));
  if (payment) parts.push('', `✅ Pagado con ${payment.provider} · Operación ${payment.reference}`);
  return parts.join('\n');
}

/** Turnos y consultas sobre un ítem puntual. */
export function buildRequestMessage(brandName: string, intro: string, subject: string, fields: LabeledValue[], payment?: OrderMessage['payment']) {
  const parts = [`¡Hola ${brandName}! ${intro}`, '', `*${subject}*`, '', ...filled(fields).map((f) => `${f.label}: ${f.value.trim()}`)];
  if (payment) parts.push('', `✅ Seña pagada con ${payment.provider} · Operación ${payment.reference}`);
  return parts.join('\n').trim();
}

export const buildWhatsAppUrl = (phone: string, message: string) =>
  `https://wa.me/${sanitizePhone(phone)}?text=${encodeURIComponent(message)}`;
