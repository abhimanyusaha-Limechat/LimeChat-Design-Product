import type { CSSProperties } from "react";
import { Modal } from "@mantine/core";
import type { ModalProps, ModalStylesNames } from "@mantine/core";
import cn from "classnames";

import styles from "@/components/core/Modal/Modal.module.sass";

const PADDING_SM = "var(--mantine-spacing-xl)" as const;
const PADDING_DEFAULT = "var(--mantine-spacing-xl) var(--mantine-spacing-2xl)" as const;
const HEADER_BODY_GAP = "var(--mantine-spacing-xs)" as const;

function isSmallModal(size: ModalProps["size"]): boolean {
  return size === "sm";
}

function getModalPadding(size: ModalProps["size"]): string {
  return isSmallModal(size) ? PADDING_SM : PADDING_DEFAULT;
}

function getModalStyles(
  size?: ModalProps["size"],
): Partial<Record<ModalStylesNames, CSSProperties>> {
  const padding = getModalPadding(size);

  return {
    header: {
      padding,
      paddingBottom: HEADER_BODY_GAP,
      alignItems: "flex-start",
    },
    close: {
      flexShrink: 0,
    },
    body: {
      padding,
      paddingTop: 0,
    },
  };
}

type ModalClassNames = ModalProps["classNames"];

function resolveClassNames(
  classNames?: ModalClassNames,
): Partial<Record<ModalStylesNames, string>> {
  if (classNames == null || typeof classNames === "function") return {};
  return classNames;
}

function getModalClassNames(
  _size?: ModalProps["size"],
  classNames?: ModalClassNames,
): Partial<Record<ModalStylesNames, string>> {
  const resolved = resolveClassNames(classNames);

  return {
    ...resolved,
    title: cn(styles.title, styles.titleDark, resolved.title) ?? cn(styles.title, styles.titleDark),
  };
}

export default Modal.extend({
  defaultProps: {
    radius: "xs",
    shadow: "xl",
  },
  classNames: (_theme, props) => getModalClassNames(props.size, props.classNames) ?? {},
  styles: (_theme, props) => getModalStyles(props.size),
});
