
import type { ConfirmModalProps } from "@mantine/modals";
import { IconAlertTriangle, IconInfoCircle, IconTrash } from "@tabler/icons-react";

import Text from "@/components/core/Text";
import Title from "@/components/core/Title";
import type {
  ConfirmationAction,
  ConfirmationModalOptions,
  ConfirmationVariant,
} from "@/components/core/Modal/types";
import { Flex } from "@mantine/core";

const VARIANT_ICON_SIZE = 20;

const VARIANT_BUTTON_DEFAULTS: Record<
  ConfirmationVariant,
  Pick<ConfirmModalProps, "confirmProps" | "cancelProps">
> = {
  info: {
    confirmProps: { color: "primary" },
    cancelProps: { variant: "subtle", color: "primary" },
  },
  warning: {
    confirmProps: { color: "primary" },
    cancelProps: { variant: "subtle", color: "gray" },
  },
  delete: {
    confirmProps: { color: "red" },
    cancelProps: { variant: "subtle", color: "red" },
  },
};

const DEFAULT_LABELS = {
  delete: { confirm: "Delete", cancel: "Cancel" },
  cancel: "Cancel",
} as const;

const HIDDEN_BUTTON_PROPS = {
  style: { display: "none" },
  tabIndex: -1,
} as const;

function VariantIcon({ variant }: { variant: ConfirmationVariant }) {
  switch (variant) {
    case "info":
      return <IconInfoCircle size={VARIANT_ICON_SIZE} color="var(--mantine-color-info-6)" />;
    case "warning":
      return <IconAlertTriangle size={VARIANT_ICON_SIZE} color="var(--mantine-color-warning-6)" />;
    case "delete":
      return <IconTrash size={VARIANT_ICON_SIZE} color="var(--mantine-color-red-6)" />;
    default:
      return null;
  }
}

function buildConfirmTitle(variant: ConfirmationVariant, title: string) {
  return (
    <Flex gap="sm" wrap="nowrap" align="center" justify="flex-start">
      <VariantIcon variant={variant} />
      <Title variant="h4" tone="dark">
        {title}
      </Title>
    </Flex>
  );
}

function buildConfirmDescription(description: string = "") {
  return <Text variant="body-1" c="light">{description}</Text>;
}

function resolveActionLabel(
  action: ConfirmationAction | undefined,
  fallback?: string,
): string | undefined {
  if (action === undefined) return undefined;
  return action.label ?? fallback;
}

function buildConfirmModalProps(options: ConfirmationModalOptions) {
  const { variant, title, description, onConfirm, onCancel, centered, zIndex, withinPortal } =
    options;
  const variantDefaults = VARIANT_BUTTON_DEFAULTS[variant];

  const confirmLabel = resolveActionLabel(
    onConfirm,
    variant === "delete" ? DEFAULT_LABELS.delete.confirm : undefined,
  );

  const cancelLabel = resolveActionLabel(
    onCancel,
    onCancel !== undefined ? DEFAULT_LABELS.cancel : undefined,
  );

  const showConfirm = onConfirm !== undefined;
  const showCancel = onCancel !== undefined;

  return {
    yOffset: 24,
    ...(centered !== undefined ? { centered } : {}),
    ...(zIndex !== undefined ? { zIndex } : {}),
    ...(withinPortal !== undefined ? { withinPortal } : {}),
    title: buildConfirmTitle(variant, title),
    children: buildConfirmDescription(description),
    labels: {
      confirm: confirmLabel ?? "",
      cancel: cancelLabel ?? "",
    },
    ...(showConfirm
      ? {
          onConfirm: () => {
            onConfirm.action?.();
          },
        }
      : {}),
    ...(showCancel
      ? {
          onCancel: () => {
            onCancel.action?.();
          },
        }
      : {}),
    confirmProps: {
      ...variantDefaults.confirmProps,
      ...(showConfirm ? {} : HIDDEN_BUTTON_PROPS),
    },
    cancelProps: {
      ...variantDefaults.cancelProps,
      ...(showCancel ? {} : HIDDEN_BUTTON_PROPS),
    },
    groupProps: { gap: "sm" },
  };
}

export default buildConfirmModalProps;
