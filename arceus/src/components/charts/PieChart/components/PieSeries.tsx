
import { Pie, LabelList, Cell } from "recharts";
import type { PieProps } from "recharts";

import type { PieDataset, PieChartProps } from "@/components/charts/PieChart/types";
import type { ChartLabelListProps } from "@/components/charts/shared/types";

/** Public props contract for rendering a single <Pie /> within the chart. */
interface PieSeriesProps {
  data: PieChartProps["data"];
  dataKey: NonNullable<PieChartProps["dataKey"]>;
  nameKey: NonNullable<PieChartProps["nameKey"]>;
  defaults: Pick<
    PieProps,
    "innerRadius" | "outerRadius" | "startAngle" | "endAngle" | "paddingAngle" | "cornerRadius"
  >;
  categories: PieDataset[];
  showLabels: boolean;
  labelPosition: NonNullable<PieChartProps["labelPosition"]>;
  labelProps: PieChartProps["labelProps"];
  labelFormatter?: ChartLabelListProps["formatter"];
  onPieClick?: PieProps["onClick"];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/**
 * Renders a single pie, merging dataset-level overrides with chart defaults and adding labels when requested.
 */
function PieSeries({
  data,
  dataKey,
  nameKey,
  defaults,
  categories,
  showLabels,
  labelPosition,
  labelProps,
  labelFormatter,
  onPieClick,
}: PieSeriesProps) {
  return (
    <Pie
      data={data}
      dataKey={dataKey}
      nameKey={nameKey}
      {...defaults}
      {...(onPieClick ? { onClick: onPieClick } : {})}
    >
      {data.map((entry, index) => {
        let sliceKey: string | undefined;
        if (isRecord(entry)) {
          const candidate = entry[nameKey];
          if (typeof candidate === "string") {
            sliceKey = candidate;
          }
        }
        const matchingCategory =
          categories.find((category) => category.key === sliceKey) ?? categories[index];

        return (
          <Cell
            key={`cell-${index}`}
            {...(matchingCategory?.color !== undefined ? { fill: matchingCategory.color } : {})}
          />
        );
      })}
      {showLabels && (
        <LabelList
          dataKey={dataKey}
          position={labelPosition}
          {...(labelFormatter ? { formatter: labelFormatter } : {})}
          {...(labelProps as Record<string, unknown>)}
        />
      )}
    </Pie>
  );
}

export default PieSeries;
