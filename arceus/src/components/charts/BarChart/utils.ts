import { Children, isValidElement } from "react";
import type { ReactNode } from "react";
import type { BarProps } from "recharts";
import { Bar } from "recharts";

import { extractDatasetsFromChildren } from "@/components/charts/shared/utils/chartHelpers";
import type { BarChartProps, BarDataset } from "@/components/charts/BarChart/types";

export type VisibleDatasets = Set<string>;

/** Identify whether consumers passed custom <Bar /> children instead of categories. */
export const hasCustomBarChildren = (children: BarChartProps["children"]): boolean =>
  Children.count(children) > 0;

/** Resolve the dataset list from either category props or custom children. */
export const collectBarDatasets = (
  hasCustomBars: boolean,
  children: BarChartProps["children"],
  categories: BarDataset[],
): BarDataset[] => (hasCustomBars ? extractDatasetsFromChildren(children) : categories);

/** Combine chart-level and dataset-level click handlers under a single function reference. */
export const mergeBarClickHandlers = (
  chartHandler?: BarProps["onClick"],
  datasetHandler?: BarProps["onClick"],
): BarProps["onClick"] | undefined => {
  if (!chartHandler && !datasetHandler) {
    return undefined;
  }

  return (...args) => {
    datasetHandler?.(...args);
    chartHandler?.(...args);
  };
};

export const filterCustomBarChildren = (
  children: BarChartProps["children"],
  visibleDatasets: VisibleDatasets,
): ReactNode[] => {
  const nodes = Children.toArray(children);

  return nodes.map((child) => {
    if (!isValidElement(child)) {
      return child;
    }

    if (child.type === Bar) {
      const datasetKey = child.props.dataKey;
      if (typeof datasetKey === "string" && !visibleDatasets.has(datasetKey)) {
        return null;
      }
    }

    return child;
  });
};

export const cloneRadius = (radius?: BarProps["radius"]): BarProps["radius"] | undefined => {
  if (radius === undefined) {
    return undefined;
  }

  if (Array.isArray(radius)) {
    return radius.slice() as BarProps["radius"];
  }

  return radius;
};
