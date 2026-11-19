import React, { useEffect, useRef, useState } from "react";
import { createVarsResolver, factory, getRadius, useProps, useStyles } from "@mantine/core";
import type { Factory, MantineColor, PopoverProps, StylesApiProps } from "@mantine/core";

import Popover from "@/components/core/Popover";
import HINT_DEFAULT_PROPS from "@/components/core/Hint/defaults";
import classes from "@/components/core/Hint/Hint.module.sass";

export type HintStylesNames = "dropdown";
export type HintCssVariables = {
  dropdown: "--hint-bg" | "--hint-color" | "--hint-radius";
};

export type HintProps = StylesApiProps<HintFactory> &
  Omit<PopoverProps, "opened" | "children" | "onChange" | "defaultOpened" | "onClose"> & {
    hintKey: string | null;
    enabled?: boolean;
    duration?: number;
    openDelay?: number;
    label: React.ReactNode;
    children: React.ReactNode;
    color?: MantineColor;
  };

export type HintFactory = Factory<{
  props: HintProps;
  ref: HTMLDivElement;
  stylesNames: HintStylesNames;
  vars: HintCssVariables;
}>;

const varsResolver = createVarsResolver<HintFactory>((theme, { color, radius }) => {
  const colors = theme.variantColorResolver({
    theme,
    color: color ?? "dark",
    variant: "filled",
    autoContrast: true,
  });

  return {
    dropdown: {
      "--hint-bg": colors.background,
      "--hint-color": colors.color,
      "--hint-radius": radius === undefined ? undefined : getRadius(radius),
    },
  };
});

export const Hint = factory<HintFactory>((_props, _ref) => {
  const props = useProps("Hint", HINT_DEFAULT_PROPS, _props);
  const {
    classNames,
    styles,
    unstyled,
    vars,
    attributes,
    hintKey,
    enabled = HINT_DEFAULT_PROPS.enabled,
    duration = HINT_DEFAULT_PROPS.duration,
    openDelay = HINT_DEFAULT_PROPS.openDelay,
    label,
    children,
    color: _color,
    ...popoverProps
  } = props;

  const getStyles = useStyles<HintFactory>({
    name: "Hint",
    classes,
    props: props,
    varsResolver,
    ...(classNames !== undefined ? { classNames } : {}),
    ...(styles !== undefined ? { styles } : {}),
    ...(unstyled !== undefined ? { unstyled } : {}),
    ...(attributes !== undefined ? { attributes } : {}),
    ...(vars !== undefined ? { vars } : {}),
  });

  const [opened, setOpened] = useState(false);
  const dismissedKey = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || hintKey === null || dismissedKey.current === hintKey) {
      setOpened(false);
      return;
    }

    let dismissTimer: number | undefined;
    const openTimer = window.setTimeout(() => {
      setOpened(true);
      dismissTimer = window.setTimeout(() => {
        dismissedKey.current = hintKey;
        setOpened(false);
      }, duration);
    }, openDelay || 16);

    return () => {
      window.clearTimeout(openTimer);
      if (dismissTimer !== undefined) window.clearTimeout(dismissTimer);
    };
  }, [duration, enabled, hintKey, openDelay]);

  if (hintKey === null) {
    return <>{children}</>;
  }

  return (
    <Popover {...popoverProps} opened={opened}>
      <Popover.Target>{children}</Popover.Target>
      <Popover.Dropdown
        {...getStyles("dropdown", {
          style: {
            background: "var(--hint-bg)",
            color: "var(--hint-color)",
            borderColor: "var(--hint-bg)",
          },
        })}
      >
        {label}
      </Popover.Dropdown>
    </Popover>
  );
});

Hint.displayName = "Hint";
Hint.classes = classes;

export default Hint;
