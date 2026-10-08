import { describe, expect, it } from 'vitest';
import {
  collectChildMargins,
  allFacesFailed,
  firstFamily,
  gapRects,
  lineBoxes,
  parsePx,
  readGap,
  readType,
  renderScale,
  stripValue,
  toHex,
  type ChildStyleLike,
  type Rect,
  type StyleLike,
} from './measure';

const rect = (left: number, top: number, width: number, height: number): Rect => ({ left, top, width, height });
const VIEWPORT = rect(0, 0, 2000, 2000);

function style(overrides: Partial<StyleLike> = {}): StyleLike {
  return {
    paddingTop: '0px',
    paddingRight: '0px',
    paddingBottom: '0px',
    paddingLeft: '0px',
    borderTopWidth: '0px',
    borderRightWidth: '0px',
    borderBottomWidth: '0px',
    borderLeftWidth: '0px',
    display: 'block',
    boxSizing: 'border-box',
    width: '100px',
    flexDirection: 'row',
    rowGap: 'normal',
    columnGap: 'normal',
    fontFamily: "'Lato', -apple-system, sans-serif",
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '20px',
    letterSpacing: 'normal',
    color: 'rgb(60, 73, 44)',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    borderTopColor: 'rgb(0, 0, 0)',
    ...overrides,
  };
}

function child(overrides: Partial<ChildStyleLike> = {}): ChildStyleLike {
  return {
    marginTop: '0px',
    marginRight: '0px',
    marginBottom: '0px',
    marginLeft: '0px',
    position: 'static',
    display: 'block',
    ...overrides,
  };
}

describe('parsing', () => {
  it('parses px values and drops float noise', () => {
    expect(parsePx('12px')).toBe(12);
    expect(parsePx('12.800000190734863px')).toBe(12.8);
    expect(parsePx('normal')).toBe(0);
    expect(parsePx('')).toBe(0);
  });

  it('takes the first family of a stack, unquoted', () => {
    expect(firstFamily("'Lato', -apple-system, sans-serif")).toBe('Lato');
    expect(firstFamily('"Segoe UI", sans-serif')).toBe('Segoe UI');
    expect(firstFamily('inherit')).toBe('inherit');
  });

  it('converts computed colors to hex, keeping alpha as a byte', () => {
    expect(toHex('rgb(60, 73, 44)')).toBe('#3c492c');
    expect(toHex('rgba(0, 0, 0, 0.5)')).toBe('#00000080');
    expect(toHex('rgba(255, 255, 255, 1)')).toBe('#ffffff');
    expect(toHex('rgb(0 0 0 / 50%)')).toBe('#00000080');
    expect(toHex('color(display-p3 1 0 0)')).toBe('color(display-p3 1 0 0)');
  });
});

describe('readGap', () => {
  it('is null outside flex and grid', () => {
    expect(readGap(style({ display: 'block', rowGap: '8px' }))).toBeNull();
  });

  it('reads both gaps, treating normal as 0', () => {
    expect(readGap(style({ display: 'flex', columnGap: '8px' }))).toEqual({ row: 0, column: 8 });
    expect(readGap(style({ display: 'inline-grid', rowGap: '12px', columnGap: '6px' }))).toEqual({
      row: 12,
      column: 6,
    });
  });
});

describe('collectChildMargins', () => {
  it('returns distinct non-zero margins of in-flow children, ascending', () => {
    expect(
      collectChildMargins([
        child({ marginBottom: '12px' }),
        child({ marginBottom: '8px', marginTop: '12px' }),
        child({ marginLeft: '6px', position: 'absolute' }),
        child({ marginLeft: '2px', display: 'none' }),
      ]),
    ).toEqual([8, 12]);
  });
});

describe('allFacesFailed', () => {
  it('is true only when the family has faces and every one errored', () => {
    expect(allFacesFailed('Lato', [{ family: '"Lato"', status: 'error' }])).toBe(true);
    expect(
      allFacesFailed('Lato', [
        { family: 'Lato', status: 'error' },
        { family: 'lato', status: 'loaded' },
      ]),
    ).toBe(false);
    expect(allFacesFailed('Lato', [{ family: 'Inter', status: 'error' }])).toBe(false);
    expect(allFacesFailed('Lato', [])).toBe(false);
  });
});

describe('readType', () => {
  const faces = [
    { family: 'Lato', status: 'loaded' },
    { family: 'Lato', status: 'loaded' },
  ];

  it('reads the type values', () => {
    expect(readType(style({ fontWeight: '600', lineHeight: 'normal', letterSpacing: '0.5px' }), faces)).toEqual({
      family: 'Lato',
      size: 14,
      weight: 600,
      fontFailed: false,
      lineHeight: null,
      letterSpacing: 0.5,
      color: '#3c492c',
    });
  });
});

