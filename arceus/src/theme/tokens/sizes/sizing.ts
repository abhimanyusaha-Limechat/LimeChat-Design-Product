export const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

export const sizing = {
  container: { xs: 24, sm: 32, md: 40, lg: 48, xl: 56 },
  compact: { xs: 20, sm: 24, md: 28, lg: 32, xl: 36 },
  control: { xs: 16, sm: 20, md: 24, lg: 28, xl: 32 },
  checkboxIcon: { xs: 12, sm: 16, md: 20, lg: 24, xl: 28 },
  icon: { xs: 16, sm: 24, md: 32, lg: 40, xl: 48 },
  inline: { xs: 16, sm: 18, md: 20, lg: 22, xl: 24 },
  inputPaddingX: { xs: 12, sm: 12, md: 16, lg: 16, xl: 20 },
  inputLineHeight: { xs: 16, sm: 20, md: 24, lg: 28, xl: 32 },
  controlFontSize: { xs: 12, sm: 14, md: 16, lg: 18, xl: 20 },
  inputSectionIcon: { xs: 12, sm: 16, md: 20, lg: 24, xl: 32 },
  avatar: { xs: 16, sm: 24, md: 36, lg: 56, xl: 84 },
  pagination: { xs: 16, sm: 20, md: 24, lg: 28, xl: 32 },
  thickness: { xs: 1, sm: 2, md: 3, lg: 4, xl: 8 },
  loader: { xs: 16, sm: 20, md: 32, lg: 40, xl: 48 },
  thumb: { xs: 12, sm: 14, md: 18, lg: 22, xl: 26 },
  switchWidth: { xs: 35, sm: 42, md: 50, lg: 58, xl: 70 },
  chevron: { xs: 11, sm: 12, md: 14, lg: 16, xl: 18 },
  inset: { xs: 2, sm: 4, md: 6, lg: 8, xl: 10 },
  actionIcon: { xs: 16, sm: 20, md: 24, lg: 32, xl: 40 },
} as const;

export type SizeCategory = keyof typeof sizing;

export type InputSize = (typeof SIZES)[number];
