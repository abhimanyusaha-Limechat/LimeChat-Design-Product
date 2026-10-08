import { afterEach, describe, expect, it } from 'vitest';
import { editsOf, resetAll, resetElement, setStyle } from './edits';

function box(style = ''): HTMLElement {
  const el = document.createElement('div');
  el.setAttribute('style', style);
  document.body.append(el);
  return el;
}

afterEach(() => {
  resetAll();
  document.body.replaceChildren();
});

describe('edits', () => {
  it('applies a style and lists it with its original value', () => {
    const el = box('padding-top: 8px');
    setStyle(el, 'padding-top', '12px');
    expect(el.style.paddingTop).toBe('12px');
    expect(editsOf(el)).toEqual([{ prop: 'padding-top', from: '8px', to: '12px' }]);
  });

  it('keeps the first original through repeated edits, and resets to it', () => {
    const el = box('padding-top: 8px');
    setStyle(el, 'padding-top', '12px');
    setStyle(el, 'padding-top', '16px');
    expect(editsOf(el)).toEqual([{ prop: 'padding-top', from: '8px', to: '16px' }]);
    resetElement(el);
    expect(el.style.paddingTop).toBe('8px');
    expect(editsOf(el)).toEqual([]);
  });

  it('removes a property that had no inline value of its own', () => {
    const el = box();
    setStyle(el, 'gap', '4px');
    resetElement(el);
    expect(el.getAttribute('style')).toBe('');
  });

  it('resetAll undoes every element', () => {
    const [a, b] = [box(), box()];
    setStyle(a, 'gap', '4px');
    setStyle(b, 'padding-left', '4px');
    resetAll();
    expect([a.style.gap, b.style.paddingLeft]).toEqual(['', '']);
  });
});
