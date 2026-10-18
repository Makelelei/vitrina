import type { OpeningHours } from '@/types';

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const toHHMM = (min: number) => `${String(Math.floor(min / 60) % 24).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

/** Considera turnos que cierran después de la medianoche (cierre < apertura). */
export function isOpenNow(hours: OpeningHours[], now = new Date()): boolean {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const today = hours.find((h) => h.day === now.getDay());
  const yesterday = hours.find((h) => h.day === (now.getDay() + 6) % 7);

  if (yesterday && !yesterday.closed) {
    const open = toMinutes(yesterday.open);
    const close = toMinutes(yesterday.close);
    if (close <= open && minutes < close) return true;
  }
  if (!today || today.closed) return false;
  const open = toMinutes(today.open);
  const close = toMinutes(today.close);
  return close > open ? minutes >= open && minutes < close : minutes >= open;
}

/** Ordena la semana empezando por el lunes. */
export const weekFromMonday = (hours: OpeningHours[]) => [...hours].sort((a, b) => ((a.day + 6) % 7) - ((b.day + 6) % 7));

export const isoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Próximos `count` días abiertos (incluye hoy si quedan horarios). */
export function nextOpenDays(hours: OpeningHours[], count = 7, from = new Date()): Date[] {
  const days: Date[] = [];
  for (let i = 0; days.length < count && i < 21; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    const h = hours.find((x) => x.day === d.getDay());
    if (h && !h.closed && (i > 0 || availableSlots(hours, d, 30, from).length > 0)) days.push(d);
  }
  return days;
}

/** Pseudo-aleatorio estable: el mismo día y hora siempre aparece igual de ocupado. */
function isTaken(date: Date, minutes: number) {
  const seed = date.getDate() * 97 + date.getMonth() * 31 + minutes;
  return Math.abs(Math.sin(seed) * 10000) % 1 < 0.32;
}

export interface Slot {
  time: string;
  available: boolean;
}

/** Horarios del día cada 30 min, dejando lugar para la duración del servicio. */
export function daySlots(hours: OpeningHours[], date: Date, durationMin = 30, now = new Date()): Slot[] {
  const h = hours.find((x) => x.day === date.getDay());
  if (!h || h.closed) return [];
  const open = toMinutes(h.open);
  let close = toMinutes(h.close);
  if (close <= open) close += 24 * 60;
  const isToday = isoDate(date) === isoDate(now);
  const nowMin = now.getHours() * 60 + now.getMinutes() + 30;
  const slots: Slot[] = [];
  for (let m = open; m + durationMin <= close; m += 30) {
    if (isToday && m < nowMin) continue;
    slots.push({ time: toHHMM(m), available: !isTaken(date, m) });
  }
  return slots;
}

export const availableSlots = (hours: OpeningHours[], date: Date, durationMin = 30, now = new Date()) =>
  daySlots(hours, date, durationMin, now).filter((s) => s.available);

/** Primer turno libre, para mostrar "Próximo turno: mañana 10:30". */
export function nextAvailable(hours: OpeningHours[], durationMin = 30, now = new Date()) {
  for (const d of nextOpenDays(hours, 7, now)) {
    const slot = availableSlots(hours, d, durationMin, now)[0];
    if (slot) return { date: d, time: slot.time };
  }
  return null;
}

export function relativeDay(date: Date, now = new Date()) {
  const diff = Math.round((new Date(date).setHours(0, 0, 0, 0) - new Date(now).setHours(0, 0, 0, 0)) / 86_400_000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Mañana';
  return date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric' });
}
