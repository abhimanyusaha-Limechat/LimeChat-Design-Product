import type { ReactNode } from "react";
import { forwardRef } from "react";
import { Modal as MantineModal } from "@mantine/core";

import ModalFooter from "@/components/core/Modal/components/ModalFooter";
import ModalHeader from "@/components/core/Modal/components/ModalHeader";
import Stack from "@/components/core/Stack";
import Text from "@/components/core/Text";
import type { ArceusModalProps } from "@/components/core/Modal/types";

export { ModalsProvider } from "@mantine/modals";
export type { ModalProps } from "@mantine/core";
export type { ModalsProviderProps } from "@mantine/modals";

export { default as useConfirmationModal } from "@/components/core/Modal/hooks/useConfirmationModal";

export type {
  ArceusModalProps,
  ConfirmationAction,
  ConfirmationModalOptions,
  ConfirmationVariant,
  ModalFooterProps,
  OpenConfirmationModal,
} from "@/components/core/Modal/types";

function resolveHeaderTitle(title?: ReactNode, description?: string): ReactNode | undefined {
  const normalizedDescription = description ?? "";

  if ((title === undefined || title === null) && normalizedDescription === "") {
    return undefined;
  }

  if (typeof title === "string") {
    return <ModalHeader title={title} description={normalizedDescription} />;
  }

  if (title === undefined || title === null) {
    return <ModalHeader title="" description={normalizedDescription} />;
  }

  if (normalizedDescription === "") {
    return title;
  }

  return (
    <Stack gap="xs">
      {title}
      <Text variant="body-2" tone="light">
        {normalizedDescription}
      </Text>
    </Stack>
  );
}

const ModalRoot = forwardRef<HTMLDivElement, ArceusModalProps>(function Modal(
  { radius = "xs", title, description, children, scrollAreaComponent, ...props },
  ref,
) {
  return (
    <MantineModal
      ref={ref}
      radius={radius}
      closeButtonProps={{ size: "sm", "aria-label": "Close" }}
      title={resolveHeaderTitle(title, description)}
      {...(scrollAreaComponent === undefined ? {} : { scrollAreaComponent })}
      {...props}
    >
      {children}
    </MantineModal>
  );
});

type ModalComponent = typeof ModalRoot & { Footer: typeof ModalFooter };

const Modal = Object.assign(ModalRoot, { Footer: ModalFooter }) as ModalComponent;

export default Modal;
export { Modal };
