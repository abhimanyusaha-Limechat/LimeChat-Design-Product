import type { CSSProperties, ComponentProps, ComponentType, ReactNode } from "react";
import type {
  XAxisProps,
  YAxisProps,
  CartesianGridProps,
  LegendProps,
  ResponsiveContainerProps,
  LabelListProps,
  LabelProps,
  PieProps,
  AreaProps,
  BarProps,
  LineProps,
  Tooltip as RechartsTooltip,
} from "recharts";
import type { LabelPosition } from "recharts/types/component/Label";
import type { Margin, DataKey } from "recharts/types/util/types";

export type Percent = `${number}%`;

export type ChartTooltipProps = ComponentProps<typeof RechartsTooltip>;

// Re-export commonly used recharts types
export type {
  AreaProps,
  BarProps,
  LineProps,
  LabelProps,
  XAxisProps,
  YAxisProps,
  CartesianGridProps,
  LegendProps,
};

// Chart loader and zero state props interfaces
export interface ChartLoaderProps {
  height?: number | Percent;
  width?: number | Percent;
  className?: string;
  showAxes?: boolean;
  barCount?: number;
  animate?: boolean;
}

export interface ChartZeroStateProps {
  message?: string;
  height?: number | Percent;
  width?: number | Percent;
  className?: string;
  icon?: ReactNode;
  showIcon?: boolean;
}

export interface ChartDataset {
  key: string;
  name: string;
  color?: string;
  visible?: boolean;
}

export type ChartDataKey<T extends Record<string, unknown>> = Extract<DataKey<T>, string>;

export type ChartLabelListProps = LabelListProps;
export type ChartLabelListFormatter = NonNullable<ChartLabelListProps["formatter"]>;

export type ChartLabelFormatter = ChartLabelListFormatter | ((value: number | string) => ReactNode);

export const InteractiveLegendPositions = [
  "top",
  "bottom",
  "left",
  "right",
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
] as const;

export type InteractiveLegendPosition = (typeof InteractiveLegendPositions)[number];

// Chart-specific label positions based on chart geometry
// Using more comprehensive position types based on Recharts capabilities
type StringLabelPosition = Extract<LabelPosition, string>;

export const BarChartLabelPositions = [
  "inside",
  "outside",
  "top",
  "insideTop",
  "insideBottom",
  "insideLeft",
  "insideRight",
] as const satisfies readonly StringLabelPosition[];
export const PieChartLabelPositions = [
  "inside",
  "outside",
  "center",
] as const satisfies readonly StringLabelPosition[];
export const LineChartLabelPositions = [
  "top",
  "bottom",
  "insideTopLeft",
  "insideTopRight",
  "insideBottomLeft",
  "insideBottomRight",
] as const satisfies readonly StringLabelPosition[];
export const AreaChartLabelPositions = [
  "top",
  "bottom",
  "center",
  "insideTop",
  "insideBottom",
] as const satisfies readonly StringLabelPosition[];

// Automatically derived types from the const arrays
export type BarChartLabelPosition = (typeof BarChartLabelPositions)[number];
export type PieChartLabelPosition = (typeof PieChartLabelPositions)[number];
export type LineChartLabelPosition = (typeof LineChartLabelPositions)[number];
export type AreaChartLabelPosition = (typeof AreaChartLabelPositions)[number];

// Base label interface
interface BaseLabelProps {
  showLabels?: boolean;
  labelFormatter?: ChartLabelFormatter;
}

// Chart-specific label interfaces
export interface BarChartLabelProps extends BaseLabelProps {
  labelPosition?: BarChartLabelPosition;
  labelProps?: Partial<ChartLabelListProps>;
}

export interface PieChartLabelProps extends BaseLabelProps {
  labelPosition?: PieChartLabelPosition;
  labelProps?: Partial<PieProps>;
}

export interface LineChartLabelProps extends BaseLabelProps {
  labelPosition?: LineChartLabelPosition;
  labelProps?: Partial<ChartLabelListProps>;
}

export interface AreaChartLabelProps extends BaseLabelProps {
  labelPosition?: AreaChartLabelPosition;
  labelProps?: Partial<ChartLabelListProps>;
}

export interface ChartClassNames {
  container?: string;
  wrapper?: string;
  legend?: string;
  loader?: string;
  emptyState?: string;
}

export interface ChartStyles {
  container?: CSSProperties;
  wrapper?: CSSProperties;
  legend?: CSSProperties;
  loader?: CSSProperties;
  emptyState?: CSSProperties;
}

export interface BaseChartProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> extends Omit<ResponsiveContainerProps, "children"> {
  data: T[];
  width?: number | Percent;
  height?: number | Percent;
  className?: string;
  classNames?: ChartClassNames;
  styles?: ChartStyles;

  interactiveLegend?: boolean;
  interactiveLegendPosition?: InteractiveLegendPosition;

  loading?: boolean;
  loader?: ComponentType<ChartLoaderProps>;
  zeroStateComponent?: ComponentType<ChartZeroStateProps>;
  emptyStateMessage?: string;

  responsive?: boolean;
  maintainAspectRatio?: boolean;

  ariaLabel?: string;
  role?: string;

  margin?: Margin;
}

export interface ChartComponentProps {
  xAxis?: XAxisProps | boolean;
  yAxis?: YAxisProps | boolean;
  grid?: CartesianGridProps | boolean;
  tooltip?: ChartTooltipProps | boolean;
  legend?: LegendProps | boolean;
}

// Convenience alias to combine base with common chart component toggles
export type CommonChartProps<T extends Record<string, unknown> = Record<string, unknown>> =
  BaseChartProps<T> & ChartComponentProps;
