import type { ReactNode } from "react";
import type { InputVariant, MantineTheme } from "@mantine/core";

import { bindActiveSizeVars, componentSizeVars, getInputSectionWidthPx } from "../../tokens/sizes";

type InputWrapperStyles = Record<string, string>;

const INPUT_ACTIVE_SIZE_VARS = [
  "--input-padding",
  "--input-padding-x",
  "--input-lh",
  "--input-section-icon-size",
] as const;

const inputSizeVars = componentSizeVars("Input", "wrapper");

function getVariantStyles(variant: InputVariant, hasError: boolean): InputWrapperStyles {
  switch (variant) {
    case "filled":
      return {
        "--input-bd": "transparent",
        "--input-bg": "var(--mantine-color-primary-0)",
        "--input-bd-focus": hasError
          ? "var(--mantine-color-error)"
          : "var(--mantine-color-primary-6)",
      };
    case "unstyled":
      return {
        "--input-bd": "transparent",
        "--input-bg": "transparent",
        "--input-bd-focus": "transparent",
      };
    default:
      return {
        "--input-bd": hasError ? "var(--mantine-color-error)" : "var(--mantine-color-gray-3)",
        "--input-bg": "var(--mantine-color-white)",
        "--input-bd-focus": hasError
          ? "var(--mantine-color-error)"
          : "var(--mantine-color-primary-6)",
      };
  }
}

function hasInputError(error?: ReactNode): boolean {
  return error != null && error !== false && error !== "";
}

function getSharedWrapperVars(
  variant: InputVariant,
  error: ReactNode | undefined,
  size: string | undefined,
): InputWrapperStyles {
  const hasError = hasInputError(error);
  const sectionWidth = `${getInputSectionWidthPx(size)}px`;

  return bindActiveSizeVars(
    {
      ...inputSizeVars().wrapper,
      ...getVariantStyles(variant, hasError),
      "--input-placeholder-color": "var(--mantine-color-placeholder)",
      "--input-disabled-bg": "var(--mantine-color-disabled)",
      "--input-disabled-color": "var(--mantine-color-disabled-color)",
      "--input-left-section-width": sectionWidth,
      "--input-right-section-width": sectionWidth,
    },
    [...INPUT_ACTIVE_SIZE_VARS],
    size,
  );
}

export default function getInputVars(
  _theme: MantineTheme,
  props: { variant?: string; error?: ReactNode; size?: string },
) {
  const variant = (props.variant ?? "default") as InputVariant;

  return {
    wrapper: getSharedWrapperVars(variant, props.error, props.size),
  };
}
