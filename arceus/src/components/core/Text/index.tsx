import React, { forwardRef } from "react";
import { Text as MantineText } from "@mantine/core";
import type { TextProps as MantineCoreTextProps, PolymorphicComponentProps } from "@mantine/core";

import { resolveArceusTypography } from "@/components/core/typography/resolveArceusTypography";
import type { TextVariant, TypographyPresentationProps } from "@/components/core/typography/types";
import { TEXT_VARIANT_PRESETS } from "@/components/core/typography/variants";

export type { PolymorphicComponentProps, TextVariant };

type TextBaseProps = Omit<MantineCoreTextProps, "variant" | "truncate"> &
  TypographyPresentationProps & {
    variant?: TextVariant;
  };

export type ArceusTextProps<C extends React.ElementType = "p"> = PolymorphicComponentProps<
  C,
  TextBaseProps
>;

export type TextProps = ArceusTextProps;

function TextRender(
  {
    variant,
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
  }: ArceusTextProps<React.ElementType>,
  ref: React.Ref<HTMLParagraphElement>,
) {
  const resolved = resolveArceusTypography(TEXT_VARIANT_PRESETS, variant, {
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
    ...rest,
  });

  return <MantineText ref={ref} {...resolved} />;
}

const Text = forwardRef(TextRender) as <C extends React.ElementType = "p">(
  props: ArceusTextProps<C>,
) => React.ReactElement;

export default Text;
export { Text };
