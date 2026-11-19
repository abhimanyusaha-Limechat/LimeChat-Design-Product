import { NumberInput as MantineNumberInput } from "@mantine/core";
import { forwardRef } from "react";
import type { NumberInputProps } from "@mantine/core";

import SIZE_DEFAULT from "@/theme/defaults/componentSize";

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  { size = SIZE_DEFAULT.size, radius = SIZE_DEFAULT.radius, ...props },
  ref,
) {
  return <MantineNumberInput ref={ref} size={size} radius={radius} {...props} />;
});

NumberInput.displayName = "NumberInput";

export default NumberInput;
export { NumberInput };
export type { NumberInputProps, NumberInputStylesNames } from "@mantine/core";
