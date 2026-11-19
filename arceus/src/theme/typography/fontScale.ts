import rem from "@/theme/typography/toRem";

const FONT_SIZE_PX = {
  "3xs": 8,
  "2xs": 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 40,
} as const;

const LINE_HEIGHT_PX = {
  "3xs": 16,
  "2xs": 18,
  xs: 20,
  sm: 22,
  md: 24,
  lg: 26,
  xl: 28,
  "2xl": 32,
  "3xl": 38,
  "4xl": 44,
  "5xl": 48,
} as const;

const fontSizes = rem.mapPxToRem(FONT_SIZE_PX);
const lineHeights = rem.mapPxToRem(LINE_HEIGHT_PX);

export type FontScaleKeys = keyof typeof FONT_SIZE_PX;

export { FONT_SIZE_PX, LINE_HEIGHT_PX };

export default { fontSizes, lineHeights };
