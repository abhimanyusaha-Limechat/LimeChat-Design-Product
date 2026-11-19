import { useMemo } from "react";

import useInteractiveLegend from "@/components/charts/shared/hooks/useInteractiveLegend";
import type { PieChartProps, PieDataset } from "@/components/charts/PieChart/types";
import { collectPieDatasets, hasCustomPieChildren } from "@/components/charts/PieChart/utils";
import type { VisibleDatasets } from "@/components/charts/PieChart/utils";

interface UsePieChartOptions<T extends Record<string, unknown>> {
  data: PieChartProps<T>["data"];
  dataKey?: PieChartProps<T>["dataKey"];
  nameKey?: PieChartProps<T>["nameKey"];
  categories: PieDataset[];
  children: PieChartProps["children"];
}

interface UsePieChartResult<T extends Record<string, unknown>> {
  hasCustomPies: boolean;
  datasets: PieDataset[];
  visibleDatasets: VisibleDatasets;
  chartData: PieChartProps<T>["data"];
  isEmpty: boolean;
  dataKey: string;
  nameKey: string;
  toggleDataset: ReturnType<typeof useInteractiveLegend>["toggleDataset"];
  toggleAll: ReturnType<typeof useInteractiveLegend>["toggleAll"];
}

const usePieChart = <T extends Record<string, unknown>>({
  data,
  dataKey,
  nameKey,
  categories,
  children,
}: UsePieChartOptions<T>): UsePieChartResult<T> => {
  const resolvedDataKey: string = dataKey ?? "value";
  const resolvedNameKey: string = nameKey ?? "name";

  const hasCustomPies = useMemo(() => hasCustomPieChildren(children), [children]);

  const datasets = useMemo(
    () => collectPieDatasets(hasCustomPies, children, categories),
    [hasCustomPies, children, categories],
  );

  const { visibleDatasets, toggleDataset, toggleAll } = useInteractiveLegend(datasets);

  const chartData = useMemo(() => {
    if (hasCustomPies || datasets.length === 0) {
      return data;
    }

    return data.filter((datum) => {
      const record = datum as Record<string, unknown>;
      const sliceValue = record[resolvedNameKey];
      if (sliceValue == null) {
        return true;
      }
      if (typeof sliceValue === "string") {
        return visibleDatasets.has(sliceValue);
      }
      return true;
    });
  }, [data, datasets.length, hasCustomPies, resolvedNameKey, visibleDatasets]);

  const isEmpty = chartData.length === 0;

  return {
    hasCustomPies,
    datasets,
    visibleDatasets,
    chartData,
    isEmpty,
    dataKey: resolvedDataKey,
    nameKey: resolvedNameKey,
    toggleDataset,
    toggleAll,
  };
};

export default usePieChart;
