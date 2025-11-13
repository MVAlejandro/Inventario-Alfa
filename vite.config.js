import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // Página principal
        main: resolve(__dirname, 'index.html'),

        // Páginas adicionales
        login: resolve(__dirname, 'src/pages/login.html'),
        products: resolve(__dirname, 'src/pages/products.html'),
        movements: resolve(__dirname, 'src/pages/movements.html'),
        counts: resolve(__dirname, 'src/pages/counts.html'),
        reports: resolve(__dirname, 'src/pages/reports.html')
      },
    },
  },
  server: {
    open: true,
  },
});
