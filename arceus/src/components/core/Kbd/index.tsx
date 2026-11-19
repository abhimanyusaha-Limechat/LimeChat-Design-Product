import { Kbd as MantineKbd } from "@mantine/core";
import type { KbdProps } from "@mantine/core";
import { forwardRef } from "react";

export const Kbd = forwardRef<HTMLDivElement, KbdProps>((props, ref) => {
  return <MantineKbd ref={ref} bdrs="2xs" {...props} />;
});

Kbd.displayName = "Kbd";

export default Kbd;
export type { KbdProps };
