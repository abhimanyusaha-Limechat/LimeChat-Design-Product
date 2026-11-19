import { Children, isValidElement, cloneElement } from "react";
import type { ReactNode } from "react";
import { Funnel } from "recharts";
import type { FunnelProps } from "recharts";

import { extractDatasetsFromChildren } from "@/components/charts/shared/utils/chartHelpers";
import type { FunnelChartProps, FunnelDataset } from "@/components/charts/FunnelChart/types";

export type VisibleDatasets = Set<string>;

/** Identify whether consumers passed custom <Funnel /> children instead of categories. */
export const hasCustomFunnelChildren = (children: FunnelChartProps["children"]): boolean =>
  Children.count(children) > 0;

/** Resolve the dataset list from either category props or custom children. */
export const collectFunnelDatasets = (
  hasCustomFunnels: boolean,
  children: FunnelChartProps["children"],
  categories: FunnelDataset[],
): FunnelDataset[] => (hasCustomFunnels ? extractDatasetsFromChildren(children) : categories);

export const mapCustomFunnelChildren = (
  children: FunnelChartProps["children"],
  visibleDatasets: VisibleDatasets,
  data: FunnelChartProps["data"],
): ReactNode[] => {
  const nodes = Children.toArray(children);

  return nodes.map((child) => {
    if (!isValidElement(child)) {
      return child;
    }

    if (isValidElement<FunnelProps>(child) && child.type === Funnel) {
      const datasetKey = child.props.dataKey;
      if (typeof datasetKey === "string" && !visibleDatasets.has(datasetKey)) {
        return null;
      }

      if (child.props.data != null) {
        return child;
      }

      return cloneElement(child, { data } satisfies Pick<FunnelProps, "data">);
    }

    return child;
  });
};
