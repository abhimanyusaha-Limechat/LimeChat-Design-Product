import { useState, useCallback, useMemo, useEffect } from "react";
import type { ChartDataset } from "@/components/charts/shared/types";
import { getDefaultVisibleDatasets } from "@/components/charts/shared/utils/chartHelpers";

const useInteractiveLegend = (datasets: ChartDataset[]) => {
  const [visibleDatasets, setVisibleDatasets] = useState<Set<string>>(() =>
    getDefaultVisibleDatasets(datasets),
  );

  const toggleDataset = useCallback((datasetKey: string) => {
    setVisibleDatasets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(datasetKey)) {
        newSet.delete(datasetKey);
      } else {
        newSet.add(datasetKey);
      }
      return newSet;
    });
  }, []);

  const showAll = useCallback(() => {
    setVisibleDatasets(new Set(datasets.map((d) => d.key)));
  }, [datasets]);

  const hideAll = useCallback(() => {
    setVisibleDatasets(new Set());
  }, []);

  const toggleAll = useCallback(() => {
    setVisibleDatasets((prev) => {
      if (prev.size === datasets.length) {
        return new Set();
      }
      return new Set(datasets.map((d) => d.key));
    });
  }, [datasets]);

  const isAllVisible = useMemo(
    () => visibleDatasets.size === datasets.length,
    [visibleDatasets, datasets],
  );

  const isAllHidden = useMemo(() => visibleDatasets.size === 0, [visibleDatasets]);

  useEffect(() => {
    setVisibleDatasets((previous) => {
      if (datasets.length === 0) {
        if (previous.size === 0) {
          return previous;
        }
        return new Set();
      }

      const defaults = getDefaultVisibleDatasets(datasets);
      const datasetKeys = new Set(datasets.map((dataset) => dataset.key));
      const next = new Set<string>();
      let changed = false;

      datasets.forEach((dataset) => {
        if (previous.has(dataset.key)) {
          next.add(dataset.key);
        } else if (defaults.has(dataset.key)) {
          next.add(dataset.key);
          changed = true;
        }
      });

      previous.forEach((key) => {
        if (!datasetKeys.has(key)) {
          changed = true;
        }
      });

      // oxlint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!changed && next.size === previous.size) {
        let identical = true;
        next.forEach((key) => {
          if (!previous.has(key)) {
            identical = false;
          }
        });

        // oxlint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (identical) {
          return previous;
        }
      }

      return next;
    });
  }, [datasets]);

  return {
    visibleDatasets,
    toggleDataset,
    showAll,
    hideAll,
    toggleAll,
    isAllVisible,
    isAllHidden,
    setVisibleDatasets,
  };
};

export default useInteractiveLegend;
