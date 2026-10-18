import { Cpu, ShieldCheck, Timer } from 'lucide-react';
import type { DemoDefinition } from '@/types';
import { BASE_SECTIONS, HOURS } from '../business';
import { choice } from '../variants';

export const techRepair: DemoDefinition = {
  id: 'tech-repair',
  category: 'tech_services',
  name: 'Servicio técnico / IT',
  examples: 'Servicio técnico, agencias web, soporte IT, consultorías',
  icon: Cpu,
  mode: 'booking',
  defaults: {
    brandName: 'Núcleo Tech',
    tagline: 'Reparamos tu equipo en el día.',
    about: 'Técnicos certificados, repuestos originales y garantía escrita en cada reparación. También armamos redes y sitios web para pymes.',
    announcement: 'Diagnóstico sin cargo en todas las reparaciones',
    preset: 'cyberpunk-neon',
    layout: 'services-booking',
    checkoutMode: 'payment_link',
  },
  copy: {
    heroKicker: 'Celulares · Notebooks · Redes · Web',
    heroCta: 'Agendar visita',
    navCatalog: 'Servicios',
    catalogTitle: 'Servicios',
    catalogSubtitle: 'Precios orientativos. Confirmamos tras el diagnóstico.',
    searchPlaceholder: 'Buscar pantalla, batería, red…',
    itemCta: 'Agendar',
    featuredTitle: 'Lo más pedido',
    aboutTitle: 'El laboratorio',
    testimonialsTitle: 'Clientes',
    deliveryLabel: '',
    pickupLabel: '',
    contactTitle: '¿Tu empresa necesita soporte?',
    contactText: 'Abonos mensuales de soporte IT para oficinas de hasta 50 puestos.',
    contactCta: 'Pedir propuesta',
    cartTitle: 'Agendar turno',
    emptyCart: '',
    messageIntro: 'Quiero agendar un turno:',
  },
  categories: [
    { id: 'celulares', label: 'Celulares', emoji: '📱' },
    { id: 'computadoras', label: 'Computadoras', emoji: '💻' },
    { id: 'empresas', label: 'Empresas', emoji: '🏢' },
  ],
  items: [
    { id: 't-pantalla', title: 'Cambio de pantalla', description: 'Repuesto original o de primera calidad, con garantía.', price: 45000, category: 'celulares', emoji: '📱', details: ['60 min'], durationMin: 60, featured: true, variants: [choice('Marca', [['Samsung'], ['Motorola', -5000], ['iPhone', 35000]])] },
    { id: 't-bateria', title: 'Cambio de batería', description: 'Recuperá la autonomía del primer día.', price: 28000, category: 'celulares', emoji: '🔋', details: ['45 min'], durationMin: 45, featured: true, variants: [choice('Marca', [['Samsung'], ['Motorola', -3000], ['iPhone', 12000]])] },
    { id: 't-pin', title: 'Pin de carga', description: 'Limpieza o reemplazo del conector.', price: 15000, category: 'celulares', emoji: '🔌', details: ['30 min'], durationMin: 30 },
    { id: 't-limpieza', title: 'Limpieza y pasta térmica', description: 'Tu notebook deja de calentar y hacer ruido.', price: 22000, category: 'computadoras', emoji: '💻', details: ['90 min'], durationMin: 90, featured: true },
    { id: 't-ssd', title: 'Upgrade a SSD', description: 'Incluye migración de datos y sistema.', price: 38000, category: 'computadoras', emoji: '⚡', details: ['120 min'], durationMin: 120, variants: [choice('Capacidad', [['480 GB'], ['1 TB', 25000]])] },
    { id: 't-redes', title: 'Instalación de red Wi-Fi', description: 'Relevamiento, equipos mesh y configuración.', price: null, category: 'empresas', emoji: '📶', details: ['Visita técnica'], durationMin: 60 },
    { id: 't-web', title: 'Sitio web para pymes', description: 'Diseño, dominio y hosting el primer año.', price: 350000, category: 'empresas', emoji: '🌐', details: ['Desde'], durationMin: 30 },
  ],
  highlights: [
    { icon: Timer, title: 'En el día', text: 'La mayoría de las reparaciones en 2 horas.' },
    { icon: ShieldCheck, title: 'Garantía escrita', text: '90 días en mano de obra y repuestos.' },
    { icon: Cpu, title: 'Diagnóstico gratis', text: 'Sin compromiso de reparación.' },
  ],
  testimonials: [
    { quote: 'Me cambiaron la pantalla en una hora. Quedó como nuevo.', author: 'Agustina L.', detail: 'Samsung A54' },
    { quote: 'Nos armaron la red de la oficina y nunca más se cortó.', author: 'Estudio Ferraro', detail: 'Abono empresas' },
    { quote: 'Honestos: me dijeron que no valía la pena reparar y me ahorré plata.', author: 'Ricardo S.', detail: 'Notebook' },
  ],
  hours: HOURS.office,
  deliveryZones: [],
  requestFields: [
    { id: 'name', label: 'Tu nombre', type: 'text', required: true },
    { id: 'model', label: 'Modelo del equipo', type: 'text', placeholder: 'Ej: Galaxy A54' },
    { id: 'notes', label: '¿Qué le pasa?', type: 'textarea' },
  ],
  supports: BASE_SECTIONS,
};
