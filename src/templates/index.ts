import type { ComponentType } from 'react';
import type { LayoutTemplate } from '@/types';
import { InteractiveMenuTemplate } from './InteractiveMenuTemplate';
import { CatalogGridTemplate } from './CatalogGridTemplate';
import { ServicesBookingTemplate } from './ServicesBookingTemplate';
import { MinimalLandingTemplate } from './MinimalLandingTemplate';

export const TEMPLATE_COMPONENTS: Record<LayoutTemplate, ComponentType> = {
  'interactive-menu': InteractiveMenuTemplate,
  'catalog-grid': CatalogGridTemplate,
  'services-booking': ServicesBookingTemplate,
  'minimal-landing': MinimalLandingTemplate,
};
