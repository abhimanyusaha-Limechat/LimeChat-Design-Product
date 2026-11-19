import { Button as MantineButton } from "@mantine/core";
import { forwardRef } from "react";
import type {
  ButtonProps as MantineButtonProps,
  ButtonVariant,
  ButtonStylesNames,
  ElementProps,
} from "@mantine/core";

import SIZE_DEFAULT from "@/theme/defaults/componentSize";

export interface ButtonProps
  extends MantineButtonProps, ElementProps<"button", keyof MantineButtonProps> {
  label?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { label, children, size = SIZE_DEFAULT.size, radius = SIZE_DEFAULT.radius, ...props },
  ref,
) {
  return (
    <MantineButton ref={ref} size={size} radius={radius} {...props}>
      {label ?? children}
    </MantineButton>
  );
});

Button.displayName = "Button";

type ButtonComponent = typeof Button & {
  Group: typeof MantineButton.Group;
};

const ButtonWithGroup = Button as ButtonComponent;
ButtonWithGroup.Group = MantineButton.Group;

export default ButtonWithGroup;
export { ButtonWithGroup as Button, ButtonWithGroup };
export const ButtonGroup = MantineButton.Group;
export type { ButtonVariant, ButtonStylesNames };
