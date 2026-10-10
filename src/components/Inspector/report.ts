/**
 * Turns a measured `Spec` into what the panel, the hover label and "Copy CSS"
 * show, with each off-scale value carrying its reason. Pure.
 */
import {
  COLOR_TOKENS,
  FONT_SIZES,
  SPACING_STEP,
  findColorToken,
  isAllowedFontSize,
  isOnSpacingGrid,
  nearestColorToken,
} from './designScale';
import type { IconName } from '../iconPaths';
import type { Sides, Spec } from './measure';
import { formatLoc } from './reactSource';

export type Tool = 'type' | 'color' | 'radius' | 'padding' | 'gap';
export type ToolSet = Record<Tool, boolean>;

export interface ReportRow {
  label: string;
  value: string;
  /** Why the value is off-scale or misleading; absent when it's fine. */
  issue?: string;
  /** A spacing value: the panel highlights off-grid numbers instead of writing out `issue`. */
  grid?: boolean;
  /** Secondary text under the value. */
  detail?: string;
  /** A color to show as a swatch before the value. */
  swatch?: string;
  /** How the panel lets you change it (live preview); absent for read-only rows. */
  edit?: RowEdit;
}

/** One number input, in CSS px, that sets `prop`. */
export interface NumberField {
  prop: string;
  label: string;
  value: number;
}

export type RowEdit =
  | { kind: 'numbers'; fields: NumberField[]; step: number; min?: number }
  | { kind: 'choice'; prop: string; value: string; options: { value: string; label: string }[] };

/** The properties a row can change, to mark it as edited. */
export const editProps = (edit: RowEdit): string[] =>
  edit.kind === 'choice' ? [edit.prop] : edit.fields.map((f) => f.prop);

/** A dropdown over `options`, with the current value added when it isn't one of them. */
function choice(prop: string, value: string, options: { value: string; label: string }[]): RowEdit {
  return {
    kind: 'choice',
    prop,
    value,
    options: options.some((o) => o.value === value) ? options : [{ value, label: value }, ...options],
  };
}

const COLOR_OPTIONS = COLOR_TOKENS.map((t) => ({ value: `var(--lc-color-${t.name})`, label: t.name }));

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

function firstGridIssue(values: number[]): string | undefined {
  const off = [...new Set(values.filter((v) => !isOnSpacingGrid(v)))];
  if (off.length === 0) return undefined;
  return `${off.map((v) => `${fmt(v)}px`).join(', ')} ${off.length === 1 ? 'is' : 'are'} off the ${SPACING_STEP}px grid`;
}

function paddingSection(spec: Spec): ReportSection {
  const { padding, border } = spec;
  const sides = [padding.top, padding.right, padding.bottom, padding.left];
  const edit: RowEdit = {
    kind: 'numbers',
    step: SPACING_STEP,
    min: 0,
    fields: [
      { prop: 'padding-top', label: 'T', value: padding.top },
      { prop: 'padding-right', label: 'R', value: padding.right },
      { prop: 'padding-bottom', label: 'B', value: padding.bottom },
      { prop: 'padding-left', label: 'L', value: padding.left },
    ],
  };
  const rows: ReportRow[] = [{ label: 'Padding', value: shorthand(padding), issue: firstGridIssue(sides), grid: true, edit }];
  if (border.top || border.right || border.bottom || border.left) {
    rows.push({ label: 'Border', value: shorthand(border) });
  }
  return { tool: 'padding', title: 'Padding', rows };
}

function radiusSection(spec: Spec): ReportSection {
  const { radius } = spec;
  const corners = [radius.top, radius.right, radius.bottom, radius.left];
  if (corners.every((r) => r === 0)) return { tool: 'radius', title: 'Radius', rows: [], empty: 'Square corners' };
  const edit: RowEdit = {
    kind: 'numbers',
    step: 2,
    min: 0,
    fields: [
      { prop: 'border-top-left-radius', label: 'TL', value: radius.top },
      { prop: 'border-top-right-radius', label: 'TR', value: radius.right },
      { prop: 'border-bottom-right-radius', label: 'BR', value: radius.bottom },
      { prop: 'border-bottom-left-radius', label: 'BL', value: radius.left },
    ],
  };
  return { tool: 'radius', title: 'Radius', rows: [{ label: 'Radius', value: shorthand(radius), issue: firstGridIssue(corners), grid: true, edit }] };
}

