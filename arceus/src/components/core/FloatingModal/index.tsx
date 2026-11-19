import React, { useRef } from "react";
import Draggable from "react-draggable";
import cn from "classnames";
import type { ModalProps, ModalStylesNames } from "@mantine/core";
import { Modal as MantineModal } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import ActionIcon from "@/components/core/ActionIcon";
import Container from "@/components/core/Container";
import Paper from "@/components/core/Paper";
import styles from "@/components/core/FloatingModal/FloatingModal.module.sass";

type FloatingModalClassNames = Partial<Record<ModalStylesNames, string>> & {
  draggableContainer?: string;
  draggableContainerHandle?: string;
  draggableContainerHandleBar?: string;
};

type FloatingModalStyles = ModalProps["styles"] & {
  draggableContainer?: React.CSSProperties;
  draggableContainerHandle?: React.CSSProperties;
  draggableContainerHandleBar?: React.CSSProperties;
};

export type FloatingModalProps = Omit<ModalProps, "classNames" | "styles"> & {
  showHandle?: boolean;
  children: React.ReactNode;
  overlayOpacity?: number;
  classNames?: FloatingModalClassNames;
  styles?: FloatingModalStyles;
};

function FloatingModal({
  children,
  showHandle = true,
  overlayOpacity = 0,
  centered = true,
  classNames,
  styles: modalStyles,
  overlayProps,
  withCloseButton,
  onClose,
  radius,
  ...props
}: FloatingModalProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const {
    draggableContainer,
    draggableContainerHandle,
    draggableContainerHandleBar,
    ...mantineClassNames
  } = classNames ?? {};
  const {
    draggableContainer: draggableContainerStyle,
    draggableContainerHandle: draggableContainerHandleStyle,
    draggableContainerHandleBar: draggableContainerHandleBarStyle,
    ...mantineStyles
  } = modalStyles ?? {};

  return (
    <MantineModal
      overlayProps={{ opacity: overlayOpacity, ...overlayProps }}
      centered={centered}
      classNames={{
        ...mantineClassNames,
        body: cn(styles["floating-modal-body"]),
        content: cn(styles["floating-modal"]),
      }}
      styles={mantineStyles}
      {...props}
      withCloseButton={false}
      onClose={onClose}
    >
      <Draggable nodeRef={nodeRef} cancel=".nodrag">
        <Paper
          ref={nodeRef}
          radius={radius ?? "xs"}
          className={cn(styles["draggable-container"], draggableContainer)}
          style={draggableContainerStyle}
        >
          {Boolean(withCloseButton) && (
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
          {showHandle && (
            <Container
              className={cn(styles["draggable-container--handle"], draggableContainerHandle)}
              style={draggableContainerHandleStyle}
            >
              <span
                className={cn(styles["handle-bar"], draggableContainerHandleBar)}
                style={draggableContainerHandleBarStyle}
              />
            </Container>
          )}
          {children}
        </Paper>
      </Draggable>
    </MantineModal>
  );
}

export default FloatingModal;
export { FloatingModal };
