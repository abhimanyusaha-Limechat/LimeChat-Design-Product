import type { ReactNode } from "react";
import type { MantineTheme } from "@mantine/core";

function hasInputError(error?: ReactNode): boolean {
  return error != null && error !== false && error !== "";
}

function getSectionColor(error?: ReactNode): string {
  return hasInputError(error) ? "var(--mantine-color-error)" : "var(--mantine-color-gray-5)";
}

export default function getInputStyles(
  _theme: MantineTheme,
  props: { variant?: string; error?: ReactNode; size?: string },
) {
  return {
    input: {
      fontWeight: 400,
      lineHeight: "var(--input-lh)",
    },
    section: {
      color: getSectionColor(props.error),
    },
  };
}
