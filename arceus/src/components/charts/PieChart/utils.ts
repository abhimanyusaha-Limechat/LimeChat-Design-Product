import { Children, isValidElement, cloneElement } from "react";
import type { ReactNode } from "react";
import { Pie } from "recharts";
import type { PieProps } from "recharts";

import { extractDatasetsFromChildren } from "@/components/charts/shared/utils/chartHelpers";
import type { PieChartProps, PieDataset } from "@/components/charts/PieChart/types";

export type VisibleDatasets = Set<string>;

/** Identify whether consumers passed custom <Pie /> children instead of categories. */
export const hasCustomPieChildren = (children: PieChartProps["children"]): boolean =>
  Children.count(children) > 0;

/** Resolve the dataset list from either category props or custom children. */
export const collectPieDatasets = (
  hasCustomPies: boolean,
  children: PieChartProps["children"],
  categories: PieDataset[],
): PieDataset[] => (hasCustomPies ? extractDatasetsFromChildren(children) : categories);

export const mapCustomPieChildren = (
  children: PieChartProps["children"],
  visibleDatasets: VisibleDatasets,
  data: PieChartProps["data"],
): ReactNode[] => {
  const nodes = Children.toArray(children);

  return nodes.map((child) => {
    if (!isValidElement(child)) {
      return child;
    }

    if (isValidElement<PieProps>(child) && child.type === Pie) {
      const datasetKey = child.props.dataKey;
      if (typeof datasetKey === "string" && !visibleDatasets.has(datasetKey)) {
        return null;
      }

      if (child.props.data != null) {
        return child;
      }

      return cloneElement(child, { data } satisfies Pick<PieProps, "data">);
    }

    return child;
  });
};
