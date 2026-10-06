/**
 * Reads what Inspect mode shows about an element. The geometry and style
 * parsing are pure (and unit tested — jsdom has no layout); `measureElement`
 * is the thin DOM glue that feeds them.
 */

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Sides {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface TypeSpec {
  family: string;
  size: number;
  weight: number;
  /** The weight the browser will actually draw, or `null` when it can't be verified. */
  renderedWeight: number | null;
  /** The family has registered font faces and every one failed to load. */
  fontFailed: boolean;
  /** `null` = `normal`. */
  lineHeight: number | null;
  /** `null` = `normal`. */
  letterSpacing: number | null;
  color: string;
}

/** Empty space between two children; `axis` names the gap property that set it. */
export interface GapStrip {
  rect: Rect;
  /** `column` separates side-by-side children (column-gap), `row` stacked ones (row-gap). */
  axis: 'row' | 'column';
}

export interface Spec {
  /** e.g. `button.lc-btn`. */
  name: string;
  /** The element's Anchor name (ADR 0003), when it has one. */
  anchor: string | null;
  rect: Rect;
  /** False for multi-line inline boxes, where one rect can't show the padding. */
  drawBands: boolean;
  /** Rendered px per CSS px — not 1 while a `transform: scale()` is applied. */
  scale: number;
  padding: Sides;
  border: Sides;
  /** `null` when the element isn't a flex or grid container. */
  gap: { row: number; column: number } | null;
  gapStrips: GapStrip[];
  /** Distinct non-zero margins on in-flow children, ascending. */
  childMargins: number[];
  /** `null` when the element has no text of its own. */
  type: TypeSpec | null;
  /** Line boxes of the element's own text, clipped to the viewport; empty without `type`. */
  textLines: Rect[];
}

type SideKeys<P extends string> = `${P}Top` | `${P}Right` | `${P}Bottom` | `${P}Left`;

export type StyleLike = Pick<
  CSSStyleDeclaration,
  | SideKeys<'padding'>
  | 'borderTopWidth'
  | 'borderRightWidth'
  | 'borderBottomWidth'
  | 'borderLeftWidth'
  | 'display'
  | 'boxSizing'
  | 'width'
  | 'flexDirection'
  | 'rowGap'
  | 'columnGap'
  | 'fontFamily'
  | 'fontSize'
  | 'fontWeight'
  | 'lineHeight'
  | 'letterSpacing'
  | 'color'
>;

export type ChildStyleLike = Pick<CSSStyleDeclaration, SideKeys<'margin'> | 'position' | 'display'>;

/** Minimal shape of a `FontFace`, so tests can pass plain objects. */
export interface FontFaceLike {
  family: string;
  weight: string;
  status: string;
}

/** `"12.5px"` → 12.5; `"normal"`, `""` → 0. Rounded to 2 decimals to drop float noise. */
export function parsePx(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

function parseOptionalPx(value: string): number | null {
  return value === 'normal' || value === '' ? null : parsePx(value);
}

/** First family in a font stack, without quotes. */
export function firstFamily(stack: string): string {
  return (stack.split(',')[0] ?? '').trim().replace(/^["']|["']$/g, '');
}

/** `rgb(60, 73, 44)` → `#3c492c`; translucent colors get an alpha byte (`#3c492c80`). */
export function toHex(color: string): string {
  const m = color.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+)(%?))?\s*\)$/);
  if (!m) return color;
  const byte = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0');
  const hex = `#${byte(Number(m[1]))}${byte(Number(m[2]))}${byte(Number(m[3]))}`;
  if (m[4] == null) return hex;
  const alpha = m[5] === '%' ? Number(m[4]) / 100 : Number(m[4]);
  return alpha >= 1 ? hex : `${hex}${byte(alpha * 255)}`;
}

export function readPadding(style: StyleLike): Sides {
  return {
    top: parsePx(style.paddingTop),
    right: parsePx(style.paddingRight),
    bottom: parsePx(style.paddingBottom),
    left: parsePx(style.paddingLeft),
  };
}

export function readBorder(style: StyleLike): Sides {
  return {
    top: parsePx(style.borderTopWidth),
    right: parsePx(style.borderRightWidth),
    bottom: parsePx(style.borderBottomWidth),
    left: parsePx(style.borderLeftWidth),
  };
}

/**
 * Rendered px per CSS px, so a `transform: scale()` on the element or an
 * ancestor doesn't skew the bands. The computed `width` is the fractional,
 * untransformed layout width (unlike the integer `offsetWidth`); it's `auto`
 * for inline boxes, which then count as unscaled.
 */
