import { describe, expect, it } from 'vitest';
import {
  collectChildMargins,
  familyFaces,
  firstFamily,
  gapRects,
  parsePx,
  readGap,
  readType,
  renderedWeight,
  renderScale,
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

describe('renderedWeight', () => {
  const LATO: [number, number][] = [
    [400, 400],
    [700, 700],
    [900, 900],
  ];

  it('keeps a weight that has a face', () => {
    expect(renderedWeight(400, LATO)).toBe(400);
    expect(renderedWeight(700, LATO)).toBe(700);
  });

  it('follows CSS font matching for missing weights', () => {
    expect(renderedWeight(600, LATO)).toBe(700); // above 500: heavier first
    expect(renderedWeight(500, LATO)).toBe(400); // 400–500: up to 500, then lighter
    expect(renderedWeight(300, LATO)).toBe(400); // below 400: lighter first, else heavier
    expect(renderedWeight(800, LATO)).toBe(900);
    expect(renderedWeight(950, LATO)).toBe(900);
  });

  it('treats a variable font range as covering every weight in it', () => {
    expect(renderedWeight(600, [[100, 900]])).toBe(600);
  });

  it('is null when nothing is registered', () => {
    expect(renderedWeight(600, [])).toBeNull();
  });
});

describe('familyFaces', () => {
  it('collects usable weights for the family, case-insensitively', () => {
    const faces = [
      { family: '"Lato"', weight: '400', status: 'loaded' },
      { family: 'Lato', weight: '700', status: 'unloaded' },
      { family: 'lato', weight: 'bold', status: 'error' },
      { family: 'Inter', weight: '600', status: 'loaded' },
    ];
    expect(familyFaces('Lato', faces)).toEqual({
      ranges: [
        [400, 400],
        [700, 700],
      ],
      failed: false,
    });
  });

  it('reports failed only when every face errored', () => {
    expect(familyFaces('Lato', [{ family: 'Lato', weight: '400', status: 'error' }]).failed).toBe(true);
    expect(familyFaces('Lato', []).failed).toBe(false);
  });
});

describe('readType', () => {
  const faces = [
    { family: 'Lato', weight: '400', status: 'loaded' },
    { family: 'Lato', weight: '700', status: 'loaded' },
  ];

  it('reads the type values', () => {
    expect(readType(style({ fontWeight: '600', lineHeight: 'normal', letterSpacing: '0.5px' }), faces)).toEqual({
      family: 'Lato',
      size: 14,
      weight: 600,
      renderedWeight: 700,
      fontFailed: false,
      lineHeight: null,
      letterSpacing: 0.5,
      color: '#3c492c',
    });
  });

  it("can't verify the weight of a family with no registered faces", () => {
    expect(readType(style({ fontFamily: '-apple-system, sans-serif' }), faces).renderedWeight).toBeNull();
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

  it('is 1 for inline boxes, whose width is auto', () => {
    expect(renderScale(40, style({ width: 'auto' }), zero, zero)).toBe(1);
  });
});

describe('gapRects', () => {
  it('finds column gaps between children on a row', () => {
    const strips = gapRects([rect(0, 0, 50, 20), rect(58, 0, 50, 30), rect(116, 0, 50, 20)], 'row', VIEWPORT);
    expect(strips).toEqual([
      { rect: rect(50, 0, 8, 30), axis: 'column' },
      { rect: rect(108, 0, 8, 30), axis: 'column' },
    ]);
  });

  it('finds row gaps between stacked children', () => {
    const strips = gapRects([rect(0, 0, 100, 20), rect(0, 32, 80, 20)], 'column', VIEWPORT);
    expect(strips).toEqual([{ rect: rect(0, 20, 100, 12), axis: 'row' }]);
  });

  it('uses on-screen order, so reversed or reordered children work', () => {
    const strips = gapRects([rect(58, 0, 50, 20), rect(0, 0, 50, 20)], 'row', VIEWPORT);
    expect(strips).toEqual([{ rect: rect(50, 0, 8, 20), axis: 'column' }]);
  });

  it('finds both gaps in wrapped rows', () => {
    const strips = gapRects(
      [rect(0, 0, 40, 20), rect(48, 0, 40, 20), rect(0, 28, 40, 20), rect(48, 28, 40, 20)],
      'row',
      VIEWPORT,
    );
    expect(strips).toEqual([
      { rect: rect(40, 0, 8, 20), axis: 'column' },
      { rect: rect(40, 28, 8, 20), axis: 'column' },
      { rect: rect(0, 20, 88, 8), axis: 'row' },
    ]);
  });

  it('skips touching and empty children, and clips to the visible area', () => {
    const strips = gapRects(
      [rect(0, 0, 50, 20), rect(50, 0, 50, 20), rect(0, 0, 0, 0), rect(108, 0, 50, 20)],
      'row',
      rect(0, 0, 104, 10),
    );
    expect(strips).toEqual([{ rect: rect(100, 0, 4, 10), axis: 'column' }]);
  });
});
