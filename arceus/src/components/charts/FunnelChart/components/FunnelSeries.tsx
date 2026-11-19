
import { Funnel, LabelList, Cell } from "recharts";
import type { FunnelProps } from "recharts";

import type { FunnelDataset, FunnelChartProps } from "@/components/charts/FunnelChart/types";

interface FunnelSeriesProps {
  data: FunnelChartProps["data"];
  dataKey: NonNullable<FunnelChartProps["dataKey"]>;
  nameKey: NonNullable<FunnelChartProps["nameKey"]>;
  defaults: Pick<FunnelProps, "isAnimationActive" | "animationBegin" | "animationDuration">;
  categories: FunnelDataset[];
  onFunnelClick?: FunnelProps["onClick"];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

function FunnelSeries({
  data,
  dataKey,
  nameKey,
  defaults,
  categories,
  onFunnelClick,
}: FunnelSeriesProps) {
  return (
    <Funnel
      data={data}
      dataKey={dataKey}
      nameKey={nameKey}
      {...defaults}
      {...(onFunnelClick ? { onClick: onFunnelClick } : {})}
    >
      <LabelList position="right" dataKey={nameKey} />
      {data.map((entry, index) => {
        let stageKey: string | undefined;
        if (isRecord(entry)) {
          const candidate = entry[nameKey];
          if (typeof candidate === "string") {
            stageKey = candidate;
          }
        }
        const category = categories.find((item) => item.key === stageKey) ?? categories[index];

        return (
          <Cell
            key={`cell-${index}`}
            {...(category?.color !== undefined ? { fill: category.color } : {})}
          />
        );
      })}
    </Funnel>
  );
}

export default FunnelSeries;
