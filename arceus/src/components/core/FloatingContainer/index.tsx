import React, { useRef } from "react";
import type { ControlPosition, PositionOffsetControlPosition } from "react-draggable";
import Draggable from "react-draggable";
import type { CardProps } from "@mantine/core";
import cn from "classnames";
import { Box } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import ActionIcon from "@/components/core/ActionIcon";
import Card from "@/components/core/Card";
import type { SpacingKeys } from "@/theme/layout/spacing";
import styles from "@/components/core/FloatingContainer/FloatingContainer.module.sass";

export type FloatingContainerAnchor = Readonly<{
  top?: SpacingKeys;
  right?: SpacingKeys;
  bottom?: SpacingKeys;
  left?: SpacingKeys;
}>;

const ANCHOR_SIDES = ["top", "right", "bottom", "left"] as const;

function resolveAnchor(anchor: FloatingContainerAnchor): React.CSSProperties {
  return Object.fromEntries(
    ANCHOR_SIDES.flatMap((side) => {
      const offset = anchor[side];
      return offset === undefined ? [] : [[side, `var(--mantine-spacing-${offset})`]];
    }),
  );
}

const HEADER_HANDLE_CLASS = "floating-container-header-handle";

type FloatingContainerProps = Omit<CardProps, "children" | "className" | "style"> & {
  opened: boolean;
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
  withCloseButton?: boolean;
  onClose?: () => void;
  position?: ControlPosition;
  positionOffset?: PositionOffsetControlPosition;
  anchor?: FloatingContainerAnchor;
  header?: React.ReactNode;
  zIndex?: number;
};

function FloatingContainer({
  opened,
  style,
  className,
  children,
  withCloseButton,
  position,
  positionOffset,
  onClose,
  anchor,
  header,
  zIndex,
  ...props
}: FloatingContainerProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <Draggable
      nodeRef={ref}
      bounds={anchor === undefined ? "parent" : "body"}
      cancel=".nodrag"
      position={position}
      positionOffset={positionOffset}
      {...(header !== undefined ? { handle: `.${HEADER_HANDLE_CLASS}` } : {})}
    >
      <Box
        ref={ref}
        className={cn(className)}
        style={{
          ...style,
          position: anchor === undefined ? "absolute" : "fixed",
          ...(anchor === undefined ? {} : resolveAnchor(anchor)),
          ...(zIndex !== undefined ? { zIndex } : {}),
          display: opened ? "block" : "none",
        }}
      >
        <Card {...props} className={cn(styles["draggable-container"])}>
          {header === undefined ? (
            <Box className={cn(styles["draggable-container--handle"])}>
              <span className={cn(styles["handle-bar"])} />
            </Box>
          ) : (
            <Box className={cn(styles["draggable-container--header"], HEADER_HANDLE_CLASS)}>
              {header}
            </Box>
          )}
          <Box className={cn(styles["draggable-container--body"], "nodrag")}>{children}</Box>
        </Card>
        {Boolean(withCloseButton) && onClose && (
          <ActionIcon
            color="red"
            size="lg"
            radius="xl"
            variant="light"
            className={cn(styles["draggable-container--close-button"])}
            onClick={() => onClose()}
          >
            <IconX size={20} />
          </ActionIcon>
        )}
      </Box>
    </Draggable>
  );
}

export default FloatingContainer;
export { FloatingContainer };
