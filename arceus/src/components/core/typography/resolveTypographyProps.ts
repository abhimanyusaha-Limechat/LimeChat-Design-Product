import { TONE_TO_COLOR } from "@/components/core/typography/variants";
import type {
  TextStylePreset,
  TextTone,
  TextTransformOption,
  TitleStylePreset,
} from "@/components/core/typography/types";

export type TypographyResolveInput = {
  preset?: TitleStylePreset | TextStylePreset;
  tone?: TextTone;
  transform?: TextTransformOption;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  truncate?: boolean | 1 | 2;
  className?: string;
  overrides: Record<string, unknown>;
};

export function resolveTypographyProps({
  preset,
  tone,
  transform,
  italic,
  underline,
  strikethrough,
  truncate,
  className,
  overrides,
}: TypographyResolveInput): Record<string, unknown> {
  const {
    c: overrideC,
    fs: overrideFs,
    td: overrideTd,
    tt: overrideTt,
    lineClamp: overrideLineClamp,
    className: overrideClassName,
    ...restOverrides
  } = overrides;

  const fs = overrideFs ?? (italic === true ? "italic" : undefined);
  const tt =
    overrideTt ??
    (transform === "capitalize"
      ? "capitalize"
      : transform === "uppercase"
        ? "uppercase"
        : undefined);
  const td =
    overrideTd ??
    (strikethrough === true ? "line-through" : underline === true ? "underline" : undefined);
  const c =
    overrideC ??
    (strikethrough === true && overrideC === undefined
      ? "red"
      : tone !== undefined
        ? TONE_TO_COLOR[tone]
        : undefined);
  const lineClamp = overrideLineClamp ?? (truncate === true ? 1 : truncate === 2 ? 2 : undefined);

  const mergedClassName = [className, overrideClassName].filter(Boolean).join(" ");

  return {
    ...preset,
    ...restOverrides,
    ...(c !== undefined ? { c } : {}),
    ...(fs !== undefined ? { fs } : {}),
    ...(td !== undefined ? { td } : {}),
    ...(tt !== undefined ? { tt } : {}),
    ...(lineClamp !== undefined ? { lineClamp } : {}),
    ...(mergedClassName ? { className: mergedClassName } : {}),
  };
}
