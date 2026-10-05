// Build-time Anchor manifest (ADR 0003). Pure: the Vite plugin in
// vite.config.ts feeds it source text and writes the result to anchors.json.

export interface SourceFile {
  path: string;
  source: string;
}

// `data-anchor` but not `data-anchor-key`, then `=` and the start of the value.
const ATTRIBUTE = /\bdata-anchor(?![\w-])\s*=\s*(?:"([^"]*)"|'([^']*)'|(\{))/g;
const KEBAB_CASE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

/** Every Anchor name in the given files, de-duplicated and sorted. Throws on misuse. */
export function anchorManifest(files: SourceFile[]): string[] {
  const names = new Set<string>();
  for (const { path, source } of files) {
    for (const match of source.matchAll(ATTRIBUTE)) {
      const where = `${path}:${source.slice(0, match.index).split('\n').length}`;
      if (match[3]) {
        throw new Error(`${where}: data-anchor must be a string literal, not {…}. Put instance ids in data-anchor-key.`);
      }
      const name = match[1] ?? match[2];
      if (!KEBAB_CASE.test(name)) {
        throw new Error(`${where}: anchor name "${name}" must be lowercase kebab-case.`);
      }
      names.add(name);
    }
  }
  return [...names].sort();
}
