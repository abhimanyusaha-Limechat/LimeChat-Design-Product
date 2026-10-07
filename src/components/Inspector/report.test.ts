import { describe, expect, it } from 'vitest';
import type { Spec, TypeSpec } from './measure';
import { buildLabel, buildReport, describePin, hasIssues, shorthand, specToCss, type ToolSet } from './report';

const ALL: ToolSet = { type: true, padding: true, gap: true };
const sides = (top: number, right = top, bottom = top, left = right) => ({ top, right, bottom, left });

const TYPE: TypeSpec = {
  family: 'Lato',
  size: 14,
  weight: 700,
  renderedWeight: 700,
  fontFailed: false,
  lineHeight: 20,
  letterSpacing: null,
  color: '#3c492c',
};

function spec(overrides: Partial<Spec> = {}): Spec {
  return {
    name: 'button.lc-btn',
    anchor: null,
    rect: { left: 0, top: 0, width: 80, height: 32 },
    drawBands: true,
    scale: 1,
    padding: sides(8, 12),
    border: sides(0),
    scrollbar: { width: 0, height: 0 },
    gap: { row: 8, column: 8 },
    gapStrips: [],
    textLines: [],
    childMargins: [],
    type: TYPE,
    ...overrides,
  };
}

const rows = (s: Spec, tools: ToolSet = ALL) =>
  Object.fromEntries(buildReport(s, tools).flatMap((section) => section.rows.map((r) => [r.label, r])));

describe('shorthand', () => {
  it('collapses like CSS shorthand', () => {
    expect(shorthand(sides(8))).toBe('8');
    expect(shorthand(sides(8, 12))).toBe('8 12');
    expect(shorthand(sides(8, 12, 4))).toBe('8 12 4');
    expect(shorthand(sides(8, 12, 4, 2))).toBe('8 12 4 2');
  });
});

describe('buildReport', () => {
  it('has no issues for on-scale values', () => {
    expect(hasIssues(buildReport(spec(), ALL))).toBe(false);
  });

  it('only includes enabled tools, in a fixed order', () => {
    expect(buildReport(spec(), { type: false, padding: true, gap: true }).map((s) => s.tool)).toEqual([
      'padding',
      'gap',
    ]);
  });

  it('flags off-grid padding, naming each offending value once', () => {
    expect(rows(spec({ padding: sides(6, 10, 6, 10) })).Padding.issue).toBe('6px, 10px are off the 4px grid');
  });

  it('shows the border only when there is one', () => {
    expect(rows(spec()).Border).toBeUndefined();
    expect(rows(spec({ border: sides(0, 0, 2, 0) })).Border.value).toBe('0 0 2');
  });

  it('flags off-grid gaps and splits row/column when they differ', () => {
    const r = rows(spec({ gap: { row: 12, column: 6 } }));
    expect(r['Row gap'].issue).toBeUndefined();
    expect(r['Column gap'].issue).toBe('6px is off the 4px grid');
  });

  it('reports child margins and explains a missing gap', () => {
    const report = buildReport(spec({ gap: null, childMargins: [8, 10] }), ALL);
    const gap = report.find((s) => s.tool === 'gap');
    expect(gap?.empty).toBeUndefined();
    expect(gap?.rows[0]).toMatchObject({ label: 'Child margins', value: '8, 10' });
    expect(buildReport(spec({ gap: null }), ALL).find((s) => s.tool === 'gap')?.empty).toMatch(/not a flex or grid/);
  });

  it('flags font sizes outside the scale', () => {
    expect(rows(spec({ type: { ...TYPE, size: 13 } })).Size.issue).toBe(
      "13px isn't in the type scale (10, 12, 14, 16, 20)",
    );
  });

  it('names a color token, with its primitive and hex underneath', () => {
    expect(rows(spec({ type: { ...TYPE, color: '#808975' } })).Color).toEqual({
      label: 'Color',
      value: 'sage-500',
      detail: 'color/light · #808975',
      swatch: '#808975',
    });
  });

  it('flags a color that is not a token, naming the closest one', () => {
    expect(rows(spec({ type: { ...TYPE, color: '#818a76' } })).Color).toMatchObject({
      value: '#818a76',
      issue: 'Not a color token — closest is sage-500 (#808975)',
    });
  });

  it('flags a weight the browser substitutes, and a font that failed to load', () => {
    expect(rows(spec({ type: { ...TYPE, weight: 600, renderedWeight: 700 } })).Weight.issue).toBe(
      'No 600 face loaded — renders as 700',
    );
    expect(rows(spec({ type: { ...TYPE, fontFailed: true } })).Weight.issue).toMatch(/failed to load/);
    expect(rows(spec({ type: { ...TYPE, weight: 600, renderedWeight: null } })).Weight.issue).toBeUndefined();
  });

  it('says when there is no text of its own instead of inherited values', () => {
    expect(buildReport(spec({ type: null }), ALL)[0]).toMatchObject({ tool: 'type', empty: 'No direct text' });
  });

  it('notes when padding bands cannot be drawn', () => {
    expect(rows(spec({ drawBands: false })).Overlay.value).toMatch(/not drawn/);
  });
});

