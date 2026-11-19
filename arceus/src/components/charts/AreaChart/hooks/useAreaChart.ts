import { useMemo } from "react";

import useInteractiveLegend from "@/components/charts/shared/hooks/useInteractiveLegend";
import useChartData from "@/components/charts/shared/hooks/useChartData";
import type { AreaChartProps, AreaDataset } from "@/components/charts/AreaChart/types";
import { collectAreaDatasets, hasCustomAreaChildren } from "@/components/charts/AreaChart/utils";
import type { VisibleDatasets } from "@/components/charts/AreaChart/utils";

/** Options required to derive state for the AreaChart component. */
interface UseAreaChartOptions<T extends Record<string, unknown>> {
  data: AreaChartProps<T>["data"];
  dataKey?: AreaChartProps<T>["dataKey"];
  categories: AreaDataset[];
  children: AreaChartProps["children"];
}

/** Values returned to the AreaChart wrapper after processing raw props. */
interface UseAreaChartResult<T extends Record<string, unknown>> {
  hasCustomAreas: boolean;
  datasets: AreaDataset[];
  visibleDatasets: VisibleDatasets;
  chartData: AreaChartProps<T>["data"];
  isEmpty: boolean;
  toggleDataset: ReturnType<typeof useInteractiveLegend>["toggleDataset"];
  toggleAll: ReturnType<typeof useInteractiveLegend>["toggleAll"];
}

/**
 * Collects datasets, applies legend visibility, and produces the data array the chart should render.
 * Keeps orchestration logic out of the visual component tree.
 */
const useAreaChart = <T extends Record<string, unknown>>({
  data,
  dataKey,
  categories,
  children,
}: UseAreaChartOptions<T>): UseAreaChartResult<T> => {
  // Determine if consumers are supplying custom <Area /> children instead of category configs.
  const hasCustomAreas = useMemo(() => hasCustomAreaChildren(children), [children]);

  // Build the datasets list used by both the legend and automatic area generation.
  const datasets = useMemo(
    () => collectAreaDatasets(hasCustomAreas, children, categories),
    [hasCustomAreas, children, categories],
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

  const chartData = hasCustomAreas ? data : filteredData;

  return {
    hasCustomAreas,
    datasets,
    visibleDatasets,
    chartData,
    isEmpty,
    toggleDataset,
    toggleAll,
  };
};

export default useAreaChart;
