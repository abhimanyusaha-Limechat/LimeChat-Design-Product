import { forwardRef, useMemo } from "react";
import { LineChart as RechartsLineChart, ResponsiveContainer } from "recharts";
import cn from "classnames";

import { Box } from "@mantine/core";
import { ChartLayout } from "@/components/charts/shared";
import LineChartLoader from "@/components/charts/LineChart/Loader";
import LineChartZeroState from "@/components/charts/LineChart/ZeroState";
import LineChartContent from "@/components/charts/LineChart/components/LineChartContent";
import useLineChart from "@/components/charts/LineChart/hooks/useLineChart";
import type { LineChartProps, LineStyleConfig } from "@/components/charts/LineChart/types";
import styles from "@/components/charts/LineChart/LineChart.module.sass";

const DEFAULT_PROPS: Partial<LineChartProps> = {
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

const DEFAULT_LINE_STYLE: LineStyleConfig = {
  type: "monotone",
  strokeWidth: 2,
  connectNulls: false,
  dot: false,
  activeDot: true,
};

const LineChart = forwardRef<HTMLDivElement, LineChartProps>((props, ref) => {
  const config = { ...DEFAULT_PROPS, ...props };
  const lineStyle = { ...DEFAULT_LINE_STYLE, ...props.lineStyle };

  const {
    data,
    dataKey,
    categories,
    children,
    loading,
    loader: LoaderComponent = LineChartLoader,
    zeroStateComponent: ZeroStateComponent = LineChartZeroState,
    className,
    onLineClick,
  } = config;

  const {
    hasCustomLines,
    datasets,
    visibleDatasets,
    chartData,
    isEmpty,
    toggleDataset,
    toggleAll,
  } = useLineChart({
    data,
    dataKey,
    categories: categories || [],
    children,
  });

  const containerClassName = useMemo(
    () => cn(styles["chart-container"], className, config.classNames?.container),
    [className, config.classNames?.container],
  );

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
      visibleDatasets,
      hasCustomLines,
      onLineClick,

      // Individual line style props
      type: lineStyle.type ?? "monotone",
      connectNulls: lineStyle.connectNulls ?? false,
      strokeWidth: lineStyle.strokeWidth ?? 2,
      strokeDasharray: lineStyle.strokeDasharray,
      dot: lineStyle.dot ?? false,
      activeDot: lineStyle.activeDot ?? true,
    }),
    [config, lineStyle, categories, dataKey, visibleDatasets, hasCustomLines, onLineClick],
  );

  if (loading ?? false) {
    return (
      <Box ref={ref} className={containerClassName} style={config.styles?.container || {}}>
        <LoaderComponent height={config.height!} width={config.width!} />
      </Box>
    );
  }

  if (isEmpty) {
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
        datasets={datasets}
        visibleDatasets={visibleDatasets}
        onToggle={toggleDataset}
        onToggleAll={toggleAll}
        legendClassName={config.classNames?.legend}
      >
        <ResponsiveContainer width={config.width!} height={config.height!}>
          <RechartsLineChart
            data={chartData}
            layout={config.layout || "horizontal"}
            margin={config.margin || {}}
          >
            <LineChartContent {...chartContentProps}>{children}</LineChartContent>
          </RechartsLineChart>
        </ResponsiveContainer>
      </ChartLayout>
    </Box>
  );
});

LineChart.displayName = "LineChart";

export default LineChart;
export { LineChart };
export type {
  LineChartProps,
  LineDataset,
  LineStyleConfig,
} from "@/components/charts/LineChart/types";
