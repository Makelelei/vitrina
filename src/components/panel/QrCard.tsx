import { useEffect, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useSiteBuilderStore } from '@/store/useSiteBuilderStore';
import { useDemo } from '@/hooks/useDemo';
import { qrDataUrl } from '@/lib/qr';
import { siteUrl, slugify } from '@/lib/format';
import { contrastRatio } from '@/lib/color';
import { Switch } from '@/components/ui/Switch';

/** Genera el QR del sitio para imprimir en mesas, vidrieras o tarjetas. */
export function QrCard({ compact = false }: { compact?: boolean }) {
  const { name, logoUrl, primary } = useSiteBuilderStore(
    useShallow((s) => ({ name: s.brandDetails.name, logoUrl: s.brandDetails.logoUrl, primary: s.themeSettings.primaryColor })),
  );
  const demo = useDemo();
  const url = siteUrl(name);
  // El color de marca solo se usa si se sigue leyendo bien sobre blanco.
  const brandReadable = contrastRatio(primary, '#ffffff') >= 4.5;
  const [useBrand, setUseBrand] = useState(false);
  const [src, setSrc] = useState('');

  useEffect(() => {
    let cancelled = false;
    qrDataUrl(url, { dark: useBrand && brandReadable ? primary : '#000000' }).then((data) => !cancelled && setSrc(data));
    return () => {
      cancelled = true;
    };
  }, [url, useBrand, brandReadable, primary]);

  const download = () => {
    const a = document.createElement('a');
    a.href = src;
    a.download = `qr-${slugify(name)}.png`;
    a.click();
  };

  const print = () => {
    const frame = document.createElement('iframe');
    frame.style.cssText = 'position:fixed;width:0;height:0;border:0;';
    document.body.appendChild(frame);
    const doc = frame.contentDocument!;
    const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
    doc.open();
    doc.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>QR ${esc(name)}</title>
      <style>body{font-family:Inter,system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0}
      .card{text-align:center;padding:40px;border:1px solid #ddd;border-radius:24px;width:320px}
      img.qr{width:260px;height:260px}img.logo{max-height:56px;margin-bottom:12px}h1{font-size:22px;margin:8px 0 4px}p{margin:0;color:#555;font-size:14px}</style></head>
      <body><div class="card">${logoUrl ? `<img class="logo" src="${logoUrl}" alt="">` : ''}<h1>${esc(name)}</h1>
      <p>Escaneá para ver ${esc(demo.copy.catalogTitle.toLowerCase())}</p><img class="qr" src="${src}" alt="Código QR"><p>${esc(url.replace('https://', ''))}</p></div></body></html>`);
    doc.close();
    frame.onload = () => {
      frame.contentWindow?.print();
      setTimeout(() => frame.remove(), 1000);
    };
  };

  return (
    <div className={`flex gap-4 ${compact ? 'flex-col items-center text-center' : 'flex-col items-stretch'}`}>
      <div className="shrink-0 self-center rounded-xl bg-white p-2 shadow-[0_0_24px_-8px_color-mix(in_oklab,var(--ui-accent)_60%,transparent)]">
        {src ? <img src={src} alt={`Código QR que abre ${url}`} className="mx-auto size-40" /> : <div className="mx-auto size-40" />}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <p className="truncate text-center font-mono text-[11px] text-ui-muted">{url.replace('https://', '')}</p>
        {!compact && (
          <Switch
            label="Usar color de marca"
            description={brandReadable ? undefined : 'Poco contraste para un QR legible'}
            checked={useBrand && brandReadable}
            disabled={!brandReadable}
            onCheckedChange={setUseBrand}
          />
        )}
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={download} disabled={!src} className="ui-btn ui-btn-ghost h-8 px-2.5 text-xs">
            <Download className="size-3.5" aria-hidden="true" /> PNG
          </button>
          <button type="button" onClick={print} disabled={!src} className="ui-btn ui-btn-ghost h-8 px-2.5 text-xs">
            <Printer className="size-3.5" aria-hidden="true" /> Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}
