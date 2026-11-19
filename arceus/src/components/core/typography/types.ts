import type {
  MantineColor,
  TextProps as MantineTextProps,
  TitleProps as MantineTitleProps,
} from "@mantine/core";

export type TextTone =
  | "dark"
  | "light"
  | "primary"
  | "secondary"
  | "white"
  | "black"
  | "red"
  | "yellow";

export type TextTransformOption = "capitalize" | "uppercase";

export type TypographyTruncate = boolean | 1 | 2;

export type TitleVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h3-medium"
  | "h4"
  | "h4-medium"
  | "h5"
  | "h5-medium"
  | "h6"
  | "h6-medium"
  | "h7"
  | "h7-medium";

export type TextVariant =
  | "subtitle-1"
  | "subtitle-2"
  | "body-1"
  | "body-2"
  | "body-3"
  | "caption-1"
  | "caption-2"
  | "caption-3";

export type TitleStylePreset = Pick<MantineTitleProps, "order" | "fz" | "fw" | "lh">;

export type TextStylePreset = Pick<MantineTextProps, "fz" | "fw" | "lh">;

export type TypographyPreset = TitleStylePreset | TextStylePreset;

export type TypographyPresentationProps = {
  tone?: TextTone;
  transform?: TextTransformOption;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  truncate?: TypographyTruncate;
};

export type TypographyStyleOverrides = Pick<
  MantineTextProps,
  "c" | "fs" | "td" | "tt" | "lineClamp" | "className"
>;

export type ResolvedTypographyProps = Partial<
  Pick<MantineTextProps, "c" | "fs" | "td" | "tt" | "lineClamp" | "className" | "fz" | "fw" | "lh">
> &
  Partial<Pick<MantineTitleProps, "order">>;

export type TypographyPresentationKeys = keyof TypographyPresentationProps | "className";

export type TypographyStyleOverrideKeys = keyof TypographyStyleOverrides;

export type StripArceusTypographyProps<T> = Omit<
  T,
  TypographyPresentationKeys | TypographyStyleOverrideKeys | "variant" | "order" | "truncate"
>;

export type TitleTypographyInput = TypographyPresentationProps &
  TypographyStyleOverrides &
  StripArceusTypographyProps<Omit<MantineTitleProps, "order">>;

export type TextTypographyInput = TypographyPresentationProps &
  TypographyStyleOverrides &
  StripArceusTypographyProps<Omit<MantineTextProps, "variant" | "truncate">>;

export type ToneColorMap = Record<TextTone, MantineColor | undefined>;