describe('renderScale', () => {
  const zero = { top: 0, right: 0, bottom: 0, left: 0 };
  const sides = { top: 0, right: 10, bottom: 0, left: 10 };

  it('is 1 when untransformed, including sub-pixel noise', () => {
    expect(renderScale(100, style({ width: '100px' }), zero, zero)).toBe(1);
    expect(renderScale(100.04, style({ width: '100px' }), zero, zero)).toBe(1);
  });

  it('measures a transform against the untransformed border box', () => {
    expect(renderScale(97, style({ width: '100px' }), zero, zero)).toBeCloseTo(0.97);
    // content-box: 80 content + 20 padding = 100 border box.
    expect(renderScale(50, style({ boxSizing: 'content-box', width: '80px' }), sides, zero)).toBeCloseTo(0.5);
  });

  it('adds back the vertical scrollbar that a content-box width leaves out', () => {
    // Declared 200px wide with a 15px scrollbar: computed width is 185, rendered 220.
    const padded = { top: 8, right: 8, bottom: 8, left: 8 };
    const bordered = { top: 2, right: 2, bottom: 2, left: 2 };
    const s = style({ boxSizing: 'content-box', width: '185px' });
    expect(renderScale(220, s, padded, bordered, 15)).toBe(1);
    // border-box widths already include it.
    expect(renderScale(200, style({ boxSizing: 'border-box', width: '200px' }), padded, bordered, 15)).toBe(1);
  });

  it('is 1 for inline boxes, whose width is auto', () => {
    expect(renderScale(40, style({ width: 'auto' }), zero, zero)).toBe(1);
  });
});

describe('gapRects', () => {
  it('finds column gaps between children on a row', () => {
    const strips = gapRects([rect(0, 0, 50, 20), rect(58, 0, 50, 30), rect(116, 0, 50, 20)], 'row', VIEWPORT);
    expect(strips).toEqual([
      { rect: rect(50, 0, 8, 30), axis: 'column', size: 8 },
      { rect: rect(108, 0, 8, 30), axis: 'column', size: 8 },
    ]);
  });

  it('finds row gaps between stacked children', () => {
    const strips = gapRects([rect(0, 0, 100, 20), rect(0, 32, 80, 20)], 'column', VIEWPORT);
    expect(strips).toEqual([{ rect: rect(0, 20, 100, 12), axis: 'row', size: 12 }]);
  });

  it('uses on-screen order, so reversed or reordered children work', () => {
    const strips = gapRects([rect(58, 0, 50, 20), rect(0, 0, 50, 20)], 'row', VIEWPORT);
    expect(strips).toEqual([{ rect: rect(50, 0, 8, 20), axis: 'column', size: 8 }]);
  });

  it('finds both gaps in wrapped rows', () => {
    const strips = gapRects(
      [rect(0, 0, 40, 20), rect(48, 0, 40, 20), rect(0, 28, 40, 20), rect(48, 28, 40, 20)],
      'row',
      VIEWPORT,
    );
    expect(strips).toEqual([
      { rect: rect(40, 0, 8, 20), axis: 'column', size: 8 },
      { rect: rect(40, 28, 8, 20), axis: 'column', size: 8 },
      { rect: rect(0, 20, 88, 8), axis: 'row', size: 8 },
    ]);
  });

  it('keeps the full size of a strip that is clipped', () => {
    const strips = gapRects([rect(0, 0, 50, 20), rect(80, 0, 50, 20)], 'row', rect(0, 0, 60, 20));
    expect(strips).toEqual([{ rect: rect(50, 0, 10, 20), axis: 'column', size: 30 }]);
  });

  it('skips touching and empty children, and clips to the visible area', () => {
    const strips = gapRects(
      [rect(0, 0, 50, 20), rect(50, 0, 50, 20), rect(0, 0, 0, 0), rect(108, 0, 50, 20)],
      'row',
      rect(0, 0, 104, 10),
    );
    expect(strips).toEqual([{ rect: rect(100, 0, 4, 10), axis: 'column', size: 8 }]);
  });
});

describe('stripValue', () => {
  it('is the declared gap when the space on screen matches it', () => {
    expect(stripValue(8, 8, 1)).toBe(8);
    // Sub-pixel layout and scale rounding don't read as off-grid.
    expect(stripValue(7.7, 8, 1)).toBe(8);
    expect(stripValue(3.98, 8, 0.5)).toBe(8);
  });

  it('is the measured space when it differs (space-between, child margins)', () => {
    expect(stripValue(37.333, 8, 1)).toBe(37.33);
    expect(stripValue(16, 8, 1)).toBe(16);
    expect(stripValue(24, 8, 2)).toBe(12);
  });
});

describe('lineBoxes', () => {
  it('merges fragments on the same line, one box per line', () => {
    const lines = lineBoxes([rect(10, 0, 40, 16), rect(60, 1, 30, 16), rect(10, 20, 50, 16)], null, VIEWPORT);
    expect(lines).toEqual([rect(10, 0, 80, 17), rect(10, 20, 50, 16)]);
  });

  it('grows each line to the line height, centered on the glyphs', () => {
    expect(lineBoxes([rect(0, 10, 40, 16)], 20, VIEWPORT)).toEqual([rect(0, 8, 40, 20)]);
  });

  it('skips empty fragments and clips to the visible area', () => {
    expect(lineBoxes([rect(0, 0, 0, 16), rect(0, -8, 40, 16)], null, VIEWPORT)).toEqual([rect(0, 0, 40, 8)]);
  });
});
