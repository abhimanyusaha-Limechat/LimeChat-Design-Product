import { SIZES } from "./sizing";

/** Wire custom unsuffixed CSS vars to the active size suffix, e.g. `--input-lh` → `var(--input-lh-sm)`. */
export default function bindActiveSizeVars(
  vars: Record<string, string>,
  prefixes: string[],
  size: string | undefined,
): Record<string, string> {
  const activeSize = SIZES.includes(size as (typeof SIZES)[number]) ? size : "sm";
  const resolved = { ...vars };

  for (const prefix of prefixes) {
    resolved[prefix] = `var(${prefix}-${activeSize})`;
  }

  return resolved;
}
