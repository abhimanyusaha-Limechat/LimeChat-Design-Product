
import cn from "classnames";
import { Box } from "@mantine/core";
import InteractiveLegend from "@/components/charts/shared/components/InteractiveLegend";
import type { InteractiveLegendLayout } from "@/components/charts/shared/hooks/useInteractiveLegendLayout";
import type { ChartDataset, InteractiveLegendPosition } from "@/components/charts/shared/types";
import layoutStyles from "@/components/charts/shared/styles/ChartLayout.module.sass";

export interface InteractiveLegendWrapperProps {
  layout: InteractiveLegendLayout;
  datasets: ChartDataset[];
  visibleDatasets: Set<string>;
  onToggle: (key: string) => void;
  onToggleAll: () => void;
  legendPosition: InteractiveLegendPosition;
  className?: string | undefined;
}

function InteractiveLegendWrapper({
  layout,
  datasets,
  visibleDatasets,
  onToggle,
  onToggleAll,
  legendPosition,
  className,
}: InteractiveLegendWrapperProps) {
  if (!layout.shouldRenderLegend) {
    return null;
  }

  const legendBlock = (
    <Box
      className={cn(
        layoutStyles["legend-wrapper"],
        layoutStyles[layout.legendOrientationClass],
        layoutStyles[layout.legendAlignmentClass],
        layoutStyles[layout.legendPositionClass],
      )}
      style={{ maxHeight: layout.legendMaxHeight }}
    >
      <InteractiveLegend
        datasets={datasets}
        visibleDatasets={visibleDatasets}
        onToggle={onToggle}
        onToggleAll={onToggleAll}
        position={legendPosition}
        className={className ?? ""}
        showToggleAll={datasets.length > 1}
      />
    </Box>
  );

  return legendBlock;
}

export default InteractiveLegendWrapper;
export { InteractiveLegendWrapper };
