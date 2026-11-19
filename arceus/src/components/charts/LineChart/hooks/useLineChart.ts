import { useMemo } from "react";

import useInteractiveLegend from "@/components/charts/shared/hooks/useInteractiveLegend";
import useChartData from "@/components/charts/shared/hooks/useChartData";
import type { LineChartProps, LineDataset } from "@/components/charts/LineChart/types";
import { collectLineDatasets, hasCustomLineChildren } from "@/components/charts/LineChart/utils";
import type { VisibleDatasets } from "@/components/charts/LineChart/utils";

/** Options required to derive state for the LineChart component. */
interface UseLineChartOptions<T extends Record<string, unknown>> {
  data: LineChartProps<T>["data"];
  dataKey?: LineChartProps<T>["dataKey"];
  categories: LineDataset[];
  children: LineChartProps["children"];
}

/** Values returned to the LineChart wrapper after processing raw props. */
interface UseLineChartResult<T extends Record<string, unknown>> {
  hasCustomLines: boolean;
  datasets: LineDataset[];
  visibleDatasets: VisibleDatasets;
  chartData: LineChartProps<T>["data"];
  isEmpty: boolean;
  toggleDataset: ReturnType<typeof useInteractiveLegend>["toggleDataset"];
  toggleAll: ReturnType<typeof useInteractiveLegend>["toggleAll"];
}

/**
 * Collects datasets, applies legend visibility, and produces the data array the chart should render.
 * Keeps orchestration logic out of the visual component tree.
 */
const useLineChart = <T extends Record<string, unknown>>({
  data,
  dataKey,
  categories,
  children,
}: UseLineChartOptions<T>): UseLineChartResult<T> => {
  // Determine if consumers are supplying custom <Line /> children instead of category configs.
  const hasCustomLines = useMemo(() => hasCustomLineChildren(children), [children]);

  // Build the datasets list used by both the legend and automatic line generation.
  const datasets = useMemo(
    () => collectLineDatasets(hasCustomLines, children, categories),
    [hasCustomLines, children, categories],
  );

  const { visibleDatasets, toggleDataset, toggleAll } = useInteractiveLegend(datasets);

  const hasDataKey = typeof dataKey === "string" && dataKey.length > 0;
  // Filter the dataset down to only the keys currently visible in the legend.
  const { filteredData, isEmpty } = useChartData({
    data,
    visibleDatasets,
    ...(hasDataKey ? { dataKey } : {}),
    preserveKeys: hasDataKey ? [dataKey] : [],
  });

  const chartData = hasCustomLines ? data : filteredData;

  return {
    hasCustomLines,
    datasets,
    visibleDatasets,
    chartData,
    isEmpty,
    toggleDataset,
    toggleAll,
  };
};

export default useLineChart;
