import { forwardRef } from "react";
import { InputBase as MantineInputBase } from "@mantine/core";
import type { InputBaseProps } from "@mantine/core";

import SIZE_DEFAULT from "@/theme/defaults/componentSize";

const InputBase = forwardRef<HTMLInputElement, InputBaseProps>(function InputBase(
  { size = SIZE_DEFAULT.size, radius = SIZE_DEFAULT.radius, ...props },
  ref,
) {
  return <MantineInputBase ref={ref} size={size} radius={radius} {...props} />;
});

InputBase.displayName = "InputBase";

export default InputBase;
export { InputBase };
export type { InputBaseProps } from "@mantine/core";
