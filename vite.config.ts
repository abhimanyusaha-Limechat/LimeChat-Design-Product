import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  // Project pages are served from /<repo>/, not the domain root — only apply
  // that prefix for production builds so `vite`/`vite preview` stay at `/`.
  base: command === 'build' ? '/LimeChat-Design-Product/' : '/',
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime', 'agentation'],
  },
}));
