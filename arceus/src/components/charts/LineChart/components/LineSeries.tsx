
import { Line, LabelList } from "recharts";
import type { LineProps } from "recharts";

import type { LineDataset, LineChartProps } from "@/components/charts/LineChart/types";
import type { VisibleDatasets } from "@/components/charts/LineChart/utils";
import { mergeLineClickHandlers } from "@/components/charts/LineChart/utils";
import type { ChartLabelListProps } from "@/components/charts/shared/types";

/** Public props contract for rendering a single <Line /> within the chart. */
interface LineSeriesProps {
  dataset: LineDataset;
  defaults: Pick<
    LineProps,
    "type" | "connectNulls" | "strokeWidth" | "strokeDasharray" | "dot" | "activeDot"
  >;
  showLabels: boolean;
  labelPosition: NonNullable<LineChartProps["labelPosition"]>;
  labelProps: LineChartProps["labelProps"];
  labelFormatter?: ChartLabelListProps["formatter"];
  onLineClick?: LineProps["onClick"];
  visibleDatasets: VisibleDatasets;
}

/**
 * Renders a single line, merging dataset-level overrides with chart defaults and adding labels when requested.
 */
function LineSeries({
  dataset,
  defaults,
  showLabels,
  labelPosition,
  labelProps,
  labelFormatter,
  onLineClick,
  visibleDatasets,
}: LineSeriesProps) {
  // Skip rendering when the interactive legend hides this dataset.
  if (!visibleDatasets.has(dataset.key)) {
    return null;
  }

  const { onClick: datasetOnClick, ...restLineProps } = dataset.lineProps ?? {};

  // Merge chart-level click handler with dataset overrides while preserving order.
  const combinedOnClick = mergeLineClickHandlers(onLineClick, datasetOnClick);

  return (
    <Line
      key={dataset.key}
      dataKey={dataset.key}
      name={dataset.name}
      {...(dataset.color !== undefined ? { stroke: dataset.color } : {})}
      {...defaults}
      {...(restLineProps as Partial<LineProps>)}
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
    </Line>
  );
}

export default LineSeries;
