import type {
  ActionIconProps as MantineActionIconProps,
  ActionIconVariant,
  MantineSize,
} from "@mantine/core";
import { ActionIcon as MantineActionIcon } from "@mantine/core";
import React, { type ButtonHTMLAttributes } from "react";

import SIZE_DEFAULT from "@/theme/defaults/componentSize";

export type ActionIconSize = MantineSize;

export interface ActionIconProps
  extends
    Omit<MantineActionIconProps, "size">,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof MantineActionIconProps | "size"> {
  size?: ActionIconSize | number;
}

const ActionIcon = React.forwardRef<HTMLButtonElement, ActionIconProps>(function ActionIcon(
  { size = "md", radius = SIZE_DEFAULT.radius, ...props }: ActionIconProps,
  ref,
) {
  return <MantineActionIcon size={size} radius={radius} {...props} ref={ref} />;
});

ActionIcon.displayName = "ActionIcon";

export default ActionIcon;
export { ActionIcon };
export type { ActionIconVariant };
