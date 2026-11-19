import type { ReactNode } from "react";
import type { BarProps } from "recharts";
import type { CartesianLayout } from "recharts/types/util/types";
import type {
  BaseChartProps,
  ChartComponentProps,
  ChartDataset,
  BarChartLabelProps,
  ChartDataKey,
} from "@/components/charts/shared/types";

export interface BarDataset extends ChartDataset {
  barProps?: Partial<BarProps>;
}

// Configuration groups to reduce prop drilling
export type BarStyleConfig = Pick<BarProps, "radius">;

export interface BarChartProps<T extends Record<string, unknown> = Record<string, unknown>>
  extends BaseChartProps<T>, ChartComponentProps, BarChartLabelProps {
  // Data
  dataKey?: ChartDataKey<T>;
  categories?: BarDataset[];
  children?: ReactNode;

  // Chart layout
  layout?: CartesianLayout;

  // Bar styling (applied to all generated bars)
  barStyle?: Partial<BarStyleConfig>;

  // Events
  onBarClick?: BarProps["onClick"];
}
