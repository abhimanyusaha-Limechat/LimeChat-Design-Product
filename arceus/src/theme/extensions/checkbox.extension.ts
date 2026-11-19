import type { ReactNode } from "react";
import { Checkbox } from "@mantine/core";
import type { CheckboxVariant } from "@mantine/core";

import styles from "../../components/core/inputs/Checkbox/Checkbox.module.sass";
import SIZE_DEFAULT from "../defaults/componentSize";
import { bindActiveSizeVars, componentSizeVars } from "../tokens/sizes";
import CheckboxIcon from "./checkboxIcon";
type CheckboxStyleVars = Record<string, string>;

const checkboxSizeVars = componentSizeVars("Checkbox");

function hasCheckboxError(error?: ReactNode): boolean {
  return error != null && error !== false && error !== "";
}

// The --arceus-checkbox-* vars feed the state selectors in Checkbox.module.sass.
function getRootVars(variant: CheckboxVariant, error?: ReactNode): CheckboxStyleVars {
  const hasError = hasCheckboxError(error);
  return {
    "--checkbox-color": "var(--mantine-color-primary-6)",
    "--checkbox-icon-color":
      variant === "outline" ? "var(--mantine-color-primary-6)" : "var(--mantine-color-white)",
    "--arceus-checkbox-border-color": getInputBorderColor(variant, error),
    "--arceus-checkbox-checked-border-color": hasError
      ? "var(--mantine-color-error)"
      : "var(--mantine-color-primary-6)",
    "--arceus-checkbox-checked-bg":
      variant === "filled" && !hasError ? "var(--mantine-color-primary-6)" : "transparent",
  };
}

function getInputBorderColor(variant: CheckboxVariant, error?: ReactNode): string {
  if (hasCheckboxError(error)) return "var(--mantine-color-error)";
  if (variant === "outline") return "var(--mantine-color-primary-7)";
  return "var(--mantine-color-gray-3)";
}

export default Checkbox.extend({
  defaultProps: {
    radius: SIZE_DEFAULT.radius,
    icon: CheckboxIcon,
  },
  vars: (_theme, props) => {
    const sizeVars = checkboxSizeVars().root;

    return {
      root: {
        ...sizeVars,
        ...bindActiveSizeVars(sizeVars, ["--checkbox-icon-size"], props.size),
        ...getRootVars((props.variant ?? "filled") as CheckboxVariant, props.error),
      },
    };
  },
  classNames: {
    input: styles.input ?? "",
  },
  styles: {
    description: {
      color: "var(--mantine-color-dimmed)",
    },
    error: {
      color: "var(--mantine-color-error)",
    },
    icon: {
      width: "var(--checkbox-icon-size)",
      height: "var(--checkbox-icon-size)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
});