function gapSection(spec: Spec): ReportSection {
  const rows: ReportRow[] = [];
  const { gap, childMargins } = spec;
  if (gap) {
    const gapRow = (label: string, prop: string, value: number): ReportRow => ({
      label,
      value: fmt(value),
      issue: firstGridIssue([value]),
      grid: true,
      edit: { kind: 'numbers', step: SPACING_STEP, min: 0, fields: [{ prop, label: '', value }] },
    });
    if (gap.row === gap.column) {
      rows.push(gapRow('Gap', 'gap', gap.row));
    } else {
      rows.push(gapRow('Row gap', 'row-gap', gap.row), gapRow('Column gap', 'column-gap', gap.column));
    }
  }
  if (childMargins.length > 0) {
    rows.push({
      label: 'Child margins',
      value: childMargins.map(fmt).join(', '),
      issue: firstGridIssue(childMargins),
      grid: true,
    });
  }
  return {
    tool: 'gap',
    title: 'Gap',
    rows,
    empty: rows.length === 0 ? 'No gap — not a flex or grid container' : undefined,
  };
}

const weightIssue = (type: NonNullable<Spec['type']>) =>
  type.fontFailed ? `${type.family} failed to load — a fallback font is drawn` : undefined;

/** A token by name, with its primitive and hex underneath; anything else is flagged. */
function colorRow(label: string, color: string, prop: string): ReportRow {
  const token = findColorToken(color);
  if (token) {
    const detail = token.primitive ? `${token.primitive} · ${token.hex}` : token.hex;
    return { label, value: token.name, detail, swatch: color, edit: choice(prop, `var(--lc-color-${token.name})`, COLOR_OPTIONS) };
  }
  const closest = nearestColorToken(color);
  return {
    label,
    value: color,
    swatch: color,
    issue: closest ? `Not a color token — closest is ${closest.name} (${closest.hex})` : 'Not a color token',
    edit: choice(prop, color, COLOR_OPTIONS),
  };
}

function typeSection(spec: Spec): ReportSection {
  const { type } = spec;
  if (!type) return { tool: 'type', title: 'Type', rows: [], empty: 'No direct text' };
  const sizes = FONT_SIZES.map((n) => ({ value: px(n), label: String(n) }));
  const weights = [300, 400, 500, 600, 700, 800].map((n) => ({ value: String(n), label: String(n) }));
  const number = (prop: string, value: number, step: number, min?: number): RowEdit => ({
    kind: 'numbers',
    step,
    min,
    fields: [{ prop, label: '', value }],
  });
  const rows: ReportRow[] = [
    { label: 'Font', value: type.family },
    {
      label: 'Size',
      value: fmt(type.size),
      issue: isAllowedFontSize(type.size)
        ? undefined
        : `${fmt(type.size)}px isn't in the type scale (${FONT_SIZES.join(', ')})`,
      edit: choice('font-size', px(type.size), sizes),
    },
    {
      label: 'Weight',
      value: String(type.weight),
      issue: weightIssue(type),
      edit: choice('font-weight', String(type.weight), weights),
    },
    {
      label: 'Line height',
      value: type.lineHeight === null ? 'normal' : fmt(type.lineHeight),
      // `normal` has no number to start from, so it isn't editable.
      edit: type.lineHeight === null ? undefined : number('line-height', type.lineHeight, 1, 0),
    },
    {
      label: 'Letter spacing',
      value: type.letterSpacing === null ? 'normal' : fmt(type.letterSpacing),
      edit: number('letter-spacing', type.letterSpacing ?? 0, 0.1),
    },
  ];
  return { tool: 'type', title: 'Type', rows };
}

/** The color slots an element has, as [label, hex] — shared by the report, label and CSS. */
function colorSlots({ type, colors }: Spec): [string, string, string][] {
  const slots: [string, string | null | undefined, string][] = [
    ['Text', type?.color, 'color'],
    ['Background', colors.background, 'background-color'],
    ['Border', colors.border, 'border-color'],
  ];
  return slots.filter((s): s is [string, string, string] => s[1] != null);
}

function colorSection(spec: Spec): ReportSection {
  const rows = colorSlots(spec).map(([label, color, prop]) => colorRow(label, color, prop));
  return { tool: 'color', title: 'Color', rows, empty: rows.length === 0 ? 'No text, fill or border color' : undefined };
}

const colorValue = (hex: string) => {
  const token = findColorToken(hex);
  return token ? `var(--lc-color-${token.name})` : hex;
};

const px = (n: number) => (n === 0 ? '0' : `${fmt(n)}px`);
/** `8` when both gaps match, else `8 12` (row column). */
const gapValue = (gap: NonNullable<Spec['gap']>, f: (n: number) => string) =>
  gap.row === gap.column ? f(gap.row) : `${f(gap.row)} ${f(gap.column)}`;

interface ToolDef {
  label: string;
  icon: IconName;
  section: (spec: Spec) => ReportSection;
  /** Part of the one-line hover label; `null` when the element has nothing for this tool. */
  summary: (spec: Spec) => string | null;
  /** CSS declarations for "Copy CSS". */
  css: (spec: Spec) => string[];
}

