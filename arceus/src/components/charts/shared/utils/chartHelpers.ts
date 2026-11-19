import React, { Children, isValidElement, type ReactNode } from "react";
import { Bar, Line, Area, Pie, Funnel } from "recharts";
import type {
  ChartDataset,
  ChartLabelFormatter,
  ChartLabelListFormatter,
  ChartLabelListProps,
  ChartTooltipProps,
} from "@/components/charts/shared/types";

export type { ChartTooltipProps };

export const extractDatasetsFromChildren = (children: ReactNode): ChartDataset[] => {
  const datasets: ChartDataset[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    // Handle React Fragments by recursively processing their children
    if (child.type === React.Fragment) {
      const fragmentDatasets = extractDatasetsFromChildren(child.props.children);
      datasets.push(...fragmentDatasets);
      return;
    }

    // Check if the child is a known chart type by comparing the displayName or type name
    const childType = child.type;
    let childTypeName = "";

    if (typeof childType === "function") {
      if ("displayName" in childType && typeof childType.displayName === "string") {
        childTypeName = childType.displayName;
      } else if ("name" in childType && typeof childType.name === "string") {
        childTypeName = childType.name;
      }
    }
    const validTypeNames = ["Bar", "Line", "Area", "Pie", "Funnel"];
    const isKnownChartType =
      validTypeNames.includes(childTypeName) ||
      [Bar, Line, Area, Pie, Funnel].some((t) => child.type === t);

    if (isKnownChartType) {
      const { dataKey, name, fill, stroke } = child.props;
      datasets.push({
        key: dataKey,
        name: name ?? dataKey,
        color: fill ?? stroke,
      });
    }
  });

  return datasets;
};

export const filterDataByVisibleDatasets = <T extends Record<string, unknown>>(
  data: T[],
  visibleDatasets: Set<string>,
  preserveKeys: string[] = [],
): T[] => {
  if (data.length === 0) return data;

  return data.map((item) => {
    const filteredItem = {} as Partial<T>;

    Object.keys(item).forEach((key) => {
      if (preserveKeys.includes(key) || visibleDatasets.has(key)) {
        (filteredItem as Record<string, unknown>)[key] = (item as Record<string, unknown>)[key];
      }
    });

    return filteredItem as T;
  });
};

// oxlint-disable-next-line max-len
export const getDefaultVisibleDatasets = (datasets: ChartDataset[]): Set<string> =>
  new Set(datasets.filter((dataset) => dataset.visible !== false).map((dataset) => dataset.key));

export const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
    ...options,
  }).format(value);

export const formatCurrency = (
  value: number,
  currency = "USD",
  options?: Intl.NumberFormatOptions,
): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
    ...options,
  }).format(value);

export const formatPercentage = (value: number): string => `${(value * 100).toFixed(1)}%`;

export const formatDate = (
  date: string | Date,
  format: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", format).format(dateObj);
};

export const resolveTooltipProps = (
  tooltip: ChartTooltipProps | boolean | undefined,
): ChartTooltipProps => (typeof tooltip === "object" ? tooltip : {});

export const resolveLabelFormatter = (
  formatter?: ChartLabelFormatter,
): ChartLabelListProps["formatter"] | undefined => {
  if (!formatter) {
    return undefined;
  }

  const safeFormatter = formatter;

  return ((label: React.ReactNode) => {
    if (typeof label === "number" || typeof label === "string") {
      return (safeFormatter as (value: number | string) => React.ReactNode)(label);
    }
    return (safeFormatter as ChartLabelListFormatter)(
      label as Parameters<ChartLabelListFormatter>[0],
    );
  }) as ChartLabelListProps["formatter"];
};
