import { forwardRef } from "react";
import { Switch as MantineSwitch } from "@mantine/core";
import type { SwitchProps as MantineSwitchProps } from "@mantine/core";

export type SwitchProps = Omit<MantineSwitchProps, "withThumbIndicator">;

const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(props, ref) {
  return <MantineSwitch ref={ref} {...props} withThumbIndicator={false} />;
});

Switch.displayName = "Switch";

export default Switch;
export { Switch };
