# Vitrina Studio

Creador de sitios "Try Before You Buy" para comercios de cualquier rubro. El dueño elige su rubro, carga su marca (logo, colores, tipografía), edita productos con variantes, prueba el carrito, los turnos y los cobros como si fuera su cliente, y activa el sitio desde el mismo lugar.

## Rubros y demos

| Rubro (`businessCategory`) | Demo | Conversión | Plantilla sugerida |
|---|---|---|---|
| `gastronomy` | Hamburguesería / casa de comidas | Carrito con variantes (tamaño, extras) | Menú interactivo |
| `fashion` | Indumentaria | Carrito con talle y color | Catálogo en grilla |
| `beauty_services` | Peluquería / barbería / estética | Turnos con día y horario | Servicios y turnos |
| `retail` | Pet shop · Florería · Librería | Carrito | Catálogo en grilla / Landing |
| `tech_services` | Servicio técnico / IT | Turnos (con seña online) | Servicios y turnos |
| `real_estate` | Inmobiliaria | Consulta por propiedad | Catálogo en grilla |

Las 4 plantillas (`interactive-menu`, `catalog-grid`, `services-booking`, `minimal-landing`) funcionan con cualquier rubro.

## Funcionalidades

- **Vista previa en vivo** en móvil, tablet y escritorio, con container queries.
- **Panel lateral colapsable** con 4 pestañas: Rubro y plantilla · Identidad y colores · Contenido y productos · Conversión.
- **Identidad**: carga de logo e imágenes (se comprimen a WebP), 9 estilos en 1 clic (Cyberpunk Neon, Minimal Dark, Warm Pastel, Corporate Clean, Organic Green…), selectores HEX/HSL con indicador de contraste WCAG y 4 tipografías.
- **Catálogo**: variantes de talle, color (con muestra), opción única y extras con precio. Hay vista rápida, filtros por talle y color, botones de "antojo", lookbook, categorías en rejilla, promos con precio tachado y búsqueda en tiempo real.
- **Conversión** (`checkoutMode`):
  - `whatsapp_only`: el pedido o turno llega armado a WhatsApp.
  - `payment_link`: simulador de Mercado Pago / Stripe.
  - `hybrid`: el cliente elige entre pagar o coordinar.
  - Seña configurable para turnos.
- **Código QR** del sitio, para descargar en PNG o imprimir.
- **Activación en 4 pasos**: resumen y plan, datos, suscripción simulada, y confirmación con QR y exportación JSON.
- **Accesibilidad**:
  - Contraste AA automático sobre cualquier paleta.
  - Radios y checkboxes nativos, y pestañas WAI-ARIA con navegación por teclado.
  - Foco visible y anuncios `aria-live`.
  - Respeta `prefers-reduced-motion`.

**Demo en vivo:** https://makelelei.github.io/vitrina/

## Scripts

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm run build      # typecheck + build de producción en dist/
npm run deploy     # compila y publica en GitHub Pages (rama gh-pages)
```

## Estructura

```
src/
├─ types/          Tipos de dominio (SiteConfig, CatalogItem, VariantGroup, DemoDefinition…)
├─ store/          useSiteBuilderStore (persistido) · useCartStore · useSiteUiStore · useUiStore
├─ presets/        Estilos 1 clic, tipografías, plantillas y planes
├─ data/           Demos por rubro, horarios, zonas y helpers de variantes
├─ lib/            Color/WCAG, variantes y precios, turnos, WhatsApp, imágenes, QR, leads/export
├─ hooks/          useDemo, useCatalogFilter, useCart, useSiteThemeVars
├─ templates/      Las 4 plantillas
└─ components/
   ├─ onboarding/  Bienvenida y elección de rubro
   ├─ studio/      Header, tema claro/oscuro, aviso de almacenamiento
   ├─ panel/       Panel lateral y sus 4 pestañas, editor de variantes, QR
   ├─ preview/     Lienzo y marcos de móvil, tablet y escritorio
   ├─ site/        Módulos del sitio: catálogo, vista rápida, carrito, turnos, pagos, secciones
   ├─ checkout/    Activación en 4 pasos
   └─ ui/          TextField, Switch, ImageUpload, Logo
```

## Persistencia y backend

- **Configuración del sitio**: se guarda en `localStorage` bajo `vitrina-builder`. La escritura es segura: si el navegador se queda sin espacio, la app avisa en vez de romperse.
- **Leads**: se guardan en `vitrina-leads`. Para conectar un backend real, reemplazá `submitLead` y `simulatePayment` en `src/lib/leads.ts`.
- **Exportación**: el JSON sigue el esquema `vitrina.site-config` v1 (`buildExport`).
