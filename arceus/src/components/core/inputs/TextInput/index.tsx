import { TextInput as MantineTextInput } from "@mantine/core";
import { forwardRef } from "react";
import type { TextInputProps } from "@mantine/core";

import SIZE_DEFAULT from "@/theme/defaults/componentSize";

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { size = SIZE_DEFAULT.size, radius = SIZE_DEFAULT.radius, ...props },
  ref,
) {
  return <MantineTextInput ref={ref} size={size} radius={radius} {...props} />;
});

TextInput.displayName = "TextInput";

export default TextInput;
export { TextInput };
export type { TextInputProps } from "@mantine/core";
