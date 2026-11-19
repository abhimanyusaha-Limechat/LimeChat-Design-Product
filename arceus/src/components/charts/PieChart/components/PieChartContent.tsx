import { useMemo } from "react";
import { Tooltip, Legend } from "recharts";

import { resolveLabelFormatter, resolveTooltipProps } from "@/components/charts/shared/utils/chartHelpers";
import type { PieChartProps, PieStyleConfig } from "@/components/charts/PieChart/types";
import type { VisibleDatasets } from "@/components/charts/PieChart/utils";
import { mapCustomPieChildren } from "@/components/charts/PieChart/utils";
import PieSeries from "@/components/charts/PieChart/components/PieSeries";

interface PieChartContentProps extends Pick<
  PieChartProps,
  | "tooltip"
  | "legend"
  | "categories"
  | "children"
  | "onPieClick"
  | "showLabels"
  | "labelPosition"
  | "labelProps"
> {
  dataKey: string;
  nameKey: string;
  chartData: PieChartProps["data"];
  pieDefaults: Pick<
    PieStyleConfig,
    "innerRadius" | "outerRadius" | "startAngle" | "endAngle" | "paddingAngle" | "cornerRadius"
  >;
  visibleDatasets: VisibleDatasets;
  interactiveLegend: boolean;
  hasCustomPies: boolean;
  labelFormatter?: PieChartProps["labelFormatter"];
}

/**
 * Responsible for rendering tooltip, legend, and all pie series inside the chart canvas.
 */
function PieChartContent({
  tooltip,
  legend,
  categories = [],
  children,
  showLabels = false,
  labelPosition = "outside",
  labelFormatter,
  labelProps = {},
  onPieClick,
  dataKey,
  nameKey,
  chartData,
  pieDefaults,
  visibleDatasets,
  interactiveLegend,
  hasCustomPies,
}: PieChartContentProps) {
  const labelFormatterFn = useMemo(() => resolveLabelFormatter(labelFormatter), [labelFormatter]);

  const tooltipProps = resolveTooltipProps(tooltip);
  const legendProps = typeof legend === "object" ? legend : {};

  const generatedSeries = useMemo(
    () => (
      <PieSeries
        data={chartData}
        dataKey={dataKey}
        nameKey={nameKey}
        defaults={pieDefaults}
        categories={categories}
        showLabels={showLabels}
        labelPosition={labelPosition}
        labelProps={labelProps}
        labelFormatter={labelFormatterFn}
        onPieClick={onPieClick}
      />
    ),
    [
      categories,
      chartData,
      dataKey,
      nameKey,
      pieDefaults,
      showLabels,
      labelPosition,
      labelProps,
      labelFormatterFn,
      onPieClick,
    ],
  );

  const customChildren = useMemo(
    () => mapCustomPieChildren(children, visibleDatasets, chartData),
    [children, visibleDatasets, chartData],
  );

  return (
    <>
      {tooltip !== false && <Tooltip {...tooltipProps} />}

      {legend !== false && !interactiveLegend && <Legend {...legendProps} />}

      {hasCustomPies ? customChildren : generatedSeries}
    </>
  );
}

export default PieChartContent;
