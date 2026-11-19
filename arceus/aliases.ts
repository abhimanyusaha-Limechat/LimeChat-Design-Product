import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The vendored arceus library is consumed from source. It imports itself with
// "@/…" and "assets/…", so the app's Vite and Vitest configs share these aliases.
const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(here, 'src');

export const arceusAliases = {
  arceus: path.join(src, 'index.ts'),
  '@fonts': path.join(src, 'assets/fonts'),
  '@': src,
  assets: path.join(src, 'assets'),
};

export const arceusSassLoadPaths = [here];
