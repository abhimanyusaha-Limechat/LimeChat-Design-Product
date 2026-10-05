import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { buildStamp } from './src/build/buildStamp';

// Which commit and day this build came from, so Comments can record it.
// CI's checkout and local clones both answer `git rev-parse`; no git → `dev`.
const stamp = buildStamp(
  () => execSync('git rev-parse --short HEAD', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }),
  new Date(),
);

export default defineConfig(({ command }) => ({
  // Project pages are served from /<repo>/, not the domain root — only apply
  // that prefix for production builds so `vite`/`vite preview` stay at `/`.
  base: command === 'build' ? '/LimeChat-Design-Product/' : '/',
  plugins: [react()],
  define: {
    'import.meta.env.BUILD_SHA': JSON.stringify(stamp.sha),
    'import.meta.env.BUILD_DATE': JSON.stringify(stamp.date),
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime', 'agentation'],
  },
}));
