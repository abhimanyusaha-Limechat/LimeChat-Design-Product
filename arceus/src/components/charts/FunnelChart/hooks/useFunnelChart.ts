import { useMemo } from "react";

import useInteractiveLegend from "@/components/charts/shared/hooks/useInteractiveLegend";
import type { FunnelChartProps, FunnelDataset } from "@/components/charts/FunnelChart/types";
import {
  collectFunnelDatasets,
  hasCustomFunnelChildren,
} from "@/components/charts/FunnelChart/utils";
import type { VisibleDatasets } from "@/components/charts/FunnelChart/utils";

interface UseFunnelChartOptions<T extends Record<string, unknown>> {
  data: FunnelChartProps<T>["data"];
  dataKey?: FunnelChartProps<T>["dataKey"];
  nameKey?: FunnelChartProps<T>["nameKey"];
  categories: FunnelDataset[];
  children: FunnelChartProps["children"];
}

interface UseFunnelChartResult<T extends Record<string, unknown>> {
  hasCustomFunnels: boolean;
  datasets: FunnelDataset[];
  visibleDatasets: VisibleDatasets;
  chartData: FunnelChartProps<T>["data"];
  isEmpty: boolean;
  dataKey: string;
  nameKey: string;
  toggleDataset: ReturnType<typeof useInteractiveLegend>["toggleDataset"];
  toggleAll: ReturnType<typeof useInteractiveLegend>["toggleAll"];
}

const useFunnelChart = <T extends Record<string, unknown>>({
  data,
  dataKey,
  nameKey,
  categories,
  children,
}: UseFunnelChartOptions<T>): UseFunnelChartResult<T> => {
  const resolvedDataKey: string = dataKey ?? "value";
  const resolvedNameKey: string = nameKey ?? "name";

  const hasCustomFunnels = useMemo(() => hasCustomFunnelChildren(children), [children]);

  const datasets = useMemo(
    () => collectFunnelDatasets(hasCustomFunnels, children, categories),
    [hasCustomFunnels, children, categories],
  );

  const { visibleDatasets, toggleDataset, toggleAll } = useInteractiveLegend(datasets);

  const chartData = useMemo(() => {
    if (hasCustomFunnels || datasets.length === 0) {
      return data;
    }

    return data.filter((datum) => {
      const record = datum as Record<string, unknown>;
      const stageValue = record[resolvedNameKey];
      if (stageValue == null) {
        return true;
      }
      if (typeof stageValue === "string") {
        return visibleDatasets.has(stageValue);
      }
      return true;
    });
  }, [data, datasets.length, hasCustomFunnels, resolvedNameKey, visibleDatasets]);

  const isEmpty = chartData.length === 0;

  return {
    hasCustomFunnels,
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

export default useFunnelChart;
