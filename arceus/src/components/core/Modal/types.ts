import type { ModalProps } from "@mantine/core";

import type { GroupProps } from "@/components/core/Group";
import type { ReactNode } from "react";

export type ArceusModalProps = Omit<ModalProps, "title"> & {
  title?: ReactNode;
  description?: string;
};

export type ModalFooterProps = Omit<GroupProps, "children" | "styles"> & {
  children: ReactNode;
};

export type ConfirmationVariant = "delete" | "warning" | "info";

export type ConfirmationAction = {
  label?: string;
  action?: () => void | Promise<void>;
};

export type ConfirmationModalOptions = {
  variant: ConfirmationVariant;
  title: string;
  description?: string;
  onConfirm?: ConfirmationAction;
  onCancel?: ConfirmationAction;
  centered?: boolean;
  zIndex?: number;
  withinPortal?: boolean;
  awaitConfirm?: boolean;
};

export type OpenConfirmationModal = (options: ConfirmationModalOptions) => string;
