import type { ReactNode } from "react";
import type { FunnelProps } from "recharts";
import type {
  BaseChartProps,
  ChartComponentProps,
  ChartDataset,
  ChartDataKey,
} from "@/components/charts/shared/types";

export interface FunnelDataset extends ChartDataset {
  funnelProps?: Partial<FunnelProps>;
}

// Configuration groups to reduce prop drilling
export type FunnelStyleConfig = Pick<
  FunnelProps,
  "isAnimationActive" | "animationBegin" | "animationDuration"
>;

export interface FunnelChartProps<T extends Record<string, unknown> = Record<string, unknown>>
  extends BaseChartProps<T>, ChartComponentProps {
  // Data
  dataKey?: ChartDataKey<T>;
  nameKey?: ChartDataKey<T>;
  categories?: FunnelDataset[];
  children?: ReactNode;

  // Funnel styling (applied to all generated funnels)
  funnelStyle?: Partial<FunnelStyleConfig>;

  // Events
  onFunnelClick?: FunnelProps["onClick"];
}
