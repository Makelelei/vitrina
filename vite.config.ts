import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Rutas relativas: el build funciona igual en la raíz de un dominio o en
  // una subcarpeta como GitHub Pages (makelelei.github.io/vitrina/).
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    // Dos entradas: el estudio (index.html) y el sitio publicado de cada cliente (site.html).
    rollupOptions: {
      input: {
        studio: fileURLToPath(new URL('./index.html', import.meta.url)),
        site: fileURLToPath(new URL('./site.html', import.meta.url)),
      },
    },
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
