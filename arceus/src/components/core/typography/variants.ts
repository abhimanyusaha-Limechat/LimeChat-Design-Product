import type {
  TextStylePreset,
  TextTone,
  TextVariant,
  TitleStylePreset,
  TitleVariant,
} from "@/components/core/typography/types";

export const TITLE_VARIANT_PRESETS: Record<TitleVariant, TitleStylePreset> = {
  h1: { order: 1, fz: "2xl", fw: 700, lh: "2xl" },
  h2: { order: 2, fz: "xl", fw: 700, lh: "xl" },
  h3: { order: 3, fz: "lg", fw: 700, lh: "lg" },
  "h3-medium": { order: 3, fz: "lg", fw: 400, lh: "lg" },
  h4: { order: 4, fz: "md", fw: 700, lh: "md" },
  "h4-medium": { order: 4, fz: "md", fw: 500, lh: "md" },
  h5: { order: 5, fz: "sm", fw: 700, lh: "sm" },
  "h5-medium": { order: 5, fz: "sm", fw: 500, lh: "sm" },
  h6: { order: 6, fz: "xs", fw: 700, lh: "xs" },
  "h6-medium": { order: 6, fz: "xs", fw: 500, lh: "xs" },
  h7: { order: 6, fz: "2xs", fw: 700, lh: "2xs" },
  "h7-medium": { order: 6, fz: "2xs", fw: 500, lh: "2xs" },
};

export const TEXT_VARIANT_PRESETS: Record<TextVariant, TextStylePreset> = {
  "subtitle-1": { fz: "md", fw: 400, lh: "md" },
  "subtitle-2": { fz: "sm", fw: 400, lh: "sm" },
  "body-1": { fz: "md", fw: 400, lh: "md" },
  "body-2": { fz: "sm", fw: 400, lh: "sm" },
  "body-3": { fz: "xs", fw: 400, lh: "xs" },
  "caption-1": { fz: "sm", fw: 400, lh: "sm" },
  "caption-2": { fz: "xs", fw: 400, lh: "xs" },
  "caption-3": { fz: "2xs", fw: 400, lh: "2xs" },
};

export const TONE_TO_COLOR: Record<TextTone, string | undefined> = {
  dark: "var(--mantine-color-dark)",
  light: "var(--mantine-color-light)",
  primary: "primary.6",
  secondary: "secondary.6",
  white: "white",
  black: "black",
  red: "red.6",
  yellow: "yellow.6",
};
