import { Bike, Clock, Flame } from 'lucide-react';
import type { DemoDefinition } from '@/types';
import { BASE_SECTIONS, HOURS, ZONES } from '../business';
import { choice, extras } from '../variants';

const burgerSize = choice('Tamaño', [['Simple'], ['Doble', 2500], ['Triple', 4500]]);
const burgerExtras = extras('Extras', [['Cheddar extra', 900], ['Bacon', 1200], ['Huevo frito', 700], ['Jalapeños', 500]]);

export const gastroBurgers: DemoDefinition = {
  id: 'gastro-burgers',
  category: 'gastronomy',
  name: 'Hamburguesería / Casa de comidas',
  examples: 'Hamburgueserías, rotiserías, pizzerías, cafés',
  icon: Flame,
  mode: 'order',
  defaults: {
    brandName: 'Casa Fuego',
    tagline: 'Hecho a la plancha, al toque.',
    about: 'Somos una cocina de barrio. Pocos ingredientes, bien elegidos, y todo cocinado en el momento. Sin apuros y sin vueltas.',
    announcement: '10% OFF en tu primer pedido online',
    preset: 'ember',
    layout: 'interactive-menu',
    checkoutMode: 'hybrid',
  },
  copy: {
    heroKicker: 'Abierto · Delivery y retiro',
    heroCta: 'Ver el menú',
    navCatalog: 'Menú',
    catalogTitle: 'Menú',
    catalogSubtitle: 'Todo se cocina al momento.',
    searchPlaceholder: 'Buscar un plato…',
    itemCta: 'Agregar',
    featuredTitle: 'Promos de hoy',
    aboutTitle: 'La cocina',
    testimonialsTitle: 'Lo que dicen',
    deliveryLabel: 'Delivery',
    pickupLabel: 'Retiro',
    contactTitle: '¿Tenés un evento?',
    contactText: 'Armamos bandejas y menús para grupos. Escribinos y te pasamos opciones.',
    contactCta: 'Consultar por WhatsApp',
    cartTitle: 'Tu pedido',
    emptyCart: 'Sumá platos del menú para empezar.',
    messageIntro: 'Quiero hacer el siguiente pedido:',
  },
  categories: [
    { id: 'hamburguesas', label: 'Hamburguesas', emoji: '🍔' },
    { id: 'para-picar', label: 'Para picar', emoji: '🍟' },
    { id: 'postres', label: 'Postres', emoji: '🍫' },
    { id: 'bebidas', label: 'Bebidas', emoji: '🥤' },
  ],
  items: [
    { id: 'g-combo', title: 'Combo Smash', description: 'Smash doble + papas medianas + bebida.', price: 13900, compareAtPrice: 16500, category: 'hamburguesas', emoji: '🍔', tags: ['burger', 'promo'], featured: true, variants: [burgerExtras] },
    { id: 'g-clasica', title: 'Clásica Smash', description: 'Carne smash, cheddar, pepinillos y ketchup casero.', price: 8900, category: 'hamburguesas', emoji: '🍔', tags: ['burger'], variants: [burgerSize, burgerExtras] },
    { id: 'g-bacon', title: 'Bacon Lovers', description: 'Doble bacon, cheddar fundido y salsa de la casa.', price: 10900, category: 'hamburguesas', emoji: '🥓', tags: ['burger'], variants: [burgerSize, burgerExtras] },
    { id: 'g-picante', title: 'La Picante', description: 'Jalapeños, pepper jack y mayo de chipotle.', price: 10400, category: 'hamburguesas', emoji: '🌶️', tags: ['burger', 'picante'], variants: [burgerSize, burgerExtras] },
    { id: 'g-veggie', title: 'Veggie de garbanzos', description: 'Medallón casero, palta, rúcula y tomate.', price: 9600, category: 'hamburguesas', emoji: '🥑', tags: ['burger', 'veggie'], variants: [burgerExtras] },
    { id: 'g-papas', title: 'Papas rústicas', description: 'Con alioli de ajo asado.', price: 4800, category: 'para-picar', emoji: '🍟', tags: ['compartir', 'veggie'], variants: [choice('Porción', [['Mediana'], ['Grande', 1800]]), extras('Toppings', [['Cheddar', 900], ['Bacon', 1200]])] },
    { id: 'g-aros', title: 'Aros de cebolla', description: 'Rebozados en cerveza, dip barbacoa.', price: 5200, compareAtPrice: 6200, category: 'para-picar', emoji: '🧅', tags: ['compartir', 'veggie', 'promo'], featured: true },
    { id: 'g-nuggets', title: 'Nuggets x8', description: 'Pollo de campo con panko y miel-mostaza.', price: 5800, category: 'para-picar', emoji: '🍗', tags: ['compartir'] },
    { id: 'g-brownie', title: 'Brownie tibio', description: 'Con helado de crema americana.', price: 5500, category: 'postres', emoji: '🍫', tags: ['dulce'] },
    { id: 'g-shake', title: 'Shake de Oreo', description: 'Batido espeso de vainilla y galletitas.', price: 6200, category: 'postres', emoji: '🥤', tags: ['dulce'], featured: true },
    { id: 'g-gaseosa', title: 'Gaseosa 500 ml', description: 'Bien fría.', price: 2500, category: 'bebidas', emoji: '🥤', variants: [choice('Sabor', [['Cola'], ['Lima-limón'], ['Naranja']])] },
    { id: 'g-ipa', title: 'Cerveza IPA', description: 'Pinta artesanal de la casa.', price: 4900, category: 'bebidas', emoji: '🍺' },
  ],
  cravings: [
    { tag: 'burger', label: 'Una burger', emoji: '🍔' },
    { tag: 'picante', label: 'Algo picante', emoji: '🌶️' },
    { tag: 'veggie', label: 'Veggie', emoji: '🌱' },
    { tag: 'compartir', label: 'Para compartir', emoji: '🍟' },
    { tag: 'dulce', label: 'Algo dulce', emoji: '🍫' },
  ],
  highlights: [
    { icon: Clock, title: 'Listo en 20 min', text: 'Cocinamos al momento.' },
    { icon: Bike, title: 'Delivery propio', text: 'Llega caliente, en envases compostables.' },
    { icon: Flame, title: 'A la plancha', text: 'Carne de productores locales.' },
  ],
  testimonials: [
    { quote: 'La mejor hamburguesa del barrio, y llega en serio en 20 minutos.', author: 'Martina R.', detail: 'Pide los viernes' },
    { quote: 'El combo es enorme. Pedí la triple con bacon y no me arrepiento.', author: 'Diego P.', detail: 'Cliente desde 2021' },
    { quote: 'Pedimos para 30 personas y salió todo perfecto.', author: 'Lucía G.', detail: 'Evento de empresa' },
  ],
  hours: HOURS.food,
  deliveryZones: ZONES.food,
  supports: [...BASE_SECTIONS, 'cravings', 'delivery'],
};
