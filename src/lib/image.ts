export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/**
 * Convierte una imagen local en un data-URL liviano (WebP, lado máximo `maxSize`)
 * para poder guardarla en localStorage sin agotar la cuota.
 */
export async function fileToDataUrl(file: File, maxSize = 640, quality = 0.82): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('El archivo no es una imagen.');
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('La imagen supera los 8 MB.');

  // Los SVG se guardan tal cual si son chicos: escalan perfecto.
  if (file.type === 'image/svg+xml') {
    if (file.size > 150 * 1024) throw new Error('El SVG supera los 150 KB.');
    return readAsDataUrl(file);
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo procesar la imagen.');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/webp', quality);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsDataURL(file);
  });
}
