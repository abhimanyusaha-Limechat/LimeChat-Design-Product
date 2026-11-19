import React, { forwardRef } from "react";
import { CodeHighlight as MantineCodeHighlight } from "@mantine/code-highlight";
import type { CodeHighlightProps } from "@mantine/code-highlight";

type PrismProps = CodeHighlightProps & {
  scrollAreaComponent?: React.ElementType;
  copyLabel?: string;
  copiedLabel?: string;
};

const Prism = forwardRef<HTMLDivElement, PrismProps>(
  (
    {
      scrollAreaComponent: _scrollAreaComponent,
      copyLabel = "Copy",
      copiedLabel = "Copied",
      ...props
    },
    ref,
  ) => (
    <MantineCodeHighlight ref={ref} copyLabel={copyLabel} copiedLabel={copiedLabel} {...props} />
  ),
);

Prism.displayName = "Prism";

export default Prism;
export { Prism };
