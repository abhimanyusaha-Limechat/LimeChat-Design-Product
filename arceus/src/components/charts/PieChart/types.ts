import type { ReactNode } from "react";
import type { PieProps } from "recharts";
import type {
  BaseChartProps,
  ChartComponentProps,
  ChartDataset,
  PieChartLabelProps,
  ChartDataKey,
} from "@/components/charts/shared/types";

export interface PieDataset extends ChartDataset {
  pieProps?: Partial<PieProps>;
}

// Configuration groups to reduce prop drilling
export type PieStyleConfig = Pick<
  PieProps,
  "innerRadius" | "outerRadius" | "startAngle" | "endAngle" | "paddingAngle" | "cornerRadius"
>;

export interface PieChartProps<T extends Record<string, unknown> = Record<string, unknown>>
  extends BaseChartProps<T>, ChartComponentProps, PieChartLabelProps {
  // Data
  dataKey?: ChartDataKey<T>;
  nameKey?: ChartDataKey<T>;
  categories?: PieDataset[];
  children?: ReactNode;

  // Pie styling (applied to all generated pies)
  pieStyle?: Partial<PieStyleConfig>;

  // Events
  onPieClick?: PieProps["onClick"];
}
