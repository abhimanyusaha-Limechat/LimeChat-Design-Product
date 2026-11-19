import { Children, isValidElement } from "react";
import type { ReactNode } from "react";
import { Area } from "recharts";

import { extractDatasetsFromChildren } from "@/components/charts/shared/utils/chartHelpers";
import type { AreaChartProps, AreaClickHandler, AreaDataset } from "@/components/charts/AreaChart/types";

export type VisibleDatasets = Set<string>;

/** Identify whether consumers passed custom <Area /> children instead of categories. */
export const hasCustomAreaChildren = (children: AreaChartProps["children"]): boolean =>
  Children.count(children) > 0;

/** Resolve the dataset list from either category props or custom children. */
export const collectAreaDatasets = (
  hasCustomAreas: boolean,
  children: AreaChartProps["children"],
  categories: AreaDataset[],
): AreaDataset[] => (hasCustomAreas ? extractDatasetsFromChildren(children) : categories);

/** Combine chart-level and dataset-level click handlers under a single function reference. */
export const mergeAreaClickHandlers = (
  chartHandler?: AreaClickHandler,
  datasetHandler?: AreaClickHandler,
): AreaClickHandler | undefined => {
  if (chartHandler === undefined && datasetHandler === undefined) {
    return undefined;
  }

  return (...args: Parameters<AreaClickHandler>) => {
    datasetHandler?.(...args);
    chartHandler?.(...args);
  };
};

export const filterCustomAreaChildren = (
  children: AreaChartProps["children"],
  visibleDatasets: VisibleDatasets,
): ReactNode[] => {
  const nodes = Children.toArray(children);

  return nodes.map((child) => {
    if (!isValidElement(child)) {
      return child;
    }

    if (child.type === Area) {
      const datasetKey = child.props.dataKey;
      if (typeof datasetKey === "string" && !visibleDatasets.has(datasetKey)) {
        return null;
      }
    }

    return child;
  });
};
