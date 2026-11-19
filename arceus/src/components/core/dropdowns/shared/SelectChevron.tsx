import { IconChevronDown } from "@tabler/icons-react";
import type { MantineSize } from "@mantine/core";

import styles from "@/components/core/dropdowns/shared/Dropdown.module.sass";

const CHEVRON_SIZES = {
  xs: 14,
  sm: 18,
  md: 20,
  lg: 24,
  xl: 28,
} as const satisfies Record<string, number>;

const DEFAULT_CHEVRON_SIZE = CHEVRON_SIZES.sm;

type SelectChevronProps = {
  size?: MantineSize | (string & {});
};

function SelectChevron({ size = "sm" }: SelectChevronProps) {
  const iconSize =
    size in CHEVRON_SIZES
      ? CHEVRON_SIZES[size as keyof typeof CHEVRON_SIZES]
      : DEFAULT_CHEVRON_SIZE;

  return <IconChevronDown size={iconSize} stroke={1.5} className={styles.chevron} />;
}

export default SelectChevron;
