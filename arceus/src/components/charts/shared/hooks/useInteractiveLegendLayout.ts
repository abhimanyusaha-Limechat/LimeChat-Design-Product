import type { InteractiveLegendPosition } from "@/components/charts/shared/types";

export interface UseInteractiveLegendLayoutProps {
  interactiveLegend?: boolean | undefined;
  interactiveLegendPosition?: InteractiveLegendPosition | undefined;
  datasetsLength: number;
  height?: number | string | undefined;
}

export interface InteractiveLegendLayout {
  shouldRenderLegend: boolean;
  isLegendSide: boolean;
  legendAlign: "start" | "end" | "center";
  legendFirst: boolean;
  legendMaxHeight: string | undefined;
  legendOrientationClass: string;
  legendAlignmentClass: string;
  legendPositionClass: string;
  layoutClassNames: string[];
}

export const useInteractiveLegendLayout = ({
  interactiveLegend,
  interactiveLegendPosition = "right",
  datasetsLength,
  height,
}: UseInteractiveLegendLayoutProps): InteractiveLegendLayout => {
  const shouldRenderLegend = Boolean(interactiveLegend) && datasetsLength > 0;
  const isLegendSide =
    shouldRenderLegend &&
    (interactiveLegendPosition.includes("left") || interactiveLegendPosition.includes("right"));

  const legendAlign = interactiveLegendPosition.includes("top")
    ? "start"
    : interactiveLegendPosition.includes("bottom")
      ? "end"
      : "center";

  const legendFirst =
    shouldRenderLegend &&
    (isLegendSide
      ? interactiveLegendPosition.includes("left")
      : interactiveLegendPosition.startsWith("top"));

  const legendMaxHeight = isLegendSide
    ? typeof height === "number"
      ? `${height}px`
      : (height ?? "100%")
    : undefined;

  const legendOrientationClass = isLegendSide ? "legend-wrapper--side" : "legend-wrapper--full";

  const legendAlignmentClass = interactiveLegendPosition.includes("top")
    ? "legend-wrapper--align-start"
    : interactiveLegendPosition.includes("bottom")
      ? "legend-wrapper--align-end"
      : "legend-wrapper--align-center";

  const legendPositionClass = isLegendSide
    ? interactiveLegendPosition.includes("right")
      ? "legend-wrapper--right"
      : "legend-wrapper--left"
    : "legend-wrapper--stretch";

  const layoutClassNames = [isLegendSide ? "layout--horizontal" : "layout--vertical"];
  if (!isLegendSide) {
    layoutClassNames.push("layout--block");
  }

  return {
    shouldRenderLegend,
    isLegendSide,
    legendAlign,
    legendFirst,
    legendMaxHeight,
    legendOrientationClass,
    legendAlignmentClass,
    legendPositionClass,
    layoutClassNames,
  };
};
