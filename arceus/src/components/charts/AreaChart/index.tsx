import * as React from "react";
import { AreaChart as RechartsAreaChart, ResponsiveContainer } from "recharts";
import cn from "classnames";

import Container from "@/components/core/Container";
import { ChartLayout } from "@/components/charts/shared";
import AreaChartLoader from "@/components/charts/AreaChart/Loader";
import AreaChartZeroState from "@/components/charts/AreaChart/ZeroState";
import AreaChartContent from "@/components/charts/AreaChart/components/AreaChartContent";
import useAreaChart from "@/components/charts/AreaChart/hooks/useAreaChart";
import type { AreaChartProps, AreaStyleConfig } from "@/components/charts/AreaChart/types";
import styles from "@/components/charts/AreaChart/AreaChart.module.sass";

// Default configurations - use spreading instead of manual destructuring
const DEFAULT_PROPS: Partial<AreaChartProps> = {
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

const DEFAULT_AREA_STYLE: AreaStyleConfig = {
  type: "monotone",
  strokeWidth: 1,
  fillOpacity: 0.6,
  connectNulls: false,
  dot: false,
  activeDot: true,
};

/**
 * A flexible AreaChart component built on Recharts.
 *
 * @example
 * // Simple usage
 * <AreaChart data={data} categories={categories} />
 *
 * // With area styling
 * <AreaChart
 *   data={data}
 *   categories={categories}
 *   areaStyle={{ strokeWidth: 2, fillOpacity: 0.8 }}
 * />
 *
 * // Advanced with custom children
 * <AreaChart data={data}>
 *   <Area dataKey="sales" fill="#8884d8" />
 * </AreaChart>
 */
const AreaChart = React.forwardRef<HTMLDivElement, AreaChartProps>((props, ref) => {
  const config = { ...DEFAULT_PROPS, ...props };
  const areaStyle = { ...DEFAULT_AREA_STYLE, ...props.areaStyle };

  const {
    data,
    dataKey,
    categories,
    children,
    loading,
    loader: LoaderComponent = AreaChartLoader,
    zeroStateComponent: ZeroStateComponent = AreaChartZeroState,
    className,
    onAreaClick,
  } = config;

  const chartState = useAreaChart({
    data,
    dataKey,
    categories: categories || [],
    children,
  });

  const containerClassName = React.useMemo(
    () => cn(styles["chart-container"], className, config.classNames?.container),
    [className, config.classNames?.container],
  );

  // Chart content props - match AreaChartContent interface
  const chartContentProps = React.useMemo(
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
      hasCustomAreas: chartState.hasCustomAreas,
      ...(onAreaClick !== undefined ? { onAreaClick } : {}),

      // Individual area style props
      type: areaStyle.type ?? "monotone",
      connectNulls: areaStyle.connectNulls ?? false,
      strokeWidth: areaStyle.strokeWidth ?? 1,
      fillOpacity: areaStyle.fillOpacity ?? 0.6,
      ...(areaStyle.strokeDasharray !== undefined
        ? { strokeDasharray: areaStyle.strokeDasharray }
        : {}),
      dot: areaStyle.dot ?? false,
      activeDot: areaStyle.activeDot ?? true,
    }),
    [
      config,
      areaStyle,
      categories,
      dataKey,
      chartState.visibleDatasets,
      chartState.hasCustomAreas,
      onAreaClick,
    ],
  );

  if (loading ?? false) {
    return (
      <Container ref={ref} className={containerClassName} style={config.styles?.container || {}}>
        <LoaderComponent height={config.height!} width={config.width!} />
      </Container>
    );
  }

  if (chartState.isEmpty) {
    return (
      <Container ref={ref} className={containerClassName} style={config.styles?.container || {}}>
        <ZeroStateComponent
          message={config.emptyStateMessage!}
          height={config.height!}
          width={config.width!}
        />
      </Container>
    );
  }

  return (
    <Container
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
          <RechartsAreaChart
            data={chartState.chartData}
            layout={config.layout || "horizontal"}
            margin={config.margin || {}}
          >
            <AreaChartContent {...chartContentProps}>{children}</AreaChartContent>
          </RechartsAreaChart>
        </ResponsiveContainer>
      </ChartLayout>
    </Container>
  );
});

AreaChart.displayName = "AreaChart";

export default AreaChart;
export { AreaChart };

export type {
  AreaChartProps,
  AreaDataset,
  AreaStyleConfig,
} from "@/components/charts/AreaChart/types";
