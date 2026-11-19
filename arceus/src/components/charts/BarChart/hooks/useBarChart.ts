import { useMemo } from "react";

import useInteractiveLegend from "@/components/charts/shared/hooks/useInteractiveLegend";
import useChartData from "@/components/charts/shared/hooks/useChartData";
import type { BarChartProps, BarDataset } from "@/components/charts/BarChart/types";
import { collectBarDatasets, hasCustomBarChildren } from "@/components/charts/BarChart/utils";
import type { VisibleDatasets } from "@/components/charts/BarChart/utils";

interface UseBarChartOptions<T extends Record<string, unknown>> {
  data: BarChartProps<T>["data"];
  dataKey?: BarChartProps<T>["dataKey"];
  categories: BarDataset[];
  children: BarChartProps["children"];
}

interface UseBarChartResult<T extends Record<string, unknown>> {
  hasCustomBars: boolean;
  datasets: BarDataset[];
  visibleDatasets: VisibleDatasets;
  chartData: BarChartProps<T>["data"];
  isEmpty: boolean;
  toggleDataset: ReturnType<typeof useInteractiveLegend>["toggleDataset"];
  toggleAll: ReturnType<typeof useInteractiveLegend>["toggleAll"];
}

const useBarChart = <T extends Record<string, unknown>>({
  data,
  dataKey,
  categories,
  children,
}: UseBarChartOptions<T>): UseBarChartResult<T> => {
  const hasCustomBars = useMemo(() => hasCustomBarChildren(children), [children]);

  const datasets = useMemo(
    () => collectBarDatasets(hasCustomBars, children, categories),
    [hasCustomBars, children, categories],
  );

  const { visibleDatasets, toggleDataset, toggleAll } = useInteractiveLegend(datasets);

  const hasDataKey = typeof dataKey === "string" && dataKey.length > 0;
  const { filteredData, isEmpty } = useChartData({
    data,
    visibleDatasets,
    ...(hasDataKey ? { dataKey } : {}),
    preserveKeys: hasDataKey ? [dataKey] : [],
  });

  const chartData = hasCustomBars ? data : filteredData;

  return {
    hasCustomBars,
    datasets,
    visibleDatasets,
    chartData,
    isEmpty,
    toggleDataset,
    toggleAll,
  };
};

export default useBarChart;
