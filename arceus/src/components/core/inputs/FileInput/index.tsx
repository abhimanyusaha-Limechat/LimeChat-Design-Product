import { FileInput as MantineFileInput } from "@mantine/core";
import { forwardRef } from "react";
import type { FileInputProps } from "@mantine/core";

import SIZE_DEFAULT from "@/theme/defaults/componentSize";

const FileInput = forwardRef<HTMLButtonElement, FileInputProps>(function FileInput(
  { size = SIZE_DEFAULT.size, radius = SIZE_DEFAULT.radius, ...props },
  ref,
) {
  return <MantineFileInput ref={ref} size={size} radius={radius} {...props} />;
});

FileInput.displayName = "FileInput";

export default FileInput;
export { FileInput };
export type { FileInputProps } from "@mantine/core";
