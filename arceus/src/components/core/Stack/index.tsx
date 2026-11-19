import { forwardRef } from "react";
import type { StackProps } from "@mantine/core";
import { Stack as MantineStack } from "@mantine/core";

const Stack = forwardRef<HTMLDivElement, StackProps>(({ children, ...props }, ref) => (
  <MantineStack {...props} ref={ref}>
    {children}
  </MantineStack>
));

Stack.displayName = "Stack";

export default Stack;
export { Stack };
export type { StackProps };
