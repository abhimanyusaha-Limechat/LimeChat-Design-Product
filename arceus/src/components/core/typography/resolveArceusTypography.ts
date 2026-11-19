import { resolveTypographyProps } from "@/components/core/typography/resolveTypographyProps";
import type {
  TextStylePreset,
  TitleStylePreset,
  TypographyPresentationProps,
} from "@/components/core/typography/types";

export type ArceusTypographyInput = {
  [K in keyof TypographyPresentationProps]?: TypographyPresentationProps[K] | undefined;
} & {
  className?: string | undefined;
  fs?: unknown;
  td?: unknown;
  tt?: unknown;
  c?: unknown;
};

export function resolveArceusTypography<
  V extends string,
  P extends Record<V, TitleStylePreset | TextStylePreset>,
>(
  presets: P,
  variant: V | undefined,
  {
    tone,
    transform,
    italic,
    underline,
    strikethrough,
    truncate,
    className,
    fs,
    td,
    tt,
    c,
    ...rest
  }: ArceusTypographyInput & Record<string, unknown>,
) {
  const preset = variant !== undefined ? presets[variant] : undefined;

  return resolveTypographyProps({
    ...(preset !== undefined ? { preset } : {}),
    ...(tone !== undefined ? { tone } : {}),
    ...(transform !== undefined ? { transform } : {}),
    ...(italic !== undefined ? { italic } : {}),
    ...(underline !== undefined ? { underline } : {}),
    ...(strikethrough !== undefined ? { strikethrough } : {}),
    ...(truncate !== undefined ? { truncate } : {}),
    ...(className !== undefined ? { className } : {}),
    overrides: { fs, td, tt, c, ...rest },
  });
}
