import { NativeSelect as MantineNativeSelect } from "@mantine/core";
import { forwardRef } from "react";
import type { NativeSelectProps } from "@mantine/core";

import SIZE_DEFAULT from "@/theme/defaults/componentSize";

const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(function NativeSelect(
  { size = SIZE_DEFAULT.size, radius = SIZE_DEFAULT.radius, ...props },
  ref,
) {
  return <MantineNativeSelect ref={ref} size={size} radius={radius} {...props} />;
});

NativeSelect.displayName = "NativeSelect";

export default NativeSelect;
export { NativeSelect };
export type { NativeSelectProps } from "@mantine/core";
