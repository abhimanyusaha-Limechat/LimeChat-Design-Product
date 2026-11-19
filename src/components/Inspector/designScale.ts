/**
 * The spacing, type and color scale Inspect mode checks values against. This
 * is the only place to change when the design system's scale changes; once
 * spacing and type tokens exist in arceus, map them here.
 */
import COLOR_PALETTES from '../../../arceus/src/theme/palettes/colors';
import FONT_COLORS from '../../../arceus/src/theme/palettes/fonts';

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
  /** The arceus palette key and step, e.g. `primary-6`, or `dark` / `light` / `white`. */
  name: string;
  /** The Mantine CSS variable arceus publishes for it, e.g. `--mantine-color-primary-6`. */
  cssVar: string;
  /** Lowercase `#rrggbb`. */
  hex: string;
}

// Palettes that are aliases of another (primary = green, error = red, …) or single-tone
// text colors are skipped so each hex resolves to one canonical name.
const SKIPPED_PALETTES = new Set(['green', 'blue', 'error', 'warning', 'dark', 'light']);

const named = (name: string, hex: string): ColorToken => ({
  name,
  cssVar: `--mantine-color-${name}`,
  hex: hex.toLowerCase(),
});

/** Every color arceus publishes, in declaration order. The palette is read from arceus, never copied. */
export const COLOR_TOKENS: readonly ColorToken[] = [
  named('dark', FONT_COLORS.DARK),
  named('light', FONT_COLORS.LIGHT),
  named('white', '#ffffff'),
  ...Object.entries(COLOR_PALETTES)
    .filter(([palette]) => !SKIPPED_PALETTES.has(palette))
    .flatMap(([palette, steps]) => steps.map((hex, step) => named(`${palette}-${step}`, hex))),
];

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
