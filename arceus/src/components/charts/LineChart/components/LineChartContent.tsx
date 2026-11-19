import { useMemo } from "react";
import { CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";
import type { LineProps } from "recharts";

import {
  resolveLabelFormatter,
  resolveTooltipProps,
} from "@/components/charts/shared/utils/chartHelpers";
import type { ChartLabelListProps } from "@/components/charts/shared/types";
import type { LineChartProps } from "@/components/charts/LineChart/types";
import type { VisibleDatasets } from "@/components/charts/LineChart/utils";
import { filterCustomLineChildren } from "@/components/charts/LineChart/utils";
import LineSeries from "@/components/charts/LineChart/components/LineSeries";

interface LineChartContentProps extends Pick<
  LineChartProps,
  "grid" | "xAxis" | "yAxis" | "tooltip" | "legend" | "categories" | "children" | "onLineClick"
> {
  // Line style props (from lineStyle object)
  type?: LineProps["type"];
  connectNulls?: LineProps["connectNulls"];
  strokeWidth?: LineProps["strokeWidth"];
  strokeDasharray?: LineProps["strokeDasharray"];
  dot?: LineProps["dot"];
  activeDot?: LineProps["activeDot"];
  showLabels?: LineChartProps["showLabels"];
  labelPosition?: LineChartProps["labelPosition"];
  labelFormatter?: LineChartProps["labelFormatter"];
  labelProps?: LineChartProps["labelProps"];
  dataKey?: LineChartProps["dataKey"];
  visibleDatasets: VisibleDatasets;
  interactiveLegend: boolean;
  hasCustomLines: boolean;
}

interface GeneratedLineSeriesGroupProps {
  categories: LineChartProps["categories"];
  lineDefaults: Pick<
    LineProps,
    "type" | "connectNulls" | "strokeWidth" | "strokeDasharray" | "dot" | "activeDot"
  >;
  showLabels?: LineChartContentProps["showLabels"];
  labelPosition?: LineChartContentProps["labelPosition"];
  labelProps?: LineChartContentProps["labelProps"];
  labelFormatter?: ChartLabelListProps["formatter"];
  onLineClick?: LineChartContentProps["onLineClick"];
  visibleDatasets: VisibleDatasets;
}

interface CustomLineChildrenProps {
  children: LineChartProps["children"];
  visibleDatasets: VisibleDatasets;
}

function GeneratedLineSeriesGroup({
  categories = [],
  lineDefaults,
  showLabels,
  labelPosition,
  labelProps,
  labelFormatter,
  onLineClick,
  visibleDatasets,
}: GeneratedLineSeriesGroupProps) {
  if (!categories.length) {
    return null;
  }

  return (
    <>
      {categories.map((dataset) => (
        <LineSeries
          key={dataset.key}
          dataset={dataset}
          defaults={lineDefaults}
          showLabels={Boolean(showLabels)}
          labelPosition={labelPosition ?? "top"}
          labelProps={labelProps ?? {}}
          labelFormatter={labelFormatter}
          onLineClick={onLineClick}
          visibleDatasets={visibleDatasets}
        />
      ))}
    </>
  );
}

/** Wraps custom <Line /> children and strips out any datasets hidden via the legend. */
function CustomLineChildren({ children, visibleDatasets }: CustomLineChildrenProps) {
  const filteredChildren = filterCustomLineChildren(children, visibleDatasets);
  return filteredChildren;
}

/**
 * Responsible for rendering axes, tooltip, legend, and all line series inside the chart canvas.
 */
function LineChartContent({
  grid,
  xAxis,
  yAxis,
  tooltip,
  legend,
  categories = [],
  children,
  showLabels = false,
  labelPosition = "top",
  labelFormatter,
  labelProps = {},
  type = "monotone",
  connectNulls = false,
  strokeWidth = 2,
  strokeDasharray,
  dot = false,
  activeDot = true,
  onLineClick,
  dataKey,
  visibleDatasets,
  interactiveLegend,
  hasCustomLines,
}: LineChartContentProps) {
  const labelFormatterFn = useMemo(() => resolveLabelFormatter(labelFormatter), [labelFormatter]);

  const lineDefaults = useMemo(
    () => ({
      type,
      connectNulls,
      strokeWidth,
      dot,
      activeDot,
      ...(strokeDasharray !== undefined ? { strokeDasharray } : {}),
    }),
    [type, connectNulls, strokeWidth, strokeDasharray, dot, activeDot],
  );

  const gridProps = typeof grid === "object" ? grid : {};
  const xAxisProps = typeof xAxis === "object" ? xAxis : {};
  const yAxisProps = typeof yAxis === "object" ? yAxis : {};
  const tooltipProps = resolveTooltipProps(tooltip);
  const legendProps = typeof legend === "object" ? legend : {};
  const xAxisDataKeyProps = typeof dataKey === "string" && dataKey.length > 0 ? { dataKey } : {};

  return (
    <>
      {grid !== false && (
        <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-gray-3)" {...gridProps} />
      )}

      {xAxis !== false && <XAxis {...xAxisDataKeyProps} {...xAxisProps} />}

      {yAxis !== false && <YAxis {...yAxisProps} />}

      {tooltip !== false && <Tooltip {...tooltipProps} />}

      {legend !== false && !interactiveLegend && <Legend {...legendProps} />}

      {hasCustomLines ? (
        <CustomLineChildren visibleDatasets={visibleDatasets}>{children}</CustomLineChildren>
      ) : (
        <GeneratedLineSeriesGroup
          categories={categories}
          lineDefaults={lineDefaults}
          showLabels={showLabels}
          labelPosition={labelPosition}
          labelProps={labelProps}
          labelFormatter={labelFormatterFn}
          onLineClick={onLineClick}
          visibleDatasets={visibleDatasets}
        />
      )}
    </>
  );
}

export default LineChartContent;
