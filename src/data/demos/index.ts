import { Building2, Cpu, Shirt, Sparkles, Store, UtensilsCrossed } from 'lucide-react';
import type { BusinessCategory, CategoryMeta, DemoDefinition, DemoId } from '@/types';
import { gastroBurgers } from './gastro-burgers';
import { fashionAtelier } from './fashion-atelier';
import { beautyStudio } from './beauty-studio';
import { retailBooks, retailFlorist, retailPetshop } from './retail';
import { techRepair } from './tech-repair';
import { realestateAgency } from './realestate-agency';

export const DEMOS: Record<DemoId, DemoDefinition> = {
  'gastro-burgers': gastroBurgers,
  'fashion-atelier': fashionAtelier,
  'beauty-studio': beautyStudio,
  'retail-petshop': retailPetshop,
  'retail-florist': retailFlorist,
  'retail-books': retailBooks,
  'tech-repair': techRepair,
  'realestate-agency': realestateAgency,
};

export const CATEGORIES: Record<BusinessCategory, CategoryMeta> = {
  gastronomy: { id: 'gastronomy', name: 'Gastronomía', description: 'Hamburgueserías, rotiserías, pizzerías, cafés', icon: UtensilsCrossed, demos: ['gastro-burgers'] },
  fashion: { id: 'fashion', name: 'Indumentaria y calzado', description: 'Moda, ropa urbana, zapatillas, accesorios', icon: Shirt, demos: ['fashion-atelier'] },
  beauty_services: { id: 'beauty_services', name: 'Estética, salud y servicios', description: 'Barberías, peluquerías, spa, gimnasios', icon: Sparkles, demos: ['beauty-studio'] },
  retail: { id: 'retail', name: 'Comercio minorista', description: 'Pet shops, florerías, librerías, regalerías, bazar', icon: Store, demos: ['retail-petshop', 'retail-florist', 'retail-books'] },
  tech_services: { id: 'tech_services', name: 'Servicios técnicos', description: 'Servicio técnico, soporte IT, agencias', icon: Cpu, demos: ['tech-repair'] },
  real_estate: { id: 'real_estate', name: 'Inmobiliaria', description: 'Venta, alquiler y emprendimientos', icon: Building2, demos: ['realestate-agency'] },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

export const MODE_LABEL = { order: 'Pedidos', booking: 'Turnos', inquiry: 'Consultas' } as const;
