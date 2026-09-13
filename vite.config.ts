import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export const pwaOptions = {
  registerType: 'autoUpdate' as const,
  workbox: {
    maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
    globPatterns: ['**/*.{js,css,html,png,webmanifest}'],
  },
  manifest: {
    name: 'TaPago',
    short_name: 'TaPago',
    description: 'Seu desafio fitness de 15 dias',
    display: 'standalone' as const,
    theme_color: '#111315',
    background_color: '#111315',
    lang: 'pt-BR',
  },
};

export default defineConfig({
  plugins: [react(), VitePWA(pwaOptions)],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
