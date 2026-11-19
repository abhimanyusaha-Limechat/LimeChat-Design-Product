import { useMemo } from "react";
import { CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";
import type { AreaElementProps, AreaChartProps } from "@/components/charts/AreaChart/types";
import {
  resolveLabelFormatter,
  resolveTooltipProps,
} from "@/components/charts/shared/utils/chartHelpers";
import type { ChartLabelListProps } from "@/components/charts/shared/types";
import type { VisibleDatasets } from "@/components/charts/AreaChart/utils";
import { filterCustomAreaChildren } from "@/components/charts/AreaChart/utils";
import AreaSeries from "@/components/charts/AreaChart/components/AreaSeries";

interface AreaChartContentProps extends Pick<
  AreaChartProps,
  "grid" | "xAxis" | "yAxis" | "tooltip" | "legend" | "categories" | "children" | "onAreaClick"
> {
  // Area style props (from areaStyle object)
  type?: AreaElementProps["type"];
  connectNulls?: AreaElementProps["connectNulls"];
  strokeWidth?: AreaElementProps["strokeWidth"];
  fillOpacity?: AreaElementProps["fillOpacity"];
  strokeDasharray?: AreaElementProps["strokeDasharray"];
  dot?: AreaElementProps["dot"];
  activeDot?: AreaElementProps["activeDot"];
  showLabels?: AreaChartProps["showLabels"];
  labelPosition?: AreaChartProps["labelPosition"];
  labelFormatter?: AreaChartProps["labelFormatter"];
  labelProps?: AreaChartProps["labelProps"];
  dataKey?: AreaChartProps["dataKey"];
  visibleDatasets: VisibleDatasets;
  interactiveLegend: boolean;
  hasCustomAreas: boolean;
}

interface GeneratedAreaSeriesGroupProps {
  categories: AreaChartProps["categories"];
  areaDefaults: Pick<
    AreaElementProps,
    | "type"
    | "connectNulls"
    | "strokeWidth"
    | "fillOpacity"
    | "strokeDasharray"
    | "dot"
    | "activeDot"
  >;
  showLabels?: AreaChartContentProps["showLabels"];
  labelPosition?: AreaChartContentProps["labelPosition"];
  labelProps?: AreaChartContentProps["labelProps"];
  labelFormatter?: ChartLabelListProps["formatter"];
  onAreaClick?: AreaChartContentProps["onAreaClick"];
  visibleDatasets: VisibleDatasets;
}

interface CustomAreaChildrenProps {
  children: AreaChartProps["children"];
  visibleDatasets: VisibleDatasets;
}

function GeneratedAreaSeriesGroup({
  categories = [],
  areaDefaults,
  showLabels,
  labelPosition,
  labelProps,
  labelFormatter,
  onAreaClick,
  visibleDatasets,
}: GeneratedAreaSeriesGroupProps) {
  if (!categories.length) {
    return null;
  }

  return (
    <>
      {categories.map((dataset) => (
        <AreaSeries
          key={dataset.key}
          dataset={dataset}
          defaults={areaDefaults}
          showLabels={Boolean(showLabels)}
          labelPosition={labelPosition ?? "top"}
          labelProps={labelProps ?? {}}
          labelFormatter={labelFormatter}
          {...(onAreaClick !== undefined ? { onAreaClick } : {})}
          visibleDatasets={visibleDatasets}
        />
      ))}
    </>
  );
}

/** Wraps custom <Area /> children and strips out any datasets hidden via the legend. */
function CustomAreaChildren({ children, visibleDatasets }: CustomAreaChildrenProps) {
  const filteredChildren = filterCustomAreaChildren(children, visibleDatasets);
  return filteredChildren;
}

/**
 * Responsible for rendering axes, tooltip, legend, and all area series inside the chart canvas.
 */
function AreaChartContent({
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
  strokeWidth = 1,
  fillOpacity = 0.6,
  strokeDasharray,
  dot = false,
  activeDot = true,
  onAreaClick,
  dataKey,
  visibleDatasets,
  interactiveLegend,
  hasCustomAreas,
}: AreaChartContentProps) {
  const labelFormatterFn = useMemo(() => resolveLabelFormatter(labelFormatter), [labelFormatter]);

  const areaDefaults = useMemo(
    () => ({
      type,
      connectNulls,
      strokeWidth,
      fillOpacity,
      dot,
      activeDot,
      ...(strokeDasharray !== undefined ? { strokeDasharray } : {}),
    }),
    [type, connectNulls, strokeWidth, fillOpacity, strokeDasharray, dot, activeDot],
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

      {hasCustomAreas ? (
        <CustomAreaChildren visibleDatasets={visibleDatasets}>{children}</CustomAreaChildren>
      ) : (
        <GeneratedAreaSeriesGroup
          categories={categories}
          areaDefaults={areaDefaults}
          showLabels={showLabels}
          labelPosition={labelPosition}
          labelProps={labelProps}
          labelFormatter={labelFormatterFn}
          onAreaClick={onAreaClick}
          visibleDatasets={visibleDatasets}
        />
      )}
    </>
  );
}

export default AreaChartContent;
