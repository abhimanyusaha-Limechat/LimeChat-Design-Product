import type { ReactNode } from "react";
import type { AreaProps } from "recharts";
import type { CartesianLayout } from "recharts/types/util/types";
import type { CurveMouseEventHandler } from "recharts/types/shape/Curve";
import type {
  BaseChartProps,
  ChartComponentProps,
  ChartDataset,
  AreaChartLabelProps,
  ChartDataKey,
} from "@/components/charts/shared/types";

export type AreaClickHandler = CurveMouseEventHandler;

/** Recharts `AreaProps` omits generic defaults — pin them at the chart boundary. */
export type AreaElementProps = AreaProps<Record<string, unknown>, string | number>;

export interface AreaDataset extends ChartDataset {
  areaProps?: Partial<AreaElementProps>;
}

// Configuration groups to reduce prop drilling
export type AreaStyleConfig = Pick<
  AreaElementProps,
  "type" | "connectNulls" | "strokeWidth" | "fillOpacity" | "strokeDasharray" | "dot" | "activeDot"
>;

export interface AreaChartProps<T extends Record<string, unknown> = Record<string, unknown>>
  extends BaseChartProps<T>, ChartComponentProps, AreaChartLabelProps {
  // Data
  dataKey?: ChartDataKey<T>;
  categories?: AreaDataset[];
  children?: ReactNode;

  // Chart layout
  layout?: CartesianLayout;

  // Area styling (applied to all generated areas)
  areaStyle?: Partial<AreaStyleConfig>;

  // Events
  onAreaClick?: AreaClickHandler | undefined;
}
