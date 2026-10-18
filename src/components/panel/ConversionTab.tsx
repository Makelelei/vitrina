import { CreditCard, MessageCircle, Shuffle } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useSiteBuilderStore } from '@/store/useSiteBuilderStore';
import { useDemo } from '@/hooks/useDemo';
import { formatPrice, isHttpsUrl } from '@/lib/format';
import { TextField } from '@/components/ui/TextField';
import type { CheckoutMode, PaymentProvider } from '@/types';
import { Switch } from '@/components/ui/Switch';
import { PanelGroup } from './PanelGroup';
import { SPOT } from '@/lib/spotlight';
import { RadioCardGroup } from './RadioCardGroup';
import { QrCard } from './QrCard';

const MODES: { id: CheckoutMode; label: string; description: string; Icon: typeof CreditCard }[] = [
  { id: 'whatsapp_only', label: 'Solo WhatsApp', description: 'El pedido llega armado a tu chat.', Icon: MessageCircle },
  { id: 'payment_link', label: 'Link de pago', description: 'Cobrás online antes de confirmar.', Icon: CreditCard },
  { id: 'hybrid', label: 'Híbrido', description: 'El cliente elige: pagar o coordinar.', Icon: Shuffle },
];

const PROVIDERS: { id: PaymentProvider; label: string; color: string }[] = [
  { id: 'mercadopago', label: 'Mercado Pago', color: '#009ee3' },
  { id: 'stripe', label: 'Stripe', color: '#635bff' },
];

export function ConversionTab() {
  const s = useSiteBuilderStore(
    useShallow((st) => ({
      checkoutMode: st.checkoutMode,
      conversion: st.conversion,
      zones: st.business.deliveryZones,
      setCheckoutMode: st.setCheckoutMode,
      updateConversion: st.updateConversion,
    })),
  );
  const demo = useDemo();
  const inquiryOnly = demo.mode === 'inquiry';

  return (
    <>
      <PanelGroup focus={SPOT.catalog} title="Cómo cobrás" description={inquiryOnly ? 'Este rubro trabaja con consultas por WhatsApp.' : undefined}>
        <RadioCardGroup
          legend="Modo de checkout"
          hideLegend
          value={inquiryOnly ? 'whatsapp_only' : s.checkoutMode}
          onChange={s.setCheckoutMode}
          options={MODES.map((m) => ({
            value: m.id,
            disabled: inquiryOnly && m.id !== 'whatsapp_only',
            content: (
              <span className="flex w-full items-center gap-3">
                <m.Icon className="size-4 shrink-0 text-ui-accent" aria-hidden="true" />
                <span>
                  <span className="block text-sm font-medium">{m.label}</span>
                  <span className="block text-xs text-ui-muted">{m.description}</span>
                </span>
              </span>
            ),
          }))}
        />
      </PanelGroup>

      {!inquiryOnly && s.checkoutMode !== 'whatsapp_only' && (
        <PanelGroup focus={SPOT.catalog} title="Procesador de pagos" description="En la vista previa el pago es simulado. En el sitio publicado se usa el link del negocio.">
          <RadioCardGroup
            legend="Procesador"
            hideLegend
            value={s.conversion.paymentProvider}
            onChange={(paymentProvider) => s.updateConversion({ paymentProvider })}
            columns="grid-cols-2"
            options={PROVIDERS.map((p) => ({
              value: p.id,
              content: (
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: p.color }} />
                  {p.label}
                </span>
              ),
            }))}
          />
          <TextField
            label="Link de pago del negocio"
            type="url"
            inputMode="url"
            value={s.conversion.paymentLinkUrl ?? ''}
            placeholder="https://mpago.la/..."
            onValueChange={(v) => s.updateConversion({ paymentLinkUrl: v.trim() || undefined })}
            hint="Link de Mercado Pago o Stripe del negocio: el dinero lo cobra directamente el negocio."
            error={s.conversion.paymentLinkUrl && !isHttpsUrl(s.conversion.paymentLinkUrl) ? 'Tiene que ser un link https:// válido.' : undefined}
          />
          {demo.mode === 'booking' && (
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>
                Seña al reservar
                <span className="block text-xs text-ui-muted">Ej: {formatPrice(Math.round((20000 * s.conversion.depositPercent) / 100))} sobre un servicio de {formatPrice(20000)}</span>
              </span>
              <span className="flex items-center gap-2">
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={10}
                  value={s.conversion.depositPercent}
                  onChange={(e) => s.updateConversion({ depositPercent: Number(e.target.value) })}
                  aria-valuetext={`${s.conversion.depositPercent}%`}
                  className="w-24 accent-[var(--ui-accent)]"
                />
                <span className="w-9 text-right font-mono text-xs tabular-nums">{s.conversion.depositPercent}%</span>
              </span>
            </label>
          )}
        </PanelGroup>
      )}

      <PanelGroup focus={SPOT.catalog} title="Operación">
        <div className="-my-1 divide-y divide-ui-border">
          {demo.mode === 'booking' && (
            <Switch
              label="Reservas online"
              description={s.conversion.bookingsEnabled ? 'Elegís día y horario en el sitio' : 'Los servicios se consultan por WhatsApp'}
              checked={s.conversion.bookingsEnabled}
              onCheckedChange={(bookingsEnabled) => s.updateConversion({ bookingsEnabled })}
            />
          )}
          {demo.mode === 'order' && (
            <Switch
              label="Envío a domicilio"
              description={s.zones.length ? `${s.zones.length} zonas configuradas` : 'Sin zonas para este rubro'}
              checked={s.conversion.deliveryEnabled && s.zones.length > 0}
              disabled={s.zones.length === 0}
              onCheckedChange={(deliveryEnabled) => s.updateConversion({ deliveryEnabled })}
            />
          )}
          {inquiryOnly && <p className="py-2.5 text-xs text-ui-muted">Cada ítem tiene un botón “Consultar” que abre WhatsApp con los datos cargados.</p>}
        </div>
      </PanelGroup>

      <PanelGroup title="Código QR" description="Para mesas, vidrieras, tarjetas o packaging.">
        <QrCard />
      </PanelGroup>
    </>
  );
}
