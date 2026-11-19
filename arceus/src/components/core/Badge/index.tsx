import { Badge as MantineBadge } from "@mantine/core";
import type { BadgeProps as MantineBadgeProps, ElementProps } from "@mantine/core";
import { forwardRef } from "react";

export type BadgeShape = "default" | "chip";

export type BadgeProps = Omit<MantineBadgeProps, "radius"> &
  ElementProps<"div", keyof MantineBadgeProps | "radius"> & {
    shape?: BadgeShape;
  };

const SHAPE_RADIUS = {
  chip: "sm",
  default: "2xs",
} as const satisfies Record<BadgeShape, NonNullable<MantineBadgeProps["radius"]>>;

const Badge = forwardRef<HTMLDivElement, BadgeProps>(function Badge(
  { shape = "default", ...props },
  ref,
) {
  return <MantineBadge tt="none" {...props} ref={ref} radius={SHAPE_RADIUS[shape]} />;
});

Badge.displayName = "Badge";

export default Badge;
export { Badge };
