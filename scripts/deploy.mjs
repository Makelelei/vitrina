/**
 * Publica `dist/` en la rama `gh-pages` del mismo repositorio (GitHub Pages).
 * Uso: npm run deploy  (compila antes de publicar)
 */
import { execSync } from 'node:child_process';
import { existsSync, rmSync, writeFileSync } from 'node:fs';

const run = (cmd, cwd = 'dist') => execSync(cmd, { cwd, stdio: 'inherit' });
const git = (cmd) => execSync(`git ${cmd}`).toString().trim();
const origin = git('remote get-url origin');
// Mismo autor que el repo (email privado de GitHub), no el global de la PC.
const author = `-c user.name="${git('config user.name')}" -c user.email="${git('config user.email')}"`;

if (!existsSync('dist/index.html')) throw new Error('Falta dist/: ejecutá "npm run build" primero.');

// Sin Jekyll: GitHub Pages sirve los archivos tal cual (incluidos los que empiezan con "_").
writeFileSync('dist/.nojekyll', '');

rmSync('dist/.git', { recursive: true, force: true });
try {
  run('git init -q -b gh-pages');
  run('git add -A');
  run(`git ${author} commit -q -m "Publicar sitio ${new Date().toISOString()}"`);
  run(`git push -q --force "${origin}" gh-pages`);
  console.log('\n✓ Publicado en GitHub Pages');
} finally {
  rmSync('dist/.git', { recursive: true, force: true });
}
