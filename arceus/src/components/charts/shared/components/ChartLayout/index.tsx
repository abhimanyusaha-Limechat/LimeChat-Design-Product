import { type ReactNode } from "react";
import cn from "classnames";
import { Box } from "@mantine/core";

import InteractiveLegendWrapper from "@/components/charts/shared/components/InteractiveLegendWrapper";
import { useInteractiveLegendLayout } from "@/components/charts/shared/hooks/useInteractiveLegendLayout";
import layoutStyles from "@/components/charts/shared/styles/ChartLayout.module.sass";
import type { ChartDataset, InteractiveLegendPosition } from "@/components/charts/shared/types";

export interface ChartLayoutProps {
  interactiveLegend?: boolean | undefined;
  interactiveLegendPosition?: InteractiveLegendPosition | undefined;
  height?: number | string | undefined;
  datasets: ChartDataset[];
  visibleDatasets: Set<string>;
  onToggle: (key: string) => void;
  onToggleAll: () => void;
  legendClassName?: string | undefined;
  legendPosition?: InteractiveLegendPosition | undefined;
  children: ReactNode;
}

function ChartLayout({
  interactiveLegend,
  interactiveLegendPosition = "right",
  height,
  datasets,
  visibleDatasets,
  onToggle,
  onToggleAll,
  legendClassName,
  legendPosition,
  children,
}: ChartLayoutProps) {
  const legendLayout = useInteractiveLegendLayout({
    interactiveLegend,
    interactiveLegendPosition,
    datasetsLength: datasets.length,
    height,
  });

  const legendProps = {
    layout: legendLayout,
    datasets,
    visibleDatasets,
    onToggle,
    onToggleAll,
    legendPosition: legendPosition ?? interactiveLegendPosition,
    className: legendClassName ?? "",
  };

  const layoutClassName = cn(
    layoutStyles.layout,
    ...legendLayout.layoutClassNames.map((layoutClass) => layoutStyles[layoutClass]),
  );

  return (
    <Box className={layoutClassName}>
      {legendLayout.legendFirst && <InteractiveLegendWrapper {...legendProps} />}

      <Box className={layoutStyles["chart-wrapper"] ?? ""}>{children}</Box>

      {!legendLayout.legendFirst && <InteractiveLegendWrapper {...legendProps} />}
    </Box>
  );
}

export default ChartLayout;
export { ChartLayout };
