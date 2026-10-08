import { execSync } from 'node:child_process';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { anchorManifest, type SourceFile } from './src/anchors/anchorManifest';
import { buildStamp } from './src/build/buildStamp';

// Emits anchors.json (ADR 0003) from the raw source of every app module in
// the bundle. Build only, so the dev server is untouched.
function anchorsPlugin(): Plugin {
  const files: SourceFile[] = [];
  let root = '';
  return {
    name: 'anchors-manifest',
    apply: 'build',
    enforce: 'pre',
    buildStart() {
      files.length = 0;
    },
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
  // Anchors first so it reads untransformed source and reports true line numbers.
  plugins: [anchorsPlugin(), react()],
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
