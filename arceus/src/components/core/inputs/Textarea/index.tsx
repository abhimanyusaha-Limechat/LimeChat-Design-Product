import { Textarea as MantineTextarea } from "@mantine/core";
import { forwardRef } from "react";
import type { TextareaProps } from "@mantine/core";

import SIZE_DEFAULT from "@/theme/defaults/componentSize";

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { size = SIZE_DEFAULT.size, radius = SIZE_DEFAULT.radius, ...props },
  ref,
) {
  return <MantineTextarea ref={ref} size={size} radius={radius} {...props} />;
});

Textarea.displayName = "Textarea";

export default Textarea;
export { Textarea };
export type { TextareaProps } from "@mantine/core";
