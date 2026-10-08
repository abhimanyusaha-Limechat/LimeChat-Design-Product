import { describe, expect, it } from 'vitest';
import type { Spec, TypeSpec } from './measure';
import {
  buildLabel,
  buildReport,
  describePin,
  editProps,
  hasIssues,
  shorthand,
  specToCss,
  toMarkdown,
  type ToolSet,
} from './report';

const ALL: ToolSet = { type: true, color: true, padding: true, gap: true };
const sides = (top: number, right = top, bottom = top, left = right) => ({ top, right, bottom, left });

const TYPE: TypeSpec = {
  family: 'Lato',
  size: 14,
  weight: 700,
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
    colors: { background: null, border: null },
    source: null,
    edits: [],
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
    expect(buildReport(spec(), { type: false, color: false, padding: true, gap: true }).map((s) => s.tool)).toEqual([
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
    expect(rows(spec({ type: { ...TYPE, color: '#808975' } })).Text).toMatchObject({
      label: 'Text',
      value: 'sage-500',
      detail: 'color/light · #808975',
      swatch: '#808975',
    });
  });

  it('flags a color that is not a token, naming the closest one', () => {
    expect(rows(spec({ type: { ...TYPE, color: '#818a76' } })).Text).toMatchObject({
      value: '#818a76',
      issue: 'Not a color token — closest is sage-500 (#808975)',
    });
  });

  it('flags a font that failed to load', () => {
    expect(rows(spec({ type: { ...TYPE, fontFailed: true } })).Weight.issue).toMatch(/failed to load/);
    expect(rows(spec({ type: TYPE })).Weight.issue).toBeUndefined();
  });

  it('reports text, background and border colors, and says when there are none', () => {
    const colors = { background: '#ffffff', border: '#818a76' };
    const report = buildReport(spec({ colors }), { type: false, color: true, padding: false, gap: false });
    expect(report[0].rows.map((r) => r.label)).toEqual(['Text', 'Background', 'Border']);
    expect(report[0].rows[2].issue).toMatch(/Not a color token/);
    expect(buildReport(spec({ type: null }), { type: false, color: true, padding: false, gap: false })[0].empty).toMatch(
      /No text, fill or border color/,
    );
  });

  it('says when there is no text of its own instead of inherited values', () => {
    expect(buildReport(spec({ type: null }), ALL)[0]).toMatchObject({ tool: 'type', empty: 'No direct text' });
  });

  it('notes when padding bands cannot be drawn', () => {
    expect(rows(spec({ drawBands: false })).Overlay.value).toMatch(/not drawn/);
  });
});

describe('describePin', () => {
  const NONE: ToolSet = { type: false, color: false, padding: false, gap: false };

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
    expect(buildLabel(spec(), { ...ALL, color: false })).toBe('14/20 Lato 700 · p 8 12 · gap 8');
    expect(buildLabel(spec(), { ...ALL, type: false, padding: false, gap: false })).toBe('text green-900');
    expect(buildLabel(spec({ type: { ...TYPE, lineHeight: null } }), { type: true, color: false, padding: false, gap: false })).toBe(
      '14/normal Lato 700',
    );
  });

  it('falls back to the size when no tool has anything to say', () => {
    expect(buildLabel(spec({ type: null, gap: null }), { type: true, color: false, padding: false, gap: true })).toBe('80 × 32');
  });

  it('reports the size in CSS px under a scale transform, like the panel', () => {
    const scaled = spec({ type: null, gap: null, scale: 0.5, rect: { left: 0, top: 0, width: 40, height: 16 } });
    expect(buildLabel(scaled, { type: false, color: false, padding: false, gap: false })).toBe('80 × 32');
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
    expect(specToCss(spec(), { type: false, color: false, padding: false, gap: true })).toBe('gap: 8px;');
  });

  it('writes background and border colors, only the ones that exist', () => {
    const colors = { background: '#ffffff', border: null };
    expect(specToCss(spec({ type: null, colors }), { type: false, color: true, padding: false, gap: false })).toBe(
      'background-color: var(--lc-color-white);',
    );
  });

  it('keeps the hex for a color that is not a token', () => {
    const css = specToCss(spec({ type: { ...TYPE, color: '#818a76' } }), { type: false, color: true, padding: false, gap: false });
    expect(css).toContain('color: #818a76;');
  });
});

describe('toMarkdown', () => {
  it('lists identity, source and the enabled tools, with issues marked', () => {
    const source = {
      component: 'Button',
      usedAt: { file: 'D:/app/src/components/TopNavBar/presets.tsx', line: 65, column: 5 },
      renderedAt: { file: 'D:/app/src/components/Button/Button.tsx', line: 124, column: 5 },
    };
    const md = toMarkdown(spec({ source, padding: sides(7, 12) }), { type: false, color: false, padding: true, gap: false });
    expect(md).toBe(
      [
        '### button.lc-btn',
        '`button.lc-btn` · 80 × 32',
        '- Used at `components/TopNavBar/presets.tsx:65` (Button)',
        '- Rendered at `components/Button/Button.tsx:124`',
        '',
        '**Padding**',
        '- Padding: 7 12 ⚠ 7px is off the 4px grid',
      ].join('\n'),
    );
  });

  it('still works with no source (production)', () => {
    expect(toMarkdown(spec(), { ...ALL, type: false, color: false, padding: false, gap: false })).toBe(
      '### button.lc-btn\n`button.lc-btn` · 80 × 32',
    );
  });
});

describe('row editors', () => {
  it('offers padding as four px fields stepping by the grid', () => {
    const { edit } = rows(spec({ padding: sides(8, 12) })).Padding;
    expect(edit).toMatchObject({ kind: 'numbers', step: 4, min: 0 });
    expect(edit?.kind === 'numbers' && edit.fields.map((f) => [f.prop, f.value])).toEqual([
      ['padding-top', 8],
      ['padding-right', 12],
      ['padding-bottom', 8],
      ['padding-left', 12],
    ]);
  });

  it('edits an even gap as one `gap`, and uneven gaps separately', () => {
    expect(editProps(rows(spec()).Gap.edit!)).toEqual(['gap']);
    const uneven = rows(spec({ gap: { row: 4, column: 8 } }));
    expect(editProps(uneven['Row gap'].edit!)).toEqual(['row-gap']);
    expect(editProps(uneven['Column gap'].edit!)).toEqual(['column-gap']);
  });

  it('lets colors be picked from the tokens, keeping an off-token value selectable', () => {
    const token = rows(spec({ colors: { background: '#fafdf6', border: '#818a76' } }));
    expect(token.Background.edit).toMatchObject({ kind: 'choice', prop: 'background-color', value: 'var(--lc-color-green-50)' });
    const custom = token.Border.edit;
    expect(custom?.kind === 'choice' && custom.options[0]).toEqual({ value: '#818a76', label: '#818a76' });
  });

  it('offers font sizes from the scale, plus an off-scale current size', () => {
    const size = rows(spec({ type: { ...TYPE, size: 13 } })).Size.edit;
    expect(size?.kind === 'choice' && size.options.map((o) => o.label)).toEqual(['13px', '10', '12', '14', '16', '20']);
    expect(size).toMatchObject({ prop: 'font-size', value: '13px' });
  });

  it('lists previewed changes in the report', () => {
    const md = toMarkdown(spec({ edits: [{ prop: 'padding-top', from: '8px', to: '12px' }] }), {
      type: false,
      color: false,
      padding: false,
      gap: false,
    });
    expect(md).toContain('**Previewed changes** (not saved)\n- padding-top: 8px → 12px');
  });
});
