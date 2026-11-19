import React, { forwardRef } from "react";
import { Title as MantineTitle } from "@mantine/core";
import type { TitleProps as MantineCoreTitleProps } from "@mantine/core";

import { resolveArceusTypography } from "@/components/core/typography/resolveArceusTypography";
import type { TitleVariant, TypographyPresentationProps } from "@/components/core/typography/types";
import { TITLE_VARIANT_PRESETS } from "@/components/core/typography/variants";

export type { TitleVariant };

export type ArceusTitleProps = Omit<MantineCoreTitleProps, "order"> &
  TypographyPresentationProps & {
    variant?: TitleVariant;
    children?: React.ReactNode;
  };

export type TitleProps = ArceusTitleProps;

const Title = forwardRef<HTMLHeadingElement, ArceusTitleProps>(function Title(
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
  },
  ref,
) {
  const resolved = resolveArceusTypography(TITLE_VARIANT_PRESETS, variant, {
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

  return <MantineTitle ref={ref} {...resolved} />;
});

export default Title;
export { Title };
