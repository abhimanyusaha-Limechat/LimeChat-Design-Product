/**
 * The spacing and type scale Inspect mode checks values against. This is the
 * only place to change when the design system's scale changes; once spacing
 * and type tokens exist in `tokens.css`, map them here.
 */
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
