import { describe, expect, it } from 'vitest';
import { dragTargetIndex } from './useDragReorder';

describe('dragTargetIndex', () => {
  it('moves one slot once the pointer passes half a row, and clamps to the list', () => {
    expect(dragTargetIndex(2, 29, 60, 5)).toBe(2);
    expect(dragTargetIndex(2, 31, 60, 5)).toBe(3);
    expect(dragTargetIndex(2, -31, 60, 5)).toBe(1);
    expect(dragTargetIndex(2, 600, 60, 5)).toBe(4);
    expect(dragTargetIndex(2, -600, 60, 5)).toBe(0);
  });
});
