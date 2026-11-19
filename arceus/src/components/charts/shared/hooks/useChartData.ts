import { useMemo } from "react";
import { filterDataByVisibleDatasets } from "@/components/charts/shared/utils/chartHelpers";
import type { ChartDataKey } from "@/components/charts/shared/types";

interface UseChartDataProps<T extends Record<string, unknown>> {
  data: T[];
  visibleDatasets: Set<string>;
  dataKey?: ChartDataKey<T>;
  preserveKeys?: Array<ChartDataKey<T>>;
}

const useChartData = <T extends Record<string, unknown>>({
  data,
  visibleDatasets,
  dataKey,
  preserveKeys = [],
}: UseChartDataProps<T>) => {
  const filteredData = useMemo(() => {
    if (data.length === 0) return [];

    const hasDataKey = typeof dataKey === "string" && dataKey.length > 0;
    const keysToPreserve = hasDataKey ? [dataKey, ...preserveKeys] : preserveKeys;

    return filterDataByVisibleDatasets(data, visibleDatasets, keysToPreserve);
  }, [data, visibleDatasets, dataKey, preserveKeys]);

  const isEmpty = useMemo(() => data.length === 0, [data]);

  const hasData = useMemo(() => data.length > 0, [data]);

  return {
    filteredData,
    isEmpty,
    hasData,
    originalData: data,
  };
};

export default useChartData;
