import { Children, isValidElement } from "react";
import type { ReactNode } from "react";
import type { LineProps } from "recharts";
import { Line } from "recharts";

import { extractDatasetsFromChildren } from "@/components/charts/shared/utils/chartHelpers";
import type { LineChartProps, LineDataset } from "@/components/charts/LineChart/types";

export type VisibleDatasets = Set<string>;

/** Identify whether consumers passed custom <Line /> children instead of categories. */
export const hasCustomLineChildren = (children: LineChartProps["children"]): boolean =>
  Children.count(children) > 0;

/** Resolve the dataset list from either category props or custom children. */
export const collectLineDatasets = (
  hasCustomLines: boolean,
  children: LineChartProps["children"],
  categories: LineDataset[],
): LineDataset[] => (hasCustomLines ? extractDatasetsFromChildren(children) : categories);

/** Combine chart-level and dataset-level click handlers under a single function reference. */
export const mergeLineClickHandlers = (
  chartHandler?: LineProps["onClick"],
  datasetHandler?: LineProps["onClick"],
): LineProps["onClick"] | undefined => {
  if (!chartHandler && !datasetHandler) {
    return undefined;
  }

  return (...args) => {
    datasetHandler?.(...args);
    chartHandler?.(...args);
  };
};

export const filterCustomLineChildren = (
  children: LineChartProps["children"],
  visibleDatasets: VisibleDatasets,
): ReactNode[] =>
  Children.toArray(children).map((child) => {
    if (!isValidElement(child)) {
      return child;
    }

    if (child.type === Line) {
      const datasetKey = child.props.dataKey;
      if (typeof datasetKey === "string" && !visibleDatasets.has(datasetKey)) {
        return null;
      }
    }

    return child;
  });
