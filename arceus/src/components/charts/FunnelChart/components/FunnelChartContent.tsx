import { useMemo } from "react";
import { Tooltip, Legend } from "recharts";

import { resolveTooltipProps } from "@/components/charts/shared/utils/chartHelpers";
import type { FunnelChartProps, FunnelStyleConfig } from "@/components/charts/FunnelChart/types";
import type { VisibleDatasets } from "@/components/charts/FunnelChart/utils";
import { mapCustomFunnelChildren } from "@/components/charts/FunnelChart/utils";
import FunnelSeries from "@/components/charts/FunnelChart/components/FunnelSeries";

interface FunnelChartContentProps extends Pick<
  FunnelChartProps,
  "tooltip" | "legend" | "categories" | "children" | "onFunnelClick"
> {
  dataKey: string;
  nameKey: string;
  chartData: FunnelChartProps["data"];
  funnelDefaults: Pick<
    FunnelStyleConfig,
    "isAnimationActive" | "animationBegin" | "animationDuration"
  >;
  visibleDatasets: VisibleDatasets;
  interactiveLegend: boolean;
  hasCustomFunnels: boolean;
}

function FunnelChartContent({
  tooltip,
  legend,
  categories = [],
  children,
  onFunnelClick,
  dataKey,
  nameKey,
  chartData,
  funnelDefaults,
  visibleDatasets,
  interactiveLegend,
  hasCustomFunnels,
}: FunnelChartContentProps) {
  const tooltipProps = resolveTooltipProps(tooltip);
  const legendProps = typeof legend === "object" ? legend : {};

  const generatedSeries = useMemo(
    () => (
      <FunnelSeries
        data={chartData}
        dataKey={dataKey}
        nameKey={nameKey}
        defaults={funnelDefaults}
        categories={categories}
        onFunnelClick={onFunnelClick}
      />
    ),
    [chartData, dataKey, nameKey, funnelDefaults, categories, onFunnelClick],
  );

  const customChildren = useMemo(
    () => mapCustomFunnelChildren(children, visibleDatasets, chartData),
    [children, visibleDatasets, chartData],
  );

  return (
    <>
      {tooltip !== false && <Tooltip {...tooltipProps} />}

      {legend !== false && !interactiveLegend && <Legend {...legendProps} />}

      {hasCustomFunnels ? customChildren : generatedSeries}
    </>
  );
}

export default FunnelChartContent;
