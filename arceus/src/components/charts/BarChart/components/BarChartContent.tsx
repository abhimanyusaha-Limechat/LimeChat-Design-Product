import { useMemo } from "react";
import { CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";
import type { BarProps } from "recharts";

import {
  resolveLabelFormatter,
  resolveTooltipProps,
} from "@/components/charts/shared/utils/chartHelpers";
import type { ChartLabelListProps } from "@/components/charts/shared/types";
import type { BarChartProps } from "@/components/charts/BarChart/types";
import type { VisibleDatasets } from "@/components/charts/BarChart/utils";
import { cloneRadius, filterCustomBarChildren } from "@/components/charts/BarChart/utils";
import BarSeries from "@/components/charts/BarChart/components/BarSeries";

interface BarChartContentProps extends Pick<
  BarChartProps,
  "grid" | "xAxis" | "yAxis" | "tooltip" | "legend" | "categories" | "children" | "onBarClick"
> {
  // Bar style props (from barStyle object)
  radius?: BarProps["radius"];
  showLabels?: BarChartProps["showLabels"];
  labelPosition?: BarChartProps["labelPosition"];
  labelFormatter?: BarChartProps["labelFormatter"];
  labelProps?: BarChartProps["labelProps"];
  dataKey?: BarChartProps["dataKey"];
  visibleDatasets: VisibleDatasets;
  interactiveLegend: boolean;
  hasCustomBars: boolean;
  layout?: BarChartProps["layout"];
}

interface GeneratedBarSeriesGroupProps {
  categories: BarChartProps["categories"];
  barDefaults: Pick<BarProps, "radius">;
  showLabels?: BarChartContentProps["showLabels"];
  labelPosition?: BarChartContentProps["labelPosition"];
  labelProps?: BarChartContentProps["labelProps"];
  labelFormatter?: ChartLabelListProps["formatter"];
  onBarClick?: BarChartContentProps["onBarClick"];
  visibleDatasets: VisibleDatasets;
}

interface CustomBarChildrenProps {
  children: BarChartProps["children"];
  visibleDatasets: VisibleDatasets;
}

function GeneratedBarSeriesGroup({
  categories = [],
  barDefaults,
  showLabels,
  labelPosition,
  labelProps,
  labelFormatter,
  onBarClick,
  visibleDatasets,
}: GeneratedBarSeriesGroupProps) {
  if (!categories.length) {
    return null;
  }

  return (
    <>
      {categories.map((dataset) => (
        <BarSeries
          key={dataset.key}
          dataset={dataset}
          defaults={barDefaults}
          showLabels={Boolean(showLabels)}
          labelPosition={labelPosition ?? "top"}
          labelProps={labelProps ?? {}}
          labelFormatter={labelFormatter}
          onBarClick={onBarClick}
          visibleDatasets={visibleDatasets}
        />
      ))}
    </>
  );
}

/** Wraps custom <Bar /> children and strips out any datasets hidden via the legend. */
function CustomBarChildren({ children, visibleDatasets }: CustomBarChildrenProps) {
  const filteredChildren = filterCustomBarChildren(children, visibleDatasets);
  return filteredChildren;
}

/**
 * Responsible for rendering axes, tooltip, legend, and all bar series inside the chart canvas.
 */
function BarChartContent({
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
  radius,
  onBarClick,
  dataKey,
  visibleDatasets,
  interactiveLegend,
  hasCustomBars,
  layout = "horizontal",
}: BarChartContentProps) {
  const labelFormatterFn = useMemo(() => resolveLabelFormatter(labelFormatter), [labelFormatter]);

  const barDefaults = useMemo(() => {
    // Recharts mutates radius arrays during layout; clone before passing down.
    const clonedRadius = cloneRadius(radius);
    return clonedRadius !== undefined ? { radius: clonedRadius } : {};
  }, [radius]);

  const gridProps = typeof grid === "object" ? grid : {};
  const xAxisProps = typeof xAxis === "object" ? xAxis : {};
  const yAxisProps = typeof yAxis === "object" ? yAxis : {};
  const tooltipProps = resolveTooltipProps(tooltip);
  const legendProps = typeof legend === "object" ? legend : {};
  const isVerticalLayout = layout === "vertical";
  const xAxisDataKeyProps =
    !isVerticalLayout && typeof dataKey === "string" && dataKey.length > 0 ? { dataKey } : {};
  const yAxisDataKeyProps =
    isVerticalLayout && typeof dataKey === "string" && dataKey.length > 0 ? { dataKey } : {};

  return (
    <>
      {grid !== false && (
        <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-gray-3)" {...gridProps} />
      )}

      {xAxis !== false && <XAxis {...xAxisDataKeyProps} {...xAxisProps} />}

      {yAxis !== false && <YAxis {...yAxisDataKeyProps} {...yAxisProps} />}

      {tooltip !== false && <Tooltip {...tooltipProps} />}

      {legend !== false && !interactiveLegend && <Legend {...legendProps} />}

      {hasCustomBars ? (
        <CustomBarChildren visibleDatasets={visibleDatasets}>{children}</CustomBarChildren>
      ) : (
        <GeneratedBarSeriesGroup
          categories={categories}
          barDefaults={barDefaults}
          showLabels={showLabels}
          labelPosition={labelPosition}
          labelProps={labelProps}
          labelFormatter={labelFormatterFn}
          onBarClick={onBarClick}
          visibleDatasets={visibleDatasets}
        />
      )}
    </>
  );
}

export default BarChartContent;
