import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { anchorManifest, type SourceFile } from './src/anchors/anchorManifest';

// Emits anchors.json (ADR 0003) from the raw source of every app module in
// the bundle. Build only, so the dev server is untouched.
function anchorsPlugin(): Plugin {
  const files: SourceFile[] = [];
  let root = '';
  return {
    name: 'anchors-manifest',
    apply: 'build',
    enforce: 'pre',
    configResolved(config) {
      root = `${config.root}/`;
    },
    transform(source, id) {
      if (id.includes('/node_modules/') || !/\.[jt]sx?$/.test(id)) return;
      files.push({ path: id.replace(root, ''), source });
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'anchors.json',
        source: `${JSON.stringify(anchorManifest(files), null, 2)}\n`,
      });
    },
  };
}

export default defineConfig(({ command }) => ({
  // Project pages are served from /<repo>/, not the domain root — only apply
  // that prefix for production builds so `vite`/`vite preview` stay at `/`.
  base: command === 'build' ? '/LimeChat-Design-Product/' : '/',
  plugins: [react(), anchorsPlugin()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime', 'agentation'],
  },
}));