/**
 * Every Inspect tool, in display order. A new tool adds an entry here (the
 * compiler enforces it), plus its overlay marks in `InspectorOverlay`.
 */
export const TOOLS: Record<Tool, ToolDef> = {
  type: {
    label: 'Type',
    icon: 'typography',
    section: typeSection,
    summary: ({ type }) =>
      type && `${fmt(type.size)}/${type.lineHeight === null ? 'normal' : fmt(type.lineHeight)} ${type.family} ${type.weight}`,
    css: ({ type: t }) => {
      if (!t) return [];
      return [
        `font-family: ${t.family};`,
        `font-size: ${px(t.size)};`,
        `font-weight: ${t.weight};`,
        `line-height: ${t.lineHeight === null ? 'normal' : px(t.lineHeight)};`,
        ...(t.letterSpacing !== null ? [`letter-spacing: ${px(t.letterSpacing)};`] : []),
      ];
    },
  },
  color: {
    label: 'Color',
    icon: 'palette',
    section: colorSection,
    summary: (spec) => {
      const parts = colorSlots(spec).map(([label, hex]) => `${label.toLowerCase()} ${findColorToken(hex)?.name ?? hex}`);
      return parts.length > 0 ? parts.join(' · ') : null;
    },
    css: (spec) =>
      colorSlots(spec).map(([, hex, prop]) => `${prop}: ${colorValue(hex)};`),
  },
  radius: {
    label: 'Radius',
    icon: 'box-padding',
    section: radiusSection,
    summary: ({ radius }) => (shorthand(radius) === '0' ? null : `r ${shorthand(radius)}`),
    css: ({ radius }) =>
      shorthand(radius) === '0' ? [] : [`border-radius: ${shorthand(radius).split(' ').map(Number).map(px).join(' ')};`],
  },
  padding: {
    label: 'Padding',
    icon: 'box-padding',
    section: paddingSection,
    summary: ({ padding }) => `p ${shorthand(padding)}`,
    css: ({ padding }) => [`padding: ${shorthand(padding).split(' ').map(Number).map(px).join(' ')};`],
  },
  gap: {
    label: 'Gap',
    icon: 'spacing-horizontal',
    section: gapSection,
    summary: ({ gap }) => gap && `gap ${gapValue(gap, fmt)}`,
    css: ({ gap }) => (gap ? [`gap: ${gapValue(gap, px)};`] : []),
  },
};

export const TOOL_IDS = Object.keys(TOOLS) as Tool[];
/** Every tool's values are always shown. */
export const ALL_TOOLS = Object.fromEntries(TOOL_IDS.map((t) => [t, true])) as ToolSet;

const enabled = (tools: ToolSet) => TOOL_IDS.filter((t) => tools[t]);

/** Sections for the enabled tools, in a fixed order. */
export function buildReport(spec: Spec, tools: ToolSet): ReportSection[] {
  return enabled(tools).map((t) => {
    const section = TOOLS[t].section(spec);
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
  const parts = enabled(tools).flatMap((t) => TOOLS[t].summary(spec) ?? []);
  // CSS px, like the panel — rect is rendered px, which differs under transform: scale().
  return parts.length > 0
    ? parts.join(' · ')
    : `${fmt(spec.rect.width / spec.scale)} × ${fmt(spec.rect.height / spec.scale)}`;
}

/** The enabled tools' values as CSS declarations, for "Copy CSS". */
export function specToCss(spec: Spec, tools: ToolSet): string {
  return enabled(tools).flatMap((t) => TOOLS[t].css(spec)).join('\n');
}

/** A pasteable report of the element for an issue or chat: identity, source, then the enabled tools' values. */
export function toMarkdown(spec: Spec, tools: ToolSet): string {
  const { source } = spec;
  const lines = [
    `### ${spec.anchor ?? spec.name}`,
    `\`${spec.name}\` · ${fmt(spec.rect.width / spec.scale)} × ${fmt(spec.rect.height / spec.scale)}`,
  ];
  if (source?.usedAt) lines.push(`- Used at \`${formatLoc(source.usedAt)}\`${source.component ? ` (${source.component})` : ''}`);
  if (source?.renderedAt) lines.push(`- Rendered at \`${formatLoc(source.renderedAt)}\``);
  for (const { title, rows, empty } of buildReport(spec, tools)) {
    lines.push('', `**${title}**`);
    if (rows.length === 0 && empty) lines.push(`- ${empty}`);
    for (const { label, value, issue } of rows) lines.push(`- ${label}: ${value}${issue ? ` ⚠ ${issue}` : ''}`);
  }
  if (spec.edits.length > 0) {
    lines.push('', '**Previewed changes** (not saved)');
    for (const { prop, from, to } of spec.edits) lines.push(`- ${prop}: ${from} → ${to}`);
  }
  return lines.join('\n');
}
