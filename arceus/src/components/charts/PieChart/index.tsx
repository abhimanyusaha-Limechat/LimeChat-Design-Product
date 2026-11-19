import { forwardRef, useMemo } from "react";
import { PieChart as RechartsPieChart, ResponsiveContainer } from "recharts";
import cn from "classnames";

import { Box } from "@mantine/core";
import { ChartLayout } from "@/components/charts/shared";
import PieChartLoader from "@/components/charts/PieChart/Loader";
import PieChartZeroState from "@/components/charts/PieChart/ZeroState";
import PieChartContent from "@/components/charts/PieChart/components/PieChartContent";
import usePieChart from "@/components/charts/PieChart/hooks/usePieChart";
import type { PieChartProps, PieStyleConfig } from "@/components/charts/PieChart/types";
import styles from "@/components/charts/PieChart/PieChart.module.sass";

// Default configurations - use spreading instead of manual destructuring
const DEFAULT_PROPS: Partial<PieChartProps> = {
  width: "100%",
  height: 400,
  margin: {
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
  },
  tooltip: true,
  legend: true,
  interactiveLegend: false,
  interactiveLegendPosition: "right",
  loading: false,
  showLabels: false,
  labelPosition: "outside",
  emptyStateMessage: "No data available",
  categories: [],
  classNames: {},
  styles: {},
  labelProps: {},
};

const DEFAULT_PIE_STYLE: PieStyleConfig = {
  innerRadius: 0,
  outerRadius: 80,
  startAngle: 0,
  endAngle: 360,
  paddingAngle: 0,
  cornerRadius: 0,
};

/**
 * A flexible PieChart component built on Recharts.
 *
 * @example
 * // Simple usage
 * <PieChart data={data} categories={categories} />
 *
 * // With pie styling
 * <PieChart
 *   data={data}
 *   categories={categories}
 *   pieStyle={{ innerRadius: 20, outerRadius: 100 }}
 * />
 *
 * // Advanced with custom children
 * <PieChart data={data}>
 *   <Pie dataKey="value" fill="#8884d8" />
 * </PieChart>
 */
const PieChart = forwardRef<HTMLDivElement, PieChartProps>((props, ref) => {
  const config = { ...DEFAULT_PROPS, ...props };
  const pieStyle = { ...DEFAULT_PIE_STYLE, ...props.pieStyle };

  const {
    data,
    dataKey,
    nameKey,
    categories,
    children,
    loading,
    loader: LoaderComponent = PieChartLoader,
    zeroStateComponent: ZeroStateComponent = PieChartZeroState,
    className,
    onPieClick,
  } = config;

  const chartState = usePieChart({
    data,
    dataKey,
    nameKey,
    categories: categories || [],
    children,
  });

  const containerClassName = useMemo(
    () => cn(styles["chart-container"], className, config.classNames?.container),
    [className, config.classNames?.container],
  );

  // Chart content props - match PieChartContent interface
  const chartContentProps = useMemo(
    () => ({
      tooltip: config.tooltip ?? true,
      legend: config.legend ?? true,
      categories: categories || [],
      dataKey: chartState.dataKey,
      nameKey: chartState.nameKey,
      chartData: chartState.chartData,
      visibleDatasets: chartState.visibleDatasets,
      interactiveLegend: Boolean(config.interactiveLegend),
      hasCustomPies: chartState.hasCustomPies,
      onPieClick,
      pieDefaults: {
        innerRadius: pieStyle.innerRadius ?? 0,
        outerRadius: pieStyle.outerRadius ?? 80,
        startAngle: pieStyle.startAngle ?? 0,
        endAngle: pieStyle.endAngle ?? 360,
        paddingAngle: pieStyle.paddingAngle ?? 0,
        cornerRadius: pieStyle.cornerRadius ?? 0,
      },
      showLabels: config.showLabels ?? false,
      labelPosition: config.labelPosition ?? "outside",
      labelFormatter: config.labelFormatter,
      labelProps: config.labelProps ?? {},
    }),
    [
      config,
      pieStyle,
      categories,
      chartState.chartData,
      chartState.dataKey,
      chartState.nameKey,
      chartState.visibleDatasets,
      chartState.hasCustomPies,
      onPieClick,
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
          <RechartsPieChart {...(config.margin && { margin: config.margin })}>
            <PieChartContent {...chartContentProps}>{children}</PieChartContent>
          </RechartsPieChart>
        </ResponsiveContainer>
      </ChartLayout>
    </Box>
  );
});

PieChart.displayName = "PieChart";

export default PieChart;
export { PieChart };
export type { PieChartProps, PieDataset, PieStyleConfig } from "@/components/charts/PieChart/types";
