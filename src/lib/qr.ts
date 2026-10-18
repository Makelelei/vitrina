/**
 * Genera un QR como data-URL PNG. Corrección de errores alta: sigue leyéndose
 * impreso o con manchas. La librería se carga bajo demanda.
 */
export async function qrDataUrl(text: string, { size = 512, dark = '#000000', light = '#ffffff' } = {}) {
  const { default: QRCode } = await import('qrcode');
  return QRCode.toDataURL(text, { width: size, margin: 2, errorCorrectionLevel: 'H', color: { dark, light } });
}
