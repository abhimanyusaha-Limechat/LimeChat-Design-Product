import rem from "@/theme/typography/toRem";

/**
 * Padding/Margin/Spacing tokens in pixels
 */
const SPACING_PX = {
  zero: 0,
  "3xs": 2,
  "2xs": 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
  "5xl": 56,
} as const;

const spacing = rem.mapPxToRem(SPACING_PX);

export type SpacingKeys = keyof typeof SPACING_PX;

export default spacing;
