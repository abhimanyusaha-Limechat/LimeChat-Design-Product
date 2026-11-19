import rem from "@/theme/typography/toRem";

const RADIUS_PX = {
  zero: 0,
  "3xs": 2,
  "2xs": 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
} as const;

const radius = rem.mapPxToRem(RADIUS_PX);

export type RadiusKeys = keyof typeof RADIUS_PX;

export default radius;
