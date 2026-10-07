/**
 * Turns a measured `Spec` into what the panel, the hover label and "Copy CSS"
 * show, with each off-scale value carrying its reason. Pure.
 */
import {
  FONT_SIZES,
  SPACING_STEP,
  findColorToken,
  isAllowedFontSize,
  isOnSpacingGrid,
  nearestColorToken,
} from './designScale';
import type { Sides, Spec } from './measure';

export type Tool = 'type' | 'padding' | 'gap';
export type ToolSet = Record<Tool, boolean>;

export interface ReportRow {
  label: string;
  value: string;
  /** Why the value is off-scale or misleading; absent when it's fine. */
  issue?: string;
  /** Secondary text under the value. */
  detail?: string;
  /** A color to show as a swatch before the value. */
  swatch?: string;
}

export interface ReportSection {
  tool: Tool;
  title: string;
  rows: ReportRow[];
  /** Shown instead of rows when there's nothing to report. */
  empty?: string;
}

/** 12 → `12`, 12.5 → `12.5`. */
export function fmt(n: number): string {
  return String(Math.round(n * 100) / 100);
}

/** CSS-style shorthand: `12`, `12 16`, `12 16 8` or `12 16 8 4`. */
export function shorthand({ top, right, bottom, left }: Sides): string {
  if (left === right) {
    if (top === bottom) return top === right ? fmt(top) : `${fmt(top)} ${fmt(right)}`;
    return `${fmt(top)} ${fmt(right)} ${fmt(bottom)}`;
  }
  return [top, right, bottom, left].map(fmt).join(' ');
}

const gridIssue = (px: number) => (isOnSpacingGrid(px) ? undefined : `${fmt(px)}px is off the ${SPACING_STEP}px grid`);

function firstGridIssue(values: number[]): string | undefined {
  const off = [...new Set(values.filter((v) => !isOnSpacingGrid(v)))];
  if (off.length === 0) return undefined;
  return `${off.map((v) => `${fmt(v)}px`).join(', ')} ${off.length === 1 ? 'is' : 'are'} off the ${SPACING_STEP}px grid`;
}

function paddingSection(spec: Spec): ReportSection {
  const { padding, border } = spec;
  const sides = [padding.top, padding.right, padding.bottom, padding.left];
  const rows: ReportRow[] = [{ label: 'Padding', value: shorthand(padding), issue: firstGridIssue(sides) }];
  if (border.top || border.right || border.bottom || border.left) {
    rows.push({ label: 'Border', value: shorthand(border) });
  }
  return { tool: 'padding', title: 'Padding', rows };
}

function gapSection(spec: Spec): ReportSection {
  const rows: ReportRow[] = [];
  const { gap, childMargins } = spec;
  if (gap) {
    if (gap.row === gap.column) {
      rows.push({ label: 'Gap', value: fmt(gap.row), issue: gridIssue(gap.row) });
    } else {
      rows.push({ label: 'Row gap', value: fmt(gap.row), issue: gridIssue(gap.row) });
      rows.push({ label: 'Column gap', value: fmt(gap.column), issue: gridIssue(gap.column) });
    }
  }
  if (childMargins.length > 0) {
    rows.push({
      label: 'Child margins',
      value: childMargins.map(fmt).join(', '),
      issue: firstGridIssue(childMargins),
    });
  }
  return {
    tool: 'gap',
    title: 'Gap',
    rows,
    empty: rows.length === 0 ? 'No gap — not a flex or grid container' : undefined,
  };
}

function weightIssue(type: NonNullable<Spec['type']>): string | undefined {
  if (type.fontFailed) return `${type.family} failed to load — a fallback font is drawn`;
  if (type.renderedWeight !== null && type.renderedWeight !== type.weight) {
    return `No ${type.weight} face loaded — renders as ${type.renderedWeight}`;
  }
  return undefined;
}

/** A token by name, with its primitive and hex underneath; anything else is flagged. */
function colorRow(color: string): ReportRow {
  const token = findColorToken(color);
  if (token) {
    const detail = token.primitive ? `${token.primitive} · ${token.hex}` : token.hex;
    return { label: 'Color', value: token.name, detail, swatch: color };
  }
  const closest = nearestColorToken(color);
  return {
    label: 'Color',
    value: color,
    swatch: color,
    issue: closest ? `Not a color token — closest is ${closest.name} (${closest.hex})` : 'Not a color token',
  };
}

