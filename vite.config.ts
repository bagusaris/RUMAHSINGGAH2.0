import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(projectRoot, '../src');

export default defineConfig({
    root: projectRoot,

    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
            ],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],

    resolve: {
    alias: {
        '@': frontendRoot,
    },
    modules: [
        path.resolve(projectRoot, 'node_modules'),
        'node_modules',
    ],
},

    server: {
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
        fs: {
            allow: [projectRoot, frontendRoot],
        },
    },
});
