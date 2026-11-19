import { forwardRef, useMemo } from "react";
import { BarChart as RechartsBarChart, ResponsiveContainer } from "recharts";
import cn from "classnames";

import { Box } from "@mantine/core";
import { ChartLayout } from "@/components/charts/shared";
import BarChartLoader from "@/components/charts/BarChart/Loader";
import BarChartZeroState from "@/components/charts/BarChart/ZeroState";
import BarChartContent from "@/components/charts/BarChart/components/BarChartContent";
import useBarChart from "@/components/charts/BarChart/hooks/useBarChart";
import type { BarChartProps, BarStyleConfig } from "@/components/charts/BarChart/types";
import styles from "@/components/charts/BarChart/BarChart.module.sass";

// Default configurations - use spreading instead of manual destructuring
const DEFAULT_PROPS: Partial<BarChartProps> = {
  width: "100%",
  height: 400,
  layout: "horizontal",
  margin: {
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
  },
  xAxis: true,
  yAxis: true,
  grid: true,
  tooltip: true,
  legend: true,
  interactiveLegend: false,
  interactiveLegendPosition: "right",
  loading: false,
  showLabels: false,
  labelPosition: "top",
  emptyStateMessage: "No data available",
  categories: [],
  classNames: {},
  styles: {},
  labelProps: {},
};

const DEFAULT_BAR_STYLE: BarStyleConfig = {
  radius: 0,
};

/**
 * A flexible BarChart component built on Recharts.
 *
 * @example
 * // Simple usage
 * <BarChart data={data} categories={categories} />
 *
 * // With bar styling
 * <BarChart
 *   data={data}
 *   categories={categories}
 *   barStyle={{ radius: 4 }}
 * />
 *
 * // Advanced with custom children
 * <BarChart data={data}>
 *   <Bar dataKey="sales" fill="#8884d8" />
 * </BarChart>
 */
const BarChart = forwardRef<HTMLDivElement, BarChartProps>((props, ref) => {
  const config = { ...DEFAULT_PROPS, ...props };
  const barStyle = { ...DEFAULT_BAR_STYLE, ...props.barStyle };

  const {
    data,
    dataKey,
    categories,
    children,
    loading,
    loader: LoaderComponent = BarChartLoader,
    zeroStateComponent: ZeroStateComponent = BarChartZeroState,
    className,
    onBarClick,
  } = config;

  const chartState = useBarChart({
    data,
    dataKey,
    categories: categories || [],
    children,
  });

  const containerClassName = useMemo(
    () => cn(styles["chart-container"], className, config.classNames?.container),
    [className, config.classNames?.container],
  );

  // Chart content props - match BarChartContent interface
  // Must be declared before any early returns to comply with Rules of Hooks
  const chartContentProps = useMemo(
    () => ({
      grid: config.grid ?? true,
      xAxis: config.xAxis ?? true,
      yAxis: config.yAxis ?? true,
      tooltip: config.tooltip ?? true,
      legend: config.legend ?? true,
      interactiveLegend: Boolean(config.interactiveLegend),
      showLabels: config.showLabels ?? false,
      labelPosition: config.labelPosition ?? "top",
      labelFormatter: config.labelFormatter,
      labelProps: config.labelProps ?? {},
      categories: categories || [],
      dataKey,
      visibleDatasets: chartState.visibleDatasets,
      hasCustomBars: chartState.hasCustomBars,
      onBarClick,
      layout: config.layout ?? "horizontal",

      // Individual bar style props
      radius: barStyle.radius ?? 0,
    }),
    [
      config,
      barStyle,
      categories,
      dataKey,
      chartState.visibleDatasets,
      chartState.hasCustomBars,
      onBarClick,
    ],
  );

  if (loading ?? false) {
    return (
      <Box ref={ref} className={containerClassName} style={config.styles?.container || {}}>
        <LoaderComponent height={config.height!} width={config.width!} />
      </Box>
    );
  }

  if (chartState.isEmpty) {
    return (
      <Box ref={ref} className={containerClassName} style={config.styles?.container || {}}>
        <ZeroStateComponent
          message={config.emptyStateMessage!}
          height={config.height!}
          width={config.width!}
        />
      </Box>
    );
  }

  return (
    <Box
      ref={ref}
      className={containerClassName}
      style={{ position: "relative", ...(config.styles?.container || {}) }}
    >
      <ChartLayout
        interactiveLegend={config.interactiveLegend}
        interactiveLegendPosition={config.interactiveLegendPosition}
        height={config.height}
        datasets={chartState.datasets}
        visibleDatasets={chartState.visibleDatasets}
        onToggle={chartState.toggleDataset}
        onToggleAll={chartState.toggleAll}
        legendClassName={config.classNames?.legend}
      >
        <ResponsiveContainer width={config.width!} height={config.height!}>
          <RechartsBarChart
            data={chartState.chartData}
            layout={config.layout || "horizontal"}
            margin={config.margin || {}}
          >
            <BarChartContent {...chartContentProps}>{children}</BarChartContent>
          </RechartsBarChart>
        </ResponsiveContainer>
      </ChartLayout>
    </Box>
  );
});

BarChart.displayName = "BarChart";

export default BarChart;
export { BarChart };
export type { BarChartProps, BarDataset, BarStyleConfig } from "@/components/charts/BarChart/types";
