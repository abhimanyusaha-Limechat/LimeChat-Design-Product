import React, { forwardRef } from "react";
import type { BoxProps } from "@mantine/core";
import { Box } from "@mantine/core";

export type IframeProps = BoxProps & {
  title: string;
  src?: string;
  allow?: string;
  id?: string;
  onLoad?: React.ReactEventHandler<HTMLIFrameElement>;
};

const Iframe = forwardRef<HTMLIFrameElement, IframeProps>(function Iframe(
  { title, src, allow, id, onLoad, ...boxProps },
  ref,
) {
  return (
    <Box
      component="iframe"
      ref={ref}
      title={title}
      src={src}
      allow={allow}
      id={id}
      onLoad={onLoad}
      bd="none"
      {...boxProps}
    />
  );
});

export default Iframe;
export { Iframe };
