import type { Plan } from '@/types';

export const PLANS: Plan[] = [
  {
    id: 'basico',
    name: 'Básico',
    price: 19900,
    period: '/mes',
    features: ['Tu diseño, tal cual lo ves', 'Catálogo ilimitado con variantes', 'Pedidos y turnos por WhatsApp', 'Código QR para imprimir'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 34900,
    period: '/mes',
    features: ['Todo lo del plan Básico', 'Cobros con link de pago', 'Dominio propio + SSL', 'Estadísticas y soporte prioritario'],
    highlighted: true,
  },
];