export function renderScale(renderedWidth: number, style: StyleLike, padding: Sides, border: Sides): number {
  const width = parsePx(style.width);
  if (width <= 0 || renderedWidth <= 0) return 1;
  const borderBox =
    style.boxSizing === 'border-box' ? width : width + padding.left + padding.right + border.left + border.right;
  const scale = renderedWidth / borderBox;
  // Sub-pixel noise isn't a transform.
  return Math.abs(scale - 1) < 0.001 ? 1 : scale;
}

const LAYOUT_CONTAINERS = new Set(['flex', 'inline-flex', 'grid', 'inline-grid']);

export function isLayoutContainer(display: string): boolean {
  return LAYOUT_CONTAINERS.has(display);
}

/** Declared gaps; `normal` counts as 0. `null` when gap doesn't apply. */
export function readGap(style: StyleLike): Spec['gap'] {
  if (!isLayoutContainer(style.display)) return null;
  return { row: parsePx(style.rowGap), column: parsePx(style.columnGap) };
}

/** Children that take part in the parent's flow, so they bound its gaps. */
export function isInFlow(style: ChildStyleLike): boolean {
  return (
    style.position !== 'absolute' &&
    style.position !== 'fixed' &&
    style.display !== 'none' &&
    style.display !== 'contents'
  );
}

/** Distinct non-zero margins across in-flow children, ascending. */
export function collectChildMargins(children: ChildStyleLike[]): number[] {
  const values = new Set<number>();
  for (const c of children) {
    if (!isInFlow(c)) continue;
    for (const v of [c.marginTop, c.marginRight, c.marginBottom, c.marginLeft]) {
      const px = parsePx(v);
      if (px !== 0) values.add(px);
    }
  }
  return [...values].sort((a, b) => a - b);
}

/** Parses a FontFace weight descriptor: `"700"`, a variable range `"100 900"`, or a keyword. */
function weightRange(weight: string): [number, number] | null {
  if (weight === 'normal') return [400, 400];
  if (weight === 'bold') return [700, 700];
  const parts = weight.trim().split(/\s+/).map(Number);
  if (parts.some((n) => !Number.isFinite(n) || n <= 0)) return null;
  return [parts[0], parts[parts.length - 1]];
}

/**
 * Which face the browser will draw for `declared`, per the CSS Fonts 4 weight
 * matching rules, given the weights registered for the family. `null` when
 * nothing is registered (a system font, or the font stylesheet never loaded).
 */
export function renderedWeight(declared: number, faces: readonly [number, number][]): number | null {
  if (faces.length === 0) return null;
  if (faces.some(([lo, hi]) => declared >= lo && declared <= hi)) return declared;
  // Outside every face, the nearest edge of each face is a candidate.
  const candidates = [...new Set(faces.flatMap(([lo, hi]) => [lo, hi]))];
  const above = candidates.filter((w) => w > declared).sort((a, b) => a - b);
  const below = candidates.filter((w) => w < declared).sort((a, b) => b - a);
  if (declared >= 400 && declared <= 500) {
    const upTo500 = above.filter((w) => w <= 500);
    const over500 = above.filter((w) => w > 500);
    return upTo500[0] ?? below[0] ?? over500[0] ?? null;
  }
  if (declared < 400) return below[0] ?? above[0] ?? null;
  return above[0] ?? below[0] ?? null;
}

/** Weight ranges of `family`'s usable faces, and whether every face failed. */
export function familyFaces(
  family: string,
  faces: Iterable<FontFaceLike>,
): { ranges: [number, number][]; failed: boolean } {
  const wanted = family.toLowerCase();
  const ranges: [number, number][] = [];
  let total = 0;
  for (const face of faces) {
    if (firstFamily(face.family).toLowerCase() !== wanted) continue;
    total += 1;
    if (face.status === 'error') continue;
    const range = weightRange(face.weight);
    if (range) ranges.push(range);
  }
  return { ranges, failed: total > 0 && ranges.length === 0 };
}

export function readType(style: StyleLike, faces: Iterable<FontFaceLike>): TypeSpec {
  const family = firstFamily(style.fontFamily);
  const weight = parseInt(style.fontWeight, 10) || 400;
  const { ranges, failed } = familyFaces(family, faces);
  return {
    family,
    size: parsePx(style.fontSize),
    weight,
    renderedWeight: renderedWeight(weight, ranges),
    fontFailed: failed,
    lineHeight: parseOptionalPx(style.lineHeight),
    letterSpacing: parseOptionalPx(style.letterSpacing),
    color: toHex(style.color),
  };
}

type Axis = { start: 'left' | 'top'; size: 'width' | 'height' };
const H: Axis = { start: 'left', size: 'width' };
const V: Axis = { start: 'top', size: 'height' };

