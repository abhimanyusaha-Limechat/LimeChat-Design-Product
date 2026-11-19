import { forwardRef, useMemo } from "react";
import { FunnelChart as RechartsFunnelChart, ResponsiveContainer } from "recharts";
import cn from "classnames";

import { Box } from "@mantine/core";
import { ChartLayout } from "@/components/charts/shared";
import FunnelChartLoader from "@/components/charts/FunnelChart/Loader";
import FunnelChartZeroState from "@/components/charts/FunnelChart/ZeroState";
import FunnelChartContent from "@/components/charts/FunnelChart/components/FunnelChartContent";
import useFunnelChart from "@/components/charts/FunnelChart/hooks/useFunnelChart";
import type { FunnelChartProps, FunnelStyleConfig } from "@/components/charts/FunnelChart/types";
import styles from "@/components/charts/FunnelChart/FunnelChart.module.sass";

// Default configurations - use spreading instead of manual destructuring
const DEFAULT_PROPS: Partial<FunnelChartProps> = {
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
  emptyStateMessage: "No data available",
  categories: [],
  classNames: {},
  styles: {},
};

const DEFAULT_FUNNEL_STYLE: FunnelStyleConfig = {
  isAnimationActive: true,
  animationBegin: 0,
  animationDuration: 1500,
};

/**
 * A flexible FunnelChart component built on Recharts.
 *
 * @example
 * // Simple usage
 * <FunnelChart data={data} categories={categories} />
 *
 * // With funnel styling
 * <FunnelChart
 *   data={data}
 *   categories={categories}
 *   funnelStyle={{ animationDuration: 2000 }}
 * />
 *
 * // Advanced with custom children
 * <FunnelChart data={data}>
 *   <Funnel dataKey="value" fill="#8884d8" />
 * </FunnelChart>
 */
const FunnelChart = forwardRef<HTMLDivElement, FunnelChartProps>((props, ref) => {
  const config = { ...DEFAULT_PROPS, ...props };
  const funnelStyle = { ...DEFAULT_FUNNEL_STYLE, ...props.funnelStyle };

  const {
    data,
    dataKey = "value",
    nameKey = "name",
    categories,
    children,
    loading,
    loader: LoaderComponent = FunnelChartLoader,
    zeroStateComponent: ZeroStateComponent = FunnelChartZeroState,
    className,
    onFunnelClick,
  } = config;

  const chartState = useFunnelChart({
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

  // Chart content props - match FunnelChartContent interface
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
      hasCustomFunnels: chartState.hasCustomFunnels,
      onFunnelClick,
      funnelDefaults: {
        isAnimationActive: funnelStyle.isAnimationActive ?? true,
        animationBegin: funnelStyle.animationBegin ?? 0,
        animationDuration: funnelStyle.animationDuration ?? 1500,
      },
    }),
    [
      config,
      funnelStyle,
      categories,
      chartState.chartData,
      chartState.dataKey,
      chartState.nameKey,
      chartState.visibleDatasets,
      chartState.hasCustomFunnels,
      onFunnelClick,
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
          <RechartsFunnelChart margin={config.margin || {}}>
            <FunnelChartContent {...chartContentProps}>{children}</FunnelChartContent>
          </RechartsFunnelChart>
        </ResponsiveContainer>
      </ChartLayout>
    </Box>
  );
});

FunnelChart.displayName = "FunnelChart";

export default FunnelChart;
export { FunnelChart };
export type {
  FunnelChartProps,
  FunnelDataset,
  FunnelStyleConfig,
} from "@/components/charts/FunnelChart/types";
