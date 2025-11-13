import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    base: '/inventory/',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                index: resolve(__dirname, 'index.html'),
                login: resolve(__dirname, 'login.html'),
                products: resolve(__dirname, 'products.html'),
                movements: resolve(__dirname, 'movements.html'),
                counts: resolve(__dirname, 'counts.html'),
                reports: resolve(__dirname, 'reports.html'),
            }
        },
    },
});
