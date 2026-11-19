import "sonner/dist/styles.css";

import { useLayoutEffect, useRef, useState } from "react";
import type { MantineColor } from "@mantine/core";
import type { ToastT, ToasterProps as SonnerToasterProps } from "sonner";
import { Toaster as SonnerToaster, toast } from "sonner";
import cn from "classnames";
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
  IconX,
} from "@tabler/icons-react";
import ActionIcon from "@/components/core/ActionIcon";
import styles from "@/components/core/Toast/Toast.module.sass";

type ToastVisualType = "success" | "error" | "warning" | "info" | "loading" | "default";

const TOAST_CLOSE_COLORS: Record<ToastVisualType, MantineColor> = {
  success: "primary",
  error: "error",
  warning: "warning",
  info: "info",
  loading: "gray",
  default: "gray",
};

function resolveToastCloseColor(type: string | null | undefined): MantineColor {
  return TOAST_CLOSE_COLORS[type as ToastVisualType] ?? TOAST_CLOSE_COLORS.default;
}

function ToastCloseIcon() {
  const hostRef = useRef<HTMLSpanElement>(null);
  const [color, setColor] = useState<MantineColor>(TOAST_CLOSE_COLORS.default);

  useLayoutEffect(() => {
    const toastType = hostRef.current?.closest("[data-sonner-toast]")?.getAttribute("data-type");

    setColor(resolveToastCloseColor(toastType));
  }, []);

  return (
    <ActionIcon size="sm" variant="subtle" color={color} tabIndex={-1}>
      <IconX size={16} />
    </ActionIcon>
  );
}

export const DEFAULT_TOAST_DURATION = 3 * 1000; // 3 seconds

export type ToastOptions = Omit<ToastT, "id"> & {
  id?: number | string;
};

export const toastSuccess = (title: string, options: ToastOptions = {}) =>
  toast.success(title, options);

export const toastError = (title: string, options: ToastOptions = {}) =>
  toast.error(title, options);

export const toastInfo = (title: string, options: ToastOptions = {}) => toast.info(title, options);

export const toastWarn = (title: string, options: ToastOptions = {}) =>
  toast.warning(title, options);

export const toastLoading = (title: string, options: ToastOptions = {}) =>
  toast.loading(title, options);

export const toastDismiss = (id: number | string) => toast.dismiss(id);

export const toastDismissAll = () => toast.dismiss();

interface ToasterProps {
  classNames?: string;
  position?: ToastT["position"];
  expand?: SonnerToasterProps["expand"];
  gap?: SonnerToasterProps["gap"];
  visibleToasts?: SonnerToasterProps["visibleToasts"];
}

function Toaster({
  position = "bottom-right",
  classNames,
  expand = true,
  gap,
  visibleToasts,
}: ToasterProps) {
  const sonnerProps = {
    ...(gap !== undefined ? { gap } : {}),
    ...(visibleToasts !== undefined ? { visibleToasts } : {}),
  };

  return (
    <SonnerToaster
      closeButton
      expand={expand}
      position={position}
      offset={{ right: 0, bottom: 16 }}
      className={cn(classNames)}
      duration={DEFAULT_TOAST_DURATION}
      {...sonnerProps}
      icons={{
        close: <ToastCloseIcon />,
        info: <IconInfoCircle color="var(--mantine-color-info-6)" size={16} />,
        error: <IconAlertCircle color="var(--mantine-color-error-6)" size={16} />,
        success: <IconCircleCheck color="var(--mantine-color-primary-6)" size={16} />,
        warning: <IconAlertTriangle color="var(--mantine-color-warning-6)" size={16} />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          icon: cn(styles.icon),
          title: cn(styles.title),
          toast: cn(styles.toast),
          description: cn(styles.description),
          closeButton: cn(styles.closeButton),
          actionButton: cn(styles.actionButton),
          cancelButton: cn(styles.cancelButton),
        },
      }}
    />
  );
}

export default Toaster;
export { Toaster as ToastContainer, Toaster };
