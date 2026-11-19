import type { MantineColorsTuple } from "@mantine/core";
import type { SpacingKeys } from "@/theme/layout/spacing";
import type { ExtendedColors } from "@/theme/palettes/extendedColors";
import type { FontScaleKeys } from "@/theme/typography/fontScale";

export type {
  MantineTheme,
  MantineThemeOverride,
  CSSVariablesResolver,
  MantineColor,
  MantineSize,
  MantineSpacing,
  MantineRadius,
} from "@mantine/core";
export { createTheme } from "@mantine/core";

declare module "@mantine/core" {
  export interface MantineThemeColorsOverride {
    colors: Record<ExtendedColors, MantineColorsTuple>;
  }

  export interface MantineThemeSizesOverride {
    fontSizes: Record<FontScaleKeys, string>;
    lineHeights: Record<FontScaleKeys, string>;
    spacing: Record<SpacingKeys, string>;
  }

  export interface MantineThemeOther {
    white: string;
    black: string;
    textDark: string;
    textLight: string;
    extra01: string;
    extra02: string;
    extra03: string;
    extra04: string;
    extra05: string;
    extra06: string;
    extra07: string;
    extra08: string;
    extra09: string;
    extra10: string;
    primaryAlpha8: string;
    primaryAlpha12: string;
    primaryAlpha16: string;
    primaryAlpha24: string;
    secondaryAlpha8: string;
    secondaryAlpha12: string;
    secondaryAlpha16: string;
    secondaryAlpha24: string;
    successAlpha8: string;
    successAlpha12: string;
    successAlpha16: string;
    successAlpha24: string;
    errorAlpha8: string;
    errorAlpha12: string;
    errorAlpha16: string;
    errorAlpha24: string;
    warningAlpha8: string;
    warningAlpha12: string;
    warningAlpha16: string;
    warningAlpha24: string;
    infoAlpha8: string;
    infoAlpha12: string;
    infoAlpha16: string;
    infoAlpha24: string;
    whatsappAlpha8: string;
    whatsappAlpha12: string;
    whatsappAlpha16: string;
    whatsappAlpha24: string;
    instagramAlpha8: string;
    instagramAlpha12: string;
    instagramAlpha16: string;
    instagramAlpha24: string;
    facebookAlpha8: string;
    facebookAlpha12: string;
    facebookAlpha16: string;
    facebookAlpha24: string;
    violetAlpha8: string;
    violetAlpha12: string;
    violetAlpha16: string;
    violetAlpha24: string;
    grayAlpha10: string;
    grayAlpha12: string;
    grayAlpha15: string;
    grayAlpha20: string;
  }
}

export { default as ThemeProvider } from "@/theme/ThemeProvider";
export { DEFAULT_THEME, createAppTheme } from "@/theme/createTheme";
export { default as resolver } from "@/theme/resolver";
