import cn from "classnames";
import type { TextInputProps } from "@mantine/core";

import styles from "@/components/core/SearchBox/SearchBox.module.sass";

type SearchBoxClassNames = TextInputProps["classNames"];

function resolveClassNames(classNames?: SearchBoxClassNames): Partial<Record<"input", string>> {
  if (classNames == null || typeof classNames === "function") return {};
  return classNames;
}

export function getSearchBoxClassNames(
  variant?: TextInputProps["variant"],
  classNames?: SearchBoxClassNames,
): Partial<Record<"input", string>> {
  const resolved = resolveClassNames(classNames);

  if (variant === "subtle") {
    return {
      ...resolved,
      input: cn(styles.input, resolved.input),
    };
  }

  if (variant === "unstyled") {
    return {
      ...resolved,
      input: cn(styles.inputUnstyled, resolved.input),
    };
  }

  return resolved;
}

export default getSearchBoxClassNames;
