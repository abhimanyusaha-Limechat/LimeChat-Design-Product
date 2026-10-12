import { describe, expect, it } from 'vitest';
import { pageWindow } from './DataTable';

describe('pageWindow', () => {
  it.each([
    [1, 1, [1]],
    [3, 5, [1, 2, 3, 4, 5]],
    [1, 10, [1, 2, null, 10]],
    [10, 10, [1, null, 9, 10]],
    [7, 262, [1, null, 6, 7, 8, null, 262]],
    // A one-page gap shows the page itself: 1 … 3 would hide only page 2.
    [3, 10, [1, 2, 3, 4, null, 10]],
    [5, 8, [1, null, 4, 5, 6, 7, 8]],
  ])('page %i of %i shows %j', (page, total, expected) => {
    expect(pageWindow(page, total)).toEqual(expected);
  });

  it('can reach every page by stepping through the window', () => {
    let page = 1;
    while (page < 262) {
      const next = pageWindow(page, 262).find((n) => n === page + 1);
      expect(next).toBe(page + 1);
      page += 1;
    }
  });
});
