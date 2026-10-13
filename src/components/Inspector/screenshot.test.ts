import { describe, expect, it } from 'vitest';
import { crop } from './screenshot';

const page = document.createElement('canvas');

describe('crop', () => {
  it('sizes the image to the element box at the device pixel ratio', () => {
    const out = crop(page, new DOMRect(10, 20, 100, 50), 800, 600, 2);
    expect([out.width, out.height]).toEqual([200, 100]);
  });

  it('clips the box to the viewport', () => {
    const out = crop(page, new DOMRect(-20, 580, 100, 50), 800, 600, 1);
    expect([out.width, out.height]).toEqual([80, 20]);
  });

  it('throws for an element entirely off screen', () => {
    expect(() => crop(page, new DOMRect(900, 0, 100, 50), 800, 600, 1)).toThrow('off screen');
  });
});
