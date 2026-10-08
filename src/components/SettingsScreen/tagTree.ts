/**
 * Tag hierarchy: a flat list where each tag points at its parent. Siblings keep the
 * order they have in the array. Tags nest at most three levels deep (depth 0–2).
 */

export const MAX_DEPTH = 2;

export type DropPosition = 'before' | 'after' | 'inside';
/** Where a moved tag lands: before/after `id` (same level as it), or inside `id` as its last child. */
export interface DropTarget {
  id: string;
  position: DropPosition;
}

interface TagNode {
  id: string;
  name: string;
  parentId?: string;
}

const parentOf = <T extends TagNode>(tags: T[], id: string) => tags.find((t) => t.id === id)?.parentId;
const childrenOf = <T extends TagNode>(tags: T[], parentId: string | undefined) =>
  tags.filter((t) => t.parentId === parentId);

function depthOf<T extends TagNode>(tags: T[], id: string): number {
  let depth = 0;
  for (let p = parentOf(tags, id); p !== undefined; p = parentOf(tags, p)) depth++;
  return depth;
}

/** Levels below `id`: 0 for a leaf, 1 if it has children, 2 if it has grandchildren. */
function heightOf<T extends TagNode>(tags: T[], id: string): number {
  return Math.max(-1, ...childrenOf(tags, id).map((c) => heightOf(tags, c.id))) + 1;
}

function isInside<T extends TagNode>(tags: T[], id: string, ancestorId: string): boolean {
  for (let p = parentOf(tags, id); p !== undefined; p = parentOf(tags, p)) if (p === ancestorId) return true;
  return false;
}

const newParent = <T extends TagNode>(tags: T[], target: DropTarget) =>
  target.position === 'inside' ? target.id : parentOf(tags, target.id);

/** A tag can't move into itself or its own subtree, and its whole subtree must still fit in three levels. */
export function canMove<T extends TagNode>(tags: T[], dragId: string, target: DropTarget): boolean {
  if (target.id === dragId || isInside(tags, target.id, dragId)) return false;
  const parent = newParent(tags, target);
  const depth = parent === undefined ? 0 : depthOf(tags, parent) + 1;
  return depth + heightOf(tags, dragId) <= MAX_DEPTH;
}

/** Moves `dragId` (with its subtree) to `target`. Returns `tags` unchanged if the move isn't allowed. */
export function moveTag<T extends TagNode>(tags: T[], dragId: string, target: DropTarget): T[] {
  const dragged = tags.find((t) => t.id === dragId);
  if (!dragged || !canMove(tags, dragId, target)) return tags;
  const rest = tags.filter((t) => t.id !== dragId);
  const targetIndex = rest.findIndex((t) => t.id === target.id);
  const index =
    target.position === 'inside' ? rest.length : target.position === 'before' ? targetIndex : targetIndex + 1;
  rest.splice(index, 0, { ...dragged, parentId: newParent(tags, target) });
  return rest;
}

/** Keyboard moves for the focused tag: ↑/↓ swap with a sibling, → nests into the sibling above, ← moves up a level. */
export function keyboardTarget<T extends TagNode>(tags: T[], id: string, key: string): DropTarget | null {
  const parentId = parentOf(tags, id);
  const siblings = childrenOf(tags, parentId);
  const i = siblings.findIndex((t) => t.id === id);
  const prev = siblings[i - 1];
  const next = siblings[i + 1];
  if (key === 'ArrowUp') return prev ? { id: prev.id, position: 'before' } : null;
  if (key === 'ArrowDown') return next ? { id: next.id, position: 'after' } : null;
  if (key === 'ArrowRight') return prev ? { id: prev.id, position: 'inside' } : null;
  if (key === 'ArrowLeft') return parentId !== undefined ? { id: parentId, position: 'after' } : null;
  return null;
}

export interface TreeRow<T> {
  tag: T;
  depth: number;
  hasChildren: boolean;
}

/** The rows to show, in tree order. With a search `query`, shows matching tags plus the ancestors that lead to them. */
export function flattenTree<T extends TagNode>(tags: T[], query = ''): TreeRow<T>[] {
  const q = query.trim().toLowerCase();
  const matches = (t: T): boolean =>
    t.name.toLowerCase().includes(q) || childrenOf(tags, t.id).some((c) => matches(c));
  const rows: TreeRow<T>[] = [];
  const walk = (parentId: string | undefined, depth: number) => {
    for (const tag of childrenOf(tags, parentId)) {
      if (q && !matches(tag)) continue;
      const hasChildren = childrenOf(tags, tag.id).length > 0;
      rows.push({ tag, depth, hasChildren });
      if (hasChildren) walk(tag.id, depth + 1);
    }
  };
  walk(undefined, 0);
  return rows;
}