const end = (r: Rect, a: Axis) => r[a.start] + r[a.size];

function makeRect(main: Axis, mainStart: number, mainEnd: number, crossStart: number, crossEnd: number): Rect {
  return main === H
    ? { left: mainStart, width: mainEnd - mainStart, top: crossStart, height: crossEnd - crossStart }
    : { top: mainStart, height: mainEnd - mainStart, left: crossStart, width: crossEnd - crossStart };
}

export function intersect(a: Rect, b: Rect): Rect | null {
  const left = Math.max(a.left, b.left);
  const top = Math.max(a.top, b.top);
  const right = Math.min(a.left + a.width, b.left + b.width);
  const bottom = Math.min(a.top + a.height, b.top + b.height);
  return right > left && bottom > top ? { left, top, width: right - left, height: bottom - top } : null;
}

/**
 * The empty strips between in-flow children, laid out as on screen (so
 * `*-reverse` and `order` don't matter). Children are grouped into lines
 * along the cross axis; strips run between neighbours on a line, and between
 * lines (wrapped flex, grid rows). Exact for single-line flex, approximate for
 * irregular grids. Strips are clipped to `clip`.
 */
export function gapRects(children: Rect[], direction: 'row' | 'column', clip: Rect): GapStrip[] {
  const main = direction === 'row' ? H : V;
  const cross = direction === 'row' ? V : H;
  const items = children.filter((r) => r.width > 0 && r.height > 0);

  // Group into lines: an item joins a line when it overlaps it on the cross axis.
  const lines: Rect[][] = [];
  for (const item of [...items].sort((a, b) => a[cross.start] - b[cross.start])) {
    const line = lines.find((l) =>
      l.some((o) => item[cross.start] < end(o, cross) && end(item, cross) > o[cross.start]),
    );
    if (line) line.push(item);
    else lines.push([item]);
  }

  // Space along the horizontal axis is column-gap; along the vertical, row-gap.
  const mainAxis: GapStrip['axis'] = main === H ? 'column' : 'row';
  const crossAxis: GapStrip['axis'] = main === H ? 'row' : 'column';
  const strips: GapStrip[] = [];
  const bounds = (line: Rect[], axis: Axis) => ({
    start: Math.min(...line.map((r) => r[axis.start])),
    end: Math.max(...line.map((r) => end(r, axis))),
  });

  for (const line of lines) {
    const sorted = [...line].sort((a, b) => a[main.start] - b[main.start]);
    for (let i = 1; i < sorted.length; i += 1) {
      const a = sorted[i - 1];
      const b = sorted[i];
      if (b[main.start] - end(a, main) < 0.5) continue;
      const crossStart = Math.min(a[cross.start], b[cross.start]);
      const crossEnd = Math.max(end(a, cross), end(b, cross));
      strips.push({ rect: makeRect(main, end(a, main), b[main.start], crossStart, crossEnd), axis: mainAxis });
    }
  }

  for (let i = 1; i < lines.length; i += 1) {
    const prev = bounds(lines[i - 1], cross);
    const next = bounds(lines[i], cross);
    if (next.start - prev.end < 0.5) continue;
    const span = bounds([...lines[i - 1], ...lines[i]], main);
    strips.push({ rect: makeRect(main, span.start, span.end, prev.end, next.start), axis: crossAxis });
  }

  return strips.flatMap((s) => {
    const rect = intersect(s.rect, clip);
    return rect ? [{ rect, axis: s.axis }] : [];
  });
}

/**
 * One box per rendered line of text, from the text's glyph fragments. With a
 * `lineHeight` (rendered px) each box grows to the full line box, centered on
 * the glyphs as half-leading is; with `normal` it stays at the glyph height.
 */
export function lineBoxes(fragments: Rect[], lineHeight: number | null, clip: Rect): Rect[] {
  const lines: Rect[] = [];
  for (const f of [...fragments].sort((a, b) => a.top - b.top)) {
    if (f.width <= 0 || f.height <= 0) continue;
    const middle = f.top + f.height / 2;
    const line = lines.find((l) => middle > l.top && middle < l.top + l.height);
    if (!line) {
      lines.push({ ...f });
      continue;
    }
    const right = Math.max(end(line, H), end(f, H));
    const bottom = Math.max(end(line, V), end(f, V));
    line.left = Math.min(line.left, f.left);
    line.top = Math.min(line.top, f.top);
    line.width = right - line.left;
    line.height = bottom - line.top;
  }
  return lines.flatMap((l) => {
    const box = lineHeight === null ? l : { ...l, top: l.top + (l.height - lineHeight) / 2, height: lineHeight };
    const rect = intersect(box, clip);
    return rect ? [rect] : [];
  });
}

