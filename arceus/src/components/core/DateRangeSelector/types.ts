import type { CSSProperties } from "react";

export interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
  onChange: (dates: { startDate: string; endDate: string }) => void;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  maxRangeDays?: number;
  minWidth?: CSSProperties["minWidth"];
  maxWidth?: CSSProperties["maxWidth"];
  /**
   * Controls whether the calendar renders in a portal (default: Mantine's `true`).
   * Consumers rendered inside a scoped/embedded container (e.g. the analytics
   * single-spa parcel) can set this to `false` to keep the calendar in-scope.
   */
  withinPortal?: boolean;
  /**
   * Floating strategy for the calendar popover. Pair `floatingStrategy="fixed"`
   * with `withinPortal={false}` to position via viewport coordinates.
   */
  floatingStrategy?: "absolute" | "fixed";
  /**
   * Props passed to the Portal component when `withinPortal` is true.
   * Use `{ target: '.selector' }` to portal to a specific container
   * (e.g. `.analytics-app` for the analytics single-spa parcel).
   */
  portalProps?: { target?: string | HTMLElement };
}