function typeSection(spec: Spec): ReportSection {
  const { type } = spec;
  if (!type) return { tool: 'type', title: 'Type', rows: [], empty: 'No direct text' };
  const rows: ReportRow[] = [
    { label: 'Font', value: type.family },
    {
      label: 'Size',
      value: fmt(type.size),
      issue: isAllowedFontSize(type.size)
        ? undefined
        : `${fmt(type.size)}px isn't in the type scale (${FONT_SIZES.join(', ')})`,
    },
    { label: 'Weight', value: String(type.weight), issue: weightIssue(type) },
    { label: 'Line height', value: type.lineHeight === null ? 'normal' : fmt(type.lineHeight) },
  ];
  if (type.letterSpacing !== null) rows.push({ label: 'Letter spacing', value: fmt(type.letterSpacing) });
  rows.push(colorRow(type.color));
  return { tool: 'type', title: 'Type', rows };
}

const SECTIONS: Record<Tool, (spec: Spec) => ReportSection> = {
  type: typeSection,
  padding: paddingSection,
  gap: gapSection,
};

const TOOL_ORDER: Tool[] = ['type', 'padding', 'gap'];

/** Sections for the enabled tools, in a fixed order. */
export function buildReport(spec: Spec, tools: ToolSet): ReportSection[] {
  return TOOL_ORDER.filter((t) => tools[t]).map((t) => {
    const section = SECTIONS[t](spec);
    // Bands can't be drawn on wrapped inline text; say so rather than draw nothing silently.
    if (t === 'padding' && !spec.drawBands) {
      return { ...section, rows: [...section.rows, { label: 'Overlay', value: 'not drawn for this element' }] };
    }
    return section;
  });
}

export function hasIssues(sections: ReportSection[]): boolean {
  return sections.some((s) => s.rows.some((r) => r.issue));
}

/** What a screen reader hears on pinning, e.g. `Pinned button.lc-btn, 80 by 32. 1 value off scale.` */
export function describePin(spec: Spec, tools: ToolSet): string {
  const size = `${fmt(spec.rect.width / spec.scale)} by ${fmt(spec.rect.height / spec.scale)}`;
  const pinned = `Pinned ${spec.anchor ?? spec.name}, ${size}.`;
  const sections = buildReport(spec, tools);
  if (sections.length === 0) return pinned;
  const issues = sections.reduce((n, s) => n + s.rows.filter((r) => r.issue).length, 0);
  if (issues === 0) return `${pinned} All values on scale.`;
  return `${pinned} ${issues} ${issues === 1 ? 'value' : 'values'} off scale.`;
}

/** One-line hover summary, e.g. `14/20 Lato 700 · p 8 12 · gap 8`. */
export function buildLabel(spec: Spec, tools: ToolSet): string {
  const parts: string[] = [];
  if (tools.type && spec.type) {
    const { size, lineHeight, family, weight } = spec.type;
    parts.push(`${fmt(size)}/${lineHeight === null ? 'normal' : fmt(lineHeight)} ${family} ${weight}`);
  }
  if (tools.padding) parts.push(`p ${shorthand(spec.padding)}`);
  if (tools.gap && spec.gap) {
    parts.push(
      spec.gap.row === spec.gap.column
        ? `gap ${fmt(spec.gap.row)}`
        : `gap ${fmt(spec.gap.row)} ${fmt(spec.gap.column)}`,
    );
  }
  // CSS px, like the panel — rect is rendered px, which differs under transform: scale().
  return parts.length > 0
    ? parts.join(' · ')
    : `${fmt(spec.rect.width / spec.scale)} × ${fmt(spec.rect.height / spec.scale)}`;
}

/** The enabled tools' values as CSS declarations, for "Copy CSS". */
export function specToCss(spec: Spec, tools: ToolSet): string {
  const px = (n: number) => (n === 0 ? '0' : `${fmt(n)}px`);
  const sides = (s: Sides) => shorthand(s).split(' ').map(Number).map(px).join(' ');
  const lines: string[] = [];
  if (tools.type && spec.type) {
    const t = spec.type;
    lines.push(`font-family: ${t.family};`, `font-size: ${px(t.size)};`, `font-weight: ${t.weight};`);
    lines.push(`line-height: ${t.lineHeight === null ? 'normal' : px(t.lineHeight)};`);
    if (t.letterSpacing !== null) lines.push(`letter-spacing: ${px(t.letterSpacing)};`);
    const token = findColorToken(t.color);
    lines.push(`color: ${token ? `var(--lc-color-${token.name})` : t.color};`);
  }
  if (tools.padding) lines.push(`padding: ${sides(spec.padding)};`);
  if (tools.gap && spec.gap) {
    lines.push(
      spec.gap.row === spec.gap.column
        ? `gap: ${px(spec.gap.row)};`
        : `gap: ${px(spec.gap.row)} ${px(spec.gap.column)};`,
    );
  }
  return lines.join('\n');
}
