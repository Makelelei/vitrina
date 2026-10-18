import { Leaf, RefreshCw, Shirt } from 'lucide-react';
import type { DemoDefinition } from '@/types';
import { BASE_SECTIONS, HOURS, ZONES } from '../business';
import { colors, sizes } from '../variants';

const TALLES = ['XS', 'S', 'M', 'L', 'XL'];

export const fashionAtelier: DemoDefinition = {
  id: 'fashion-atelier',
  category: 'fashion',
  name: 'Indumentaria',
  examples: 'Ropa, ropa urbana, calzado, accesorios',
  icon: Shirt,
  mode: 'order',
  defaults: {
    brandName: 'Atelier Lino',
    tagline: 'Prendas atemporales en fibras naturales.',
    about: 'Diseñamos pocas prendas por temporada y las producimos en talleres de Buenos Aires. Lino, algodón orgánico y lana merino: materiales que duran y mejoran con el uso.',
    announcement: 'Envío gratis en compras desde $80.000 · Cambios sin cargo',
    preset: 'paper',
    layout: 'catalog-grid',
    checkoutMode: 'hybrid',
  },
  copy: {
    heroKicker: 'Colección Otoño · Producción local',
    heroCta: 'Ver colección',
    navCatalog: 'Tienda',
    catalogTitle: 'Colección',
    catalogSubtitle: 'Filtrá por talle y color.',
    searchPlaceholder: 'Buscar camisas, lino…',
    itemCta: 'Agregar',
    featuredTitle: 'Nuevos ingresos',
    aboutTitle: 'El taller',
    testimonialsTitle: 'Comunidad',
    deliveryLabel: 'Envío',
    pickupLabel: 'Retiro en showroom',
    contactTitle: '¿Dudas con el talle?',
    contactText: 'Escribinos con tus medidas y te recomendamos el calce justo.',
    contactCta: 'Consultar talle',
    cartTitle: 'Tu compra',
    emptyCart: 'Elegí prendas de la colección para empezar.',
    messageIntro: 'Quiero comprar:',
  },
  categories: [
    { id: 'mujer', label: 'Mujer', emoji: '👗' },
    { id: 'hombre', label: 'Hombre', emoji: '👔' },
    { id: 'calzado', label: 'Calzado', emoji: '👟' },
    { id: 'accesorios', label: 'Accesorios', emoji: '👜' },
  ],
  items: [
    { id: 'f-vestido', title: 'Vestido midi de lino', description: 'Corte recto, breteles regulables.', price: 68000, category: 'mujer', emoji: '👗', featured: true, variants: [sizes(['XS', 'S', 'M', 'L']), colors([['Crudo', '#e8e0d0'], ['Negro', '#1a1a1a'], ['Terracota', '#b4532a']])] },
    { id: 'f-camisa-m', title: 'Camisa oversize', description: 'Lino lavado, cuello clásico.', price: 52000, compareAtPrice: 61000, category: 'mujer', emoji: '👚', tags: ['promo'], featured: true, variants: [sizes(TALLES), colors([['Blanco', '#f5f5f0'], ['Celeste', '#a9c4dc']])] },
    { id: 'f-pantalon', title: 'Pantalón sastrero', description: 'Tiro alto, pinzas y bolsillos laterales.', price: 59000, category: 'mujer', emoji: '👖', variants: [sizes(['36', '38', '40', '42', '44'], 'Talle'), colors([['Negro', '#1a1a1a'], ['Arena', '#cbb894']])] },
    { id: 'f-camisa-h', title: 'Camisa de lino', description: 'Calce regular, botones de nácar.', price: 55000, category: 'hombre', emoji: '👔', featured: true, variants: [sizes(['S', 'M', 'L', 'XL']), colors([['Blanco', '#f5f5f0'], ['Verde oliva', '#6b7046'], ['Azul', '#2c3e5c']])] },
    { id: 'f-remera', title: 'Remera de algodón orgánico', description: 'Jersey pesado, 220 g.', price: 24000, category: 'hombre', emoji: '👕', tags: ['básico'], variants: [sizes(['S', 'M', 'L', 'XL']), colors([['Blanco', '#f5f5f0'], ['Negro', '#1a1a1a'], ['Gris', '#9a9a9a']])] },
    { id: 'f-chino', title: 'Pantalón chino', description: 'Gabardina de algodón con elastano.', price: 49000, category: 'hombre', emoji: '👖', variants: [sizes(['38', '40', '42', '44', '46']), colors([['Arena', '#cbb894'], ['Azul', '#2c3e5c']])] },
    { id: 'f-zapatilla', title: 'Zapatilla de lona', description: 'Suela de caucho natural.', price: 46000, category: 'calzado', emoji: '👟', variants: [sizes(['36', '37', '38', '39', '40', '41', '42', '43']), colors([['Blanco', '#f5f5f0'], ['Negro', '#1a1a1a']])] },
    { id: 'f-tote', title: 'Bolso tote', description: 'Lona encerada y manijas de cuero.', price: 32000, category: 'accesorios', emoji: '👜', variants: [colors([['Crudo', '#e8e0d0'], ['Negro', '#1a1a1a']])] },
    { id: 'f-bufanda', title: 'Bufanda de alpaca', description: 'Suave y liviana. 180 cm.', price: 36000, category: 'accesorios', emoji: '🧣', variants: [colors([['Camel', '#b88a5a'], ['Gris', '#9a9a9a']])] },
  ],
  highlights: [
    { icon: Leaf, title: 'Fibras naturales', text: 'Lino, algodón orgánico y merino.' },
    { icon: Shirt, title: 'Producción local', text: 'Talleres de Buenos Aires con pago justo.' },
    { icon: RefreshCw, title: 'Cambios fáciles', text: '30 días para cambiar sin costo.' },
  ],
  testimonials: [
    { quote: 'La camisa de lino es la prenda que más uso. Dos años y sigue impecable.', author: 'Valentina C.', detail: 'Compra online' },
    { quote: 'Me asesoraron por WhatsApp con el talle y me quedó perfecto.', author: 'Federico M.', detail: 'Primera compra' },
    { quote: 'Ropa simple, bien hecha y sin logos.', author: 'Paula N.', detail: 'Clienta frecuente' },
  ],
  hours: HOURS.retail,
  deliveryZones: ZONES.shipping,
  supports: [...BASE_SECTIONS, 'lookbook', 'categoryTiles', 'delivery'],
};
