import React, { forwardRef } from "react";
import type { ContainerProps as MantineContainerProps, ElementProps } from "@mantine/core";
import { Container as MantineContainer } from "@mantine/core";

export type ContainerProps = React.PropsWithChildren<
  MantineContainerProps &
    ElementProps<"div", keyof MantineContainerProps> & {
      fluid?: boolean;
    }
>;

const Container = forwardRef<HTMLDivElement, ContainerProps>((props, ref) => {
  const { children, ...rest } = props;

  return (
    <MantineContainer ref={ref} {...rest}>
      {children}
    </MantineContainer>
  );
});

Container.displayName = "Container";

export default Container;
export { Container };
