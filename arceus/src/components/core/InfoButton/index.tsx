import React, { forwardRef } from "react";
import type { TooltipProps, UnstyledButtonProps } from "@mantine/core";

import Tooltip from "@/components/core/Tooltip";
import UnstyledButton from "@/components/core/UnstyledButton";
import Icon from "@/components/core/Icon";
import type { IconName, IconSize } from "@/components/core/Icon/types";

export type InfoButtonProps = Omit<
  UnstyledButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  tooltip: React.ReactNode;
  tooltipProps?: Omit<TooltipProps, "children" | "label">;
  iconName?: IconName;
  iconSize?: IconSize;
  iconColor?: string;
  ariaLabel?: string;
};

const InfoButton = forwardRef<HTMLButtonElement, InfoButtonProps>(
  (
    {
      tooltip,
      tooltipProps,
      iconName = "info",
      iconSize = "average",
      iconColor = "var(--mantine-color-text)",
      ariaLabel = "Information",
      style,
      ...buttonProps
    },
    ref,
  ) => {
    const tooltipComponentProps = tooltipProps ?? {};

    return (
      <Tooltip label={tooltip} {...tooltipComponentProps}>
        <UnstyledButton
          {...buttonProps}
          ref={ref}
          aria-label={ariaLabel}
          type={buttonProps.type ?? "button"}
          style={{
            lineHeight: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            ...style,
          }}
        >
          <Icon name={iconName} size={iconSize} color={iconColor} />
        </UnstyledButton>
      </Tooltip>
    );
  },
);

InfoButton.displayName = "InfoButton";

export default InfoButton;
export { InfoButton };
