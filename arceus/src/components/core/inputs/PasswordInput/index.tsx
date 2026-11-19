import { PasswordInput as MantinePasswordInput } from "@mantine/core";
import { forwardRef } from "react";
import type { PasswordInputProps } from "@mantine/core";

import SIZE_DEFAULT from "@/theme/defaults/componentSize";

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { size = SIZE_DEFAULT.size, radius = SIZE_DEFAULT.radius, ...props },
  ref,
) {
  return <MantinePasswordInput ref={ref} size={size} radius={radius} {...props} />;
});

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
export { PasswordInput };
export type { PasswordInputProps, PasswordInputStylesNames } from "@mantine/core";
