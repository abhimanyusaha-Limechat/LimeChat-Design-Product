/**
 * The spacing, type and color scale Inspect mode checks values against. This
 * is the only place to change when the design system's scale changes; once
 * spacing and type tokens exist in `tokens.css`, map them here.
 */
import tokensCss from '../../tokens.css?raw';

export const SPACING_STEP = 4;
export const FONT_SIZES: readonly number[] = [10, 12, 14, 16, 20];

/** True when `px` is a whole multiple of the spacing step (0 included). */
export function isOnSpacingGrid(px: number): boolean {
  return Number.isInteger(px) && px % SPACING_STEP === 0;
}

/** True when `px` is exactly one of the allowed font sizes. */
export function isAllowedFontSize(px: number): boolean {
  return FONT_SIZES.includes(px);
}

export interface ColorToken {
  /** The CSS variable without its `--lc-color-` prefix, e.g. `sage-500`. */
  name: string;
  /** The design system's primitive name from the token's comment, e.g. `color/light`. */
  primitive: string | null;
  /** Lowercase `#rrggbb`. */
  hex: string;
}

// `--lc-color-sage-500: #808975; /* color/light */` — the comment is optional, and
// anything from `(` on is a note, not part of the primitive name.
const TOKEN_LINE = /--lc-color-([\w-]+):\s*(#[0-9a-f]{6})\s*;(?:[ \t]*\/\*\s*([^*(\n]+?)\s*(?:\(|\*\/))?/gi;

/** The color tokens declared in a stylesheet, in declaration order. */
export function parseColorTokens(css: string): ColorToken[] {
  return [...css.matchAll(TOKEN_LINE)].map(([, name, hex, primitive]) => ({
    name,
    hex: hex.toLowerCase(),
    primitive: primitive ?? null,
  }));
}

/** Read from tokens.css itself, so the palette is never maintained twice. */
export const COLOR_TOKENS: readonly ColorToken[] = parseColorTokens(tokensCss);

/** The first-declared token with exactly this color, or null. */
export function findColorToken(hex: string, tokens: readonly ColorToken[] = COLOR_TOKENS): ColorToken | null {
  const target = hex.toLowerCase();
  return tokens.find((t) => t.hex === target) ?? null;
}

const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/** The token closest in RGB to an opaque or translucent hex color, or null when it isn't hex. */
export function nearestColorToken(hex: string, tokens: readonly ColorToken[] = COLOR_TOKENS): ColorToken | null {
  if (!/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(hex)) return null;
  const [r, g, b] = channels(hex);
  let best: ColorToken | null = null;
  let bestDistance = Infinity;
  for (const token of tokens) {
    const [tr, tg, tb] = channels(token.hex);
    const distance = (r - tr) ** 2 + (g - tg) ** 2 + (b - tb) ** 2;
    if (distance < bestDistance) {
      best = token;
      bestDistance = distance;
    }
  }
  return best;
}
