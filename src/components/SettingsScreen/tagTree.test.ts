import { describe, expect, it } from 'vitest';
import { canMove, flattenTree, keyboardTarget, moveTag } from './tagTree';

// Orders > Delivery > Delay, plus top-level Spam.
const TAGS = [
  { id: 'orders', name: 'Orders' },
  { id: 'delivery', name: 'Delivery', parentId: 'orders' },
  { id: 'delay', name: 'Delay', parentId: 'delivery' },
  { id: 'returns', name: 'Returns', parentId: 'orders' },
  { id: 'spam', name: 'Spam' },
];
const shape = (tags: typeof TAGS) => flattenTree(tags).map((r) => `${'-'.repeat(r.depth)}${r.tag.id}`);

describe('tag tree', () => {
  it('flattens in tree order and keeps the ancestors of search matches', () => {
    expect(shape(TAGS)).toEqual(['orders', '-delivery', '--delay', '-returns', 'spam']);
    expect(flattenTree(TAGS, 'del').map((r) => r.tag.id)).toEqual(['orders', 'delivery', 'delay']);
  });

  it('nests a tag inside another, or places it before/after a row at that row level', () => {
    expect(shape(moveTag(TAGS, 'spam', { id: 'returns', position: 'inside' }))).toEqual([
      'orders', '-delivery', '--delay', '-returns', '--spam',
    ]);
    expect(shape(moveTag(TAGS, 'spam', { id: 'delivery', position: 'before' }))).toEqual([
      'orders', '-spam', '-delivery', '--delay', '-returns',
    ]);
    expect(shape(moveTag(TAGS, 'delay', { id: 'orders', position: 'after' }))).toEqual([
      'orders', '-delivery', '-returns', 'delay', 'spam',
    ]);
  });

  it('refuses moves into its own subtree or deeper than three levels', () => {
    expect(canMove(TAGS, 'orders', { id: 'delay', position: 'after' })).toBe(false); // into own subtree
    expect(canMove(TAGS, 'delivery', { id: 'returns', position: 'inside' })).toBe(false); // Delay would be level 4
    expect(canMove(TAGS, 'spam', { id: 'delay', position: 'inside' })).toBe(false); // level 4
    expect(canMove(TAGS, 'delivery', { id: 'spam', position: 'inside' })).toBe(true); // Delay lands on level 3
    expect(moveTag(TAGS, 'spam', { id: 'delay', position: 'inside' })).toBe(TAGS);
  });

  it('maps arrow keys to sibling swaps, nesting and moving up a level', () => {
    expect(keyboardTarget(TAGS, 'returns', 'ArrowUp')).toEqual({ id: 'delivery', position: 'before' });
    expect(keyboardTarget(TAGS, 'delivery', 'ArrowDown')).toEqual({ id: 'returns', position: 'after' });
    expect(keyboardTarget(TAGS, 'returns', 'ArrowRight')).toEqual({ id: 'delivery', position: 'inside' });
    expect(keyboardTarget(TAGS, 'delay', 'ArrowLeft')).toEqual({ id: 'delivery', position: 'after' });
    expect(keyboardTarget(TAGS, 'orders', 'ArrowLeft')).toBeNull();
  });
});
