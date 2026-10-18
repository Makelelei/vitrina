/**
 * Arma la carpeta lista para subir del sitio de un cliente.
 *
 * Uso:   npm run client -- ruta/al/vitrina-negocio.json [--slug nombre]
 * Sale:  clients/<slug>/  (index.html + assets + site.json + .htaccess)
 *
 * El JSON es el que llega con cada solicitud (o el que exporta el estudio).
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, copyFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

const fail = (msg) => {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
};

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const slugFlag = args.indexOf('--slug');
if (!file) fail('Indicá el JSON del cliente: npm run client -- ruta/al/archivo.json');
if (!existsSync(file)) fail(`No existe el archivo: ${file}`);
if (!existsSync('dist/site.html')) fail('Falta dist/. Ejecutá "npm run build" primero.');

let raw;
try {
  raw = JSON.parse(readFileSync(file, 'utf8'));
} catch (error) {
  fail(`El JSON no es válido (${error.message}).`);
}

// Formato de exportación ({ schema, site, lead }) o configuración directa.
const site = raw && typeof raw === 'object' && raw.site && typeof raw.site === 'object' ? raw.site : raw;
const name = site?.brandDetails?.name;
if (typeof name !== 'string' || !name.trim()) fail('El JSON no tiene brandDetails.name: ¿es una configuración de Vitrina?');

const slugify = (value) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'cliente';

const slug = slugFlag >= 0 && args[slugFlag + 1] ? slugify(args[slugFlag + 1]) : slugify(name);
const out = resolve('clients', slug);

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

// Copia el build sin el estudio: el sitio publicado pasa a ser la portada.
const isStudioOnly = (src) => {
  const name = basename(src);
  return (!src.includes('assets') && (name === 'index.html' || name === 'site.html')) || /^studio-.*\.js$/.test(name);
};
cpSync('dist', out, { recursive: true, filter: (src) => !isStudioOnly(src) });
copyFileSync('dist/site.html', join(out, 'index.html'));
writeFileSync(join(out, 'site.json'), JSON.stringify(site, null, 2));
writeFileSync(
  join(out, '.htaccess'),
  `# Generado por Vitrina
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

<IfModule mod_headers.c>
  <FilesMatch "\\.(js|css|svg|png|webp|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "^(index\\.html|site\\.json)$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
</IfModule>
`,
);

console.log(`
✓ Sitio de "${name}" listo en clients/${slug}/

Para publicarlo en Hostinger:
  1. hPanel → Dominios → Subdominios: creá "${slug}" en el dominio de Vitrina
     (o usá el dominio propio del cliente).
  2. Administrador de archivos → carpeta del subdominio: subí TODO el contenido
     de clients/${slug}/ (incluido .htaccess).
  3. Abrí https://${slug}.<tu-dominio> y probá un pedido de punta a punta.

Para actualizar contenido después: editá site.json y volvé a subir solo ese archivo.
`);