/** `div.lc-ticket-row` — tag plus first class, for labels. */
export function elementName(el: Element): string {
  // The attribute, not `className`: on SVG elements that's an SVGAnimatedString.
  const cls = (el.getAttribute('class') ?? '').trim().split(/\s+/)[0];
  return `${el.tagName.toLowerCase()}${cls ? `.${cls}` : ''}`;
}

function ownTextNodes(el: Element): Text[] {
  return [...el.childNodes].filter((n): n is Text => n.nodeType === Node.TEXT_NODE && !!n.textContent?.trim());
}

/** Rendered fragments of the element's own text: one per line per text node. */
function textFragments(nodes: Text[]): Rect[] {
  const range = document.createRange();
  // jsdom has no text layout.
  if (typeof range.getClientRects !== 'function') return [];
  return nodes.flatMap((node) => {
    range.selectNodeContents(node);
    return [...range.getClientRects()].map(({ left, top, width, height }) => ({ left, top, width, height }));
  });
}

/**
 * Walks up from `el` to the nearest element that draws a box (skips
 * `display: contents` and zero-size elements). Stops at `body`. Shapes inside
 * an icon resolve to the `<svg>` itself — its box is what a reviewer means.
 */
export function resolveTarget(el: Element): Element {
  let current: Element = el instanceof SVGElement && el.ownerSVGElement ? el.ownerSVGElement : el;
  while (current !== document.body && current.parentElement) {
    const rect = current.getBoundingClientRect();
    const boxless = getComputedStyle(current).display === 'contents' || (rect.width === 0 && rect.height === 0);
    if (!boxless) break;
    current = current.parentElement;
  }
  return current;
}

const MARGIN_SIDES = [
  ['marginTop', 'margin-top'],
  ['marginRight', 'margin-right'],
  ['marginBottom', 'margin-bottom'],
  ['marginLeft', 'margin-left'],
] as const;

/**
 * A child's margins, with `auto` ones zeroed. `getComputedStyle` reports an
 * auto margin as the px it resolved to (e.g. a flex "push right" margin of
 * 523px), which isn't spacing anyone chose. The Typed OM still sees `auto`;
 * where it's unsupported (Firefox) the px value is kept.
 */
function childSpacing(child: Element): ChildStyleLike {
  const style = getComputedStyle(child);
  const spacing: ChildStyleLike = {
    marginTop: style.marginTop,
    marginRight: style.marginRight,
    marginBottom: style.marginBottom,
    marginLeft: style.marginLeft,
    position: style.position,
    display: style.display,
  };
  if (typeof child.computedStyleMap !== 'function') return spacing;
  const typed = child.computedStyleMap();
  for (const [key, property] of MARGIN_SIDES) {
    if (typed.get(property)?.toString() === 'auto') spacing[key] = '0px';
  }
  return spacing;
}

function viewportRect(): Rect {
  return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
}

function documentFaces(): Iterable<FontFaceLike> {
  return typeof document !== 'undefined' && 'fonts' in document ? document.fonts : [];
}

/** Everything Inspect mode shows for `el`, measured now. */
export function measureElement(el: Element): Spec {
  const style = getComputedStyle(el);
  const box = el.getBoundingClientRect();
  const rect: Rect = { left: box.left, top: box.top, width: box.width, height: box.height };
  const padding = readPadding(style);
  const border = readBorder(style);
  const scale = renderScale(rect.width, style, padding, border);

  const children = [...el.children].map((child) => ({ child, style: childSpacing(child) }));
  const inFlow = children.filter((c) => isInFlow(c.style));
  const gap = readGap(style);
  const direction = style.flexDirection.startsWith('column') && style.display.includes('flex') ? 'column' : 'row';
  const viewport = viewportRect();
  const clip = intersect(rect, viewport);
  const gapStrips =
    gap && (gap.row > 0 || gap.column > 0) && clip
      ? gapRects(
          inFlow.map((c) => c.child.getBoundingClientRect()),
          direction,
          clip,
        )
      : [];
  const text = ownTextNodes(el);
  const type = text.length > 0 ? readType(style, documentFaces()) : null;
  const textLines =
    type && clip
      ? lineBoxes(textFragments(text), type.lineHeight === null ? null : type.lineHeight * scale, viewport)
      : [];

  return {
    name: elementName(el),
    anchor: el.getAttribute('data-anchor'),
    rect,
    drawBands: el instanceof HTMLElement && !(style.display === 'inline' && el.getClientRects().length > 1),
    scale,
    padding,
    border,
    gap,
    gapStrips,
    childMargins: collectChildMargins(children.map((c) => c.style)),
    type,
    textLines,
  };
}
