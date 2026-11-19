import type { MantineThemeOverride } from "@mantine/core";

import colorPalettes from "@/theme/palettes/colors";
import accentColors from "@/theme/palettes/accents";
import spacing from "@/theme/layout/spacing";
import radius from "@/theme/layout/radius";
import fontScale from "@/theme/typography/fontScale";
import { REM_BASE_PX } from "@/theme/typography/toRem";
import { AI_GRADIENT } from "@/theme/palettes/gradients";

const defaultThemeOverride: MantineThemeOverride = {
  scale: 16 / REM_BASE_PX,
  primaryColor: "primary",
  primaryShade: 6,
  defaultGradient: AI_GRADIENT,
  black: "#000000",
  white: "#FFFFFF",
  cursorType: "pointer",
  colors: { ...colorPalettes },
  other: { ...accentColors },
  fontFamily: "'Lato', sans-serif",
  fontSizes: fontScale.fontSizes,
  lineHeights: fontScale.lineHeights,
  spacing,
  radius,
  defaultRadius: "2xs",
};

export default defaultThemeOverride;
