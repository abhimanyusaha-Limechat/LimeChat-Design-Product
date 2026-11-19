import {
  Children,
  forwardRef,
  isValidElement,
  useMemo,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { useUncontrolled } from "@mantine/hooks";
import { IconAlertCircle, IconAlertTriangle, IconInfoCircle, IconX } from "@tabler/icons-react";
import type { MantineColor } from "@mantine/core";

import ActionIcon from "@/components/core/ActionIcon";
import Alert from "@/components/core/Alert";
import Button from "@/components/core/Button";
import Flex from "@/components/core/Flex";
import Group from "@/components/core/Group";
import Text from "@/components/core/Text";
import UnstyledButton from "@/components/core/UnstyledButton";
import type { TextTone } from "@/components/core/typography/types";

export type BannerState = "default" | "warning" | "error";
export type BannerSize = "xs" | "sm";

export type BannerCta = {
  label: string;
  onClick?: () => void;
  leftSection?: ReactNode;
  rightSection?: ReactNode;
};

export type BannerIndicators = {
  visible?: boolean;
  active?: number;
  defaultActive?: number;
  onChange?: (index: number) => void;
};

export type BannerItemProps = {
  children: ReactNode;
  state?: BannerState;
  icon?: ReactNode | null;
  cta?: BannerCta;
};

export type BannerProps = {
  children: ReactNode;
  state?: BannerState;
  size?: BannerSize;
  icon?: ReactNode | null;
  cta?: BannerCta;
  onClose?: () => void;
  indicators?: BannerIndicators;
  className?: string;
  style?: CSSProperties;
};

const STATE_ALERT_COLOR: Record<BannerState, MantineColor> = {
  default: "primary",
  warning: "yellow",
  error: "red",
};

const STATE_CTA = {
  default: { variant: "outline" as const, color: "primary" },
  warning: { variant: "outline" as const, color: "yellow" },
  error: { variant: "filled" as const, color: "red" },
};

const ICON_SIZE = 16;

function DefaultStateIcon({ state }: { state: BannerState }) {
  if (state === "warning") {
    return <IconAlertTriangle size={ICON_SIZE} color="var(--mantine-color-yellow-6)" />;
  }

  if (state === "error") {
    return <IconAlertCircle size={ICON_SIZE} color="var(--mantine-color-red-6)" />;
  }

  return <IconInfoCircle size={ICON_SIZE} color="var(--mantine-color-primary-6)" />;
}

function BannerItem(_props: BannerItemProps) {
  return null;
}

BannerItem.displayName = "Banner.Item";

function isBannerItemElement(child: ReactNode): child is ReactElement<BannerItemProps> {
  return isValidElement(child) && child.type === BannerItem;
}

function resolveItems(children: ReactNode, fallback: BannerItemProps): BannerItemProps[] {
  const nodes = Children.toArray(children);
  const items = nodes.filter(isBannerItemElement).map((child) => child.props);

  if (items.length > 0) {
    return items;
  }

  return [fallback];
}

function resolveIcon(icon: ReactNode | null | undefined, state: BannerState) {
  if (icon === null) {
    return null;
  }

  if (icon !== undefined) {
    return icon;
  }

  return <DefaultStateIcon state={state} />;
}

function messageTextProps(state: BannerState): { tone: TextTone } | { c: "dimmed" } {
  if (state === "warning") {
    return { tone: "yellow" };
  }

  if (state === "error") {
    return { tone: "red" };
  }

  return { c: "dimmed" };
}

const Banner = forwardRef<HTMLDivElement, BannerProps>(function Banner(
  { children, state = "default", size = "xs", icon, cta, onClose, indicators, className, style },
  ref,
) {
  const items = useMemo(() => {
    const fallback: BannerItemProps = { children };

    fallback.state = state;
    if (icon !== undefined) {
      fallback.icon = icon;
    }
    if (cta !== undefined) {
      fallback.cta = cta;
    }

    return resolveItems(children, fallback);
  }, [children, state, icon, cta]);

  const uncontrolledOptions: {
    defaultValue: number;
    finalValue: number;
    value?: number;
    onChange?: (index: number) => void;
  } = {
    defaultValue: indicators?.defaultActive ?? 0,
    finalValue: 0,
  };

  if (indicators?.active !== undefined) {
    uncontrolledOptions.value = indicators.active;
  }
  if (indicators?.onChange !== undefined) {
    uncontrolledOptions.onChange = indicators.onChange;
  }

  const [active, setActive] = useUncontrolled(uncontrolledOptions);

  const safeIndex = Math.min(Math.max(active, 0), Math.max(items.length - 1, 0));
  const current = items[safeIndex] ?? items[0];
  const currentState = current?.state ?? "default";
  const showIndicators = indicators?.visible ?? items.length > 1;

  return (
    <Alert
      ref={ref}
      variant="light"
      color={STATE_ALERT_COLOR[currentState]}
      radius="2xs"
      px="sm"
      py={size === "sm" ? "sm" : "xs"}
      {...(className !== undefined ? { className } : {})}
      {...(style !== undefined ? { style } : {})}
      styles={{
        root: { overflow: "visible" },
        wrapper: { alignItems: "center" },
        body: { flex: 1, minWidth: 0, overflow: "visible" },
        message: { overflow: "visible" },
      }}
    >
      <Flex align="center" gap="xs" wrap="nowrap" w="100%">
        {showIndicators ? (
          <Group gap="2xs" wrap="nowrap" style={{ flexShrink: 0 }}>
            {items.map((_, index) => {
              const isActive = index === safeIndex;
              const dotProps = isActive ? { "aria-current": "true" as const } : {};

              return (
                <UnstyledButton
                  key={index}
                  type="button"
                  w={6}
                  h={6}
                  bg={isActive ? "gray.6" : "gray.2"}
                  aria-label={`Show message ${index + 1} of ${items.length}`}
                  onClick={() => setActive(index)}
                  style={{ borderRadius: "50%" }}
                  {...dotProps}
                />
              );
            })}
          </Group>
        ) : null}

        <Group
          justify="center"
          align="center"
          gap="xs"
          wrap="wrap"
          style={{ flex: 1, minWidth: 0 }}
        >
          {resolveIcon(current?.icon, currentState)}
          <Text
            variant="body-2"
            {...messageTextProps(currentState)}
            style={{ flex: "0 1 auto", minWidth: 0 }}
          >
            {current?.children}
          </Text>
          {current?.cta ? (
            <Button
              size="xs"
              label={current.cta.label}
              variant={STATE_CTA[currentState].variant}
              color={STATE_CTA[currentState].color}
              {...(current.cta.leftSection !== undefined
                ? { leftSection: current.cta.leftSection }
                : {})}
              {...(current.cta.rightSection !== undefined
                ? { rightSection: current.cta.rightSection }
                : {})}
              {...(current.cta.onClick !== undefined ? { onClick: current.cta.onClick } : {})}
              style={{ flexShrink: 0 }}
            />
          ) : null}
        </Group>

        {typeof onClose === "function" ? (
          <ActionIcon
            size="xs"
            variant="transparent"
            color="gray"
            aria-label="Close"
            onClick={onClose}
            style={{ flexShrink: 0 }}
          >
            <IconX size={ICON_SIZE} />
          </ActionIcon>
        ) : null}
      </Flex>
    </Alert>
  );
});

Banner.displayName = "Banner";

const BannerWithItem = Banner as typeof Banner & { Item: typeof BannerItem };
BannerWithItem.Item = BannerItem;

export default BannerWithItem;
export { BannerWithItem as Banner, BannerItem };
