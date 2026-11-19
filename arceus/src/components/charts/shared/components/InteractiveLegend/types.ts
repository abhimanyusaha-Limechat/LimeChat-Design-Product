import type { ChartDataset, InteractiveLegendPosition } from "@/components/charts/shared/types";

export interface InteractiveLegendProps {
  datasets: ChartDataset[];
  visibleDatasets: Set<string>;
  onToggle: (datasetKey: string) => void;
  onToggleAll?: () => void;
  position?: InteractiveLegendPosition;
  className?: string;
  showToggleAll?: boolean;
  compact?: boolean;
}
