import { Box, MultiSelect as MantineMultiSelect } from "@mantine/core";
import type { MultiSelectProps } from "@mantine/core";

import SIZE_DEFAULT from "@/theme/defaults/componentSize";
import SelectChevron from "@/components/core/dropdowns/shared/SelectChevron";

export function MultiSelect({
  size = SIZE_DEFAULT.size,
  radius = SIZE_DEFAULT.radius,
  rightSection,
  rightSectionPointerEvents = "none",
  placeholder,
  ...props
}: MultiSelectProps) {
  // Selected items render as pills while the search input stays empty, so Mantine keeps
  // painting the field's native placeholder next to them. Drop it once a value is picked
  // to mirror single Select behaviour.
  const hasValue = (props.value ?? props.defaultValue ?? []).length > 0;

  return (
    <MantineMultiSelect
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
      {...(!hasValue && placeholder !== undefined ? { placeholder } : {})}
      {...props}
    />
  );
}

export type { MultiSelectProps };

export default MultiSelect;
