import type { ReactNode } from "react";
import type { LineProps } from "recharts";
import type { CartesianLayout } from "recharts/types/util/types";
import type {
  BaseChartProps,
  ChartComponentProps,
  ChartDataset,
  LineChartLabelProps,
  ChartDataKey,
} from "@/components/charts/shared/types";

export interface LineDataset extends ChartDataset {
  lineProps?: Partial<LineProps>;
}

export type LineStyleConfig = Pick<
  LineProps,
  "type" | "connectNulls" | "strokeWidth" | "strokeDasharray" | "dot" | "activeDot"
>;

export interface LineChartProps<T extends Record<string, unknown> = Record<string, unknown>>
  extends BaseChartProps<T>, ChartComponentProps, LineChartLabelProps {
  // Data
  dataKey?: ChartDataKey<T>;
  categories?: LineDataset[];
  children?: ReactNode;

  // Chart layout
  layout?: CartesianLayout;

  // Line styling (applied to all generated lines)
  lineStyle?: Partial<LineStyleConfig>;

  // Events
  onLineClick?: LineProps["onClick"];
}
