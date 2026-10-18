# Guía de operación de Vitrina

Cómo funciona el negocio día a día: desde que un cliente pide su sitio hasta que lo tiene online.

## Accesos

| Qué | Dónde |
|---|---|
| Estudio (lo que ven los clientes) | https://armatuvitrina.com |
| Panel de solicitudes | https://armatuvitrina.com/admin/ · contraseña guardada aparte (no se versiona) |
| Código | https://github.com/Makelelei/vitrina |
| Hosting | hPanel de Hostinger → sitio `armatuvitrina.com` (separado de alvacio.net) |
| Email de avisos | hola@armatuvitrina.com |
| Base de datos | `u454816136_vitrina` (separada de la de alvacio) |

## Cuando llega una solicitud

1. **Entrá al panel** `/admin/`. La solicitud aparece con estado *Nuevo*, el plan, el rubro y los datos de contacto.
2. **Escribile por WhatsApp en menos de 24 h** (botón "WhatsApp" del panel; el mensaje ya incluye el código de solicitud). Pasá el estado a *Contactado*.
3. **Charla de relevamiento** (10–15 min):
   - ¿Qué quiere lograr? (vender más, ordenar pedidos, recibir turnos)
   - ¿Cómo cobra? Solo WhatsApp, link de pago o ambos. Si cobra online, pedile **su** link de Mercado Pago.
   - ¿Subdominio gratis o dominio propio? (el dominio propio tiene costo anual aparte)
   - Qué incluye el plan, cuántos cambios por mes, plazos (48–72 h desde que tenés todo).
4. **Cobrá** el primer mes (transferencia o link de Mercado Pago) y emití la factura. Estado → *Pagado*. Anotá el comprobante en "Notas".
5. **Pedile el material**: logo (PNG transparente o SVG), fotos, lista de productos/servicios con precios y variantes, horarios, dirección, zonas de envío, WhatsApp del negocio, texto "Sobre nosotros".
6. **Armá el sitio**:
   - Descargá el JSON desde el panel ("Descargar JSON").
   - En el estudio, cargá tu configuración, reemplazá textos, fotos y precios por los reales, y exportá el JSON final (Activar → Descargar mi configuración).
7. **Generá la carpeta del sitio**:
   ```bash
   npm run build
   npm run client -- ruta/al/vitrina-negocio.json
   ```
   Queda lista en `clients/<negocio>/`.
8. **Publicalo en Hostinger** (subdominio `negocio.armatuvitrina.com` o dominio propio del cliente): subí todo el contenido de `clients/<negocio>/`, incluido `.htaccess`.
9. **Revisión con el cliente**: pasale el link, hasta 2 rondas de cambios. Para cambios de contenido alcanza con volver a subir `site.json`.
10. **Entrega final** → estado *Publicado*. Mandale:
    - El link del sitio funcionando.
    - El código QR en PNG (pestaña Conversión del estudio).
    - Cómo le llegan los pedidos/turnos y cómo pedir cambios.
    - Fecha de renovación del plan y cómo darse de baja.
11. **Seguimiento** a los 7 días y cobro mensual.

## Precios de referencia

| Plan | Precio | Incluye |
|---|---|---|
| Básico | $19.900/mes | Sitio con su diseño, catálogo con variantes, pedidos/turnos por WhatsApp, QR |
| Pro | $34.900/mes | Todo lo anterior + link de pago, dominio propio, soporte prioritario |
| Extras | a presupuestar | Fotos, carga de catálogo grande, logo, cambios fuera del plan |

## Pendientes del negocio (no técnicos)

- [x] Dominio `armatuvitrina.com` (vence el 18/10/2027).
- [ ] Crear la casilla `hola@armatuvitrina.com` en hPanel → Emails.
- [ ] Inscripción en monotributo (ARCA) para emitir factura C.
- [ ] Número de WhatsApp Business de Vitrina (se configura en `VITE_OWNER_WHATSAPP`).
- [ ] Agregar razón social/CUIT en `public/terminos.html` y `public/privacidad.html` una vez inscripto.

## Actualizar el estudio en Hostinger

1. Completá `.env.production.local` (ver `.env.example`).
2. `npm run build`.
3. Pedile a Claude que despliegue el paquete (dist + `server/public_html` + configuración privada), o subilo desde el Administrador de archivos de hPanel.
