import { Box, Select as MantineSelect } from "@mantine/core";
import type { SelectProps as MantineSelectProps } from "@mantine/core";

import SIZE_DEFAULT from "@/theme/defaults/componentSize";
import SelectChevron from "@/components/core/dropdowns/shared/SelectChevron";

export type SelectProps = MantineSelectProps;

export function Select({
  data = [],
  size = SIZE_DEFAULT.size,
  radius = SIZE_DEFAULT.radius,
  rightSection,
  rightSectionPointerEvents = "none",
  ...props
}: SelectProps) {
  return (
    <MantineSelect
      data={data}
      size={size}
      radius={radius}
      rightSection={
        rightSection ?? (
          <Box component="span" bg="var(--input-bg)">
            <SelectChevron size={size} />
          </Box>
        )
      }
      rightSectionPointerEvents={rightSectionPointerEvents}
      {...props}
    />
  );
}

export default Select;
export type { ComboboxItem as SelectItem } from "@mantine/core";
