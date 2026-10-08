/**
 * Where an element comes from in the source: the file and line of the JSX that
 * rendered it, and of the component that was written around it.
 *
 * Reads React's dev-only `_debugSource` off the element's fiber. That is a
 * React internal (React 18; React 19 removed it), so everything here returns
 * `null` when it's missing — production builds, newer React, non-React nodes.
 * If it ever stops working, delete this file and the `source` field.
 */

export interface Loc {
  /** Absolute path as the dev server saw it, forward slashes. */
  file: string;
  line: number;
  column: number;
}

export interface SourceInfo {
  /** Nearest component that rendered the element, e.g. `Sidebar`. */
  component: string | null;
  /** The JSX that created this DOM node (inside a design-system part, often the component's own file). */
  renderedAt: Loc | null;
  /** Where that component was used — usually the line a developer wants to edit. */
  usedAt: Loc | null;
}

interface DebugSource {
  fileName: string;
  lineNumber: number;
  columnNumber?: number;
}

interface FiberLike {
  type: unknown;
  return: FiberLike | null;
  _debugSource?: DebugSource | null;
}

const toLoc = (source: DebugSource | null | undefined): Loc | null =>
  source ? { file: source.fileName, line: source.lineNumber, column: source.columnNumber ?? 1 } : null;

function fiberOf(el: Element): FiberLike | null {
  const key = Object.keys(el).find((k) => k.startsWith('__reactFiber$'));
  return key ? ((el as unknown as Record<string, FiberLike>)[key] ?? null) : null;
}

/** `Sidebar`, also for `memo(...)` and `forwardRef(...)` wrappers. */
function componentName(type: unknown): string | null {
  if (typeof type !== 'function' && (typeof type !== 'object' || type === null)) return null;
  const t = type as { displayName?: string; name?: string; type?: unknown; render?: unknown };
  return t.displayName ?? (t.name || null) ?? componentName(t.type) ?? componentName(t.render);
}

export function sourceOf(el: Element): SourceInfo | null {
  const fiber = fiberOf(el);
  if (!fiber) return null;
  let owner = fiber.return;
  while (owner && typeof owner.type === 'string') owner = owner.return;
  const info: SourceInfo = {
    component: owner ? componentName(owner.type) : null,
    renderedAt: toLoc(fiber._debugSource),
    usedAt: toLoc(owner?._debugSource),
  };
  return info.renderedAt || info.usedAt ? info : null;
}

/** `components/Sidebar/Sidebar.tsx:147` — relative to `src/` when it's under it. */
export function formatLoc({ file, line }: Loc): string {
  return `${file.replace(/^.*?\/src\//, '')}:${line}`;
}

/** Opens the location in VS Code. */
export function editorHref({ file, line, column }: Loc): string {
  return `vscode://file/${encodeURI(file)}:${line}:${column}`;
}
