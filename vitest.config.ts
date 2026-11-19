import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { arceusAliases, arceusSassLoadPaths } from './arceus/aliases';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: arceusAliases },
  css: { preprocessorOptions: { sass: { loadPaths: arceusSassLoadPaths } } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Form-filling tests take ~2s alone but pass 5s when every file runs in parallel.
    testTimeout: 15_000,
  },
});
