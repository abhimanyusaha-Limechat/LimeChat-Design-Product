import { useMemo } from "react";
import { Bar, LabelList } from "recharts";
import type { BarProps } from "recharts";

import type { BarDataset, BarChartProps } from "@/components/charts/BarChart/types";
import type { VisibleDatasets } from "@/components/charts/BarChart/utils";
import { cloneRadius, mergeBarClickHandlers } from "@/components/charts/BarChart/utils";
import type { ChartLabelListProps } from "@/components/charts/shared/types";

/** Public props contract for rendering a single <Bar /> within the chart. */
interface BarSeriesProps {
  dataset: BarDataset;
  defaults: Pick<BarProps, "radius">;
  showLabels: boolean;
  labelPosition: NonNullable<BarChartProps["labelPosition"]>;
  labelProps: BarChartProps["labelProps"];
  labelFormatter?: ChartLabelListProps["formatter"];
  onBarClick?: BarProps["onClick"];
  visibleDatasets: VisibleDatasets;
}

/**
 * Renders a single bar, merging dataset-level overrides with chart defaults and adding labels when requested.
 */
function BarSeries({
  dataset,
  defaults,
  showLabels,
  labelPosition,
  labelProps,
  labelFormatter,
  onBarClick,
  visibleDatasets,
}: BarSeriesProps) {
  const datasetBarProps = dataset.barProps;
  const datasetOnClick = datasetBarProps?.onClick;

  const barDefaults = useMemo(() => {
    // Recharts mutates the array; clone so upstream props stay immutable.
    const clonedRadius = cloneRadius(defaults.radius);
    return clonedRadius !== undefined ? { radius: clonedRadius } : {};
  }, [defaults.radius]);

  const safeDatasetProps = useMemo(() => {
    if (!datasetBarProps) {
      return {};
    }

    const { onClick: _ignoredOnClick, radius: datasetRadius, ...rest } = datasetBarProps;
    // Dataset overrides hit the same mutation path, so guard those too.
    const clonedRadius = cloneRadius(datasetRadius);

    return {
      ...rest,
      ...(clonedRadius !== undefined ? { radius: clonedRadius } : {}),
    } as Partial<BarProps>;
  }, [datasetBarProps]);

  // Skip rendering when the interactive legend hides this dataset.
  if (!visibleDatasets.has(dataset.key)) {
    return null;
  }

  // Merge chart-level click handler with dataset overrides while preserving order.
  const combinedOnClick = mergeBarClickHandlers(onBarClick, datasetOnClick);

  return (
    <Bar
      key={dataset.key}
      dataKey={dataset.key}
      name={dataset.name}
      fill={dataset.color}
      {...barDefaults}
      {...safeDatasetProps}
      {...(combinedOnClick ? { onClick: combinedOnClick } : {})}
    >
      {showLabels && (
        <LabelList
          dataKey={dataset.key}
          position={labelPosition}
          {...(labelFormatter ? { formatter: labelFormatter } : {})}
          {...labelProps}
        />
      )}
    </Bar>
  );
}

export default BarSeries;