describe('describePin', () => {
  const NONE: ToolSet = { type: false, padding: false, gap: false };

  it('names the element and its size, and says whether values are on scale', () => {
    expect(describePin(spec({ type: null, gap: null }), ALL)).toBe('Pinned button.lc-btn, 80 by 32. All values on scale.');
  });

  it('counts off-scale values', () => {
    expect(describePin(spec({ type: null, padding: sides(7, 12), gap: null }), ALL)).toBe(
      'Pinned button.lc-btn, 80 by 32. 1 value off scale.',
    );
    expect(describePin(spec({ type: null, padding: sides(7, 12), gap: { row: 5, column: 5 } }), ALL)).toBe(
      'Pinned button.lc-btn, 80 by 32. 2 values off scale.',
    );
  });

  it('prefers the Anchor name, reports CSS px, and skips the scale with every tool off', () => {
    const scaled = spec({ anchor: 'ticket-row', scale: 0.5, rect: { left: 0, top: 0, width: 40, height: 16 } });
    expect(describePin(scaled, NONE)).toBe('Pinned ticket-row, 80 by 32.');
  });
});

describe('buildLabel', () => {
  it('summarises the enabled tools', () => {
    expect(buildLabel(spec(), ALL)).toBe('14/20 Lato 700 · p 8 12 · gap 8');
    expect(buildLabel(spec({ type: { ...TYPE, lineHeight: null } }), { type: true, padding: false, gap: false })).toBe(
      '14/normal Lato 700',
    );
  });

  it('falls back to the size when no tool has anything to say', () => {
    expect(buildLabel(spec({ type: null, gap: null }), { type: true, padding: false, gap: true })).toBe('80 × 32');
  });

  it('reports the size in CSS px under a scale transform, like the panel', () => {
    const scaled = spec({ type: null, gap: null, scale: 0.5, rect: { left: 0, top: 0, width: 40, height: 16 } });
    expect(buildLabel(scaled, { type: false, padding: false, gap: false })).toBe('80 × 32');
  });
});

describe('specToCss', () => {
  it('writes the enabled tools as declarations', () => {
    expect(specToCss(spec({ padding: sides(0, 12) }), ALL)).toBe(
      [
        'font-family: Lato;',
        'font-size: 14px;',
        'font-weight: 700;',
        'line-height: 20px;',
        'color: var(--lc-color-green-900);',
        'padding: 0 12px;',
        'gap: 8px;',
      ].join('\n'),
    );
    expect(specToCss(spec(), { type: false, padding: false, gap: true })).toBe('gap: 8px;');
  });

  it('keeps the hex for a color that is not a token', () => {
    const css = specToCss(spec({ type: { ...TYPE, color: '#818a76' } }), { type: true, padding: false, gap: false });
    expect(css).toContain('color: #818a76;');
  });
});
