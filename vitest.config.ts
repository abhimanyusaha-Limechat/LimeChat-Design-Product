import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Form-filling tests take ~2s alone but pass 5s when every file runs in parallel.
    testTimeout: 15_000,
    // Vitest blanks CSS by default; Inspect mode reads its color tokens from this file.
    css: { include: [/tokens\.css/] },
  },
});
