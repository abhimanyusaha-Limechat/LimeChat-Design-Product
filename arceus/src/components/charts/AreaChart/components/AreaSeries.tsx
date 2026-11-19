import { useMemo } from "react";
import { Area, LabelList } from "recharts";

import type { AreaClickHandler, AreaChartProps, AreaDataset, AreaElementProps } from "@/components/charts/AreaChart/types";
import type { VisibleDatasets } from "@/components/charts/AreaChart/utils";
import { mergeAreaClickHandlers } from "@/components/charts/AreaChart/utils";
import type { ChartLabelListProps } from "@/components/charts/shared/types";

/** Public props contract for rendering a single <Area /> within the chart. */
interface AreaSeriesProps {
  dataset: AreaDataset;
  defaults: Pick<
    AreaElementProps,
    | "type"
    | "connectNulls"
    | "strokeWidth"
    | "fillOpacity"
    | "strokeDasharray"
    | "dot"
    | "activeDot"
  >;
  showLabels: boolean;
  labelPosition: NonNullable<AreaChartProps["labelPosition"]>;
  labelProps: AreaChartProps["labelProps"];
  labelFormatter?: ChartLabelListProps["formatter"];
  onAreaClick?: AreaClickHandler | undefined;
  visibleDatasets: VisibleDatasets;
}

/**
 * Renders a single area, merging dataset-level overrides with chart defaults and adding labels when requested.
 */
function AreaSeries({
  dataset,
  defaults,
  showLabels,
  labelPosition,
  labelProps,
  labelFormatter,
  onAreaClick,
  visibleDatasets,
}: AreaSeriesProps) {
  const datasetAreaProps = dataset.areaProps;
  const datasetOnClick = datasetAreaProps?.onClick;

  const safeAreaProps = useMemo((): Partial<AreaElementProps> => {
    if (datasetAreaProps === undefined) {
      return {};
    }

    const { onClick: _ignoredOnClick, ...rest } = datasetAreaProps;
    return rest;
  }, [datasetAreaProps]);

  // Skip rendering when the interactive legend hides this dataset.
  if (!visibleDatasets.has(dataset.key)) {
    return null;
  }

  // Merge chart-level click handler with dataset overrides while preserving order.
  const combinedOnClick = mergeAreaClickHandlers(onAreaClick, datasetOnClick);

  return (
    <Area
      key={dataset.key}
      dataKey={dataset.key}
      name={dataset.name}
      {...(dataset.color !== undefined ? { fill: dataset.color, stroke: dataset.color } : {})}
      {...defaults}
      {...safeAreaProps}
      {...(combinedOnClick !== undefined ? { onClick: combinedOnClick } : {})}
    >
      {showLabels && (
        <LabelList
          dataKey={dataset.key}
          position={labelPosition}
          {...(labelFormatter ? { formatter: labelFormatter } : {})}
          {...labelProps}
        />
      )}
    </Area>
  );
}

export default AreaSeries;
