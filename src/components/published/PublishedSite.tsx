import { SiteRenderer } from '@/components/preview/SiteRenderer';

/** Sitio del cliente a pantalla completa (sin estudio ni marcos de dispositivo). */
export function PublishedSite() {
  return (
    <div className="fixed inset-0">
      <SiteRenderer />
    </div>
  );
}

export function SiteUnavailable() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#0f0f12] p-6 text-center text-[#ececf1]">
      <div>
        <h1 className="text-xl font-semibold">Sitio no disponible</h1>
        <p className="mt-2 text-sm text-[#9b9ba8]">Estamos actualizando esta página. Volvé a intentar en unos minutos.</p>
      </div>
    </main>
  );
}
